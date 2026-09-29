import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';

/** Correlation id travels on the response and every log line for that request (§85). */
export function requestId(req: Request, res: Response, next: () => void) {
  const incoming = req.header('x-request-id');
  const id = incoming && /^[\w.-]{1,64}$/.test(incoming) ? incoming : randomUUID();
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
  }
}
