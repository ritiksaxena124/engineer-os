# EngineerOS

A training system for an early-career engineer who intends to become a senior and then an AI-era
engineer. It is not a course platform. It has no certificates, no streaks to farm, and no progress
bar that goes up when you watch something. Its only metric is: **can you reproduce this under
 questioning, and use it in production?**

The one rule the whole codebase enforces is that **reading a lesson is never mastery**. A read
writes one row and moves nothing. A rung on the ladder is held only while the most recent thing you
actually answered scores at or above 60 with evidence behind it — which is why standing can fall.

## How it works

| | |
| --- | --- |
| **Curriculum** | 40 dependency-ordered phases, P00 Engineering Baseline → P39 Engineering Judgment; 303 topics with prerequisite edges. A topic unlocks only when the graph says its prerequisites are held. |
| **Mastery** | 8 rungs, L0 Exposure → L7 Teaching, derived from 8 signal dimensions. Dimensions come from which category a question belongs to, so the kind of question decides what it is evidence for. |
| **Practice** | 13 question categories at difficulty 1–7: conceptual, output prediction, implementation, debug, code review, system design, incident, interview and others. The answer model stays closed until an attempt exists. |
| **Recall** | A graded answer schedules spaced reviews at 1/3/7/14/30 days. Answering a review is the only path that moves the `recall` dimension. |
| **Weakness** | Three misses in a row on one topic opens a finding, and the finding walks the graph down to the deepest weak prerequisite. The report names what to repair, not what to keep failing. |
| **Diagnostic** | 30 written questions, one per area. It decides where the graph opens and promotes nothing. |

## Layout

```
apps/api   NestJS + Prisma control plane — every business decision, the source of truth
apps/web   Next.js 15 client — reads the control plane through one cookie-only gateway
docs/      architecture, schema, curriculum graph, diagnostic design, MVP scope, learning plan
```

PostgreSQL is the only data plane. There is no Redis and no container stack yet: nothing in the
shipped milestones has a latency or shared-state problem a process-local cache cannot serve, and
adding infrastructure before the reason exists is exactly the judgment failure the curriculum
teaches. The Python/FastAPI mentor service is Phase 2.

## Run it

Requires Bun 1.2+ and a PostgreSQL server you can create databases on.

```bash
bun install

cp apps/api/.env.example apps/api/.env      # set DATABASE_URL, DATABASE_URL_TEST, the two JWT secrets
cp apps/web/.env.example apps/web/.env      # API_URL, unless you moved the control plane off :4000

bun run db:migrate                            # generate + apply; migrations are the only schema path
bun run db:seed                               # 40 phases, 303 topics, categories, question bank

bun run dev:api                               # :4000
bun run dev:web                               # :3000
```

Register at `http://localhost:3000/register`, then sit the diagnostic. Each app has its own README
covering its commands, environment and the toolchain constraints behind its build layout.

## Test it

```bash
bun run test:api          # 158 tests — integration against engineer_os_test, domain rules without a DB
bun run --cwd apps/web test
bun run typecheck         # both apps
```

The API suite runs through `bunx tsc -p tsconfig.test.json && bun test dist-test`; Bun does not
emit the decorator metadata NestJS needs for dependency injection, so TypeScript is compiled by tsc
and only executed by Bun.

## Status

Milestones 1–5 and 7–9 are shipped and tested: schema and toolchain, auth with refresh rotation and
reuse detection, the curriculum graph with gating, the lesson engine, the question engine with
rubric grading, the mastery engine with spaced repetition, weakness detection, and the web client.
The diagnostic ships; the phase exam (Parts A–G) is authored content that is not finished. Deferred
deliberately: the AI mentor, an embedded code-execution sandbox, Redis, docker-compose, load tests.

## Design documents

- [Architecture](docs/architecture.md) — the three planes, request path, cross-cutting rules
- [Schema](docs/schema.md) — 30+ tables, soft delete only, no enums, no cascades
- [Curriculum](docs/curriculum.md) — the 40-phase graph and how a topic unlocks
- [Diagnostic](docs/diagnostic.md) — what placement measures and what it refuses to report
- [MVP scope](docs/mvp-scope.md) — milestone order and the acceptance bar for each
- [Learning plan](docs/learning-plan.md) — the path a learner is expected to walk
