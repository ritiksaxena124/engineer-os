import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { deriveStanding, type SignalStanding, type Standing } from './derivation';

interface Dimension {
  key: string;
  weight: number;
  levelKey: string;
  levelNumber: number;
  evidencedByReview: boolean;
}

export interface EvidenceOptions {
  /** The dimension the question's category evidences, as authored on the category row. */
  signalKey: string | null;
  /** An answer taken on its due review day speaks for the recall dimension instead. */
  fromReview: boolean;
  score: number;
}

export interface TopicStanding extends Standing {
  topicSlug: string;
  levelKey: string;
  previousLevel: number;
}

/**
 * §71 — a topic's level is derived from evidence, never asserted. An Attempt is the only thing
 * that can reach this service: reading a lesson has no path here, which is what makes "you read
 * it so you know it" structurally impossible rather than merely discouraged.
 *
 * A dimension's standing is its most recent demonstration, not its best one: evidence you can no
 * longer reproduce is not mastery you still have. `evidenceCount` keeps the audit trail of how
 * many attempts produced that standing.
 */
@Injectable()
export class MasteryService {
  constructor(private readonly prisma: PrismaService) {}

  async recordEvidence(
    userId: string,
    topicSlug: string,
    options: EvidenceOptions,
  ): Promise<TopicStanding | null> {
    // A category marked practice-only produces an attempt and no promotion. That is authored
    // content, checked at seed time, so it is a legitimate absence rather than an error.
    if (!options.signalKey && !options.fromReview) return null;

    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { id: true, slug: true },
    });
    if (!topic) throw new NotFoundException({ code: 'TOPIC_NOT_FOUND', message: `no topic "${topicSlug}"` });

    const [dimensions, levels] = await Promise.all([this.dimensions(), this.levels()]);
    const dimension = dimensions.find((entry) =>
      options.fromReview ? entry.evidencedByReview : entry.key === options.signalKey,
    );
    if (!dimension) {
      throw new NotFoundException({
        code: 'SIGNAL_NOT_FOUND',
        message: options.fromReview
          ? 'no mastery signal is marked as evidenced by a review'
          : `no mastery signal "${options.signalKey}"`,
      });
    }

    const exposure = levels.find((level) => level.number === 0);
    if (!exposure) throw new Error('no exposure mastery level is configured');

    const record = await this.prisma.masteryRecord.upsert({
      where: { userId_topicId: { userId, topicId: topic.id } },
      create: { userId, topicId: topic.id, levelKey: exposure.key },
      update: {},
      include: { level: { select: { number: true } } },
    });

    const signal = await this.prisma.masteryRecordSignal.upsert({
      where: { recordId_signalKey: { recordId: record.id, signalKey: dimension.key } },
      create: { recordId: record.id, signalKey: dimension.key, score: options.score, evidenceCount: 1 },
      update: { score: options.score, evidenceCount: { increment: 1 } },
    });

    const earned = await this.prisma.masteryRecordSignal.findMany({ where: { recordId: record.id } });
    const standing = deriveStanding(this.dimensionsWith(dimensions, earned));
    const levelKey = this.keyForLevel(levels, standing.level);
    const previousLevel = record.level.number;

    if (standing.level !== previousLevel) {
      await this.prisma.$transaction([
        this.prisma.masteryRecord.update({ where: { id: record.id }, data: { levelKey } }),
        this.prisma.masteryEvent.create({
          data: {
            recordId: record.id,
            fromLevel: record.levelKey,
            toLevel: levelKey,
            reason: this.reasonFor(dimension.key, options.score, signal.evidenceCount, standing.level, previousLevel),
          },
        }),
      ]);
    }

    return { ...standing, levelKey, topicSlug: topic.slug, previousLevel };
  }

  async standings(userId: string): Promise<{ standings: TopicStanding[]; summary: Summary }> {
    const standings = await this.allStandings(userId);
    const levels: Record<string, number> = {};
    for (const standing of standings.values()) {
      levels[standing.levelKey] = (levels[standing.levelKey] ?? 0) + 1;
    }

    const rows = [...standings.values()].sort((a, b) => a.topicSlug.localeCompare(b.topicSlug));
    return { standings: rows, summary: { topics: rows.length, levels } };
  }

  /** Every evidenced topic, derived from the signal ledger rather than stored as a claim. */
  private async allStandings(userId: string): Promise<Map<string, TopicStanding>> {
    const [dimensions, levels, records] = await Promise.all([
      this.dimensions(),
      this.levels(),
      this.prisma.masteryRecord.findMany({
        where: { userId },
        include: {
          topic: { select: { slug: true } },
          level: { select: { number: true } },
          signals: true,
        },
      }),
    ]);

    const byTopic = new Map<string, TopicStanding>();
    for (const record of records) {
      const standing = deriveStanding(this.dimensionsWith(dimensions, record.signals));
      byTopic.set(record.topicId, {
        ...standing,
        levelKey: this.keyForLevel(levels, standing.level),
        topicSlug: record.topic.slug,
        previousLevel: record.level.number,
      });
    }
    return byTopic;
  }

  /** An unevidenced dimension scores zero and still counts against the aggregate. */
  private dimensionsWith(
    dimensions: Dimension[],
    earned: { signalKey: string; score: number; evidenceCount: number }[],
  ): SignalStanding[] {
    const byKey = new Map(earned.map((row) => [row.signalKey, row]));
    return dimensions.map((dimension) => ({
      ...dimension,
      score: byKey.get(dimension.key)?.score ?? 0,
      evidenceCount: byKey.get(dimension.key)?.evidenceCount ?? 0,
    }));
  }

  private levels() {
    return this.prisma.masteryLevel.findMany({ where: { isActive: true }, orderBy: { number: 'asc' } });
  }

  private async dimensions(): Promise<Dimension[]> {
    const signals = await this.prisma.signal.findMany({
      where: { isActive: true },
      include: { level: { select: { number: true } } },
      orderBy: { key: 'asc' },
    });

    return signals.map((signal) => ({
      key: signal.key,
      weight: signal.weight,
      levelKey: signal.levelKey,
      levelNumber: signal.level.number,
      evidencedByReview: signal.evidencedByReview,
    }));
  }

  private keyForLevel(levels: { key: string; number: number }[], number: number): string {
    const level = levels.find((entry) => entry.number === number);
    if (!level) throw new Error(`no mastery level configured for rung ${number}`);
    return level.key;
  }

  /** The event ledger is read by humans later, so each row says what moved and why. */
  private reasonFor(
    signalKey: string,
    score: number,
    evidenceCount: number,
    level: number,
    previousLevel: number,
  ): string {
    const evidence = `${signalKey} evidenced at ${score}/100 on attempt ${evidenceCount}`;
    return level > previousLevel
      ? `${evidence}; rungs up to ${level} are now held in order`
      : `${evidence}; the chain broke, so the standing falls back to rung ${level}`;
  }
}

interface Summary {
  topics: number;
  levels: Record<string, number>;
}
