import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';

const apiDir = `${import.meta.dir}/..`;

function env(): Record<string, string> {
  return Object.fromEntries(
    readFileSync(`${apiDir}/.env`, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
  );
}

const config = env();
const testUrl = config.DATABASE_URL_TEST;
if (!testUrl) throw new Error('DATABASE_URL_TEST is not set in apps/api/.env');

const maintenanceUrl = testUrl.replace(/\/[^/?]+\?/, '/postgres?');
const targetName = new URL(testUrl).pathname.slice(1);

const admin = new PrismaClient({ datasources: { db: { url: maintenanceUrl } } });
try {
  // The test schema is rebuilt from scratch every run, so migrations are verified
  // against a database no developer is afraid of dropping.
  await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${targetName}" WITH (FORCE)`);
  await admin.$executeRawUnsafe(`CREATE DATABASE "${targetName}"`);
  console.log(`recreated ${targetName}`);
} finally {
  await admin.$disconnect();
}

const deploy = Bun.spawn(
  [process.execPath, 'x', 'prisma', 'migrate', 'deploy', '--schema', 'prisma/schema.prisma'],
  {
    cwd: apiDir,
    stdout: 'inherit',
    stderr: 'inherit',
    env: { ...process.env, DATABASE_URL: testUrl },
  },
);
const code = await deploy.exited;
if (code !== 0) throw new Error(`prisma migrate deploy failed with exit ${code}`);
console.log(`migrations applied to ${targetName}`);
