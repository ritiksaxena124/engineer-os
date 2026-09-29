import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurriculumService, type CatalogTopic } from '../curriculum/curriculum.service';
import { detectWeaknesses, REPEATED_FAILURE_STREAK, type AttemptRow, type WeaknessFinding } from './weakness';

/**
 * Milestone 8. A refusal says what is locked; this says what is *weak*, which is a different
 * question. Repeated failure on a topic is read as evidence about the graph underneath it, and
 * the report names the one topic the next hour should be spent on instead of the one being drilled.
 *
 * Nothing here is stored. The attempt ledger, the review lapses and the current standings are
 * enough to derive it, so a repaired foundation closes the finding without a cleanup job.
 */
@Injectable()
export class WeaknessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly curriculum: CurriculumService,
  ) {}

  async report(userId: string) {
    const [{ topics, levels }, attemptRows, lapseRows] = await Promise.all([
      this.curriculum.graphWithLevels(userId),
      this.prisma.attempt.findMany({
        where: { userId },
        select: {
          score: true,
          createdAt: true,
          question: { select: { slug: true, isDiagnostic: true, topic: { select: { slug: true } } } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.reviewSchedule.findMany({
        where: { userId, isActive: true, lapseCount: { gt: 0 } },
        select: { lapseCount: true, question: { select: { topic: { select: { slug: true } } } } },
      }),
    ]);

    const attempts: AttemptRow[] = [];
    for (const row of attemptRows) {
      // A session attempt with no question is not evidence about a topic.
      if (!row.question) continue;
      attempts.push({
        topicSlug: row.question.topic.slug,
        questionSlug: row.question.slug,
        score: row.score,
        at: row.createdAt,
        isDiagnostic: row.question.isDiagnostic,
      });
    }

    const lapses = new Map<string, number>();
    for (const row of lapseRows) {
      const slug = row.question.topic.slug;
      lapses.set(slug, (lapses.get(slug) ?? 0) + row.lapseCount);
    }

    const bySlug = new Map(topics.map((topic) => [topic.slug, topic]));
    const weaknesses = detectWeaknesses(attempts, topics, levels).map((finding) =>
      this.entry(finding, bySlug, levels, lapses),
    );

    const rootCauses: string[] = [];
    for (const entry of weaknesses) {
      if (!rootCauses.includes(entry.rootCause.slug)) rootCauses.push(entry.rootCause.slug);
    }

    return {
      threshold: REPEATED_FAILURE_STREAK,
      weaknesses,
      summary: { topics: weaknesses.length, rootCauses },
    };
  }

  private entry(
    finding: WeaknessFinding,
    bySlug: Map<string, CatalogTopic>,
    levels: Record<string, number>,
    lapses: Map<string, number>,
  ) {
    const topic = bySlug.get(finding.topicSlug)!;
    const root = bySlug.get(finding.rootCauseSlug)!;
    const levelOf = (slug: string) => levels[slug] ?? 0;

    return {
      topicSlug: topic.slug,
      title: topic.title,
      phaseKey: topic.phaseKey,
      level: levelOf(topic.slug),
      requiredLevel: topic.unlockRequiredLevel,
      failedStreak: finding.failedStreak,
      attempts: finding.attempts,
      lapses: lapses.get(topic.slug) ?? 0,
      rootCause: {
        slug: root.slug,
        title: root.title,
        phaseKey: root.phaseKey,
        currentLevel: levelOf(root.slug),
      },
      repairPath: finding.repairPath.map((slug) => ({
        slug,
        title: bySlug.get(slug)!.title,
        phaseKey: bySlug.get(slug)!.phaseKey,
        currentLevel: levelOf(slug),
      })),
      action: this.actionFor(finding, topic, { slug: root.slug, level: levelOf(root.slug) }),
    };
  }

  /** The sentence the learner reads, and the reason the report exists at all. */
  private actionFor(
    finding: WeaknessFinding,
    topic: CatalogTopic,
    root: { slug: string; level: number },
  ): string {
    const misses = `${finding.failedStreak} misses in a row on ${topic.slug}`;
    if (root.slug === topic.slug) {
      return `${misses} with nothing weaker underneath it. The gap is in ${topic.slug} itself: re-read the ` +
        'lesson, run the exercise, and answer again from what you measured instead of what you remember.';
    }
    return `${misses}, and the misses are not about ${topic.slug}. ${root.slug} is at rung ${root.level} and ` +
      `this topic does not work below ${topic.unlockRequiredLevel}. Stop drilling ${topic.slug} — rebuild ` +
      `${root.slug} to ${topic.unlockRequiredLevel} first.`;
  }
}
