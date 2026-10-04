import { PrismaClient, Prisma } from '@prisma/client';
import { ALL_PHASES, ALL_TOPICS, validateCurriculum, validateLessons } from './content/curriculum';
import { LESSONS } from './content/lessons';
import { ALL_QUESTIONS, validateQuestions } from './content/questions';
import { ASKED_AT, COMPANIES, validateCompanies } from './content/companies';
import { INTERVIEW_SCENARIOS, validateInterviewScenarios } from './content/interview-scenarios';
import type { ConceptSpec } from './content/types';
import {
  ATTEMPT_VERDICTS,
  LESSON_SECTION_KINDS,
  MASTERY_LEVELS,
  QUESTION_CATEGORIES,
  SESSION_TYPES,
  SIGNALS,
  SKILLS,
  TRACKS,
  validateReference,
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
export async function seedContent(
  prisma: PrismaClient,
): Promise<{ topics: number; phases: number; questions: number; scenarios: number }> {
  const problems = validateCurriculum();
  if (problems.length > 0) throw new Error(`curriculum content invalid:\n${problems.join('\n')}`);
  const lessonProblems = validateLessons();
  if (lessonProblems.length > 0) {
    throw new Error(`lesson content invalid:\n${lessonProblems.join('\n')}`);
  }
  const questionProblems = validateQuestions();
  if (questionProblems.length > 0) {
    throw new Error(`question content invalid:\n${questionProblems.join('\n')}`);
  }
  const companyProblems = validateCompanies(new Set(ALL_QUESTIONS.map((question) => question.slug)));
  if (companyProblems.length > 0) {
    throw new Error(`company tags invalid:\n${companyProblems.join('\n')}`);
  }
  const referenceProblems = validateReference();
  if (referenceProblems.length > 0) {
    throw new Error(`reference content invalid:\n${referenceProblems.join('\n')}`);
  }
  const scenarioProblems = validateInterviewScenarios();
  if (scenarioProblems.length > 0) {
    throw new Error(`interview scenario content invalid:\n${scenarioProblems.join('\n')}`);
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
        update: { label: row.label, asks: row.asks, signalKey: row.signalKey },
      }),
    ),
    ...LESSON_SECTION_KINDS.map((row) =>
      prisma.lessonSectionKind.upsert({ where: { key: row.key }, create: row, update: row }),
    ),
    ...COMPANIES.map((row) =>
      prisma.company.upsert({ where: { key: row.key }, create: row, update: { label: row.label, isActive: true } }),
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

  // A phase's display order is unique per row, so resequencing it — inserting a topic between two
  // existing ones — cannot be written in one pass: the second upsert would land on a number the
  // first has not given up yet. Every row steps into a high band first, then the authored order
  // writes the finals into the space that leaves empty.
  await runInChunks(
    prisma,
    ALL_PHASES.map((phase) =>
      prisma.topic.updateMany({ where: { phaseKey: phase.key }, data: { number: { increment: 1000 } } }),
    ),
  );

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
  await buildQuestionOperations(prisma, idBySlug);
  const scenarios = await seedInterviewScenarios(prisma);

  return {
    topics: ALL_TOPICS.length,
    phases: ALL_PHASES.length,
    questions: ALL_QUESTIONS.length,
    scenarios,
  };
}

/**
 * A scenario's files and fixes are keyed by their path inside the project, so re-seeding an edited
 * scenario updates the rows the room reads instead of leaving a stale second copy behind.
 */
async function seedInterviewScenarios(prisma: PrismaClient): Promise<number> {
  for (const scenario of INTERVIEW_SCENARIOS) {
    await prisma.interviewScenario.upsert({
      where: { slug: scenario.slug },
      create: {
        slug: scenario.slug,
        title: scenario.title,
        roleKey: scenario.roleKey,
        ticketTitle: scenario.ticketTitle,
        ticketBody: scenario.ticketBody,
        signalNotes: scenario.signalNotes,
        isActive: true,
      },
      update: {
        title: scenario.title,
        roleKey: scenario.roleKey,
        ticketTitle: scenario.ticketTitle,
        ticketBody: scenario.ticketBody,
        signalNotes: scenario.signalNotes,
        isActive: true,
      },
    });

    for (const [index, file] of scenario.files.entries()) {
      await prisma.interviewScenarioFile.upsert({
        where: { scenarioSlug_path: { scenarioSlug: scenario.slug, path: file.path } },
        create: {
          scenarioSlug: scenario.slug,
          path: file.path,
          contents: file.contents,
          position: index + 1,
          isCheck: file.isCheck === true,
        },
        update: { contents: file.contents, position: index + 1, isCheck: file.isCheck === true },
      });
    }

    const stored = await prisma.interviewScenarioFix.findMany({
      where: { scenarioSlug: scenario.slug },
      orderBy: { position: 'asc' },
    });
    for (const [index, fix] of scenario.fixes.entries()) {
      const position = index + 1;
      const found = stored.find((row) => row.filePath === fix.filePath && row.position === position);
      const data = {
        requiredText: fix.requiredText,
        fixedText: fix.fixedText,
        rationale: fix.rationale,
        position,
      };
      if (found) {
        await prisma.interviewScenarioFix.update({ where: { id: found.id }, data });
      } else {
        await prisma.interviewScenarioFix.create({
          data: { ...data, scenarioSlug: scenario.slug, filePath: fix.filePath, isActive: true },
        });
      }
    }
    const authored = new Set(
      scenario.fixes.map((fix, index) => `${fix.filePath}#${index + 1}`),
    );
    const stale = stored
      .filter((row) => row.isActive && !authored.has(`${row.filePath}#${row.position}`))
      .map((row) => row.id);
    if (stale.length > 0) {
      await prisma.interviewScenarioFix.updateMany({ where: { id: { in: stale } }, data: { isActive: false } });
    }
  }
  return INTERVIEW_SCENARIOS.length;
}

/**
 * Questions carry their own rubric: concepts are global rows, their terms are the matchable
 * phrasings, and the answer model travels with the question so grading never reads source files.
 */
async function buildQuestionOperations(prisma: PrismaClient, topicIdBySlug: Map<string, string>) {
  const lessonIdBySlug = new Map(
    (await prisma.lesson.findMany({ select: { id: true, slug: true } })).map((lesson) => [lesson.slug, lesson.id]),
  );

  await runInChunks(
    prisma,
    ALL_QUESTIONS.map((question) => {
      const data = {
        stem: question.stem,
        body: question.body,
        difficulty: question.difficulty,
        isDiagnostic: question.isDiagnostic === true,
        topicId: topicIdBySlug.get(question.topicSlug) as string,
        categoryKey: question.categoryKey,
        levelKey: question.levelKey,
        lessonId: question.lessonSlug ? lessonIdBySlug.get(question.lessonSlug) ?? null : null,
      };
      return prisma.question.upsert({
        where: { slug: question.slug },
        create: { slug: question.slug, ...data },
        update: { ...data, isActive: true },
      });
    }),
  );

  const questionIdBySlug = new Map(
    (await prisma.question.findMany({ select: { id: true, slug: true } })).map((row) => [row.slug, row.id]),
  );

  await seedCompanyTags(prisma, questionIdBySlug);

  // validateQuestions guarantees a shared concept slug always means the same thing, so the
  // first definition seen is the definition.
  const conceptBySlug = new Map<string, ConceptSpec>();
  const conceptTopicId = new Map<string, string>();
  for (const question of ALL_QUESTIONS) {
    for (const concept of question.concepts) {
      if (conceptBySlug.has(concept.slug)) continue;
      conceptBySlug.set(concept.slug, concept);
      conceptTopicId.set(concept.slug, topicIdBySlug.get(question.topicSlug) as string);
    }
  }

  await runInChunks(
    prisma,
    [...conceptBySlug.entries()].map(([slug, concept]) => {
      const topicId = conceptTopicId.get(slug) as string;
      return prisma.concept.upsert({
        where: { slug },
        create: { slug, name: concept.name, detail: concept.detail, topicId },
        update: { name: concept.name, detail: concept.detail, topicId, isActive: true },
      });
    }),
  );

  const conceptIdBySlug = new Map(
    (await prisma.concept.findMany({ select: { id: true, slug: true } })).map((row) => [row.slug, row.id]),
  );

  const termOperations: Operation[] = [];
  const edgeOperations: Operation[] = [];
  for (const question of ALL_QUESTIONS) {
    const questionId = questionIdBySlug.get(question.slug);
    if (!questionId) continue;

    for (const concept of question.concepts) {
      const conceptId = conceptIdBySlug.get(concept.slug);
      if (!conceptId) continue;
      for (const term of concept.terms) {
        termOperations.push(
          prisma.conceptTerm.upsert({
            where: { conceptId_term: { conceptId, term } },
            create: { conceptId, term },
            update: {},
          }),
        );
      }
      const weight = concept.weight ?? 1;
      edgeOperations.push(
        prisma.questionExpectedConcept.upsert({
          where: { questionId_conceptId: { questionId, conceptId } },
          create: { questionId, conceptId, weight },
          update: { weight },
        }),
      );
    }
  }
  await runInChunks(prisma, termOperations);

  await runInChunks(
    prisma,
    ALL_QUESTIONS.map((question) => {
      const questionId = questionIdBySlug.get(question.slug) as string;
      return prisma.questionAnswer.upsert({
        where: { questionId },
        create: { questionId, ...question.answer },
        update: question.answer,
      });
    }),
  );
  await runInChunks(prisma, edgeOperations);
}

/**
 * Company tags are curated content, so refining companies.ts is a reseed: every live edge is
 * turned off first and the map switches back the ones it still claims. An edge that the curator
 * removed goes inactive rather than deleted, in line with the rest of the schema.
 */
async function seedCompanyTags(prisma: PrismaClient, questionIdBySlug: Map<string, string>) {
  await prisma.questionCompany.updateMany({ where: { isActive: true }, data: { isActive: false } });

  const operations: Operation[] = [];
  for (const [slug, keys] of Object.entries(ASKED_AT)) {
    const questionId = questionIdBySlug.get(slug);
    if (!questionId) continue;
    for (const companyKey of keys) {
      operations.push(
        prisma.questionCompany.upsert({
          where: { questionId_companyKey: { questionId, companyKey } },
          create: { questionId, companyKey, isActive: true },
          update: { isActive: true },
        }),
      );
    }
  }
  await runInChunks(prisma, operations);
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
    console.log(
      `seeded ${result.phases} phases, ${result.topics} topics, ${result.questions} questions, ${result.scenarios} interview scenarios`,
    );
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
