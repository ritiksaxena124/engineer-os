# Curriculum dependency graph

40 phases, ordered by dependency, not by hype (§5). Every topic declares *critical* prerequisites
that gate unlocking and *advisory* ones that only warn.

## Spine

```
P0 Engineering Baseline ──► P1 JS Internals ──► P2 TypeScript ──► P3 DSA
        │                        │
        └────────────────────────┴──► P4 HTTP & Web Fundamentals ──► P5 REST API Engineering
                                                          │
                                             P6 NestJS ◄──┘
                                             P7 PostgreSQL ──► P8 ORM Mastery
                                             P9 Redis & Caching (needs P7 write path)
P10 Frontend (React/Next) ── needs P1,P2
P11 Software Design ── needs P1,P2,P3
P12 Clean Architecture ── needs P11,P5,P6
P13 Design Patterns ── needs P11
P14 Testing ── needs P2,P5
P15 Concurrency ── needs P1(async),P7(transactions)
P16 Distributed Systems ── needs P15,P7,P9
P17 Queues & Event-Driven ── needs P16
P18 System Design ── needs P4,P7,P9,P15,P16,P17
P19 Linux ── needs P0
P20 Docker ── needs P19
P21 CI/CD ── needs P20,P14
P22 Cloud & Production ── needs P20,P18
P23 Observability ── needs P5,P19,P22
P24 Security ── needs P4,P5,P7
P25 Performance Engineering ── needs P1,P7,P23
P26 Git Deep Mastery ── needs P0
P27 AI Fundamentals ── needs P2
P28 LLM Application Engineering ── needs P27,P5
P29 RAG ── needs P28,P7
P30 LLM Evaluation ── needs P28,P14
P31 Agent Engineering ── needs P28,P30
P32 LangGraph ── needs P31,P3(state machines/graphs)
P33 Agent Memory & Context ── needs P31,P29
P34 MCP ── needs P28,P31
P35 AI Coding Agents ── needs P32,P33,P34,P26
P36 Agentic SDLC ── needs P35,P12,P14,P21
P37 Production AI ── needs P28,P23,P24,P25,P16
P38 Engineering Management ── needs P11,P18
P39 Engineering Judgment ── needs everything at ≥ L4; it is the capstone of judgment
```

## Track routing

| Track | Phases |
|---|---|
| A — Senior Backend | P0–P9, P11–P18, P19–P26, P37, P38–P39 |
| B — Senior Full-Stack | A + P10 |
| C — Applied / Agentic AI | A core (P0–P7, P14–P18) + P27–P37, P38–P39 |

P39 is terminal in every track: it cannot be unlocked until at least 12 topics across the
spine sit at L4+, because "best fit for the constraints" cannot be practised without material to
trade off.

## Notable gating edges (the ones that stop the classic mistakes)

| Topic | Critical prerequisite | Why the edge exists |
|---|---|---|
| MVCC & isolation | Transactions, pages/tuples | you cannot reason about snapshots without knowing what a row version is |
| Distributed locks | Redis atomics, Postgres row locks | Redlock without a lock model is cargo cult |
| Saga / outbox | Queues at-least-once, transactions | compensation only makes sense once you know retry semantics |
| LangGraph | hand-rolled state machine (P32 exercise), graph traversal (P3) | the abstraction is only appreciable against the pain it removes |
| Agents | deterministic workflow, LLM evaluation (P30) | "when NOT to use an agent" requires having measured an LLM |
| RAG | retrieval semantics, Postgres indexes | vector search is an index problem before it is an embedding problem |
| Production AI | observability (P23), security (P24) | cost, prompt-injection and outages are operations problems |

## Mastery ladder (per topic)

```
L0 Exposure → L1 Understanding → L2 Implementation → L3 Debugging
→ L4 Design → L5 Production → L6 Senior Judgment → L7 Teaching
```

Advancement requires evidence in the signal that matches the rung — an L2 promotion needs an
accepted implementation attempt, not a read lesson. `mastery_events` records every promotion so
the learner can audit how the system judged them.
