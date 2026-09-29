import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createTestApp, type TestApp } from './helpers/test-app';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName: string };
}

const credentials = () => ({
  email: `learner-${Math.random().toString(36).slice(2, 10)}@example.com`,
  displayName: 'Test Learner',
  password: 'CoMplicated-passw0rd!23',
});

let app: TestApp;

async function post(path: string, body: unknown, token?: string) {
  const res = await fetch(`${app.base}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function get(path: string, token?: string) {
  const res = await fetch(`${app.base}${path}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status, body: await res.json() };
}

describe('auth', () => {
  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  test('register creates the learner and hands back a working session', async () => {
    const { status, body } = await post('/auth/register', credentials());
    const session = body as TokenPair;
    expect(status).toBe(201);
    expect(session.user.id).toHaveLength(36);
    expect(JSON.stringify(session)).not.toContain('passwordHash');

    const me = await get('/auth/me', session.accessToken);
    expect(me.status).toBe(200);
    expect((me.body as { email: string }).email).toBe(session.user.email);
  });

  test('the same email cannot register twice', async () => {
    const creds = credentials();
    expect((await post('/auth/register', creds)).status).toBe(201);
    const second = await post('/auth/register', creds);
    expect(second.status).toBe(409);
  });

  test('malformed input is rejected before it reaches the database', async () => {
    const badEmail = await post('/auth/register', { ...credentials(), email: 'not-an-email' });
    expect(badEmail.status).toBe(400);
    expect((badEmail.body as { error: { message: string[] } }).error.message).toBeDefined();

    const weak = await post('/auth/register', { ...credentials(), password: 'short' });
    expect(weak.status).toBe(400);

    const unexpected = await post('/auth/register', {
      ...credentials(),
      roleKey: 'admin',
    });
    expect(unexpected.status).toBe(400);
  });

  test('login does not reveal whether the email exists', async () => {
    const unknown = await post('/auth/login', {
      email: `ghost-${Math.random().toString(36).slice(2)}@example.com`,
      password: 'whatever-12345',
    });
    const registered = credentials();
    await post('/auth/register', registered);
    const wrongPassword = await post('/auth/login', {
      email: registered.email,
      password: 'definitely-wrong-password',
    });

    expect(unknown.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    const messageOf = (r: { body: unknown }) =>
      JSON.stringify((r.body as { error: { message: string } }).error.message);
    expect(messageOf(unknown)).toBe(messageOf(wrongPassword));
  });

  test('protected routes require a token signed with the access secret', async () => {
    expect((await get('/auth/me')).status).toBe(401);

    const session = await registerAndReturn();
    const tampered = `${session.accessToken.slice(0, -4)}AAAA`;
    expect((await get('/auth/me', tampered)).status).toBe(401);
    expect((await get('/auth/me', session.refreshToken)).status).toBe(401);
    expect((await get('/auth/me', session.accessToken)).status).toBe(200);
  });

  test('a refresh token works once, then the whole family is revoked on reuse', async () => {
    const session = await registerAndReturn();
    const first = await post('/auth/refresh', { refreshToken: session.refreshToken });
    expect(first.status).toBe(200);
    const rotated = first.body as TokenPair;
    expect(rotated.refreshToken).not.toBe(session.refreshToken);

    // replay of the consumed token must not just fail — it must invalidate the family
    const replay = await post('/auth/refresh', { refreshToken: session.refreshToken });
    expect(replay.status).toBe(401);

    const afterTheft = await post('/auth/refresh', { refreshToken: rotated.refreshToken });
    expect(afterTheft.status).toBe(401);
  });

  test('logout revokes the session so the refresh token stops working', async () => {
    const session = await registerAndReturn();
    expect((await post('/auth/logout', { refreshToken: session.refreshToken })).status).toBe(204);
    expect((await post('/auth/refresh', { refreshToken: session.refreshToken })).status).toBe(401);
  });

  async function registerAndReturn(): Promise<TokenPair> {
    const res = await post('/auth/register', credentials());
    return res.body as TokenPair;
  }
});
