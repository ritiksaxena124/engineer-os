import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** The review ladder: a passed item comes back at these day offsets until it is never failed again. */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

const DAY_MS = 86_400_000;

export interface ReviewOutcome {
  /** True when this attempt was made on or after the due date, which makes it recall evidence. */
  isReview: boolean;
  intervalDays: number;
  dueAt: Date;
  lapseCount: number;
}

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Spaced repetition over the attempt ledger. Only a passed answer enters the schedule — a
   * question you have never passed is not revision material, it is a gap the weakness engine has
   * to route back through the graph. Failing a scheduled item resets its interval and counts a
   * lapse, which is what makes the lapse count observable in the standing.
   */
  async recordAttempt(
    userId: string,
    questionId: string,
    options: { passed: boolean; now: Date },
  ): Promise<ReviewOutcome | null> {
    const row = await this.prisma.reviewSchedule.findFirst({
      where: { userId, questionId, isActive: true },
    });

    if (!row) {
      if (!options.passed) return null;
      const created = await this.prisma.reviewSchedule.create({
        data: {
          userId,
          questionId,
          intervalDays: REVIEW_INTERVALS[0],
          dueAt: new Date(options.now.getTime() + REVIEW_INTERVALS[0] * DAY_MS),
        },
      });
      return this.outcome(created, false);
    }

    const isReview = row.dueAt.getTime() <= options.now.getTime();
    const intervalDays = options.passed
      ? isReview
        ? this.nextInterval(row.intervalDays)
        : row.intervalDays
      : REVIEW_INTERVALS[0];
    const lapseCount = options.passed ? row.lapseCount : row.lapseCount + 1;

    const updated = await this.prisma.reviewSchedule.update({
      where: { id: row.id },
      data: { intervalDays, lapseCount, dueAt: new Date(options.now.getTime() + intervalDays * DAY_MS) },
    });

    return this.outcome(updated, isReview);
  }

  async due(userId: string, now: Date) {
    const rows = await this.prisma.reviewSchedule.findMany({
      where: { userId, isActive: true, dueAt: { lte: now } },
      include: { question: { select: { slug: true, topic: { select: { slug: true } }, difficulty: true } } },
      orderBy: { dueAt: 'asc' },
    });

    return {
      reviews: rows.map((row) => ({
        questionSlug: row.question.slug,
        topicSlug: row.question.topic.slug,
        difficulty: row.question.difficulty,
        dueAt: row.dueAt,
        intervalDays: row.intervalDays,
        lapseCount: row.lapseCount,
      })),
    };
  }

  private nextInterval(current: number): number {
    const index = REVIEW_INTERVALS.indexOf(current);
    // An off-ladder interval (content edited after scheduling) resumes at the first rung.
    if (index < 0) return REVIEW_INTERVALS[0];
    return REVIEW_INTERVALS[Math.min(index + 1, REVIEW_INTERVALS.length - 1)];
  }

  private outcome(row: { intervalDays: number; dueAt: Date; lapseCount: number }, isReview: boolean): ReviewOutcome {
    return { isReview, intervalDays: row.intervalDays, dueAt: row.dueAt, lapseCount: row.lapseCount };
  }
}
