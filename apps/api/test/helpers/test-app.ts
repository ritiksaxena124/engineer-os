import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, readFileSync } from 'node:fs';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/http-exception.filter';

function envFile(): Record<string, string> {
  // compiled to CJS for NestJS decorator metadata, so __dirname not import.meta
  let dir = __dirname;
  for (let up = 0; up < 6; up += 1) {
    const candidate = `${dir}/.env`;
    if (existsSync(candidate)) {
      return Object.fromEntries(
        readFileSync(candidate, 'utf8')
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith('#'))
          .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
      );
    }
    dir = `${dir}/..`;
  }
  throw new Error('no .env found walking up from the test helper');
}

export interface TestApp {
  base: string;
  close: () => Promise<void>;
}

/** Boots the real app against engineer_os_test on an ephemeral port. */
export async function createTestApp(): Promise<TestApp> {
  const config = envFile();
  const url = config.DATABASE_URL_TEST;
  if (!url?.includes('engineer_os_test')) {
    throw new Error('refusing to boot tests against anything but engineer_os_test');
  }
  // Prisma reads process.env first, so this beats the .env default it also loads.
  process.env.DATABASE_URL = url;
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-0123456789';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-0123456789';
  process.env.PASSWORD_WORK_FACTOR = '12';

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();
  const server = app.getHttpServer();
  const listener = server.listen(0);
  const port = (listener.address() as { port: number }).port;

  return {
    base: `http://127.0.0.1:${port}`,
    close: async () => {
      await new Promise<void>((resolve) => listener.close(() => resolve()));
      await app.close();
    },
  };
}
