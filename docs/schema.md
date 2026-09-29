# Database schema

PostgreSQL via Prisma. Twenty core tables (§74). Design rules, applied consistently:

| Rule | Reason |
|---|---|
| No Prisma/Postgres enums for business constants | adding a question category should be a row insert, not a migration |
| Lookup tables for categories, levels, signals | the learner-facing taxonomy is content, not code |
| `isActive` soft delete on mutable business rows | deactivation, never removal |
| No `onDelete: Cascade` | a deleted topic must not silently erase attempt history |
| Append-only rows (`attempts`, `mastery_events`, `learning_sessions`, journal, incidents) carry no `isActive` | they are ledgers; a deleted mistake is a lost lesson |
| Identity keys (`email`, `slug`, `tokenHash`) unique globally; business keys scoped to active rows | a retired row must not block a re-created one |

Prisma cannot declare a partial unique index, and a hand-written one gets dropped by the next
`migrate diff`. Scoped uniqueness is therefore expressed with a nullable `activeMarker` column:
`(phaseKey, number, activeMarker)` is unique, `activeMarker` is `1` while active and set to `null`
by the repository on deactivation, and Postgres treats NULLs as distinct — so any number of
retired topics may share a number while active ones cannot.

## Core tables

```
users                     one row per learner; email unique; passwordHash never leaves the API
tracks                    A Senior Backend · B Senior Full-Stack · C Applied/Agentic AI
phases                    the 40 ordered phases of the curriculum
topics                    the unit of mastery; belongs to a phase and a track
topic_prerequisites       (topicId, prerequisiteTopicId, critical) — the knowledge graph (§42)
lessons                   §43 content: why → internals → production → failure → trade-offs
concepts                  atomic idea inside a topic; what a question actually targets
question_categories       conceptual · why · internal · implementation · debugging ·
                          output-prediction · architecture · trade-off · security ·
                          performance · production · interview · senior-judgment
questions                 one question, one category, difficulty 1–7, stem + prompt
question_answers          answer model: expected concepts, ideal/short/deep answer,
                          common wrong answers, why wrong, follow-ups, practical exercise
question_expected_concepts joins a question to the concepts a correct answer must name
mastery_levels            L0 Exposure … L7 Teaching, as rows with required signals
mastery_records           current standing per (user, topic): level + each signal
mastery_events            append-only: every signal that moved the needle
attempts                  append-only: every answer, exercise run, exam part, teach-back
exercises                 implementation/debug challenges with starter code + test spec
projects                  monthly + flagship build projects (§56–57) with requirements
learning_sessions         append-only: one study session, type from session_types
session_types             Learn Practice Debug Build Interview SystemDesign Incident
                          CodeReview TeachBack Revision Exam
review_schedules          spaced repetition: next review at 1/3/7/14/30 days
mistakes                  append-only: what broke, diagnosis, root cause, lesson
journal_entries           engineering journal (§58)
architecture_decisions    ADR: context, decision, alternatives, trade-offs, consequences
incidents                 production incident scenarios: alerts, metrics, logs, resolution
incident_steps            the 8-question incident protocol (§50)
resources                 doc/book/source links per topic, checkedAt for validity (§60)
interview_sessions        interviewer mode: role, category, transcript turns, feedback
diagnostic_questions      the ~30-question baseline assessment (§99E)
```

## The gating shape that matters

```sql
topics ──< topic_prerequisites >── topics
                    │
                 critical: true  → unlock requires prerequisite topic at ≥ L3 (Can Debug)
```

A topic unlocks only when every *critical* prerequisite has reached the level the curriculum
requires. `critical: false` prerequisites warn but do not block, because a hard gate on every
edge makes the graph unusable and teaches the learner that graphs are bureaucracy.

## Why attempts and mastery are separate tables

`attempts` is raw evidence: what the learner said, when, scored against which expected concepts.
`mastery_records` is a *derived* view rebuilt from evidence. Keeping them separate means the
mastery algorithm (§71) can change without rewriting history — which is the same reason an
event-sourced ledger beats a mutable `score` column for anything you will later have to defend.
