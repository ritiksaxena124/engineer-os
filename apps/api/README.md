# The control plane

NestJS 11 + Prisma 6 + PostgreSQL. It owns every business decision the product makes: the
curriculum graph, prerequisite gating, the attempt ledger, mastery computation, spaced
repetition, auth. The web client never computes any of it.

## Toolchain: Bun runs it, tsc emits it

Bun is the package manager, dev runner, test runner and runtime — with one exception that decides
the whole build layout. Bun's transpiler does **not** emit `design:paramtypes` decorator metadata,
and NestJS resolves constructor injection from that metadata. So TypeScript is compiled by tsc and
only executed by Bun:

```bash
bunx tsc -p tsconfig.build.json   # → dist/src/main.js
bun run dist/src/main.js
```

The emit root is the **package**, not `src/`, because `src/question/dto.ts` imports the authored
content tables from `prisma/content/reference`. `rootDir` is pinned in `tsconfig.build.json` so
that stays true instead of being re-inferred every time a file moves.

Tests follow the same rule: authored in TS, compiled to `dist-test/`, then run by Bun against a
real `engineer_os_test` database. There are no mocks over the repository layer — a test that
passes against a fake migration plan proves nothing.

## Commands

| Command | What it does |
| --- | --- |
| `bun run dev` | tsc watch + restart-on-emit (`scripts/dev.ts`) |
| `bun run build` | emit `dist/` |
| `bun run start` | run the emitted entry |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | compile the suite and run all of it |
| `bun run test:unit` | domain rules only — no database |
| `bun run db:migrate` | `migrate diff` → file → `deploy` (see below) |
| `bun run db:seed` | load the authored curriculum, question bank and category table |
| `bun run db:test:prepare` | drop and re-migrate the test database |

`prisma migrate dev` refuses to run non-interactively, which is what an agent and CI both need, so
`scripts/migrate.ts` generates the migration by diffing against the intended schema and deploys
it. `--db=DATABASE_URL_TEST` points the same script at the test cluster.

## Environment

Copy `.env.example` to `.env`. Nothing else reads the file; the config module validates it at boot
and the process refuses to start on a bad value rather than failing at the first request.

| Variable | Notes |
| --- | --- |
| `PORT` | HTTP port. 4000 is what the web gateway expects by default. |
| `DATABASE_URL` | dev database |
| `DATABASE_URL_TEST` | the database the suite runs against |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | separate keys: an access token must not be accepted as a refresh token |
| `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL` | 15m / 7d. Shortening the access TTL is how you exercise silent refresh. |
| `PASSWORD_WORK_FACTOR` | scrypt log-N, accepted range 12–20. `.env` ships 14 for a fast dev loop; 15+ for anything real. |
| `FRONTEND_ORIGIN` | CORS origin for the web client |
| `AI_SERVICE_URL` | Phase 2 mentor service; unused by the engine |

## Module map

```
src/
├── auth/          register, login, refresh rotation with reuse detection, guards
├── curriculum/    tracks, phases, topics, prerequisites, unlock state, repair path
├── lessons/       §43 lesson anatomy; reading writes a read and no mastery signal
├── question/      bank, categories, rubric grading, active-recall reveal
├── assessments/   the 30-question diagnostic session and gap report
├── mastery/       8-signal derivation, evidence-gated rungs, spaced repetition, weakness findings
└── prisma/        schema, migrations, authored content tables
```

Gating, grading and mastery are pure modules — no NestJS or Prisma imports — so they are unit-tested
without a database and the HTTP layer stays thin.

## Rules the code actually follows

- **No enums for business constants.** Categories, levels, verdicts and statuses are lookup-table
  rows with an `isActive` flag, so a value can be retired without a migration or a redeploy.
- **No hard deletes, no cascades.** Business rows carry `isActive`; the append-only ledgers
  (`attempts`, `mastery_events`, `lesson_reads`) carry nothing deletable — a removed mistake is a
  lost lesson.
- **Mastery is derived, never claimed.** A rung is held only while its most recent demonstration
  scores at or above 60 with evidence attached, which is why standing can fall. Reading a lesson
  reaches none of it.
- **Errors are envelopes.** `{ error: { status, code, message, requestId, details? } }` from every
  failure path, including unmatched routes.
