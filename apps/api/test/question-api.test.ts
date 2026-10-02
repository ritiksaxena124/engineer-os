import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { createTestApp, type TestApp } from './helpers/test-app';
import { seedContent } from '../prisma/seed';
import { ALL_QUESTIONS } from '../prisma/content/questions';

interface QuestionPayload {
  slug: string;
  stem: string;
  body: string;
  category: string;
  difficulty: number;
  band: string | null;
  topicSlug: string;
  isDiagnostic: boolean;
  conceptCount: number;
  companies?: { key: string; label: string }[];
  answer?: Record<string, string> | null;
}

interface BrowsePayload {
  questions: QuestionPayload[];
  facets: {
    companies: { key: string; label: string; count: number }[];
    difficulties: { difficulty: number; count: number }[];
    areas: { slug: string; title: string; count: number }[];
    untagged: number;
  };
}

interface AttemptPayload {
  verdict: string;
  score: number;
  coverage: number;
  missing: string[];
  feedback: string;
  answer: Record<string, string>;
}

let app: TestApp;
let prisma: PrismaClient;
let token: string;
let userId: string;

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
  return { status: res.status, text, body: text ? (JSON.parse(text) as unknown) : null };
}

async function register(): Promise<{ token: string; userId: string }> {
  const email = `questions-${Math.random().toString(36).slice(2, 10)}@example.com`;
  const res = await fetch(`${app.base}/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, displayName: 'Question Tester', password: 'CoMplicated-passw0rd!23' }),
  });
  const body = (await res.json()) as { accessToken: string; user: { id: string } };
  return { token: body.accessToken, userId: body.user.id };
}

async function browse(path: string): Promise<BrowsePayload> {
  const { body } = await request(path, 'GET', token);
  return body as BrowsePayload;
}

async function setLevel(topicSlug: string, levelKey: string) {
  const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: topicSlug } });
  await prisma.masteryRecord.upsert({
    where: { userId_topicId: { userId, topicId: topic.id } },
    create: { userId, topicId: topic.id, levelKey },
    update: { levelKey },
  });
}

const strongAnswer =
  'The script is one synchronous task, so the call stack empties and A and D print before the loop looks at ' +
  'anything queued. B is a promise reaction, which means a microtask, and the microtask queue drains completely ' +
  'before the loop advances a phase. C is a timer callback, a macrotask, so it waits for a later turn — ' +
  'setTimeout 0 means no sooner than zero, never immediately.';

describe('question engine', () => {
  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
    await seedContent(prisma);
    const session = await register();
    token = session.token;
    userId = session.userId;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('requires authentication', async () => {
    expect((await request('/questions')).status).toBe(401);
    expect((await request('/questions/diag-event-loop-order')).status).toBe(401);
    expect((await request('/questions/diag-event-loop-order/attempt', 'POST', undefined, { answerText: 'x' })).status).toBe(401);
  });

  test('the bank lists questions without any answer material', async () => {
    const { status, text } = await request('/questions?topic=event-loop', 'GET', token);
    expect(status).toBe(200);
    const questions = (JSON.parse(text) as { questions: QuestionPayload[] }).questions;
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every((question) => question.topicSlug === 'event-loop')).toBe(true);

    // nothing in the payload may pre-answer the question
    expect(text).not.toContain('idealAnswer');
    expect(text).not.toContain('microtask queue drains completely');
    expect(questions[0].conceptCount).toBeGreaterThan(0);
  });

  test('filters by category and difficulty ceiling', async () => {
    const all = await request('/questions', 'GET', token);
    const total = (JSON.parse(all.text) as { questions: QuestionPayload[] }).questions.length;

    const onlyDebugging = await request('/questions?category=debugging&maxDifficulty=4', 'GET', token);
    const filtered = (JSON.parse(onlyDebugging.text) as { questions: QuestionPayload[] }).questions;
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(total);
    expect(filtered.every((question) => question.category === 'debugging')).toBe(true);
    expect(filtered.every((question) => question.difficulty <= 4)).toBe(true);
  });

  test('every row carries its company tags and the response carries the facets to filter on', async () => {
    const payload = await browse('/questions?diagnostic=false');
    expect(payload.questions.length).toBeGreaterThan(100);
    expect(payload.questions.every((row) => Array.isArray(row.companies))).toBe(true);
    expect(payload.facets.companies.map((row) => row.key).sort()).toEqual(['amazon', 'google', 'microsoft']);
    expect(payload.facets.companies.every((row) => row.count > 0 && row.label.length > 1)).toBe(true);
    const rungs = payload.facets.difficulties.map((row) => row.difficulty);
    expect(rungs).toEqual([...rungs].sort((a, b) => a - b));
  });

  test('a company filter returns exactly the questions tagged for it', async () => {
    const amazon = await browse('/questions?diagnostic=false&company=amazon');
    expect(amazon.questions.length).toBeGreaterThan(5);
    expect(amazon.questions.every((row) => row.companies!.some((company) => company.key === 'amazon'))).toBe(true);

    const everything = await browse('/questions?diagnostic=false');
    const tagged = everything.questions.filter((row) => row.companies!.length > 0);
    expect(amazon.questions.length).toBeLessThan(tagged.length);
    expect(amazon.questions.length).toBeLessThan(everything.questions.length);
  });

  test('untagged is an answer rather than a missing tag', async () => {
    const untagged = await browse('/questions?company=untagged');
    expect(untagged.questions.length).toBeGreaterThan(0);
    expect(untagged.questions.every((row) => row.companies!.length === 0)).toBe(true);

    const all = await browse('/questions?diagnostic=false');
    expect(all.facets.untagged).toBe(all.questions.filter((row) => row.companies!.length === 0).length);
  });

  test('the difficulty filter selects a rung on the same ladder the row shows', async () => {
    const fives = await browse('/questions?minDifficulty=5&maxDifficulty=5');
    expect(fives.questions.length).toBeGreaterThan(0);
    expect(fives.questions.every((row) => row.difficulty === 5)).toBe(true);

    const senior = await browse('/questions?minDifficulty=6');
    expect(senior.questions.length).toBeGreaterThan(0);
    expect(senior.questions.every((row) => row.difficulty >= 6)).toBe(true);
    expect(senior.questions.length).toBeLessThan(fives.questions.length + senior.questions.length);
  });

  test('the dsa bank is the sheet, and its rows are labelled in the sheet vocabulary', async () => {
    const rows = await browse('/questions?bank=dsa');
    expect(rows.questions.length).toBeGreaterThan(100);
    expect(rows.questions.every((row) => row.slug.startsWith('dsa-'))).toBe(true);
    expect(new Set(rows.questions.map((row) => row.band)).size).toBe(3);
    expect(rows.questions.every((row) => ['Easy', 'Medium', 'Hard'].includes(row.band ?? ''))).toBe(true);

    // one ladder, two names for a rung: the band is derived from the difficulty, never stored
    expect(
      rows.questions.every((row) =>
        row.band === 'Easy' ? row.difficulty <= 3 : row.band === 'Medium' ? row.difficulty === 4 : row.difficulty >= 5,
      ),
    ).toBe(true);
  });

  test('a band filter selects the same rows as the difficulty range it derives from', async () => {
    const hard = await browse('/questions?bank=dsa&minDifficulty=5');
    expect(hard.questions.length).toBeGreaterThan(0);
    expect(hard.questions.every((row) => row.band === 'Hard')).toBe(true);

    const everything = await browse('/questions?bank=dsa');
    expect(everything.questions.filter((row) => row.band === 'Hard').length).toBe(hard.questions.length);
  });

  test('banks are disjoint and an unknown bank is refused', async () => {
    const dsa = await browse('/questions?bank=dsa');
    const interview = await browse('/questions?bank=interview');
    expect(dsa.questions.some((row) => row.slug.startsWith('int-'))).toBe(false);
    expect(interview.questions.some((row) => row.slug.startsWith('dsa-'))).toBe(false);
    expect(interview.questions.every((row) => row.slug.startsWith('int-'))).toBe(true);

    expect((await request('/questions?bank=leetcode', 'GET', token)).status).toBe(400);
  });

  test('the areas facet counts the topics reachable from the filters already applied', async () => {
    const rows = await browse('/questions?bank=dsa');
    expect(rows.facets.areas.length).toBeGreaterThan(3);
    expect(rows.facets.areas.every((area) => area.count > 0 && area.title.length > 1)).toBe(true);
    expect(rows.facets.areas.reduce((total, area) => total + area.count, 0)).toBe(rows.questions.length);

    const narrowed = await browse('/questions?bank=dsa&topic=linked-lists');
    expect(narrowed.facets.areas.map((area) => area.slug)).toEqual(['linked-lists']);
    expect(narrowed.facets.areas[0].count).toBe(narrowed.questions.length);
  });

  test('company and difficulty filters compose, and the facet counts follow the other filters', async () => {
    const rows = await browse('/questions?diagnostic=false&company=amazon&minDifficulty=5');
    expect(rows.questions.length).toBeGreaterThan(0);
    expect(rows.questions.every((row) => row.difficulty >= 4 && row.companies!.some((c) => c.key === 'amazon'))).toBe(
      true,
    );
    const googleAtFive = await browse('/questions?diagnostic=false&company=google&minDifficulty=5');
    expect(googleAtFive.questions.length).toBeGreaterThan(0);
    expect(rows.facets.companies.find((row) => row.key === 'google')!.count).toBe(
      googleAtFive.questions.length,
    );
  });

  test('the search matches the stem and nothing else is leaked', async () => {
    const rows = await browse('/questions?search=rotated');
    expect(rows.questions.length).toBeGreaterThan(0);
    expect(rows.questions.every((row) => row.stem.toLowerCase().includes('rotated'))).toBe(true);
    expect(JSON.stringify(rows)).not.toContain('idealAnswer');
  });

  test('an unknown company, an unknown rung and an inverted range are all refused', async () => {
    expect((await request('/questions?company=bytedance', 'GET', token)).status).toBe(400);
    expect((await request('/questions?minDifficulty=8', 'GET', token)).status).toBe(400);
    expect((await request('/questions?minDifficulty=6&maxDifficulty=2', 'GET', token)).status).toBe(400);
  });

  test('a question is served without its answer until the learner has answered it', async () => {
    const { status, text } = await request('/questions/diag-event-loop-order', 'GET', token);
    expect(status).toBe(200);
    const payload = JSON.parse(text) as { question: QuestionPayload };
    expect(payload.question.slug).toBe('diag-event-loop-order');
    expect(payload.question.stem).toBeTruthy();
    expect(payload.question.answer ?? null).toBeNull();
    expect(text).not.toContain('deepAnswer');
  });

  test('a diagnostic question is answerable before anything is unlocked', async () => {
    const { status, body } = await request(
      '/questions/diag-event-loop-order/attempt',
      'POST',
      token,
      { answerText: strongAnswer },
    );
    expect(status).toBe(201);
    const result = body as AttemptPayload;
    expect(['correct', 'partially-correct']).toContain(result.verdict);
    expect(result.coverage).toBeGreaterThan(0.5);
    expect(result.answer.idealAnswer.length).toBeGreaterThan(100);
  });

  test('grading reports the concepts that were missing, not just a score', async () => {
    const { status, body } = (await request(
      '/questions/diag-single-thread-10k/attempt',
      'POST',
      token,
      { answerText: 'Because of epoll and the non-blocking kernel notifications, so no thread is ever waiting.' },
    )) as { status: number; body: unknown };

    expect(status).toBe(201);
    const result = body as AttemptPayload;
    expect(result.verdict).toBe('shallow');
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.feedback).toMatch(/explain the mechanism/i);
  });

  test('an attempt is recorded as evidence with its rubric output', async () => {
    const attempt = await prisma.attempt.findFirst({
      where: { userId, question: { slug: 'diag-event-loop-order' } },
      orderBy: { createdAt: 'desc' },
    });
    expect(attempt).not.toBeNull();
    expect(attempt!.answerText).toContain('microtask');
    expect(attempt!.verdictKey).toBeTruthy();
    const meta = attempt!.meta as { coverage: number; matched: string[] };
    expect(meta.matched.length).toBeGreaterThan(0);
    expect(meta.coverage).toBeGreaterThan(0);
  });

  test('the answer stays revealed after evaluation, for revision', async () => {
    const { status, body } = await request('/questions/diag-event-loop-order', 'GET', token);
    expect(status).toBe(200);
    const payload = (body as { question: QuestionPayload }).question;
    expect(payload.answer).toBeTruthy();
    expect(payload.answer!.deepAnswer.length).toBeGreaterThan(100);
  });

  test('a drill on a locked topic refuses the attempt and records nothing', async () => {
    const before = await prisma.attempt.count({ where: { userId } });
    const { status, body } = await request(
      '/questions/drill-async-duplication-bug/attempt',
      'POST',
      token,
      { answerText: strongAnswer },
    );
    expect(status).toBe(403);
    const error = (body as {
      error: { code: string; details: { blockedBy: { slug: string }[]; repairPath: unknown[] } };
    }).error;
    expect(error.code).toBe('TOPIC_LOCKED');
    expect(error.details.blockedBy.map((entry) => entry.slug)).toContain('closures-scope');

    const after = await prisma.attempt.count({ where: { userId } });
    expect(after).toBe(before);
  });

  test('the same drill opens once the topic unlocks, and repeat attempts are kept', async () => {
    await setLevel('js-values-references', 'debugging');
    await setLevel('closures-scope', 'debugging');

    const first = await request('/questions/drill-async-duplication-bug/attempt', 'POST', token, {
      answerText: strongAnswer,
    });
    expect(first.status).toBe(201);

    const second = await request('/questions/drill-async-duplication-bug/attempt', 'POST', token, {
      answerText: 'Store the in-flight promise, not the value, so every concurrent caller awaits the same query.',
    });
    expect(second.status).toBe(201);

    const count = await prisma.attempt.count({
      where: { userId, question: { slug: 'drill-async-duplication-bug' } },
    });
    expect(count).toBe(2);
  });

  test('rejects an empty answer and an unknown field', async () => {
    expect(
      (await request('/questions/diag-event-loop-order/attempt', 'POST', token, { answerText: '' })).status,
    ).toBe(400);
    expect(
      (await request('/questions/diag-event-loop-order/attempt', 'POST', token, {
        answerText: 'fine',
        verdict: 'correct',
      })).status,
    ).toBe(400);
  });

  test('unknown questions are a 404 with a machine code', async () => {
    const { status, body } = await request('/questions/not-a-real-question', 'GET', token);
    expect(status).toBe(404);
    expect((body as { error: { code: string } }).error.code).toBe('QUESTION_NOT_FOUND');
  });

  test('the seeded bank covers every category and every rung of the difficulty ladder', async () => {
    const rows = await prisma.question.findMany({
      where: { isActive: true },
      select: { categoryKey: true, difficulty: true, isDiagnostic: true },
    });
    expect(rows).toHaveLength(ALL_QUESTIONS.length);
    expect(new Set(rows.map((row) => row.categoryKey)).size).toBe(13);
    expect(new Set(rows.map((row) => row.difficulty)).size).toBe(7);
    expect(rows.filter((row) => row.isDiagnostic)).toHaveLength(30);
  });

  test('concepts and their terms are stored so grading never depends on the source files', async () => {
    const question = await prisma.question.findUniqueOrThrow({
      where: { slug: 'diag-mvcc' },
      include: {
        expectedConcepts: { include: { concept: { include: { terms: true } } } },
      },
    });
    expect(question.expectedConcepts.length).toBeGreaterThan(2);
    for (const edge of question.expectedConcepts) {
      expect(edge.concept.terms.length).toBeGreaterThan(0);
      expect(edge.concept.topicId).toBe(question.topicId);
    }
  });
});
