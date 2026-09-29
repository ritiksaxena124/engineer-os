import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { createTestApp, type TestApp } from './helpers/test-app';
import { seedContent } from '../prisma/seed';

interface ExamItem {
  slug: string;
  stem: string;
  body: string;
  difficulty: number;
  category: string;
  topicSlug: string;
  conceptCount: number;
}

interface ExamPart {
  key: string;
  label: string;
  position: number;
  minutes: number;
  instructions: string;
  short: boolean;
  items: ExamItem[];
}

interface Started {
  sessionId: string;
  phaseKey: string;
  phaseTitle: string;
  plannedMinutes: number;
  shortParts: string[];
  parts: ExamPart[];
}

interface PartScore {
  key: string;
  label: string;
  items: number;
  answered: number;
  score: number;
  passed: boolean;
}

interface Submitted {
  sessionId: string;
  passed: boolean;
  score: number;
  parts: PartScore[];
  failedParts: { key: string; label: string; score: number }[];
  verdicts: { slug: string; part: string; verdict: string; score: number; missing: string[] }[];
  promotions: { topicSlug: string; levelKey: string; previousLevel: number; level: number }[];
  nextPhase: { key: string; title: string } | null;
}

interface ErrorBody {
  error?: { code?: string; details?: { blocked?: unknown[]; missingParts?: { key: string }[] } };
}

let app: TestApp;
let prisma: PrismaClient;

async function request(path: string, method = 'GET', auth?: string, body?: unknown) {
  const res = await fetch(`${app.base}${path}`, {
    method,
    headers: {
      ...(auth ? { authorization: `Bearer ${auth}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  return { status: res.status, text, body: text ? (JSON.parse(text) as ErrorBody & Record<string, unknown>) : null };
}

/**
 * Gating reads the derived standing, so "has reached the phase" is a learner whose signals hold
 * the rungs underneath it. Planted here because climbing it through the API would need a question
 * set for every topic in the phase — that is content work, and this file tests the exam.
 */
async function reachPhase(userId: string, phaseKeys: string[]) {
  const topics = await prisma.topic.findMany({ where: { phase: { key: { in: phaseKeys } } }, select: { id: true } });
  for (const topic of topics) {
    const record = await prisma.masteryRecord.upsert({
      where: { userId_topicId: { userId, topicId: topic.id } },
      create: { userId, topicId: topic.id, levelKey: 'debugging' },
      update: { levelKey: 'debugging' },
    });
    for (const signalKey of ['understanding', 'implementation', 'debugging']) {
      await prisma.masteryRecordSignal.upsert({
        where: { recordId_signalKey: { recordId: record.id, signalKey } },
        create: { recordId: record.id, signalKey, score: 85, evidenceCount: 1 },
        update: { score: 85, evidenceCount: 1 },
      });
    }
  }
}

async function learner(phaseKeys?: string[]) {
  const email = `exam-${(phaseKeys ?? ['fresh']).join('-')}-${Math.random().toString(36).slice(2, 10)}@example.com`;
  const res = await fetch(`${app.base}/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, displayName: 'Exam Tester', password: 'CoMplicated-passw0rd!23' }),
  });
  const body = (await res.json()) as { accessToken: string; user: { id: string } };
  if (phaseKeys) await reachPhase(body.user.id, phaseKeys);
  return { token: body.accessToken, userId: body.user.id };
}

async function startExam(token: string, phaseKey: string) {
  const res = await request('/assessments/exam', 'POST', token, { phaseKey });
  return res.body as unknown as Started;
}

/** An answer that carries every rubric term, phrased as an explanation rather than a list. */
const essay = (terms: string[]) =>
  terms.map((term) => `${term} is the part that decides the outcome here`).join('; ') +
  ', and the order matters because each of those is what the next one waits on.';

async function termsFor(item: ExamItem): Promise<string[]> {
  const firstTerm = (terms: { term: string }[]) => terms[0]?.term;

  // Part G has no question row, so its rubric is the topic's own concepts
  if (item.category === 'teach-back') {
    const concepts = await prisma.concept.findMany({
      where: { topic: { slug: item.topicSlug }, isActive: true },
      select: { terms: { select: { term: true } } },
    });
    return concepts
      .map((concept) => firstTerm(concept.terms))
      .filter((term): term is string => Boolean(term));
  }

  const question = await prisma.question.findUniqueOrThrow({
    where: { slug: item.slug },
    select: { expectedConcepts: { select: { concept: { select: { terms: { select: { term: true } } } } } } },
  });
  return question.expectedConcepts
    .map((edge) => firstTerm(edge.concept.terms))
    .filter((term): term is string => Boolean(term));
}

const essayFor = async (item: ExamItem) => essay(await termsFor(item));

const strongAnswers = async (started: Started) => {
  const answers: { slug: string; answerText: string }[] = [];
  for (const part of started.parts) {
    for (const item of part.items) answers.push({ slug: item.slug, answerText: await essayFor(item) });
  }
  return answers;
};

const partOf = (started: Started, key: string) => started.parts.find((part) => part.key === key)!;
const itemSlugs = (started: Started) => started.parts.flatMap((part) => part.items.map((item) => item.slug));

describe('phase exam', () => {
  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
    await seedContent(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('requires authentication', async () => {
    expect((await request('/assessments/exam', 'POST', undefined, { phaseKey: 'p00' })).status).toBe(401);
  });

  test('refuses a phase that does not exist', async () => {
    const { token } = await learner();
    const res = await request('/assessments/exam', 'POST', token, { phaseKey: 'p99' });
    expect(res.status).toBe(404);
    expect(res.body!.error!.code).toBe('PHASE_NOT_FOUND');
  });

  test('refuses a phase the learner has not reached, and names what blocks it', async () => {
    const { token } = await learner();
    const res = await request('/assessments/exam', 'POST', token, { phaseKey: 'p00' });
    expect(res.status).toBe(409);
    expect(res.body!.error!.code).toBe('PHASE_NOT_REACHED');
    const blocked = res.body!.error!.details!.blocked as { slug: string }[];
    // everything except the entry topic, which has no prerequisites and is open from the start
    expect(blocked.map((entry) => entry.slug).sort()).toEqual(
      ['concurrency-parallelism', 'cpu-bound-vs-io-bound', 'memory-hierarchy', 'networking-basics', 'processes-threads', 'system-calls-io'],
    );
  });

  test('reading every lesson in the phase does not reach the phase', async () => {
    const { token, userId } = await learner();
    const lessons = await prisma.lesson.findMany({ where: { topic: { phaseKey: 'p00' } }, select: { id: true } });
    expect(lessons.length).toBeGreaterThan(0);
    await prisma.lessonRead.createMany({ data: lessons.map((lesson) => ({ userId, lessonId: lesson.id })) });

    const res = await request('/assessments/exam', 'POST', token, { phaseKey: 'p00' });
    expect(res.status).toBe(409);
    expect(res.body!.error!.code).toBe('PHASE_NOT_REACHED');
  });

  test('refuses a phase whose parts nobody authored, instead of padding the paper', async () => {
    const { token } = await learner(['p00', 'p01', 'p02']);
    const res = await request('/assessments/exam', 'POST', token, { phaseKey: 'p02' });
    expect(res.status).toBe(409);
    expect(res.body!.error!.code).toBe('EXAM_NOT_AUTHORED');
    expect(res.body!.error!.details!.missingParts!.map((part) => part.key)).toEqual(
      expect.arrayContaining(['theory', 'implementation', 'debugging', 'architecture', 'production', 'interview']),
    );
  });

  test('hands out Parts A to G in order, with the answer models closed', async () => {
    const { token } = await learner(['p00']);
    const res = await request('/assessments/exam', 'POST', token, { phaseKey: 'p00' });
    expect(res.status).toBe(201);
    const started = res.body as unknown as Started;

    expect(started.parts.map((part) => part.position)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(started.parts.map((part) => part.key)).toEqual([
      'theory',
      'implementation',
      'debugging',
      'architecture',
      'production',
      'interview',
      'teaching',
    ]);
    expect(started.plannedMinutes).toBe(175);
    expect(started.phaseTitle).toBeTruthy();

    // every part is a different kind of work, so every part carries its own instruction
    expect(new Set(started.parts.map((part) => part.instructions)).size).toBe(7);

    const interview = partOf(started, 'interview');
    expect(interview.items.map((item) => item.difficulty)).toEqual([5, 6, 7]);
    expect(interview.short).toBe(false);

    // a thin bank is a short paper, said out loud rather than hidden
    expect(partOf(started, 'theory').short).toBe(true);
    expect(started.shortParts).toContain('Part A — Theory');

    const teaching = partOf(started, 'teaching');
    expect(teaching.items).toHaveLength(1);
    expect(teaching.items[0].category).toBe('teach-back');
    expect(teaching.items[0].slug).toBe(`teach-back::${teaching.items[0].topicSlug}`);

    expect(res.text).not.toContain('idealAnswer');
    expect(res.text).not.toContain('shortAnswer');
    expect(res.text).not.toContain('commonMistakes');

    const session = await prisma.learningSession.findUniqueOrThrow({ where: { id: started.sessionId } });
    expect(session.typeKey).toBe('exam');
    expect(session.plannedMinutes).toBe(175);
    expect(session.meta).toMatchObject({ kind: 'phase-exam', phaseKey: 'p00' });
  });

  test('the same phase hands out the same paper, so a retake is a retake', async () => {
    const { token } = await learner(['p00']);
    const first = await startExam(token, 'p00');
    const second = await startExam(token, 'p00');
    expect(itemSlugs(second)).toEqual(itemSlugs(first));
  });

  test('every part held is a pass, and the pass is what recommends the next phase', async () => {
    const { token, userId } = await learner(['p00']);
    const started = await startExam(token, 'p00');
    const res = await request('/assessments/exam/submit', 'POST', token, {
      sessionId: started.sessionId,
      answers: await strongAnswers(started),
    });
    expect(res.status).toBe(201);
    const report = res.body as unknown as Submitted;

    expect(report.passed).toBe(true);
    expect(report.failedParts).toHaveLength(0);
    expect(report.parts).toHaveLength(7);
    expect(report.parts.every((part) => part.passed && part.score >= 60)).toBe(true);
    expect(report.nextPhase!.key).toBe('p01');

    const attempts = await prisma.attempt.findMany({ where: { sessionId: started.sessionId } });
    expect(attempts).toHaveLength(itemSlugs(started).length);
    expect(attempts.every((attempt) => attempt.userId === userId)).toBe(true);
    expect(attempts.every((attempt) => (attempt.meta as { examPart?: string }).examPart)).toBe(true);

    // Part G evidences a topic with no question row behind it
    const teachBack = attempts.find((attempt) => attempt.questionId === null)!;
    expect((teachBack.meta as { teachBackTopic?: string }).teachBackTopic).toBe(
      partOf(started, 'teaching').items[0].topicSlug,
    );
  });

  test('one failed part is a failed exam, and no next phase is recommended', async () => {
    const { token } = await learner(['p00']);
    const started = await startExam(token, 'p00');
    const skipped = new Set(partOf(started, 'debugging').items.map((item) => item.slug));
    const report = (await request('/assessments/exam/submit', 'POST', token, {
      sessionId: started.sessionId,
      answers: (await strongAnswers(started)).filter((answer) => !skipped.has(answer.slug)),
    }))
      .body as unknown as Submitted;

    expect(report.passed).toBe(false);
    expect(report.failedParts.map((part) => part.key)).toEqual(['debugging']);
    expect(report.nextPhase).toBeNull();

    const debugging = report.parts.find((part) => part.key === 'debugging')!;
    expect(debugging.answered).toBe(0);
    expect(debugging.score).toBe(0);
  });

  test('an answer that names nothing the rubric asks for does not hold its part', async () => {
    const { token } = await learner(['p00']);
    const started = await startExam(token, 'p00');
    const theory = partOf(started, 'theory');
    const answers = await strongAnswers(started);
    for (const item of theory.items) {
      answers.find((answer) => answer.slug === item.slug)!.answerText =
        'It is the thing that runs your code and keeps everything fast, which is why most teams reach for it ' +
        'first, before looking at the rest of the system around it, and then again much later.';
    }
    const report = (await request('/assessments/exam/submit', 'POST', token, {
      sessionId: started.sessionId,
      answers,
    }))
      .body as unknown as Submitted;

    expect(report.passed).toBe(false);
    const scores = report.parts.find((part) => part.key === 'theory')!;
    expect(scores.answered).toBe(theory.items.length);
    expect(scores.passed).toBe(false);
    expect(
      report.verdicts.filter((verdict) => verdict.part === 'theory').every((verdict) => verdict.missing.length > 0),
    ).toBe(true);
  });

  test('refuses a slug that is not on this paper, and a second answer to the same item', async () => {
    const { token } = await learner(['p00']);
    const started = await startExam(token, 'p00');

    const foreign = await request('/assessments/exam/submit', 'POST', token, {
      sessionId: started.sessionId,
      answers: [{ slug: 'drill-interview-event-loop', answerText: essay(['address space', 'page table']) }],
    });
    expect(foreign.status).toBe(400);
    expect(foreign.body!.error!.code).toBe('QUESTION_NOT_FOUND');

    const [first] = partOf(started, 'theory').items;
    const duplicate = await request('/assessments/exam/submit', 'POST', token, {
      sessionId: started.sessionId,
      answers: [
        { slug: first.slug, answerText: await essayFor(first) },
        { slug: first.slug, answerText: await essayFor(first) },
      ],
    });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body!.error!.code).toBe('DUPLICATE_ANSWER');
  });

  test('a handed-in exam cannot be handed in again', async () => {
    const { token } = await learner(['p00']);
    const started = await startExam(token, 'p00');
    const answers = await strongAnswers(started);
    expect((await request('/assessments/exam/submit', 'POST', token, { sessionId: started.sessionId, answers })).status).toBe(201);

    const again = await request('/assessments/exam/submit', 'POST', token, { sessionId: started.sessionId, answers });
    expect(again.status).toBe(409);
    expect(again.body!.error!.code).toBe('SESSION_CLOSED');
  });

  test('a session that is not a phase exam cannot be submitted as one', async () => {
    const { token } = await learner(['p00']);
    const diagnostic = (await request('/assessments/diagnostic', 'POST', token)).body as { sessionId: string };
    const submitted = await request('/assessments/exam/submit', 'POST', token, {
      sessionId: diagnostic.sessionId,
      answers: [{ slug: 'drill-process-vs-program', answerText: essay(['address space', 'page table']) }],
    });
    expect(submitted.status).toBe(409);
    expect(submitted.body!.error!.code).toBe('NOT_AN_EXAM');
  });

  test('an exam belonging to another learner is not found', async () => {
    const owner = await learner(['p00']);
    const other = await learner(['p00']);
    const started = await startExam(owner.token, 'p00');
    const submitted = await request('/assessments/exam/submit', 'POST', other.token, {
      sessionId: started.sessionId,
      answers: [
        {
          slug: partOf(started, 'theory').items[0].slug,
          answerText: 'long enough for a rubric to judge, and it says something about the mechanism underneath',
        },
      ],
    });
    expect(submitted.status).toBe(404);
    expect(submitted.body!.error!.code).toBe('SESSION_NOT_FOUND');
  });
});
