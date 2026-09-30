import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { MasteryService } from '../mastery/mastery.service';
import { ReviewService } from '../mastery/review.service';
import { PASS_SCORE } from '../mastery/derivation';
import { gradeAnswer, type GradeableConcept } from './grading';
import type { AttemptDto, QuestionQueryDto } from './dto';

/**
 * Active recall is enforced here rather than in the UI: the answer model is part of the row,
 * but it is never serialised to a learner who has not answered the question yet. Revealing it
 * after evaluation is intentional — that is when it becomes revision material instead of a
 * spoiler, and the attempt is already recorded as evidence.
 */
@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly curriculum: CurriculumService,
    private readonly mastery: MasteryService,
    private readonly reviews: ReviewService,
  ) {}

  async list(filter: QuestionQueryDto) {
    /**
     * Everything except the company clause: the facet counts are what a chip would select if it
     * were clicked on top of the filters already applied, so the numbers never advertise a result
     * set the learner cannot reach.
     */
    const scope: Prisma.QuestionWhereInput = {
      isActive: true,
      ...(filter.topic ? { topic: { slug: filter.topic } } : {}),
      ...(filter.category ? { categoryKey: filter.category } : {}),
      ...(filter.minDifficulty === undefined && filter.maxDifficulty === undefined
        ? {}
        : {
            difficulty: {
              ...(filter.minDifficulty === undefined ? {} : { gte: filter.minDifficulty }),
              ...(filter.maxDifficulty === undefined ? {} : { lte: filter.maxDifficulty }),
            },
          }),
      ...(filter.diagnostic === undefined ? {} : { isDiagnostic: filter.diagnostic }),
      ...(filter.search ? { stem: { contains: filter.search, mode: 'insensitive' } } : {}),
    };

    const where: Prisma.QuestionWhereInput = {
      ...scope,
      ...(filter.company === undefined
        ? {}
        : filter.company === 'untagged'
          ? { companies: { none: { isActive: true } } }
          : { companies: { some: { isActive: true, companyKey: filter.company } } }),
    };

    const [rows, companyRows, tagged, rungs, untagged] = await Promise.all([
      this.prisma.question.findMany({
        where,
        orderBy: [{ difficulty: 'asc' }, { slug: 'asc' }],
        include: {
          topic: { select: { slug: true } },
          _count: { select: { expectedConcepts: true } },
          companies: {
            where: { isActive: true },
            include: { company: { select: { key: true, label: true } } },
          },
        },
      }),
      this.prisma.company.findMany({ where: { isActive: true }, orderBy: { key: 'asc' } }),
      this.prisma.questionCompany.groupBy({
        by: ['companyKey'],
        where: { isActive: true, question: scope },
        _count: { _all: true },
      }),
      this.prisma.question.groupBy({
        by: ['difficulty'],
        where: scope,
        _count: { _all: true },
        orderBy: { difficulty: 'asc' },
      }),
      this.prisma.question.count({ where: { ...scope, companies: { none: { isActive: true } } } }),
    ]);

    const countByCompany = new Map(tagged.map((row) => [row.companyKey, row._count._all]));

    return {
      questions: rows.map((row) => ({
        slug: row.slug,
        stem: row.stem,
        topicSlug: row.topic.slug,
        category: row.categoryKey,
        difficulty: row.difficulty,
        levelKey: row.levelKey,
        isDiagnostic: row.isDiagnostic,
        conceptCount: row._count.expectedConcepts,
        companies: row.companies
          .map((edge) => ({ key: edge.company.key, label: edge.company.label }))
          .sort((a, b) => a.key.localeCompare(b.key)),
      })),
      facets: {
        companies: companyRows.map((company) => ({
          key: company.key,
          label: company.label,
          count: countByCompany.get(company.key) ?? 0,
        })),
        difficulties: rungs.map((rung) => ({ difficulty: rung.difficulty, count: rung._count._all })),
        untagged,
      },
    };
  }

  async question(userId: string, slug: string) {
    const loaded = await this.load(userId, slug);
    const revealed = loaded.attemptCount > 0;

    return {
      question: {
        slug: loaded.row.slug,
        stem: loaded.row.stem,
        body: loaded.row.body,
        category: loaded.row.category.key,
        categoryLabel: loaded.row.category.label,
        difficulty: loaded.row.difficulty,
        levelKey: loaded.row.levelKey,
        topicSlug: loaded.row.topic.slug,
        isDiagnostic: loaded.row.isDiagnostic,
        conceptCount: loaded.row.expectedConcepts.length,
        attemptCount: loaded.attemptCount,
        answer: revealed ? this.answerOf(loaded.row) : null,
      },
    };
  }

  async attempt(userId: string, slug: string, dto: AttemptDto) {
    const loaded = await this.load(userId, slug);
    await this.assertAnswerable(userId, loaded.row);

    const result = gradeAnswer(dto.answerText, loaded.concepts);
    const now = new Date();

    /**
     * The diagnostic is a placement instrument: it writes an attempt and nothing else, so it can
     * report a gap but can never promote a topic the learner has not been gated into.
     */
    const review = loaded.row.isDiagnostic
      ? null
      : await this.reviews.recordAttempt(userId, loaded.row.id, {
          passed: result.score >= PASS_SCORE,
          now,
        });

    await this.prisma.attempt.create({
      data: {
        userId,
        questionId: loaded.row.id,
        answerText: dto.answerText,
        verdictKey: result.verdict,
        score: result.score,
        missingConcepts: result.missing.join('; '),
        feedback: result.feedback,
        meta: {
          coverage: result.coverage,
          matched: result.matched,
          missing: result.missing,
          characters: dto.answerText.trim().length,
          fromReview: review?.isReview ?? false,
        },
      },
    });

    const evidence = loaded.row.isDiagnostic
      ? null
      : await this.mastery.recordEvidence(userId, loaded.row.topic.slug, {
          signalKey: loaded.row.category.signalKey,
          fromReview: review?.isReview ?? false,
          score: result.score,
        });

    return {
      verdict: result.verdict,
      score: result.score,
      coverage: result.coverage,
      missing: result.missing,
      feedback: result.feedback,
      evidence: evidence && {
        topicSlug: evidence.topicSlug,
        level: evidence.level,
        levelKey: evidence.levelKey,
        previousLevel: evidence.previousLevel,
        score: evidence.score,
      },
      review: review && {
        intervalDays: review.intervalDays,
        dueAt: review.dueAt,
        lapseCount: review.lapseCount,
      },
      answer: this.answerOf(loaded.row),
    };
  }

  private async load(userId: string, slug: string) {
    const row = await this.prisma.question.findUnique({
      where: { slug },
      include: {
        topic: { select: { slug: true } },
        category: { select: { key: true, label: true, signalKey: true } },
        expectedConcepts: {
          include: { concept: { select: { slug: true, name: true, terms: { select: { term: true } } } } },
        },
        answer: true,
      },
    });

    if (!row || !row.isActive) {
      throw new NotFoundException({ code: 'QUESTION_NOT_FOUND', message: `no question "${slug}"` });
    }

    const attemptCount = await this.prisma.attempt.count({ where: { userId, questionId: row.id } });
    const concepts: GradeableConcept[] = row.expectedConcepts.map((edge) => ({
      slug: edge.concept.slug,
      name: edge.concept.name,
      terms: edge.concept.terms.map((term) => term.term),
      weight: edge.weight,
    }));

    return { row, concepts, attemptCount };
  }

  /**
   * Diagnostics are the one thing a learner with nothing unlocked must be able to sit, so
   * they bypass the gate; a drill on a locked topic is refused with the same repair path
   * the lesson engine gives.
   */
  private async assertAnswerable(userId: string, row: { isDiagnostic: boolean; topic: { slug: string } }) {
    if (row.isDiagnostic) return;

    const gating = await this.curriculum.unlockStateForTopic(userId, row.topic.slug);
    if (!gating) {
      throw new NotFoundException({
        code: 'TOPIC_NOT_FOUND',
        message: `no topic "${row.topic.slug}"`,
      });
    }
    if (gating.state.unlocked) return;

    throw new ForbiddenException({
      code: 'TOPIC_LOCKED',
      message: `"${row.topic.slug}" is not unlocked yet, so this drill would only measure the gap above it`,
      details: {
        blockedBy: gating.state.blockedBy,
        warnings: gating.state.warnings,
        repairPath: (await this.curriculum.repairPathFor(userId, row.topic.slug)).path,
      },
    });
  }

  private answerOf(
    row: {
      answer: {
        shortAnswer: string;
        idealAnswer: string;
        deepAnswer: string;
        commonMistakes: string;
        whyWrong: string;
        followUps: string;
        exercise: string;
      } | null;
    },
  ) {
    if (!row.answer) return null;
    const { shortAnswer, idealAnswer, deepAnswer, commonMistakes, whyWrong, followUps, exercise } = row.answer;
    return { shortAnswer, idealAnswer, deepAnswer, commonMistakes, whyWrong, followUps, exercise };
  }
}
