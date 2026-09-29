import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { repairPath, unlockState, type GraphTopic } from './graph';

interface CatalogTopic extends GraphTopic {
  phaseKey: string;
  skillKey: string | null;
  summary: string;
}

/** Current mastery level per topic slug; absent means untouched, which gates as zero. */
type Levels = Record<string, number>;

@Injectable()
export class CurriculumService {
  constructor(private readonly prisma: PrismaService) {}

  async phases(trackKey?: string) {
    const phases = await this.prisma.phase.findMany({
      where: {
        isActive: true,
        ...(trackKey ? { tracks: { some: { trackKey, isActive: true } } } : {}),
      },
      orderBy: { number: 'asc' },
      include: { topics: { where: { isActive: true }, select: { id: true } } },
    });

    return {
      phases: phases.map((phase) => ({
        key: phase.key,
        number: phase.number,
        title: phase.title,
        summary: phase.summary,
        topicCount: phase.topics.length,
      })),
    };
  }

  async catalog(userId: string, trackKey?: string) {
    const topics = await this.loadTopics(trackKey);
    const levels = await this.levelsFor(userId);

    return {
      topics: topics.map((topic) => {
        const { unlocked, blockedBy, warnings } = unlockState(topic, levels);
        return {
          slug: topic.slug,
          title: topic.title,
          summary: topic.summary,
          phaseKey: topic.phaseKey,
          number: topic.number,
          skillKey: topic.skillKey,
          unlockRequiredLevel: topic.unlockRequiredLevel,
          level: levels[topic.slug] ?? 0,
          unlocked,
          blockedBy,
          warnings,
        };
      }),
    };
  }

  async repairPathFor(userId: string, slug: string) {
    const topics = await this.loadTopics();
    if (!topics.some((topic) => topic.slug === slug)) {
      throw new NotFoundException({
        code: 'TOPIC_NOT_FOUND',
        message: `no topic "${slug}"`,
      });
    }

    const levels = await this.levelsFor(userId);
    const slugs = repairPath(slug, topics, levels);
    const bySlug = new Map(topics.map((topic) => [topic.slug, topic]));

    return {
      slug,
      path: slugs.map((entry) => ({
        slug: entry,
        title: bySlug.get(entry)!.title,
        phaseKey: bySlug.get(entry)!.phaseKey,
        currentLevel: levels[entry] ?? 0,
      })),
    };
  }

  private async loadTopics(trackKey?: string): Promise<CatalogTopic[]> {
    const rows = await this.prisma.topic.findMany({
      where: {
        isActive: true,
        ...(trackKey ? { phase: { tracks: { some: { trackKey, isActive: true } } } } : {}),
      },
      orderBy: [{ phase: { number: 'asc' } }, { number: 'asc' }, { slug: 'asc' }],
      include: {
        phase: { select: { number: true } },
        requires: {
          where: { isActive: true },
          include: { prerequisite: { select: { slug: true } } },
        },
      },
    });

    // GraphTopic.number drives the deterministic tie-break in topologicalOrder, so it has to
    // order across phases: phase number first, topic position second.
    const numbering = new Map(
      rows.map((row) => [row.slug, row.phase.number * 1000 + row.number]),
    );

    return rows.map((row) => ({
      slug: row.slug,
      number: numbering.get(row.slug) ?? row.number,
      title: row.title,
      summary: row.summary,
      unlockRequiredLevel: row.unlockRequiredLevel,
      phaseKey: row.phaseKey,
      skillKey: row.skillKey,
      prerequisites: row.requires.map((edge) => ({
        slug: edge.prerequisite.slug,
        critical: edge.critical,
      })),
    }));
  }

  private async levelsFor(userId: string): Promise<Levels> {
    const records = await this.prisma.masteryRecord.findMany({
      where: { userId },
      include: { topic: { select: { slug: true } }, level: { select: { number: true } } },
    });

    return Object.fromEntries(
      records.map((record) => [record.topic.slug, record.level.number]),
    );
  }
}
