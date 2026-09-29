/**
 * Everything the browser asks for goes through /api/gateway, which adds the bearer token and
 * rotates it on the server. The access and refresh tokens are httpOnly cookies, so no script on
 * this page — including one injected through an XSS bug — can read them.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: unknown = null,
    /** The control plane logs every refusal against this id, so a screenshot is enough to debug. */
    readonly requestId: string | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  code?: string;
  message?: string | string[];
  details?: unknown;
  error?: { code?: string; message?: string; details?: unknown; requestId?: string };
}

function describe(status: number, payload: ErrorBody | null): ApiError {
  const code = payload?.error?.code ?? payload?.code ?? 'request_failed';
  const raw = payload?.error?.message ?? payload?.message;
  const message = Array.isArray(raw) ? raw.join(', ') : (raw ?? `request failed with status ${status}`);
  return new ApiError(
    status,
    code,
    message,
    payload?.error?.details ?? payload?.details ?? null,
    payload?.error?.requestId ?? null,
  );
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/gateway/${path}`, {
    method,
    credentials: 'same-origin',
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const payload = text ? (JSON.parse(text) as T & ErrorBody) : ({} as T & ErrorBody);
  if (!res.ok) throw describe(res.status, payload);
  return payload;
}

export const api = {
  get: <T>(path: string) => call<T>('GET', path),
  post: <T>(path: string, body?: unknown) => call<T>('POST', path, body ?? {}),
};
