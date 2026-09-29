import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000';
const ACCESS_COOKIE = 'eos_access';
const REFRESH_COOKIE = 'eos_refresh';

/** Seven days matches the control plane's refresh TTL; the access cookie lives as long as the tab. */
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

type Params = { params: Promise<{ path: string[] }> };

interface IssuedSession {
  accessToken: string;
  refreshToken: string;
  user: unknown;
}

/** A 401 on these means the credentials were wrong, not that the access token aged out. */
const CREDENTIAL_CALLS = new Set(['auth/login', 'auth/register', 'auth/refresh']);

/**
 * A dashboard fires five reads at once, and the control plane treats a replayed refresh token as
 * theft — it revokes the whole family and both parties are logged out. So a rotation is started
 * once per presented token and every request holding that same token waits for it, then retries
 * with the token the rotation issued. Keyed by the presented token, never by the learner, so two
 * sessions on one server cannot read each other's entry.
 */
const rotations = new Map<string, Promise<IssuedSession | null>>();

/** The map only ever holds the last few rotations; the oldest entry is the least likely to be replayed. */
const ROTATIONS_KEPT = 25;

function jarOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

async function store(session: IssuedSession) {
  const jar = await cookies();
  // the access token is a session cookie: it dies with the tab, and the refresh token does the rest
  jar.set(ACCESS_COOKIE, session.accessToken, jarOptions());
  jar.set(REFRESH_COOKIE, session.refreshToken, jarOptions(REFRESH_MAX_AGE));
}

async function clear() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

async function call(path: string, init: RequestInit, accessToken?: string) {
  try {
    const res = await fetch(`${API_URL}/${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...(init.headers as Record<string, string> | undefined),
      },
      cache: 'no-store',
    });
    const text = await res.text();
    return { status: res.status, text };
  } catch (cause) {
    // a control plane that is not running is a fact the screen can report, not a stack trace
    return {
      status: 502,
      text: JSON.stringify({
        error: {
          status: 502,
          code: 'CONTROL_PLANE_UNREACHABLE',
          message: `the control plane is not answering on ${API_URL}: ${(cause as Error).message}`,
        },
      }),
    };
  }
}

/**
 * Rotations in flight or already finished, keyed by the refresh token that was presented. A token
 * that has already been consumed resolves to the session its rotation issued, so a request still
 * carrying it is served rather than replaying it. The cookie jar is written by the request that
 * awaits this, not here — every response has to carry the new tokens, not just the one that won.
 */
function rotate(presented: string): Promise<IssuedSession | null> {
  const already = rotations.get(presented);
  if (already) return already;

  const attempt = (async () => {
    const renewed = await call('auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: presented }) });
    if (renewed.status >= 400) return null;
    return JSON.parse(renewed.text) as IssuedSession;
  })();

  rotations.set(presented, attempt);
  if (rotations.size > ROTATIONS_KEPT) rotations.delete(rotations.keys().next().value as string);
  return attempt;
}

function respond(status: number, text: string) {
  if (status === 204 || text === '') return new NextResponse(null, { status });
  return new NextResponse(text, { status, headers: { 'content-type': 'application/json' } });
}

/**
 * The browser only ever sees this gateway. The control plane's tokens are issued into httpOnly
 * cookies here and stripped from the body, so a session cannot be lifted out of a stored JSON
 * response, and a 401 is retried once after a silent refresh instead of dumping the learner back
 * to the sign-in screen mid-answer.
 */
async function handle(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const segments = (await params).path;
  const path = segments.join('/');
  const query = req.nextUrl.search;
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text();
  const jar = await cookies();

  const send = (token: string | undefined) =>
    call(`${path}${query}`, { method: req.method, ...(body ? { body } : {}) }, token);

  const accessToken = jar.get(ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  let result = await send(accessToken);

  if (result.status === 401 && refreshToken && !CREDENTIAL_CALLS.has(path)) {
    const rotated = await rotate(refreshToken);
    if (rotated) {
      await store(rotated);
      result = await send(rotated.accessToken);
    } else {
      // the rotation was refused, so the session really is over and this response has to say so
      await clear();
    }
  }

  if (path.startsWith('auth/')) return finishAuth(path, result);
  return respond(result.status, result.text);
}

/** Auth calls are the only ones whose body carries credentials, and none of it leaves the server. */
async function finishAuth(path: string, result: { status: number; text: string }) {
  if (path === 'auth/logout') {
    await clear();
    return respond(result.status, result.text);
  }
  if (result.status >= 400) return respond(result.status, result.text);

  if (path === 'auth/me') return respond(result.status, result.text);

  const session = JSON.parse(result.text) as IssuedSession;
  await store(session);
  return respond(result.status, JSON.stringify({ user: session.user }));
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
