import { existsSync, readFileSync, statSync } from 'node:fs';

const apiDir = `${import.meta.dir}/..`;

// Bun's transpiler does not emit decorator metadata, so NestJS DI needs tsc as the
// emitter. tsc watches and writes dist/; bun --watch restarts the app on each build.
const compiler = Bun.spawn(
  [process.execPath, 'x', 'tsc', '-p', 'tsconfig.build.json', '--watch', '--preserveWatchOutput'],
  { cwd: apiDir, stdout: 'inherit', stderr: 'inherit' },
);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Don't launch the app against a stale dist/ — wait for tsc's first emit.
const mainEntry = `${apiDir}/dist/main.js`;
const startedAt = Date.now();
for (;;) {
  if (existsSync(mainEntry) && statSync(mainEntry).size > 0) break;
  if (Date.now() - startedAt > 120_000) throw new Error('tsc never emitted dist/main.js');
  await wait(500);
}
await wait(1000);

const app = Bun.spawn([process.execPath, 'run', '--watch', 'dist/main.js'], {
  cwd: apiDir,
  stdout: 'inherit',
  stderr: 'inherit',
  env: { ...process.env, ...parseEnv(`${apiDir}/.env`) },
});

function parseEnv(path: string): Record<string, string> {
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i), line.slice(i + 1)];
      }),
  );
}

process.on('SIGINT', () => {
  compiler.kill();
  app.kill();
  process.exit(0);
});

await Promise.race([compiler.exited, app.exited]);
