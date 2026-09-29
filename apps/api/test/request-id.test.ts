import { describe, expect, test } from 'bun:test';
import { requestId } from '../src/common/request-id.middleware';

function harness(incoming: string | null) {
  const headers: Record<string, string> = {};
  const res = { setHeader: (k: string, v: string) => (headers[k] = v) };
  const req = {
    header: (name: string) => (name === 'x-request-id' ? incoming : undefined),
  } as never;
  let nextCalled = false;
  requestId(req, res as never, () => (nextCalled = true));
  return { headers, req, nextCalled };
}

describe('requestId middleware', () => {
  test('adopts a well-formed caller id so traces stitch across services', () => {
    const { headers, req, nextCalled } = harness('ingress-42');
    expect(headers['x-request-id']).toBe('ingress-42');
    expect((req as { requestId: string }).requestId).toBe('ingress-42');
    expect(nextCalled).toBeTrue();
  });

  test.each([
    ['CRLF smuggling', 'a\r\nSet-Cookie: evil=1'],
    ['oversized', 'x'.repeat(200)],
    ['shell metacharacters', 'id; rm -rf /'],
  ])('regenerates for %s', (_label, value) => {
    const { headers } = harness(value);
    expect(headers['x-request-id']).toHaveLength(36);
  });

  test('generates an id when none is supplied', () => {
    const { headers } = harness(null);
    expect(headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
