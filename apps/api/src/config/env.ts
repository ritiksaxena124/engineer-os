import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_TEST: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  PASSWORD_WORK_FACTOR: z.coerce.number().int().min(12).max(20).default(15),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),
  AI_SERVICE_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(overrides: Record<string, string | undefined> = {}): Env {
  const merged = { ...process.env, ...overrides };
  const parsed = schema.safeParse(merged);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    // Fail at boot, not at the first request that needs the missing value.
    throw new Error(`Invalid environment configuration — ${detail}`);
  }
  return parsed.data;
}
