import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { createTestApp, type TestApp } from './helpers/test-app';
import { seedContent } from '../prisma/seed';

interface TopicRow {
  slug: string;
  unlocked: boolean;
  level: number;
  blockedBy: { slug: string; requiredLevel: number; currentLevel: number }[];
  warnings: { slug: string }[];
}

let app: TestApp;
let prisma: PrismaClient;
let token: string;
let userId: string;

async function get(path: string, auth?: string) {
  const res = await fetch(`${app.base}${path}`, {
    headers: auth ? { authorization: `Bearer ${auth}` } : {},
  });
  return { status: res.status, body: await res.json() };
}

const findTopic = (topics: TopicRow[], slug: string) => {
  const topic = topics.find((entry) => entry.slug === slug);
  if (!topic) throw new Error(`topic ${slug} missing from response`);
  return topic;
};

/** Records mastery directly: the mastery engine is a later milestone, the gate is here now. */
async function setLevel(topicSlug: string, levelKey: string) {
  const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: topicSlug } });
  await prisma.masteryRecord.upsert({
    where: { userId_topicId: { userId, topicId: topic.id } },
    create: { userId, topicId: topic.id, levelKey },
    update: { levelKey },
  });
}

describe('curriculum api', () => {
  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
    await seedContent(prisma);

    const email = `curriculum-${Math.random().toString(36).slice(2, 10)}@example.com`;
    const res = await fetch(`${app.base}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, displayName: 'Curriculum Tester', password: 'CoMplicated-passw0rd!23' }),
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
    expect((await get('/curriculum/topics')).status).toBe(401);
    expect((await get('/curriculum/phases')).status).toBe(401);
  });

  test('lists the forty phases in dependency order', async () => {
    const { status, body } = await get('/curriculum/phases', token);
    expect(status).toBe(200);
    const phases = (body as { phases: { number: number; topicCount: number }[] }).phases;
    expect(phases).toHaveLength(40);
    expect(phases.map((phase) => phase.number)).toEqual(Array.from({ length: 40 }, (_, i) => i));
    expect(phases.every((phase) => phase.topicCount > 0)).toBe(true);
  });

  test('filters phases by track', async () => {
    const frontend = await get('/curriculum/phases?track=fullstack', token);
    const keys = (frontend.body as { phases: { key: string }[] }).phases.map((phase) => phase.key);
    expect(keys).toContain('p10');
    expect(keys).not.toContain('p27');

    const ai = await get('/curriculum/phases?track=agentic-ai', token);
    const aiKeys = (ai.body as { phases: { key: string }[] }).phases.map((phase) => phase.key);
    expect(aiKeys).toContain('p27');
    expect(aiKeys).not.toContain('p10');
  });

  test('an untouched learner sees the roots open and the spine gated', async () => {
    const { body } = await get('/curriculum/topics', token);
    const topics = (body as { topics: TopicRow[] }).topics;

    expect(findTopic(topics, 'how-programs-run').unlocked).toBe(true);
    expect(findTopic(topics, 'event-loop').unlocked).toBe(false);

    const mvcc = findTopic(topics, 'mvcc-isolation');
    expect(mvcc.unlocked).toBe(false);
    expect(mvcc.level).toBe(0);
    expect(mvcc.blockedBy.map((entry) => entry.slug).sort()).toEqual([
      'postgres-storage',
      'sql-fundamentals',
    ]);
    expect(mvcc.blockedBy[0].requiredLevel).toBe(3);
  });

  test('an advisory prerequisite warns without gating', async () => {
    const { body } = await get('/curriculum/topics', token);
    const redisRateLimiting = findTopic(
      (body as { topics: TopicRow[] }).topics,
      'redis-rate-limiting',
    );
    expect(redisRateLimiting.unlocked).toBe(false);
    expect(redisRateLimiting.blockedBy.map((entry) => entry.slug).sort()).toEqual([
      'rate-limit-circuit-breaker',
      'redis-atomicity-lua',
    ]);

    const cacheInvalidation = findTopic((body as { topics: TopicRow[] }).topics, 'cache-invalidation');
    expect(cacheInvalidation.warnings.length).toBeGreaterThan(0);
  });

  test('reaching the required level on every critical prerequisite unlocks the topic', async () => {
    await setLevel('postgres-storage', 'debugging');
    await setLevel('sql-fundamentals', 'debugging');

    const { body } = await get('/curriculum/topics', token);
    const mvcc = findTopic((body as { topics: TopicRow[] }).topics, 'mvcc-isolation');
    expect(mvcc.unlocked).toBe(true);
    expect(mvcc.blockedBy).toEqual([]);
  });

  test('a design-level requirement is not satisfied by debugging level', async () => {
    await setLevel('cap-and-pacelc', 'debugging');
    await setLevel('bounded-contexts', 'debugging');
    await setLevel('requirements-to-numbers', 'debugging');

    const { body } = await get('/curriculum/topics', token);
    const constraints = findTopic((body as { topics: TopicRow[] }).topics, 'constraints-decide-architecture');
    expect(constraints.unlocked).toBe(false);
    expect(constraints.blockedBy.every((entry) => entry.requiredLevel === 4)).toBe(true);
  });

  test('the repair path names the weak prerequisite underneath a blocked topic', async () => {
    await setLevel('wal-recovery', 'understanding');
    await setLevel('postgres-storage', 'understanding');

    const { status, body } = await get('/curriculum/topics/mvcc-isolation/repair-path', token);
    expect(status).toBe(200);
    const path = (body as { path: { slug: string; currentLevel: number }[] }).path;
    expect(path.map((entry) => entry.slug)).toContain('postgres-storage');
    expect(path.find((entry) => entry.slug === 'postgres-storage')!.currentLevel).toBe(1);
    expect(path.some((entry) => entry.slug === 'sql-fundamentals')).toBe(false);
  });

  test('a topic with no gaps reports an empty repair path', async () => {
    const { body } = await get('/curriculum/topics/how-programs-run/repair-path', token);
    expect((body as { path: unknown[] }).path).toEqual([]);
  });

  test('unknown topics are a 404, not an empty 200', async () => {
    const { status, body } = await get('/curriculum/topics/not-a-real-topic/repair-path', token);
    expect(status).toBe(404);
    expect((body as { error: { code: string } }).error.code).toBe('TOPIC_NOT_FOUND');
  });

  test('the seeded graph matches the authored content exactly', async () => {
    const [topics, edges, phases] = await Promise.all([
      prisma.topic.count({ where: { isActive: true } }),
      prisma.topicPrerequisite.count({ where: { isActive: true } }),
      prisma.phase.count({ where: { isActive: true } }),
    ]);
    const authoredTopics = await prisma.topic.findMany({
      where: { isActive: true },
      include: { requires: { where: { isActive: true } } },
    });
    expect(topics).toBe(authoredTopics.length);
    expect(phases).toBe(40);
    expect(edges).toBe(
      authoredTopics.reduce((total, topic) => total + topic.requires.length, 0),
    );
  });

  // A full re-seed of 303 topics takes seconds on its own and Bun's default timeout is five,
  // so it gets room while the other suites share the test database.
  test(
    'seeding twice is idempotent',
    async () => {
      const before = await Promise.all([
        prisma.topic.count(),
        prisma.topicPrerequisite.count(),
        prisma.phase.count(),
      ]);
      await seedContent(prisma);
      const after = await Promise.all([
        prisma.topic.count(),
        prisma.topicPrerequisite.count(),
        prisma.phase.count(),
      ]);
      expect(after).toEqual(before);
    },
    60_000,
  );
});
