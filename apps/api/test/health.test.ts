import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createTestApp, type TestApp } from './helpers/test-app';

describe('boot', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  test('liveness answers without touching the database', async () => {
    const res = await fetch(`${app.base}/health/live`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
    expect(res.headers.get('x-request-id')).toHaveLength(36);
  });

  test('readiness proves the database is reachable', async () => {
    const res = await fetch(`${app.base}/health/ready`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ready', database: 'up' });
  });

  test('a caller-supplied request id is echoed, not replaced', async () => {
    const res = await fetch(`${app.base}/health/live`, {
      headers: { 'x-request-id': 'trace-abc-123' },
    });
    expect(res.headers.get('x-request-id')).toBe('trace-abc-123');
  });

  test('unknown routes fail with the structured error contract', async () => {
    const res = await fetch(`${app.base}/nope`);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { status: number; requestId: string } };
    expect(body.error.status).toBe(404);
    expect(body.error.requestId).toHaveLength(36);
  });

  test('an oversized request id is discarded instead of reflected', async () => {
    const res = await fetch(`${app.base}/health/live`, {
      headers: { 'x-request-id': 'x'.repeat(200) },
    });
    expect(res.headers.get('x-request-id')).toHaveLength(36);
  });
});
