# Scope

Built in the order mandated by §87. Each milestone ships working, tested, and reviewable before
the next starts.

## MVP — the engine that can judge you

| # | Deliverable | Acceptance |
|---|---|---|
| 1 | Architecture + schema | migration applies; 30+ tables; no enum, no cascade |
| 2 | Auth | register/login/refresh rotation; reused refresh token is rejected; integration tests on a real DB |
| 3 | Curriculum engine | graph query returns unlock state per topic; cycle detection at seed time; gating unit-tested |
| 4 | Lesson engine | §43 anatomy served as sections; reading a lesson produces **no** mastery signal |
| 5 | Question engine | 13 categories, difficulty 1–7, answer model, expected concepts |
| 6 | Assessment engine | diagnostic (30 q) + topic drill + phase exam Parts A–G |
| 7 | Mastery engine | level computed from 8 signals; promotion requires evidence; spaced repetition schedules reviews |
| 8 | Weakness detection | repeated failure walks the graph back to the weak prerequisite and recommends the repair path |
| 9 | Web UI | Dashboard, Learning Path, Topic, Lesson, Practice, Progress — dark, developer-tool aesthetic |

**Deferred deliberately:** embedded code execution sandbox (§83 says local execution is
acceptable for MVP — exercises ship with a runner script instead), Redis, docker-compose,
load tests, the Python AI service.

## Phase 2 — the mentor

FastAPI AI service (mentor, evaluator, interviewer, question/incident generators) behind a
provider abstraction, with a deterministic local evaluator so the product works with no API key.
Code-review mode, teach-back grading, NO-AI / AI-review / AI-explanation modes, production
incident simulator, system design interview mode, weekly boss fight.

## Phase 3 — the flagship

Engineering journal + ADR workflows wired into every assessment, agentic SDLC project as the
capstone, MCP server for the platform's own data, CI/CD, observability dashboards.

## Future (explicitly not planned)

Remote code execution infrastructure, multi-tenant billing, Kubernetes, mobile apps. Adding any
of these requires the §63 interrogation: what problem does it solve, which fundamental concept it
represents, is that concept already held, does it serve the target role, can it wait.

## Non-negotiable quality bar for every milestone

Validation at the boundary, structured errors with request IDs, health checks, graceful
shutdown, migrations as the only schema path, tests that fail before they pass, and no
abstraction with a single hypothetical consumer.
