import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { createTestApp, type TestApp } from './helpers/test-app';
import { seedContent } from '../prisma/seed';

/**
 * The room is the one surface an anonymous candidate touches, so the tests hold the two things that
 * make that safe: the clock gate is enforced server-side on every call, and the share token is the
 * only credential — a link for a different room must not answer.
 */
interface RoomView {
  phase: string;
  id?: string;
  files?: { path: string; contents: string; isCheck: boolean }[];
  scenario?: { ticketTitle: string; ticketBody: string };
  minutesRemaining?: number;
  openedAt?: string | null;
}

interface RunReport {
  results: { name: string; passed: boolean; message: string }[];
  crashed: string | null;
  summary: { passed: number; failed: number; allGreen: boolean };
}

interface PromptResult {
  applied: { filePath: string; diff: { sign: string; text: string }[]; stats: { added: number; removed: number } }[];
  declined: { filePath: string; missing: string[] }[];
  report: RunReport | null;
  room: RoomView;
}

let app: TestApp;
let prisma: PrismaClient;
let token: string;
let hostId: string;
let scenarioSlug: string;

async function call(method: string, path: string, body?: unknown, auth?: string) {
  const res = await fetch(`${app.base}${path}`, {
    method,
    headers: { ...(auth ? { authorization: `Bearer ${auth}` } : {}), 'content-type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, body: await res.json() };
}

const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

async function schedule(body: { candidateLabel: string; scheduledAt: string; openMinutes?: number }) {
  const res = await call('POST', '/interview/rooms', 
    {
      scenarioSlug,
      candidateLabel: body.candidateLabel,
      scheduledAt: body.scheduledAt,
      openMinutes: body.openMinutes ?? 60,
    },
    token,
  );
  expect(res.status).toBe(201);
  return res.body as { shareToken: string; room: { id: string } };
}

describe('interview room api', () => {
  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
    await seedContent(prisma);

    const email = `interview-${Math.random().toString(36).slice(2, 10)}@example.com`;
    const registered = await call('POST', '/auth/register', {
      email,
      displayName: 'Interviewer',
      password: 'CoMplicated-passw0rd!23',
    });
    token = (registered.body as { accessToken: string }).accessToken;
    hostId = (registered.body as { user: { id: string } }).user.id;

    const scenarios = await call('GET', '/interview/scenarios', undefined, token);
    expect(scenarios.status).toBe(200);
    const first = (scenarios.body as { slug: string }[])[0];
    expect(first).toBeDefined();
    scenarioSlug = first.slug;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  test('the interviewer side needs a session and the candidate side does not', async () => {
    expect((await call('GET', '/interview/rooms')).status).toBe(401);
    expect((await call('GET', '/interview/scenarios')).status).toBe(401);
    expect((await call('GET', '/interview/room/not-a-real-token')).status).toBe(404);
  });

  test('a scheduled room hands back exactly one secret link', async () => {
    const { shareToken, room } = await schedule({ candidateLabel: 'Ada', scheduledAt: minutesFromNow(5) });
    expect(shareToken.length).toBeGreaterThan(20);
    expect(room.id).toBeTruthy();

    const stored = await prisma.interviewRoom.findUnique({ where: { id: room.id } });
    expect(stored?.tokenHash).not.toBe(shareToken);
    expect(stored?.hostUserId).toBe(hostId);
    // the room owns its copy of the project, so editing it cannot reach the authored scenario
    expect(await prisma.interviewRoomFile.count({ where: { roomId: room.id } })).toBeGreaterThan(1);
  });

  test('a locked room says when it opens and shows nothing else', async () => {
    const { shareToken } = await schedule({ candidateLabel: 'Locked', scheduledAt: minutesFromNow(30) });
    const res = await call('GET', `/interview/room/${shareToken}`);
    expect(res.status).toBe(200);
    const body = res.body as RoomView;
    expect(body.phase).toBe('locked');
    expect(body.files).toBeUndefined();
    expect(body.scenario).toBeUndefined();
    expect(body.minutesRemaining).toBe(30);

    const run = await call('POST', `/interview/room/${shareToken}/run`);
    expect(run.status).toBe(409);
    expect((run.body as { error: { code: string } }).error.code).toBe('ROOM_LOCKED');
  });

  test('a live room opens once, on the candidate, and records that they came in', async () => {
    const { shareToken, room } = await schedule({ candidateLabel: 'Grace', scheduledAt: minutesFromNow(-1) });
    const opened = await call('GET', `/interview/room/${shareToken}`);
    expect(opened.status).toBe(200);
    const body = opened.body as RoomView;
    expect(body.phase).toBe('live');
    expect(body.scenario?.ticketTitle).toContain('·');
    expect(body.files?.length).toBeGreaterThan(1);
    expect(body.files?.some((file) => file.isCheck)).toBe(true);

    const stored = await prisma.interviewRoom.findUniqueOrThrow({ where: { id: room.id } });
    expect(stored.openedAt).not.toBeNull();
    const events = await prisma.interviewRoomEvent.findMany({ where: { roomId: room.id } });
    expect(events.map((event) => event.kindKey)).toEqual(['opened']);
  });

  test('the candidate edits project files but never the checks', async () => {
    const { shareToken } = await schedule({ candidateLabel: 'Alan', scheduledAt: minutesFromNow(-1) });
    const room = (await call('GET', `/interview/room/${shareToken}`)).body as RoomView;
    const target = room.files!.find((file) => !file.isCheck)!;
    const check = room.files!.find((file) => file.isCheck)!;

    const saved = await call('POST', `/interview/room/${shareToken}/save`, {
      files: [{ path: target.path, contents: `${target.contents}\n// candidate note\n` }],
    });
    expect(saved.status).toBe(201);
    expect((saved.body as RoomView).files!.find((file) => file.path === target.path)!.contents).toContain(
      'candidate note',
    );

    const readOnly = await call('POST', `/interview/room/${shareToken}/save`, {
      files: [{ path: check.path, contents: 'defineCheck("everything", () => assert(true));' }],
    });
    expect(readOnly.status).toBe(400);
    expect((readOnly.body as { error: { code: string } }).error.code).toBe('ROOM_CHECK_READ_ONLY');

    const unknown = await call('POST', `/interview/room/${shareToken}/save`, {
      files: [{ path: 'src/env-stealer.js', contents: 'x' }],
    });
    expect(unknown.status).toBe(400);
    expect((unknown.body as { error: { code: string } }).error.code).toBe('ROOM_FILE_UNKNOWN');
  });

  test('running the checks reports the bug the ticket describes', async () => {
    const { shareToken } = await schedule({ candidateLabel: 'Barbara', scheduledAt: minutesFromNow(-1) });
    const res = await call('POST', `/interview/room/${shareToken}/run`);
    expect(res.status).toBe(201);
    const report = res.body as RunReport;
    expect(report.crashed).toBeNull();
    expect(report.summary.allGreen).toBe(false);
    expect(report.results.every((result) => result.message.length > 0)).toBe(true);
  });

  test('a prompt that does not name the fix changes nothing and says what is missing', async () => {
    const { shareToken } = await schedule({ candidateLabel: 'Linus', scheduledAt: minutesFromNow(-1) });
    const before = (await call('GET', `/interview/room/${shareToken}`)).body as RoomView;

    const res = await call('POST', `/interview/room/${shareToken}/prompt`, {
      prompt: 'please fix this bug, it is breaking production',
    });
    expect(res.status).toBe(201);
    const result = res.body as PromptResult;
    expect(result.applied).toEqual([]);
    expect(result.declined.length).toBeGreaterThan(0);
    expect(result.declined[0].missing.length).toBeGreaterThan(0);
    expect(result.report).toBeNull();
    expect(result.room.files).toEqual(before.files);
  });

  test('a prompt that names the fix rewrites the file and turns the checks green', async () => {
    const { shareToken } = await schedule({ candidateLabel: 'Margaret', scheduledAt: minutesFromNow(-1) });
    const before = (await call('GET', `/interview/room/${shareToken}`)).body as RoomView;
    const res = await call('POST', `/interview/room/${shareToken}/prompt`, {
      prompt:
        'the cached order status goes stale because nothing invalidates the entry on the write path, ' +
        'so a cancelled order keeps shipping',
    });
    expect(res.status).toBe(201);
    const result = res.body as PromptResult;
    expect(result.declined).toEqual([]);
    expect(result.applied.length).toBe(1);
    expect(result.applied[0].stats.added).toBeGreaterThan(0);
    expect(result.applied[0].diff.some((line) => line.sign === '-')).toBe(true);
    expect(result.report?.summary.allGreen).toBe(true);

    // and the room keeps the fixed buffer rather than showing it once
    const after = (await call('GET', `/interview/room/${shareToken}`)).body as RoomView;
    const path = result.applied[0].filePath;
    expect(after.files!.find((file) => file.path === path)!.contents).not.toBe(
      before.files!.find((file) => file.path === path)!.contents,
    );
    const rerun = await call('POST', `/interview/room/${shareToken}/run`);
    expect((rerun.body as RunReport).summary.allGreen).toBe(true);
  });

  test('the interviewer reads the ledger in the order the candidate worked', async () => {
    const { shareToken, room } = await schedule({ candidateLabel: 'Ken', scheduledAt: minutesFromNow(-1) });
    await call('GET', `/interview/room/${shareToken}`);
    await call('POST', `/interview/room/${shareToken}/run`);
    await call('POST', `/interview/room/${shareToken}/prompt`, { prompt: 'make it expire and invalidate and cancel' });

    const detail = await call('GET', `/interview/rooms/${room.id}`, undefined, token);
    expect(detail.status).toBe(200);
    const body = detail.body as {
      signalNotes: string;
      fixes: { filePath: string; applied: boolean }[];
      events: { kindKey: string; input: string }[];
    };
    expect(body.signalNotes.length).toBeGreaterThan(10);
    expect(body.fixes[0].applied).toBe(true);
    expect(body.events.map((event) => event.kindKey)).toEqual(['opened', 'run', 'prompt']);
    expect(body.events[2].input).toContain('invalidate');
  });

  test('closing a room early ends it for the candidate', async () => {
    const { shareToken, room } = await schedule({ candidateLabel: 'Radia', scheduledAt: minutesFromNow(-1) });
    expect((await call('POST', `/interview/rooms/${room.id}/close`, {}, token)).status).toBe(201);

    const view = await call('GET', `/interview/room/${shareToken}`);
    expect((view.body as RoomView).phase).toBe('expired');
    const run = await call('POST', `/interview/room/${shareToken}/run`);
    expect((run.body as { error: { code: string } }).error.code).toBe('ROOM_CLOSED');
    expect((await call('POST', `/interview/rooms/${room.id}/close`, {}, token)).status).toBe(409);
  });

  test('a window that ran out is expired, and the room list shows both', async () => {
    const { shareToken, room } = await schedule({ candidateLabel: 'Frances', scheduledAt: minutesFromNow(-180), openMinutes: 60 });
    expect((await call('GET', `/interview/room/${shareToken}`)).body).toMatchObject({ phase: 'expired', ranOut: true });

    const list = (await call('GET', '/interview/rooms', undefined, token)).body as {
      id: string;
      phase: string;
      candidateLabel: string;
    }[];
    expect(list.find((entry) => entry.id === room.id)).toMatchObject({
      phase: 'expired',
      candidateLabel: 'Frances',
    });
    expect(list.some((entry) => entry.candidateLabel === 'Margaret' && entry.phase === 'live')).toBe(true);
  });

  test('rejects a schedule for a scenario that does not exist', async () => {
    const res = await call(
      'POST',
      '/interview/rooms',
      { scenarioSlug: 'no-such-scenario', candidateLabel: 'Ghost', scheduledAt: minutesFromNow(5), openMinutes: 60 },
      token,
    );
    expect(res.status).toBe(404);
    expect((res.body as { error: { code: string } }).error.code).toBe('SCENARIO_NOT_FOUND');
  });
});
