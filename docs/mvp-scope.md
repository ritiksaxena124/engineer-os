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

**Status.** All nine MVP milestones are shipped and tested, 6 including the phase exam. The
30-question diagnostic, topic drills and Parts A–G of the exam all work; what is thin is authored
content — P00 and P01 carry the question sets, so P00 is the only phase that can be sat end to end.

Mastery (7) is derived, never stored as a claim: a question category is evidence for one signal
dimension (`question_categories.signalKey`, authored as a lookup table), each dimension belongs to
one rung, and a rung is held only while its **most recent** demonstration scores at least 60.
That is why standing can fall. A scheduled review answers for the `recall` dimension instead,
which is the only way spaced repetition moves the ladder. Reading a lesson reaches none of this.

The exam (6) is §70: seven parts, each a different kind of work, each selecting from a different
family of the phase's own bank — theory, implementation, debugging, architecture, production,
interview, and a teach-back addressed to the topic with the most to explain (it has no question
row). A part that cannot be filled is refused out loud as `EXAM_NOT_AUTHORED` rather than padded
with a question from the wrong family; a part that is only partly filled hands out a short paper
and grades it against what it handed out. Passing requires every part to hold, and the pass is the
only thing that recommends the next phase — a finished lesson never does. `POST /assessments/exam`
and `/assessments/exam/submit`.

Weakness (8) is derived the same way, from the attempt ledger rather than a stored flag: three
misses in a row on one topic — a miss being an attempt under the pass score, diagnostic attempts
excluded — opens a finding, and a single passing answer closes it. The finding then walks the
prerequisite graph downward and names the deepest weak prerequisite as the root cause, so the
report says what to repair instead of what to keep failing; when nothing underneath is weak, the
topic itself is the answer. Review lapses ride along as supporting evidence. `GET
/mastery/weaknesses` is the read path.

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
