# Initial diagnostic (30 questions)

Purpose is gap discovery, not scoring. Each question names the concepts a real answer must touch
and the shape of a shallow answer. Difficulty uses the §45 ladder. The system reads *which*
concepts were missing, not how many questions were right — that difference is what makes the
result actionable.

## JavaScript / runtime

| # | Q | Expected concepts | Shallow answer looks like |
|---|---|---|---|
| 1 | Order of `console.log("A")`, `Promise.resolve().then(B)`, `setTimeout(C,0)`, `log("D")` — and why | microtask queue, macrotask/timer queue, call stack, drain-microtasks-before-next-tick | correct order with "because promises are faster" |
| 2 | Same snippet with `await` inside an async function between B and C | implicit continuation, microtask chaining, function return boundary | treats `await` as a thread block |
| 3 | What is a closure; give a case where it leaks memory | captured lexical environment, lifetime of scope, retained references, listener/timer retention | "function remembering variables" |
| 4 | Why can a single-threaded runtime serve 10k connections | event loop, non-blocking syscalls, libuv poller, epoll/kqueue, per-connection state ≠ thread | "because it's async" |
| 5 | What actually blocks Node | CPU-bound work on main thread, sync fs/crypto, JSON parse of large payloads, GC pause | names only "long loops" |

## Node internals

| # | Q | Expected concepts | Shallow answer |
|---|---|---|---|
| 6 | Where does `fs.readFile` execute | libuv thread pool (uv_threadpool_size=4 default), C++ layer, completion callback on loop | "in the event loop" |
| 7 | Worker threads vs child processes vs cluster | isolate memory boundaries, message serialisation cost, shared vs IPC, when CPU-bound justifies each | "workers are faster" |
| 8 | Backpressure in streams, and what ignoring it does | highWaterMark, `pause()`/`drain`, buffered memory growth, writable slow reader | names the API, not the flow-control contract |
| 9 | Graceful shutdown: SIGTERM arrives mid-request | in-flight request drain, stop accepting, server.close, timeout+force, queue ack | "call process.exit" |

## TypeScript

| # | Q | Expected concepts | Shallow answer |
|---|---|---|---|
| 10 | Why `as` is not validation | compile-time erasure, runtime shape, boundary validation, Zod | "it tells TS the type" |
| 11 | Discriminated union vs tagged literal + exhaustive `never` check | exhaustiveness, control-flow narrowing, adding variant breaks build | uses optional fields + nulls |
| 12 | Make an illegal state unrepresentable for a payment intent | sum types, branded types, invariants, transition functions | one big interface with nullable fields |

## PostgreSQL

| # | Q | Expected concepts | Shallow answer |
|---|---|---|---|
| 13 | What is MVCC and why not lock-and-modify-in-place | row versions, snapshot, xmin/xmax, read Committed vs Repeatable Read, no reader blocking writer | "multi version concurrency control" |
| 14 | Why `UPDATE` does not modify a page in place | new tuple version, WAL, page pruning, vacuum, visibility map | "because of locks" |
| 15 | Why PostgreSQL chose a sequential scan over your index | selectivity, planner cost model, random vs sequential IO, small table, statistics staleness | "index is broken" |
| 16 | Two transactions deadlock — diagnose and fix | lock ordering, `SELECT FOR UPDATE`, retry with backoff, lock timeout, key-order discipline | "add a lock" |
| 17 | `LIMIT 10 OFFSET 500000` is slow. Fix | keyset/seek pagination, index on ordering columns, covering index, deferred join | "add index on id" |

## Redis & caching

| # | Q | Expected concepts | Shallow answer |
|---|---|---|---|
| 18 | Cache stampede on a hot key expiry, three mitigations | TTL jitter, request coalescing/singleflight, logical expiry, lock-based refresh | "increase TTL" |
| 19 | Redis disappears — what breaks and what do you do | fail-open vs fail-closed, circuit breaker, DB load amplification, degradation plan | "use Redis Sentinel" |
| 20 | Distributed lock correctness | atomic SET NX PX, fencing tokens, lease/ TTL vs work duration, clock skew, Redlock criticism | "SETNX is enough" |

## HTTP / APIs

| # | Q | Expected concepts | Shallow answer |
|---|---|---|---|
| 21 | Type, duration, and blast radius of a 500 from your payment endpoint | idempotency key, retry safety, partial failure, error contract, alerting on rate not count | "return 500 with message" |
| 22 | POST is non-idempotent — how do you make charging a card retry-safe | idempotency token, store-and-replay response, unique constraint, at-least-once delivery | "check if already charged" |
| 23 | Why `Cache-Control: private, max-age=0, must-revalidate` on a session page | CDN vs browser caching, `Vary`, authorization leakage, revalidation | "no-store is the same thing" |

## Security

| # | Q | Expected concepts | Shallow answer |
|---|---|---|---|
| 24 | IDOR/BOLA in `GET /orders/:id` behind auth | object-level authorization, ownership check, tenant scoping, guessable IDs | "JWT already authenticates them" |
| 25 | Refresh token theft, and rotation catching it | token hash at rest, rotation + reuse detection, family revocation, httpOnly secure cookie | "short access token TTL" |
| 26 | Prompt injection reaching a tool with filesystem access | untrusted content boundary, tool allowlist, confirmation, least privilege, output validation | "add a system prompt saying don't" |

## Distributed systems

| # | Q | Expected concepts | Shallow answer |
|---|---|---|---|
| 27 | Service A commits, Service B is down. Three designs with trade-offs | outbox + relay, saga/compensation, dual-write avoidance, idempotent consumer, eventual consistency | "use Kafka for exactly-once" |
| 28 | Why at-least-once + idempotent consumer beats "exactly-once" claims | broker ack semantics, duplicate delivery, dedupe key, transactional producer limits | "exactly-once is a config" |

## AI engineering

| # | Q | Expected concepts | Shallow answer |
|---|---|---|---|
| 29 | RAG returns confident wrong answers — where do you instrument | retrieval eval (recall/precision), chunking, reranking, groundedness, golden set, citation check | "better embeddings" |
| 30 | Agent loops 12 times and burns tokens. Guardrails and the design question | step cap, budget, tool error feedback, plan-vs-act, deterministic workflow alternative | "retry with smaller model" |

## Reading the result

| Pattern of misses | Verdict | First repair |
|---|---|---|
| 1–9 shallow, 13–21 solid | concurrency internals are folklore | P1 async internals with output-prediction drills + blocking experiment |
| 13–17 shallow | database is a black box | P7 pages/tuples/WAL experiments before any index advice |
| 21–28 shallow | never owned a production failure path | P16/P17 with the incident simulator |
| 29–30 shallow, framework usage confident | AI work is API-calling, not engineering | P30 evaluation harness before touching agents |
| all solid | accelerate to P11–P18 + P31–P37 | jump straight to design and agent engineering |
