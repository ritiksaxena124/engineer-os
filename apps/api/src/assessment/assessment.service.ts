import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { MasteryService } from '../mastery/mastery.service';
import { ReviewService } from '../mastery/review.service';
import { PASS_SCORE } from '../mastery/derivation';
import { gradeAnswer, type GradeableConcept } from '../question/grading';
import {
  EXAM_MINUTES,
  judgeExam,
  planExam,
  scorePart,
  teachBackSlug,
  type ExamItem,
  type ExamPartRule,
  type GradedItem,
} from './exam';
import { firstRepairFor } from './reading';
import type { Prisma } from '@prisma/client';
import type { SubmitDiagnosticDto, SubmitExamDto } from './dto';

const DIAGNOSTIC_MINUTES = 45;

@Injectable()
export class AssessmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly curriculum: CurriculumService,
    private readonly mastery: MasteryService,
    private readonly reviews: ReviewService,
  ) {}

  /** The diagnostic bypasses topic gating by design: it exists to find what is not unlocked yet. */
  async startDiagnostic(userId: string) {
    const session = await this.prisma.learningSession.create({
      data: { userId, typeKey: 'diagnostic', plannedMinutes: DIAGNOSTIC_MINUTES, summary: 'Initial diagnostic' },
    });

    const items = await this.prisma.question.findMany({
      where: { isActive: true, isDiagnostic: true },
      orderBy: [{ difficulty: 'asc' }, { slug: 'asc' }],
      select: {
        slug: true,
        stem: true,
        body: true,
        difficulty: true,
        categoryKey: true,
        levelKey: true,
        topic: { select: { slug: true } },
        _count: { select: { expectedConcepts: true } },
      },
    });

    return {
      sessionId: session.id,
      plannedMinutes: session.plannedMinutes,
      items: items.map((item) => ({
        slug: item.slug,
        stem: item.stem,
        body: item.body,
        difficulty: item.difficulty,
        category: item.categoryKey,
        levelKey: item.levelKey,
        topicSlug: item.topic.slug,
        conceptCount: item._count.expectedConcepts,
      })),
    };
  }

  /**
   * Attempts are the evidence this writes; mastery is derived from them elsewhere. Unanswered
   * items are reported but never recorded, because an empty answer is not a measurement.
   */
  async submitDiagnostic(userId: string, dto: SubmitDiagnosticDto) {
    const session = await this.prisma.learningSession.findUnique({ where: { id: dto.sessionId } });
    if (!session || session.userId !== userId) {
      throw new NotFoundException({ code: 'SESSION_NOT_FOUND', message: 'no such session for this learner' });
    }
    if (session.endedAt) {
      throw new ConflictException({ code: 'SESSION_CLOSED', message: 'this session was already submitted' });
    }

    const questions = await this.prisma.question.findMany({
      where: { isActive: true, isDiagnostic: true },
      include: {
        topic: { select: { slug: true, title: true, phaseKey: true, skillKey: true } },
        expectedConcepts: {
          include: {
            concept: { select: { slug: true, name: true, terms: { select: { term: true } } } },
          },
        },
      },
    });
    const bySlug = new Map(questions.map((row) => [row.slug, row]));

    const answersBySlug = new Map<string, string>();
    for (const answer of dto.answers) {
      if (!bySlug.has(answer.slug)) {
        throw new BadRequestException({
          code: 'QUESTION_NOT_FOUND',
          message: `"${answer.slug}" is not part of this diagnostic`,
        });
      }
      answersBySlug.set(answer.slug, answer.answerText);
    }

    const verdicts: {
      slug: string;
      verdict: string;
      score: number;
      missing: string[];
    }[] = [];
    const misses = new Map<string, { topic: { slug: string; title: string; skillKey: string | null }; name: string }>();

    const attemptRows: {
      userId: string;
      questionId: string;
      sessionId: string;
      answerText: string;
      verdictKey: string;
      score: number;
      missingConcepts: string;
      feedback: string;
      meta: object;
    }[] = [];

    for (const [slug, answerText] of answersBySlug) {
      const question = bySlug.get(slug)!;
      const concepts: GradeableConcept[] = question.expectedConcepts.map((edge) => ({
        slug: edge.concept.slug,
        name: edge.concept.name,
        terms: edge.concept.terms.map((term) => term.term),
        weight: edge.weight,
      }));

      const result = gradeAnswer(answerText, concepts);
      verdicts.push({ slug, verdict: result.verdict, score: result.score, missing: result.missing });

      for (const name of result.missing) {
        misses.set(`${slug}::${name}`, { topic: question.topic, name });
      }

      attemptRows.push({
        userId,
        questionId: question.id,
        sessionId: session.id,
        answerText,
        verdictKey: result.verdict,
        score: result.score,
        missingConcepts: result.missing.join('; '),
        feedback: result.feedback,
        meta: {
          coverage: result.coverage,
          matched: result.matched,
          missing: result.missing,
          characters: answerText.trim().length,
          source: 'diagnostic',
        },
      });
    }

    for (const question of questions) {
      if (!answersBySlug.has(question.slug)) {
        verdicts.push({
          slug: question.slug,
          verdict: 'unanswered',
          score: 0,
          missing: question.expectedConcepts.map((edge) => edge.concept.name),
        });
      }
    }

    const missesByTopic = new Map<string, number>();
    const missesBySkill = new Map<string, number>();
    for (const entry of misses.values()) {
      missesByTopic.set(entry.topic.slug, (missesByTopic.get(entry.topic.slug) ?? 0) + 1);
      const skill = entry.topic.skillKey ?? 'unassigned';
      missesBySkill.set(skill, (missesBySkill.get(skill) ?? 0) + 1);
    }

    const titleByTopic = new Map(questions.map((row) => [row.topic.slug, row.topic.title]));
    const weakTopics = [...missesByTopic.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([slug, count]) => ({ slug, title: titleByTopic.get(slug) ?? slug, misses: count }));

    const reading = [...missesBySkill.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([skill, count]) => ({ skill, misses: count, firstRepair: firstRepairFor(skill) }));

    const repairPath = weakTopics.length
      ? (await this.curriculum.repairPathFor(userId, weakTopics[0].slug)).path
      : [];

    await this.prisma.$transaction([
      ...attemptRows.map((row) => this.prisma.attempt.create({ data: row })),
      this.prisma.learningSession.update({
        where: { id: session.id },
        data: {
          endedAt: new Date(),
          summary: `diagnostic: ${attemptRows.length}/${questions.length} answered, weakest area ${
            reading[0]?.skill ?? 'none'
          }`,
        },
      }),
    ]);

    return {
      sessionId: session.id,
      answered: attemptRows.length,
      unanswered: questions.length - attemptRows.length,
      verdicts,
      weakTopics,
      reading,
      repairPath,
    };
  }

  /**
   * A phase is examined in seven kinds of work, and the exam is derived rather than stored: the
   * same bank under the same part rules hands out the same paper every time, so a retake is a
   * retake and a submission is graded against exactly what was given out.
   */
  async startExam(userId: string, phaseKey: string) {
    const loaded = await this.loadExam(userId, phaseKey);
    if (loaded.blocked.length > 0) {
      throw new ConflictException({
        code: 'PHASE_NOT_REACHED',
        message: `"${phaseKey}" is not fully unlocked, so an exam on it would only measure the gap above it`,
        details: { blocked: loaded.blocked },
      });
    }
    if (loaded.plan.missing.length > 0) {
      throw new ConflictException({
        code: 'EXAM_NOT_AUTHORED',
        message: `parts of the ${phaseKey} exam have no questions yet, so they cannot be graded`,
        details: { missingParts: loaded.plan.missing.map((part) => ({ key: part.key, label: part.label })) },
      });
    }

    const session = await this.prisma.learningSession.create({
      data: {
        userId,
        typeKey: 'exam',
        plannedMinutes: EXAM_MINUTES,
        summary: `Phase ${phaseKey} exam`,
        meta: { kind: 'phase-exam', phaseKey },
      },
    });

    return {
      sessionId: session.id,
      phaseKey,
      phaseTitle: loaded.phase.title,
      plannedMinutes: session.plannedMinutes,
      shortParts: loaded.plan.plans.filter((entry) => entry.short).map((entry) => entry.part.label),
      parts: loaded.plan.plans.map((entry) => ({
        key: entry.part.key,
        label: entry.part.label,
        position: entry.part.position,
        minutes: entry.part.minutes,
        instructions: entry.part.instructions,
        short: entry.short,
        items: entry.part.generated
          ? [this.teachBackItem(entry.part, loaded.plan.teachBackSlug!, loaded.topicRows)]
          : entry.items.map((item) => ({
              slug: item.slug,
              stem: item.stem,
              body: item.body,
              difficulty: item.difficulty,
              category: item.category,
              levelKey: item.levelKey,
              topicSlug: item.topicSlug,
              conceptCount: item.conceptCount,
            })),
      })),
    };
  }

  /**
   * Blanks are graded as zeros here, unlike the diagnostic, because an exam is the judgment and not
   * a sample. Answer models stay closed: the report says what was missed, never what the answer was
   * — a drill on the topic is what opens the model.
   */
  async submitExam(userId: string, dto: SubmitExamDto) {
    const session = await this.prisma.learningSession.findUnique({ where: { id: dto.sessionId } });
    if (!session || session.userId !== userId) {
      throw new NotFoundException({ code: 'SESSION_NOT_FOUND', message: 'no such session for this learner' });
    }
    const meta = session.meta as { kind?: string; phaseKey?: string } | null;
    if (meta?.kind !== 'phase-exam' || !meta.phaseKey) {
      throw new ConflictException({ code: 'NOT_AN_EXAM', message: 'this session is not a phase exam' });
    }
    if (session.endedAt) {
      throw new ConflictException({ code: 'SESSION_CLOSED', message: 'this exam was already submitted' });
    }

    const loaded = await this.loadExam(userId, meta.phaseKey);
    const slugToPart = new Map<string, ExamPartRule>();
    for (const entry of loaded.plan.plans) {
      if (entry.part.generated) slugToPart.set(teachBackSlug(loaded.plan.teachBackSlug!), entry.part);
      for (const item of entry.items) slugToPart.set(item.slug, entry.part);
    }

    const gradedByPart = new Map<string, GradedItem[]>();
    const answers = new Map<string, string>();
    for (const answer of dto.answers) {
      if (!slugToPart.has(answer.slug)) {
        throw new BadRequestException({
          code: 'QUESTION_NOT_FOUND',
          message: `"${answer.slug}" is not part of the ${meta.phaseKey} exam`,
        });
      }
      if (answers.has(answer.slug)) {
        throw new BadRequestException({ code: 'DUPLICATE_ANSWER', message: `"${answer.slug}" was answered twice` });
      }
      answers.set(answer.slug, answer.answerText);
    }

    const now = new Date();
    const rows: Prisma.AttemptCreateManyInput[] = [];
    const evidence: { topicSlug: string; signalKey: string | null; score: number; fromReview: boolean }[] = [];
    const verdicts: { slug: string; part: string; verdict: string; score: number; missing: string[] }[] = [];

    for (const [slug, answerText] of answers) {
      const part = slugToPart.get(slug)!;
      const question = loaded.bankRows.find((row) => row.slug === slug);
      const concepts = question
        ? question.expectedConcepts.map((edge) => ({
            slug: edge.concept.slug,
            name: edge.concept.name,
            terms: edge.concept.terms.map((term) => term.term),
            weight: edge.weight,
          }))
        : await this.teachBackConcepts(loaded.plan.teachBackSlug!);

      const result = gradeAnswer(answerText, concepts);
      verdicts.push({ slug, part: part.key, verdict: result.verdict, score: result.score, missing: result.missing });

      const bucket = gradedByPart.get(part.key) ?? [];
      bucket.push({ slug, score: result.score, verdict: result.verdict });
      gradedByPart.set(part.key, bucket);

      const base = {
        userId,
        sessionId: session.id,
        answerText,
        verdictKey: result.verdict,
        score: result.score,
        missingConcepts: result.missing.join('; '),
        feedback: result.feedback,
      };

      if (!question) {
        rows.push({
          ...base,
          questionId: null,
          meta: {
            coverage: result.coverage,
            matched: result.matched,
            missing: result.missing,
            characters: answerText.trim().length,
            examPart: part.key,
            teachBackTopic: loaded.plan.teachBackSlug,
          },
        });
        continue;
      }

      const review = await this.reviews.recordAttempt(userId, question.id, {
        passed: result.score >= PASS_SCORE,
        now,
      });
      evidence.push({
        topicSlug: question.topic.slug,
        signalKey: question.category.signalKey,
        score: result.score,
        fromReview: review?.isReview ?? false,
      });
      rows.push({
        ...base,
        questionId: question.id,
        meta: {
          coverage: result.coverage,
          matched: result.matched,
          missing: result.missing,
          characters: answerText.trim().length,
          examPart: part.key,
          fromReview: review?.isReview ?? false,
        },
      });
    }

    const scores = loaded.plan.plans.map((entry) => scorePart(entry, gradedByPart.get(entry.part.key) ?? []));
    const judgement = judgeExam(scores);

    await this.prisma.$transaction([
      this.prisma.attempt.createMany({ data: rows }),
      this.prisma.learningSession.update({
        where: { id: session.id },
        data: {
          endedAt: now,
          summary: `Phase ${meta.phaseKey} exam: ${judgement.passed ? 'passed' : `failed ${judgement.failedParts.map((part) => part.label).join(', ') || 'no part passed'}`} at ${judgement.score}`,
        },
      }),
    ]);

    const promotions: { topicSlug: string; levelKey: string; previousLevel: number; level: number }[] = [];
    for (const entry of evidence) {
      const standing = await this.mastery.recordEvidence(userId, entry.topicSlug, {
        signalKey: entry.signalKey,
        fromReview: entry.fromReview,
        score: entry.score,
      });
      if (standing && standing.level > standing.previousLevel) {
        promotions.push({
          topicSlug: standing.topicSlug,
          levelKey: standing.levelKey,
          previousLevel: standing.previousLevel,
          level: standing.level,
        });
      }
    }

    const next = judgement.passed
      ? await this.prisma.phase.findFirst({ where: { number: { gt: loaded.phase.number }, isActive: true }, orderBy: { number: 'asc' } })
      : null;

    return {
      sessionId: session.id,
      phaseKey: meta.phaseKey,
      passed: judgement.passed,
      score: judgement.score,
      parts: scores,
      failedParts: judgement.failedParts,
      verdicts,
      promotions,
      // §70: the next phase is recommended by a pass and by nothing else.
      nextPhase: next ? { key: next.key, title: next.title } : null,
    };
  }

  /** The paper is assembled from the phase's own topics, so a read of the plan is also its check. */
  private async loadExam(userId: string, phaseKey: string) {
    const phase = await this.prisma.phase.findUnique({ where: { key: phaseKey } });
    if (!phase || !phase.isActive) {
      throw new NotFoundException({ code: 'PHASE_NOT_FOUND', message: `no phase "${phaseKey}"` });
    }

    const [catalog, topicRows, bankRows] = await Promise.all([
      this.curriculum.catalog(userId),
      this.prisma.topic.findMany({
        where: { phaseKey, isActive: true },
        select: { slug: true, title: true, number: true, _count: { select: { concepts: true } } },
      }),
      this.prisma.question.findMany({
        where: { isActive: true, isDiagnostic: false, topic: { phaseKey } },
        select: {
          id: true,
          slug: true,
          stem: true,
          body: true,
          difficulty: true,
          categoryKey: true,
          levelKey: true,
          topic: { select: { slug: true } },
          category: { select: { key: true, signalKey: true } },
          _count: { select: { expectedConcepts: true } },
          expectedConcepts: { include: { concept: { select: { slug: true, name: true, terms: { select: { term: true } } } } } },
        },
      }),
    ]);

    const inPhase = new Set(topicRows.map((row) => row.slug));
    const blocked = catalog.topics
      .filter((topic) => inPhase.has(topic.slug) && !topic.unlocked)
      .map((topic) => ({ slug: topic.slug, title: topic.title, level: topic.level }));

    const bank: ExamItem[] = bankRows.map((row) => ({
      slug: row.slug,
      stem: row.stem,
      body: row.body,
      difficulty: row.difficulty,
      category: row.categoryKey,
      levelKey: row.levelKey,
      topicSlug: row.topic.slug,
      conceptCount: row._count.expectedConcepts,
    }));

    return {
      phase,
      blocked,
      topicRows,
      bankRows,
      plan: planExam(
        bank,
        topicRows.map((row) => ({ slug: row.slug, conceptCount: row._count.concepts, number: row.number })),
      ),
    };
  }

  /** Part G has no question row: the rubric is whatever the topic itself says a real answer needs. */
  private async teachBackConcepts(topicSlug: string): Promise<GradeableConcept[]> {
    const concepts = await this.prisma.concept.findMany({
      where: { topic: { slug: topicSlug }, isActive: true },
      select: { slug: true, name: true, terms: { select: { term: true } } },
    });
    return concepts.map((concept) => ({
      slug: concept.slug,
      name: concept.name,
      terms: concept.terms.map((term) => term.term),
      weight: 1,
    }));
  }

  private teachBackItem(part: ExamPartRule, topicSlug: string, topics: { slug: string; title: string; _count: { concepts: number } }[]): ExamItem {
    const topic = topics.find((row) => row.slug === topicSlug)!;
    return {
      slug: teachBackSlug(topicSlug),
      stem: `Explain ${topic.title} to a junior engineer who has to use it today.`,
      body: `${part.instructions} Define every term you use, in the order you use them, and end with the failure this concept prevents.`,
      difficulty: 7,
      category: 'teach-back',
      levelKey: 'teaching',
      topicSlug,
      conceptCount: topic._count.concepts,
    };
  }
}
