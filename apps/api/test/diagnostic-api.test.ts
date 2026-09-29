import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { createTestApp, type TestApp } from './helpers/test-app';
import { seedContent } from '../prisma/seed';

interface Item {
  slug: string;
  stem: string;
  difficulty: number;
  category: string;
}

interface Report {
  sessionId: string;
  answered: number;
  unanswered: number;
  verdicts: { slug: string; verdict: string; score: number; missing: string[] }[];
  weakTopics: { slug: string; title: string; misses: number }[];
  reading: { skill: string; misses: number; firstRepair: string }[];
  repairPath: unknown[];
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

const strong = (conceptNames: string[]) =>
  `${conceptNames.join(', ')} — and the mechanism behind them is what decides the failure mode here, ` +
  'which is why the naive version of this survives a demo and breaks the first time traffic arrives.';

describe('diagnostic assessment', () => {
  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
    await seedContent(prisma);

    const email = `diagnostic-${Math.random().toString(36).slice(2, 10)}@example.com`;
    const res = await fetch(`${app.base}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, displayName: 'Diagnostic Tester', password: 'CoMplicated-passw0rd!23' }),
    });
    const body = (await res.json()) as { accessToken: string; user: { id: string } };
    token = body.accessToken;
    userId = body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('requires authentication', async () => {
    expect((await request('/assessments/diagnostic', 'POST')).status).toBe(401);
  });

  test('starting a diagnostic opens a session and hands out the thirty items, answers withheld', async () => {
    const { status, text, body } = await request('/assessments/diagnostic', 'POST', token);
    expect(status).toBe(201);
    const payload = body as { sessionId: string; items: Item[] };
    expect(payload.items).toHaveLength(30);
    expect(payload.sessionId).toBeTruthy();
    expect(text).not.toContain('idealAnswer');
    expect(text).not.toContain('commonMistakes');

    const session = await prisma.learningSession.findUniqueOrThrow({ where: { id: payload.sessionId } });
    // placement is not a phase exam: it is its own session type, so the two are never confused
    expect(session.typeKey).toBe('diagnostic');
    expect(session.endedAt).toBeNull();
  });

  test('grading is per item and the report names what was missing, not just a number', async () => {
    const started = await request('/assessments/diagnostic', 'POST', token);
    const { sessionId, items } = started.body as { sessionId: string; items: Item[] };

    const answers = items.map((item) => ({
      slug: item.slug,
      answerText:
        item.difficulty >= 5
          ? 'Because it depends on the layer underneath it, and the trade-off decides which one to pick.'
          : strong(['microtask queue', 'call stack', 'epoll', 'xmin', 'highwater mark', 'idempotency key']),
    }));

    const submitted = await request('/assessments/diagnostic/submit', 'POST', token, { sessionId, answers });
    expect(submitted.status).toBe(201);
    const report = submitted.body as Report;

    expect(report.answered).toBe(30);
    expect(report.unanswered).toBe(0);
    expect(report.verdicts).toHaveLength(30);
    expect(report.verdicts.some((verdict) => verdict.verdict === 'incorrect')).toBe(true);

    // a partial answer must always name what was absent — that is the difference between
    // a score and a diagnosis
    const partial = report.verdicts.filter((verdict) => verdict.score > 0 && verdict.score < 100);
    expect(partial.length).toBeGreaterThan(0);
    expect(partial.every((verdict) => verdict.missing.length > 0)).toBe(true);
  });

  test('unanswered items are reported as unanswered rather than silently wrong', async () => {
    const started = await request('/assessments/diagnostic', 'POST', token);
    const { sessionId, items } = started.body as { sessionId: string; items: Item[] };

    const submitted = await request('/assessments/diagnostic/submit', 'POST', token, {
      sessionId,
      answers: [{ slug: items[0].slug, answerText: strong(['epoll', 'call stack']) }],
    });
    const report = submitted.body as Report;

    expect(report.answered).toBe(1);
    expect(report.unanswered).toBe(29);
    expect(report.verdicts.filter((verdict) => verdict.verdict === 'unanswered')).toHaveLength(29);
  });

  test('the reading maps misses to the concepts and topics underneath them, then to a repair', async () => {
    const started = await request('/assessments/diagnostic', 'POST', token);
    const { sessionId, items } = started.body as { sessionId: string; items: Item[] };

    const submitted = await request('/assessments/diagnostic/submit', 'POST', token, {
      sessionId,
      answers: items.map((item) => ({
        slug: item.slug,
        answerText: 'It is async, and you should add an index and use a cache for that.',
      })),
    });
    const report = submitted.body as Report;

    expect(report.weakTopics.length).toBeGreaterThan(0);
    expect(report.weakTopics[0].misses).toBeGreaterThan(0);
    expect(report.reading.length).toBeGreaterThan(0);
    expect(report.reading[0].firstRepair.length).toBeGreaterThan(20);
    expect(report.repairPath.length).toBeGreaterThan(0);
  });

  test('every attempt is stored against the session as evidence', async () => {
    const attempts = await prisma.attempt.findMany({
      where: { userId, sessionId: { not: null } },
      select: { verdictKey: true, score: true, questionId: true, sessionId: true },
    });
    expect(attempts.length).toBeGreaterThanOrEqual(30);
    expect(attempts.every((attempt) => attempt.questionId !== null && attempt.sessionId !== null)).toBe(true);
  });

  test('a closed session cannot be submitted to twice', async () => {
    const started = await request('/assessments/diagnostic', 'POST', token);
    const { sessionId, items } = started.body as { sessionId: string; items: Item[] };
    const answers = [{ slug: items[0].slug, answerText: strong(['epoll', 'call stack']) }];

    expect((await request('/assessments/diagnostic/submit', 'POST', token, { sessionId, answers })).status).toBe(201);
    const again = await request('/assessments/diagnostic/submit', 'POST', token, { sessionId, answers });
    expect(again.status).toBe(409);
    expect((again.body as { error: { code: string } }).error.code).toBe('SESSION_CLOSED');
  });

  test('another learner session is not submittable', async () => {
    const other = await fetch(`${app.base}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: `diagnostic-other-${Math.random().toString(36).slice(2, 10)}@example.com`,
        displayName: 'Other Tester',
        password: 'CoMplicated-passw0rd!23',
      }),
    });
    const otherToken = ((await other.json()) as { accessToken: string }).accessToken;

    const started = await request('/assessments/diagnostic', 'POST', token);
    const { sessionId, items } = started.body as { sessionId: string; items: Item[] };
    const stolen = await request('/assessments/diagnostic/submit', 'POST', otherToken, {
      sessionId,
      answers: [{ slug: items[0].slug, answerText: strong(['epoll']) }],
    });
    expect(stolen.status).toBe(404);
  });

  test('an unknown question slug in the answers is refused', async () => {
    const started = await request('/assessments/diagnostic', 'POST', token);
    const { sessionId } = started.body as { sessionId: string };
    const submitted = await request('/assessments/diagnostic/submit', 'POST', token, {
      sessionId,
      answers: [{ slug: 'not-a-question', answerText: 'whatever' }],
    });
    expect(submitted.status).toBe(400);
    expect((submitted.body as { error: { code: string } }).error.code).toBe('QUESTION_NOT_FOUND');
  });

  test('the diagnostic is the only thing a locked learner can sit', async () => {
    const catalog = await request('/curriculum/topics', 'GET', token);
    const topics = (catalog.body as { topics: { slug: string; unlocked: boolean }[] }).topics;
    expect(topics.some((topic) => !topic.unlocked)).toBe(true);

    const started = await request('/assessments/diagnostic', 'POST', token);
    expect(started.status).toBe(201);
  });
});
