import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const apiDir = `${import.meta.dir}/..`;
const name = process.argv[2];
if (!name) throw new Error('usage: bun run scripts/migrate.ts <migration_name> [--db=DATABASE_URL_KEY]');

const dbKey = (process.argv[3]?.replace('--db=', '') || 'DATABASE_URL') as 'DATABASE_URL' | 'DATABASE_URL_TEST';

function env(): Record<string, string> {
  return Object.fromEntries(
    readFileSync(`${apiDir}/.env`, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
  );
}

const config = env();
const url = config[dbKey];
if (!url) throw new Error(`${dbKey} missing from .env`);

// migrate diff needs a shadow database it can rebuild at will.
const shadowName = 'engineer_os_shadow';
const maintenanceUrl = url.replace(/\/[^/?]+\?/, '/postgres?');
const admin = new PrismaClient({ datasources: { db: { url: maintenanceUrl } } });
try {
  const rows = await admin.$queryRawUnsafe<{ n: number }[]>(
    'select 1 as n from pg_database where datname = $1',
    shadowName,
  );
  if (rows.length === 0) await admin.$executeRawUnsafe(`CREATE DATABASE "${shadowName}"`);
} finally {
  await admin.$disconnect();
}

const shadowUrl = new URL(maintenanceUrl);
shadowUrl.pathname = `/${shadowName}`;

const diff = Bun.spawn(
  [
    process.execPath,
    'x',
    'prisma',
    'migrate',
    'diff',
    '--from-migrations',
    'prisma/migrations',
    '--to-schema-datamodel',
    'prisma/schema.prisma',
    '--shadow-database-url',
    shadowUrl.toString(),
    '--script',
  ],
  { cwd: apiDir, stdout: 'pipe', stderr: 'pipe', env: { ...process.env, DATABASE_URL: url } },
);
const exitCode = await diff.exited;
const sql = await new Response(diff.stdout).text();
if (exitCode !== 0) {
  throw new Error(`migrate diff failed — ${await new Response(diff.stderr).text()}`);
}
if (!sql.trim()) throw new Error('migrate diff produced no SQL — schema is already applied');

const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const dir = `${apiDir}/prisma/migrations/${stamp}_${name}`;
if (existsSync(dir)) throw new Error(`migration ${name} already exists at ${dir}`);
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/migration.sql`, sql);
console.log(`wrote ${dir.replace(apiDir + '/', '')} (${sql.split('\n').length} lines)`);

const deploy = Bun.spawn(
  [process.execPath, 'x', 'prisma', 'migrate', 'deploy'],
  { cwd: apiDir, stdout: 'inherit', stderr: 'inherit', env: { ...process.env, DATABASE_URL: url } },
);
if ((await deploy.exited) !== 0) throw new Error('migrate deploy failed — see output above');

const generate = Bun.spawn([process.execPath, 'x', 'prisma', 'generate'], {
  cwd: apiDir,
  stdout: 'inherit',
  stderr: 'inherit',
});
await generate.exited;
console.log(`applied ${name}; migrations now: ${readdirSync(`${apiDir}/prisma/migrations`).filter((d) => !d.startsWith('.')).join(', ')}`);
