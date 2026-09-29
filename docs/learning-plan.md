# Initial learning plan

Assumes the diagnostic has been taken. The profile (ships production Node/Nest/Postgres/Python
systems, builds agentic prototypes) makes two sequences near-certain: internals folklore and
evaluation-free AI work. Both are corrected before any new framework is touched.

## Week 0 — calibrate

Diagnostic (30 q) → per-concept gap map → unlock set. Nothing is skipped on the strength of the
profile alone (§1: never assume knowledge because a technology has been used).

## Weeks 1–2 — P1 JavaScript internals, P0 gaps only where diagnostics missed

- Event loop: microtask/macrotask prediction set, 25 items, difficulty 3→6, graded on reasoning
  not output
- Experiment: block the loop with `crypto.scryptSync` while a health check runs; measure p99
- Build: HTTP server from `node:http`, then a worker-thread offload for the CPU path
- Debug lab: leak via retained listener; find it with two heap snapshots
- Exit: L3 Debugging on Event Loop, L2 on Streams/Backpressure

Why first: everything downstream — Node scaling, DB pooling, queue consumers, agent loops — is
reasoned about in event-loop terms. Weakness here makes later production judgment unfalsifiable.

## Weeks 3–4 — P7 PostgreSQL internals

- 1M-row table: same query with/without index, `EXPLAIN ANALYZE` both, explain every planner line
- MVCC: two-transaction script reproducing dirty read, non-repeatable read, phantom, serialization
  failure; then fix each with the correct isolation level
- Deadlock: build it, read `pg_stat_activity`, fix with lock ordering
- Keyset pagination against a 10M-row ordered scan
- Exit: L4 Design on Transactions & Indexing

Why here: this is the single highest-leverage module for a backend role and the most common place
where "I use Prisma" masks "I do not know what the database does".

## Weeks 5–6 — P15 Concurrency, P16 Distributed Systems (entry)

- Race: two users buy the last item — solve with DB constraint, then Redis lock, then compare
  correctness/throughput/operational cost of each
- Webhook delivered twice — idempotency key design + ADR
- Partial failure drill: kill one dependency and describe what the dashboard shows
- Exit: L3 on Race Conditions, first ADR filed

## Weeks 7–8 — P30 LLM Evaluation before any agent work

- Build a 30-case golden set for an existing RAG prototype; measure retrieval recall before
  touching prompts
- Judge-model vs deterministic assertion; document where the judge disagrees with you
- Break the loop: force an agent into a retry cycle, add step/budget guardrails, measure again
- Exit: L2 Implementation on Evaluation — prerequisite gate for P31 Agent Engineering

## Cadence

Daily: 1 concept, 1 deep question, 1 implementation, 1 debug, 1 interview, 1 design, 1 production
scenario (§54), budgeted to a configurable 30–90 min. Weekly: one integrated boss fight (§55) that
combines the week's topics and injects failures mid-run. Monthly: phase project + exam Parts A–G.

Reviews are scheduled, not volunteered: 1/3/7/14/30 days, and only for concepts that were missed
or that gate unlocked topics.
