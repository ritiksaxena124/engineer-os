import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { createTestApp, type TestApp } from './helpers/test-app';
import { seedContent } from '../prisma/seed';
import { LESSON_ANATOMY } from '../prisma/content/lessons';

interface LessonPayload {
  slug: string;
  title: string;
  topicSlug: string;
  sections: { kind: string; label: string; guidance: string; body: string; position: number }[];
  readAt: string | null;
}

let app: TestApp;
let prisma: PrismaClient;
let token: string;
let userId: string;

async function request(path: string, method = 'GET', auth?: string) {
  const res = await fetch(`${app.base}${path}`, {
    method,
    headers: auth ? { authorization: `Bearer ${auth}` } : {},
  });
  const text = await res.text();
  return { status: res.status, body: text ? (JSON.parse(text) as unknown) : null };
}

async function setLevel(topicSlug: string, levelKey: string) {
  const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: topicSlug } });
  await prisma.masteryRecord.upsert({
    where: { userId_topicId: { userId, topicId: topic.id } },
    create: { userId, topicId: topic.id, levelKey },
    update: { levelKey },
  });
}

describe('lesson engine', () => {
  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
    await seedContent(prisma);

    const email = `lessons-${Math.random().toString(36).slice(2, 10)}@example.com`;
    const res = await fetch(`${app.base}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, displayName: 'Lesson Tester', password: 'CoMplicated-passw0rd!23' }),
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
    expect((await request('/lessons/the-life-of-a-program')).status).toBe(401);
    expect((await request('/lessons/the-life-of-a-program/read', 'POST')).status).toBe(401);
    expect((await request('/lessons?topic=event-loop')).status).toBe(401);
  });

  test('serves the full §43 anatomy in order, with real content in every section', async () => {
    const { status, body } = await request('/lessons/the-life-of-a-program', 'GET', token);
    expect(status).toBe(200);
    const lesson = (body as { lesson: LessonPayload }).lesson;

    expect(lesson.slug).toBe('the-life-of-a-program');
    expect(lesson.topicSlug).toBe('how-programs-run');
    expect(lesson.sections.map((section) => section.kind)).toEqual([...LESSON_ANATOMY]);
    expect(lesson.sections.map((section) => section.position)).toEqual(
      LESSON_ANATOMY.map((_, index) => index + 1),
    );
    for (const section of lesson.sections) {
      expect(section.body.length).toBeGreaterThan(80);
      expect(section.label.length).toBeGreaterThan(0);
      expect(section.guidance.length).toBeGreaterThan(0);
    }
    // the anatomy is only meaningful if the naive solution precedes why it fails
    const kinds = lesson.sections.map((section) => section.kind);
    expect(kinds.indexOf('naive-solution')).toBeLessThan(kinds.indexOf('why-naive-fails'));
    expect(kinds.indexOf('why-naive-fails')).toBeLessThan(kinds.indexOf('mental-model'));
  });

  test('a lesson on a locked topic refuses the learner and says what is missing', async () => {
    const { status, body } = await request('/lessons/the-event-loop-from-the-inside', 'GET', token);
    expect(status).toBe(403);
    const error = (body as {
      error: { code: string; message: string; details: { blockedBy: { slug: string }[] } };
    }).error;
    expect(error.code).toBe('TOPIC_LOCKED');
    expect(error.details.blockedBy.map((entry) => entry.slug)).toContain('closures-scope');

    await setLevel('js-values-references', 'debugging');
    await setLevel('closures-scope', 'debugging');
    const unlocked = await request('/lessons/the-event-loop-from-the-inside', 'GET', token);
    expect(unlocked.status).toBe(200);
  });

  test('marking a lesson read is recorded once, not once per click', async () => {
    await request('/lessons/the-life-of-a-program/read', 'POST', token);
    await request('/lessons/the-life-of-a-program/read', 'POST', token);

    // scoped to this learner: the test database is reused across runs, other users
    // have their own read rows for the same lesson
    const reads = await prisma.lessonRead.count({
      where: { userId, lesson: { slug: 'the-life-of-a-program' } },
    });
    expect(reads).toBe(1);

    const { body } = await request('/lessons?topic=how-programs-run', 'GET', token);
    const listed = (body as { lessons: LessonPayload[] }).lessons;
    expect(listed).toHaveLength(1);
    expect(new Date(listed[0].readAt!).getTime()).toBeGreaterThan(0);
  });

  test('reading a lesson produces no mastery evidence whatsoever', async () => {
    const before = await request('/curriculum/topics', 'GET', token);
    const beforeTopic = (before.body as { topics: { slug: string; level: number; unlocked: boolean }[] })
      .topics.find((entry) => entry.slug === 'event-loop');
    const recordsBefore = await prisma.masteryRecord.count({ where: { userId } });

    await request('/lessons/the-life-of-a-program/read', 'POST', token);

    const [records, events] = await Promise.all([
      prisma.masteryRecord.count({ where: { userId } }),
      prisma.masteryEvent.count({ where: { record: { userId } } }),
    ]);
    const after = await request('/curriculum/topics', 'GET', token);
    const afterTopic = (after.body as { topics: { slug: string; level: number; unlocked: boolean }[] })
      .topics.find((entry) => entry.slug === 'event-loop');

    // reading is exposure, and exposure has no row in the mastery model at all
    expect(records).toBe(recordsBefore);
    expect(events).toBe(0);
    expect(afterTopic).toEqual(beforeTopic);
  });

  test('lists lessons for a topic including ones the learner has not read', async () => {
    const { body } = await request('/lessons?topic=event-loop', 'GET', token);
    const listed = (body as { lessons: LessonPayload[] }).lessons;
    expect(listed.map((lesson) => lesson.slug)).toEqual(['the-event-loop-from-the-inside']);
    expect(listed[0].readAt).toBeNull();
  });

  test('unknown lessons are a 404 with a machine code', async () => {
    const { status, body } = await request('/lessons/no-such-lesson', 'GET', token);
    expect(status).toBe(404);
    expect((body as { error: { code: string } }).error.code).toBe('LESSON_NOT_FOUND');
  });

  test('every lesson covers the whole anatomy or the seed refuses it', async () => {
    const lessons = await prisma.lesson.findMany({
      include: { sections: { orderBy: { position: 'asc' }, select: { kindKey: true } } },
    });
    expect(lessons.length).toBeGreaterThan(0);
    for (const lesson of lessons) {
      expect(lesson.sections.map((section) => section.kindKey)).toEqual([...LESSON_ANATOMY]);
    }
  });
});
