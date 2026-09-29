import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { createTestApp, type TestApp } from './helpers/test-app';
import { seedContent } from '../prisma/seed';

interface Weakness {
  topicSlug: string;
  title: string;
  phaseKey: string;
  level: number;
  failedStreak: number;
  attempts: number;
  lapses: number;
  rootCause: { slug: string; title: string; currentLevel: number };
  repairPath: { slug: string; title: string; phaseKey: string; currentLevel: number }[];
  action: string;
}

interface Report {
  threshold: number;
  weaknesses: Weakness[];
  summary: { topics: number; rootCauses: string[] };
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
  return body as { score: number; evidence: { level: number } | null };
}

async function miss(slug: string, answerText: string, times: number) {
  for (let index = 0; index < times; index += 1) {
    const result = await attempt(slug, answerText);
    expect(result.score).toBeLessThan(60);
  }
}

async function report(): Promise<Report> {
  const { status, body } = await request('/mastery/weaknesses', 'GET', token);
  expect(status).toBe(200);
  return body as Report;
}

const DAY = 86_400_000;

// The same content-shaped answers the mastery engine uses: the grader decides the score.
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
const wrongLocality = [
  'It ran out of memory, so the answer is a bigger container and a garbage collection run before the',
  'benchmark. The heap is where objects live and the stack holds the frames, and the difference between',
  'them is what makes the loop slow when the array grows past a few million entries.',
].join(' ');
describe('weakness detection', () => {
  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
    await seedContent(prisma);
    const email = `weakness-${Math.random().toString(36).slice(2, 10)}@example.com`;
    const res = await fetch(`${app.base}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, displayName: 'Weakness Tester', password: 'CoMplicated-passw0rd!23' }),
    });
    const session = (await res.json()) as { accessToken: string; user: { id: string } };
    token = session.accessToken;
    userId = session.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('the report requires authentication and starts empty', async () => {
    expect((await request('/mastery/weaknesses')).status).toBe(401);
    const body = await report();
    expect(body.weaknesses).toHaveLength(0);
    expect(body.summary).toEqual({ topics: 0, rootCauses: [] });
  });

  test('one miss is a lesson, not a weakness', async () => {
    await miss('drill-process-vs-program', vagueProgram, 1);
    expect((await report()).weaknesses).toHaveLength(0);
  });

  test('repeated failure on the entry topic opens a finding with nothing underneath it', async () => {
    await miss('drill-process-vs-program', vagueProgram, 2);

    const body = await report();
    expect(body.weaknesses).toHaveLength(1);
    const entry = body.weaknesses[0];
    expect(entry).toMatchObject({
      topicSlug: 'how-programs-run',
      phaseKey: 'p00',
      level: 0,
      failedStreak: 3,
      attempts: 3,
      lapses: 0,
      repairPath: [],
    });
    expect(entry.rootCause.slug).toBe('how-programs-run');
    expect(entry.action).toContain('how-programs-run');
    expect(body.summary).toEqual({ topics: 1, rootCauses: ['how-programs-run'] });
  });

  test('a passing answer breaks the streak and closes the finding', async () => {
    const result = await attempt('drill-process-vs-program', strongProgram);
    expect(result.evidence!.level).toBe(1);
    expect((await report()).weaknesses).toHaveLength(0);
  });

  test('placement misses never open a finding', async () => {
    await miss('diag-event-loop-order', 'Everything in the order it is written, because Node is single threaded.', 3);
    const body = await report();
    expect(body.weaknesses).toHaveLength(0);
    expect(await prisma.attempt.count({ where: { userId, question: { isDiagnostic: true } } })).toBe(3);
  });

  test('a dependent topic is judged on its own misses, not on the strength below it', async () => {
    // climb the entry topic to the rung that unlocks its dependent
    expect((await attempt('drill-process-isolation-proof', strongIsolation)).evidence!.level).toBe(2);
    expect((await attempt('drill-stack-overflow-debugging', strongOverflow)).evidence!.level).toBe(3);

    await miss('drill-why-locality-beats-size', wrongLocality, 3);

    const body = await report();
    expect(body.weaknesses).toHaveLength(1);
    expect(body.weaknesses[0]).toMatchObject({
      topicSlug: 'memory-hierarchy',
      failedStreak: 3,
      rootCause: { slug: 'memory-hierarchy' },
      repairPath: [],
    });
  });

  test('repeated failure walks the graph back to the prerequisite that went weak', async () => {
    // the prerequisite itself is now what keeps failing, and its standing falls with it
    await miss('drill-stack-heap-where', offTopicHeap, 3);

    const body = await report();
    expect(body.weaknesses.map((entry) => entry.topicSlug)).toEqual(['how-programs-run', 'memory-hierarchy']);

    const dependent = body.weaknesses.find((entry) => entry.topicSlug === 'memory-hierarchy')!;
    expect(dependent.repairPath).toEqual([
      { slug: 'how-programs-run', title: 'How Programs Run', phaseKey: 'p00', currentLevel: 0 },
    ]);
    expect(dependent.rootCause.slug).toBe('how-programs-run');
    expect(dependent.action).toContain('how-programs-run');
    expect(dependent.level).toBe(0);

    // one root cause, reported once, even though two findings point at it
    expect(body.summary.rootCauses).toEqual(['how-programs-run']);
  });

  test('the report routes the learner while the dependent topic is gated again', async () => {
    const locked = await request('/questions/drill-why-locality-beats-size/attempt', 'POST', token, {
      answerText: wrongLocality,
    });
    expect(locked.status).toBe(403);

    const entry = (await report()).weaknesses.find((row) => row.topicSlug === 'memory-hierarchy')!;
    expect(entry.failedStreak).toBe(3);
    expect(entry.rootCause.currentLevel).toBe(0);
  });

  test('a review lapse is written into the finding it belongs to', async () => {
    await prisma.reviewSchedule.updateMany({
      where: { userId, question: { slug: 'drill-stack-overflow-debugging' } },
      data: { dueAt: new Date(Date.now() - DAY), intervalDays: 14 },
    });

    await miss('drill-stack-overflow-debugging', offTopicHeap, 1);

    const entry = (await report()).weaknesses.find((row) => row.topicSlug === 'how-programs-run')!;
    expect(entry.failedStreak).toBe(4);
    expect(entry.lapses).toBe(1);
  });

  test('repairing the root cause closes the findings above it', async () => {
    await attempt('drill-process-vs-program', strongProgram);
    await attempt('drill-stack-heap-where', strongHeap);
    await attempt('drill-process-isolation-proof', strongIsolation);
    await attempt('drill-stack-overflow-debugging', strongOverflow);

    const body = await report();
    expect(body.weaknesses.map((entry) => entry.topicSlug)).toEqual(['memory-hierarchy']);
    expect(body.weaknesses[0].repairPath).toEqual([]);
    expect(body.weaknesses[0].rootCause.slug).toBe('memory-hierarchy');
  });
});
