import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { gradeAnswer, type GradeableConcept } from '../question/grading';
import { firstRepairFor } from './reading';
import type { SubmitDiagnosticDto } from './dto';

const DIAGNOSTIC_MINUTES = 45;

@Injectable()
export class AssessmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly curriculum: CurriculumService,
  ) {}

  /** The diagnostic bypasses topic gating by design: it exists to find what is not unlocked yet. */
  async startDiagnostic(userId: string) {
    const session = await this.prisma.learningSession.create({
      data: { userId, typeKey: 'exam', plannedMinutes: DIAGNOSTIC_MINUTES, summary: 'Initial diagnostic' },
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
}
