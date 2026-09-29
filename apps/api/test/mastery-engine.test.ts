import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { createTestApp, type TestApp } from './helpers/test-app';
import { seedContent } from '../prisma/seed';

interface Standing {
  topicSlug: string;
  level: number;
  levelKey: string;
  score: number;
  signals: { key: string; score: number; evidenceCount: number }[];
}

interface AttemptResult {
  score: number;
  evidence: { topicSlug: string; level: number; levelKey: string; previousLevel: number } | null;
  review: { intervalDays: number; dueAt: string; lapseCount: number } | null;
}

interface CatalogTopic {
  slug: string;
  level: number;
  unlocked: boolean;
  blockedBy: { slug: string; requiredLevel: number; currentLevel: number }[];
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

async function attempt(slug: string, answerText: string) {
  const { status, body } = await request(`/questions/${slug}/attempt`, 'POST', token, { answerText });
  expect(status).toBe(201);
  return body as AttemptResult;
}

async function standings(): Promise<Standing[]> {
  const { body } = await request('/mastery', 'GET', token);
  return (body as { standings: Standing[] }).standings;
}

async function standingOf(topicSlug: string) {
  return (await standings()).find((entry) => entry.topicSlug === topicSlug);
}

const DAY = 86_400_000;

// Answers written to touch the concepts each drill expects; the grader, not this file, decides
// the score, so these are content-shaped rather than keyword-shaped.
const vagueProgram = 'A process is basically a program that is currently running in memory on the machine.';
const strongProgram = [
  'A program is a file: the instructions sitting on disk, inert, with no memory allocated to it at all.',
  'A process is the running instance the kernel builds around those bytes — its own address space, a pid,',
  'a file descriptor table, and its stack frame and heap. The same binary can back multiple processes at',
  'once, each with a separate copy of every module-level variable, which is exactly why a Map you treat',
  'as a cache is not a cache once you run cluster workers on the same program.',
].join(' ');
const strongHeap = [
  'count is a primitive in the stack frame, a slot that is gone the moment the frame pops.',
  'payload is a reference to a heap object, and the returned value is a new array holding the same',
  'references — a shallow copy, so every selected row stays reachable through it. Reclamation follows',
  'reachability, not scope: an object outlives the function whenever anything still reachable points at',
  'it, which is why a captured closure keeps the whole rows array alive. Prove it with a heap snapshot',
  'and read the retainer path rather than the size column.',
].join(' ');
const strongIsolation = [
  'The parent calls fork from child_process to start the worker, then each side prints process.pid and',
  'process.memoryUsage().rss. The pids differ and the RSS numbers differ, which is the measurement.',
  'Then write into a module-level Map in the child and read it in the parent: the state is per process,',
  'so it is not shared — nothing crosses the boundary unless you pass a message over the ipc channel.',
  'argv and process.env are copied at exec time, so eight cluster workers are eight separate heaps with',
  'eight copies of everything the module ever touched, which is the number that bites when RSS scales.',
].join(' ');
const strongOverflow = [
  'Every call pushes a stack frame holding the return address and the locals, so depth times frame size',
  'is what ran out — the V8 default is roughly a 1 MB stack budget, which puts the wall near ten',
  'thousand frames. The depth comes from the nesting depth of the payload, not from the code, so the',
  'limit is attacker controlled. Two fixes ship: an iterative rewrite with an explicit worklist array on',
  'the heap, and a bound on input depth that rejects the payload. Passing --stack-size upward only moves',
  'the wall, and there is no tail call elimination in this shape to rely on.',
].join(' ');
const offTopicHeap = 'The array is too large, so stream it and give the container more memory than the default.';

describe('mastery engine', () => {
  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
    await seedContent(prisma);
    const email = `mastery-${Math.random().toString(36).slice(2, 10)}@example.com`;
    const res = await fetch(`${app.base}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, displayName: 'Mastery Tester', password: 'CoMplicated-passw0rd!23' }),
    });
    const session = (await res.json()) as { accessToken: string; user: { id: string } };
    token = session.accessToken;
    userId = session.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('the standing endpoint requires authentication and starts empty', async () => {
    expect((await request('/mastery')).status).toBe(401);
    expect(await standings()).toHaveLength(0);
  });

  test('a wrong answer is evidence that promotes nobody', async () => {
    const result = await attempt('drill-process-vs-program', vagueProgram);
    expect(result.score).toBeLessThan(60);
    expect(result.evidence).not.toBeNull();
    expect(result.evidence!.level).toBe(0);
    expect(result.evidence!.previousLevel).toBe(0);
    expect(result.review).toBeNull();

    // the topic now has a standing — it is exposure — but no rung was held, so no event exists
    const record = await prisma.masteryRecord.findFirst({ where: { userId } });
    expect(record!.levelKey).toBe('exposure');
    expect(await prisma.masteryEvent.count({ where: { record: { userId } } })).toBe(0);
  });

  test('a passing answer promotes exactly the rungs its evidence chain holds', async () => {
    const result = await attempt('drill-process-vs-program', strongProgram);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.evidence!.level).toBe(1);
    expect(result.evidence!.levelKey).toBe('understanding');
    expect(result.evidence!.previousLevel).toBe(0);

    const standing = await standingOf('how-programs-run');
    expect(standing!.level).toBe(1);
    expect(standing!.signals.filter((signal) => signal.evidenceCount > 0)).toHaveLength(1);
    // seven dimensions are still unevidenced, so the aggregate is nowhere near mastered
    expect(standing!.score).toBeLessThan(20);
  });

  test('a second drill on the same dimension adds evidence without climbing', async () => {
    const events = await prisma.masteryEvent.count({ where: { record: { userId } } });

    const result = await attempt('drill-stack-heap-where', strongHeap);
    expect(result.score).toBeGreaterThanOrEqual(60);
    // internal and conceptual both evidence understanding, so rung 2 is still unheld
    expect(result.evidence!.level).toBe(1);

    const signals = await prisma.masteryRecordSignal.findMany({
      where: { record: { userId } },
      select: { signalKey: true, evidenceCount: true },
    });
    expect(signals).toHaveLength(1);
    expect(signals[0].signalKey).toBe('understanding');
    expect(signals[0].evidenceCount).toBe(3);
    expect(await prisma.masteryEvent.count({ where: { record: { userId } } })).toBe(events);
  });

  test('a dependent topic stays gated until the prerequisite reaches its required level', async () => {
    const { body } = await request('/curriculum/topics', 'GET', token);
    const topics = (body as { topics: CatalogTopic[] }).topics;
    expect(topics.find((topic) => topic.slug === 'how-programs-run')!.level).toBe(1);
    const gated = topics.find((topic) => topic.slug === 'memory-hierarchy')!;
    expect(gated.unlocked).toBe(false);
    expect(gated.blockedBy).toEqual([{ slug: 'how-programs-run', requiredLevel: 3, currentLevel: 1 }]);
  });

  test('the ladder climbs one rung of evidence at a time', async () => {
    const implementation = await attempt('drill-process-isolation-proof', strongIsolation);
    expect(implementation.score).toBeGreaterThanOrEqual(60);
    // understanding was already held, so this one answer climbs exactly one rung
    expect(implementation.evidence!.level).toBe(2);
    expect(implementation.evidence!.levelKey).toBe('implementation');

    const debugging = await attempt('drill-stack-overflow-debugging', strongOverflow);
    expect(debugging.score).toBeGreaterThanOrEqual(60);
    expect(debugging.evidence!.level).toBe(3);
    expect(debugging.evidence!.levelKey).toBe('debugging');

    const { body } = await request('/curriculum/topics', 'GET', token);
    const topics = (body as { topics: CatalogTopic[] }).topics;
    expect(topics.find((topic) => topic.slug === 'memory-hierarchy')!.unlocked).toBe(true);
  });

  test('every change of standing is written to the event ledger with its reason', async () => {
    const events = await prisma.masteryEvent.findMany({
      where: { record: { userId } },
      orderBy: { createdAt: 'asc' },
    });
    expect(events.map((event) => [event.fromLevel, event.toLevel])).toEqual([
      ['exposure', 'understanding'],
      ['understanding', 'implementation'],
      ['implementation', 'debugging'],
    ]);
    expect(events[2].reason).toContain('debugging');
    expect(events.every((event) => event.reason.length > 20)).toBe(true);
  });

  test('a passed drill is scheduled for spaced repetition at the first interval', async () => {
    const row = await prisma.reviewSchedule.findFirst({
      where: { userId, question: { slug: 'drill-stack-overflow-debugging' } },
    });
    expect(row).not.toBeNull();
    expect(row!.intervalDays).toBe(1);
    expect(row!.dueAt.getTime()).toBeGreaterThan(Date.now());
    expect(row!.lapseCount).toBe(0);
    expect((await request('/mastery/reviews/due', 'GET', token)).body).toMatchObject({ reviews: [] });
  });

  test('an answer on a due review advances the interval and evidences recall', async () => {
    await prisma.reviewSchedule.updateMany({
      where: { userId, question: { slug: 'drill-stack-overflow-debugging' } },
      data: { dueAt: new Date(Date.now() - DAY), intervalDays: 7 },
    });

    const result = await attempt('drill-stack-overflow-debugging', strongOverflow);
    expect(result.review!.intervalDays).toBe(14);
    expect(result.evidence).not.toBeNull();

    const standing = await standingOf('how-programs-run');
    const recall = standing!.signals.find((signal) => signal.key === 'recall');
    expect(recall!.evidenceCount).toBe(1);
    expect(standing!.level).toBe(3);
    expect(standing!.signals.filter((signal) => signal.evidenceCount > 0)).toHaveLength(4);
  });

  test('a lapse resets the interval and records the lapse', async () => {
    await prisma.reviewSchedule.updateMany({
      where: { userId, question: { slug: 'drill-stack-overflow-debugging' } },
      data: { dueAt: new Date(Date.now() - DAY), intervalDays: 14 },
    });

    const result = await attempt('drill-stack-overflow-debugging', offTopicHeap);
    expect(result.score).toBeLessThan(60);
    expect(result.review!.intervalDays).toBe(1);
    expect(result.review!.lapseCount).toBe(1);

    const row = await prisma.reviewSchedule.findFirst({
      where: { userId, question: { slug: 'drill-stack-overflow-debugging' } },
    });
    expect(row!.dueAt.getTime()).toBeGreaterThan(Date.now());
    // the failed recall is evidence about recall, not about the rung the drill itself proves
    expect((await standingOf('how-programs-run'))!.level).toBe(3);
  });

  test('standing can fall: the most recent demonstration is what is claimed', async () => {
    const result = await attempt('drill-process-vs-program', vagueProgram);
    expect(result.score).toBeLessThan(60);
    expect(result.evidence!.level).toBe(0);

    const standing = await standingOf('how-programs-run');
    expect(standing!.levelKey).toBe('exposure');
    const last = await prisma.masteryEvent.findFirst({
      where: { record: { userId } },
      orderBy: { createdAt: 'desc' },
    });
    expect(last!.fromLevel).toBe('debugging');
    expect(last!.toLevel).toBe('exposure');
  });

  test('the diagnostic never promotes and never schedules a review', async () => {
    const records = await prisma.masteryRecord.count({ where: { userId } });
    const result = await attempt(
      'diag-event-loop-order',
      [
        'A and D print first because the script is one synchronous task and the call stack has to empty',
        'before the loop consults any queue. B is a microtask, a promise reaction, and the microtask queue',
        'drains completely before the next macrotask. C is a timer callback in the timers phase, so it',
        'waits for a later turn — setTimeout 0 means no sooner than zero, never immediately.',
      ].join(' '),
    );
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.evidence).toBeNull();
    expect(result.review).toBeNull();
    expect(await prisma.masteryRecord.count({ where: { userId } })).toBe(records);
    expect(await prisma.reviewSchedule.count({ where: { userId, question: { isDiagnostic: true } } })).toBe(0);
  });

  test('the standing reports all eight dimensions with their weights', async () => {
    const { body } = await request('/mastery', 'GET', token);
    const payload = body as {
      standings: Standing[];
      summary: { topics: number; levels: Record<string, number> };
    };
    expect(payload.standings).toHaveLength(1);
    expect(payload.standings[0].signals).toHaveLength(8);
    expect(payload.summary.topics).toBe(1);
    expect(payload.summary.levels.exposure).toBe(1);
    expect(payload.standings[0].signals.every((signal) => signal.evidenceCount >= 0)).toBe(true);
  });
});
