import { PrismaClient, Prisma } from '@prisma/client';
import { ALL_PHASES, ALL_TOPICS, validateCurriculum, validateLessons } from './content/curriculum';
import { LESSONS } from './content/lessons';
import {
  ATTEMPT_VERDICTS,
  LESSON_SECTION_KINDS,
  MASTERY_LEVELS,
  QUESTION_CATEGORIES,
  SESSION_TYPES,
  SIGNALS,
  SKILLS,
  TRACKS,
} from './content/reference';
import { topologicalOrder, type GraphTopic } from '../src/curriculum/graph';

type Operation = Prisma.PrismaPromise<unknown>;

const asGraphTopic = (topic: (typeof ALL_TOPICS)[number]): GraphTopic => ({
  slug: topic.slug,
  number: topic.number,
  title: topic.title,
  unlockRequiredLevel: topic.unlockRequiredLevel,
  prerequisites: topic.prerequisites,
});

/**
 * Chunked so one interactive transaction does not hold the connection for the whole
 * curriculum while still avoiding hundreds of separate round trips.
 */
async function runInChunks(prisma: PrismaClient, operations: Operation[], size = 200) {
  for (let index = 0; index < operations.length; index += size) {
    await prisma.$transaction(operations.slice(index, index + size));
  }
}

/**
 * Content is code here, so seeding is the deploy step. It validates the authored graph before
 * writing, then upserts by natural key so re-running it is a no-op rather than a duplicate.
 */
export async function seedContent(prisma: PrismaClient): Promise<{ topics: number; phases: number }> {
  const problems = validateCurriculum();
  if (problems.length > 0) throw new Error(`curriculum content invalid:\n${problems.join('\n')}`);
  const lessonProblems = validateLessons();
  if (lessonProblems.length > 0) {
    throw new Error(`lesson content invalid:\n${lessonProblems.join('\n')}`);
  }

  const order = topologicalOrder(ALL_TOPICS.map(asGraphTopic));
  const positionOf = new Map(order.map((slug, index) => [slug, index]));

  const lookups: Operation[] = [
    ...TRACKS.map((row) => prisma.track.upsert({ where: { key: row.key }, create: row, update: row })),
    ...SKILLS.map((row) => prisma.skill.upsert({ where: { key: row.key }, create: row, update: { label: row.label } })),
    ...MASTERY_LEVELS.map((row) => prisma.masteryLevel.upsert({ where: { key: row.key }, create: row, update: row })),
    ...SIGNALS.map((row) => prisma.signal.upsert({ where: { key: row.key }, create: row, update: row })),
    ...QUESTION_CATEGORIES.map((row) =>
      prisma.questionCategory.upsert({
        where: { key: row.key },
        create: row,
        update: { label: row.label, asks: row.asks },
      }),
    ),
    ...LESSON_SECTION_KINDS.map((row) =>
      prisma.lessonSectionKind.upsert({ where: { key: row.key }, create: row, update: row }),
    ),
    ...SESSION_TYPES.map((row) => prisma.sessionType.upsert({ where: { key: row.key }, create: row, update: row })),
    ...ATTEMPT_VERDICTS.map((row) =>
      prisma.attemptVerdict.upsert({ where: { key: row.key }, create: row, update: row }),
    ),
    ...ALL_PHASES.map((phase) =>
      prisma.phase.upsert({
        where: { key: phase.key },
        create: { key: phase.key, number: phase.number, title: phase.title, summary: phase.summary },
        update: { number: phase.number, title: phase.title, summary: phase.summary, isActive: true },
      }),
    ),
    ...ALL_PHASES.flatMap((phase) =>
      phase.tracks.map((trackKey) =>
        prisma.phaseTrack.upsert({
          where: { phaseKey_trackKey: { phaseKey: phase.key, trackKey } },
          create: { phaseKey: phase.key, trackKey },
          update: { isActive: true },
        }),
      ),
    ),
  ];
  await runInChunks(prisma, lookups);

  const topicOps = ALL_TOPICS.map((topic) =>
    prisma.topic.upsert({
      where: { slug: topic.slug },
      create: {
        slug: topic.slug,
        number: topic.number,
        title: topic.title,
        summary: topic.summary,
        phaseKey: topic.phaseKey,
        skillKey: topic.skill ?? null,
        unlockRequiredLevel: topic.unlockRequiredLevel,
        activeMarker: 1,
      },
      update: {
        number: topic.number,
        title: topic.title,
        summary: topic.summary,
        phaseKey: topic.phaseKey,
        skillKey: topic.skill ?? null,
        unlockRequiredLevel: topic.unlockRequiredLevel,
        isActive: true,
        activeMarker: 1,
      },
    }),
  );
  await runInChunks(prisma, topicOps);

  const idBySlug = new Map(
    (await prisma.topic.findMany({ select: { id: true, slug: true } })).map((topic) => [
      topic.slug,
      topic.id,
    ]),
  );

  await runInChunks(prisma, await buildEdgeOperations(prisma, idBySlug, positionOf));
  await runInChunks(prisma, await buildLessonOperations(prisma, idBySlug));

  return { topics: ALL_TOPICS.length, phases: ALL_PHASES.length };
}

/** topic_prerequisites has no natural unique key, so existing edges are matched by slug pair. */
async function buildEdgeOperations(
  prisma: PrismaClient,
  idBySlug: Map<string, string>,
  positionOf: Map<string, number>,
) {
  const existing = await prisma.topicPrerequisite.findMany({
    include: {
      topic: { select: { slug: true } },
      prerequisite: { select: { slug: true } },
    },
  });

  const byPair = new Map(
    existing.map((edge) => [`${edge.topic.slug}>${edge.prerequisite.slug}`, edge]),
  );

  const operations: Operation[] = [];
  for (const topic of ALL_TOPICS) {
    const topicId = idBySlug.get(topic.slug);
    if (!topicId) continue;

    const sorted = [...topic.prerequisites].sort(
      (a, b) => (positionOf.get(a.slug) ?? 0) - (positionOf.get(b.slug) ?? 0),
    );

    for (const prerequisite of sorted) {
      const prerequisiteId = idBySlug.get(prerequisite.slug);
      if (!prerequisiteId) continue;

      const found = byPair.get(`${topic.slug}>${prerequisite.slug}`);
      if (!found) {
        operations.push(
          prisma.topicPrerequisite.create({
            data: { topicId, prerequisiteId, critical: prerequisite.critical },
          }),
        );
      } else if (found.critical !== prerequisite.critical || !found.isActive) {
        operations.push(
          prisma.topicPrerequisite.update({
            where: { id: found.id },
            data: { critical: prerequisite.critical, isActive: true },
          }),
        );
      }
    }
  }
  return operations;
}

/** Sections are matched by kind within a lesson so a reseed edits content instead of duplicating it. */
async function buildLessonOperations(prisma: PrismaClient, idBySlug: Map<string, string>) {
  const operations: Operation[] = [];
  const lessons: Operation[] = [];

  for (const lesson of LESSONS) {
    const topicId = idBySlug.get(lesson.topicSlug);
    if (!topicId) continue;
    lessons.push(
      prisma.lesson.upsert({
        where: { slug: lesson.slug },
        create: { slug: lesson.slug, title: lesson.title, topicId },
        update: { title: lesson.title, topicId, isActive: true },
      }),
    );
  }
  await runInChunks(prisma, lessons);

  const stored = await prisma.lesson.findMany({
    where: { slug: { in: LESSONS.map((lesson) => lesson.slug) } },
    include: { sections: true },
  });
  const bySlug = new Map(stored.map((lesson) => [lesson.slug, lesson]));

  for (const lesson of LESSONS) {
    const row = bySlug.get(lesson.slug);
    if (!row) continue;
    const existingByKind = new Map(row.sections.map((section) => [section.kindKey, section]));

    lesson.sections.forEach((section, index) => {
      const found = existingByKind.get(section.kind);
      if (!found) {
        operations.push(
          prisma.lessonSection.create({
            data: { lessonId: row.id, kindKey: section.kind, position: index + 1, body: section.body },
          }),
        );
      } else if (found.body !== section.body || found.position !== index + 1) {
        operations.push(
          prisma.lessonSection.update({
            where: { id: found.id },
            data: { body: section.body, position: index + 1 },
          }),
        );
      }
    });
  }
  return operations;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await seedContent(prisma);
    console.log(`seeded ${result.phases} phases, ${result.topics} topics`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
