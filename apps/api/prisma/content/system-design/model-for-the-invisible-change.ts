import type { LessonSpec } from '../types';

export const LESSON: LessonSpec = {
  slug: 'model-for-the-invisible-change',
  title: 'Extensible Data Modeling and the Change You Cannot See',
  topicSlug: 'sd-extensible-data-modeling',
  sections: [
    {
      kind: 'why-it-exists',
      body: 'You are not modelling the product someone described to you; you are modelling every change that product will ask for over the next three years. The requirements you were handed are a snapshot, and storage outlives snapshots. The reason extensibility is a first-class concern is asymmetry: adding a well-placed column or table costs an afternoon, while re-laying keys or splitting a JSON blob after forty million rows costs a quarter and a maintenance window. So you model entities, relationships and invariants first, and leave deliberate seams where the next change will land.',
    },
    {
      kind: 'naive-solution',
      body: 'Two defaults. The `metadata JSONB` column that swallows every unknown requirement \u2014 need a field, stuff it in. The enum that grows one value per customer, so the type column quietly becomes a per-tenant list of magic strings. Both let you ship today without a migration, and both feel responsible because the data is still there, still typed, still queryable.',
    },
    {
      kind: 'why-naive-fails',
      body: 'Unstructured JSON has no constraint, no index by default and no owner, so every invariant about it moves into application code, where the batch job, the report and the ad-hoc script can each violate it without a failing write. The enum is an invisible API contract: every consumer must handle the new value before you deploy it, and most discover they cannot two deploys later. The artifact that proves the model was never really a model is the report nobody can write without a pivot nobody understands.',
    },
    {
      kind: 'mental-model',
      body: 'Hold two things together. The change ladder, cheapest to costliest: add a column, add a nullable column with a backfill, add a join table, add a table with its own invariants, add a store. You climb it only when the rung below is genuinely full, never one rung ahead of need. Behind the ladder sits the deployment rhythm that keeps every step reversible \u2014 expand, migrate, contract. Name the two shapes a column will ever have, the old one and the new one, and hold the seam where the change lands.',
    },
    {
      kind: 'internals',
      body: 'The mechanisms that make extension survivable all have a lock story. A nullable column with a constant default is not the same as a backfill: on a 200M-row table a locked rewrite is a downtime event, not a DDL detail. Postgres 11 and later adds a column with a constant default without rewriting the table, but changing that column\u2019s type does rewrite and holds the lock while it does. A polymorphic association \u2014 `owner_type` plus `owner_id` with no real foreign key, since a foreign key must name one table \u2014 is integrity by hope. And the tenancy key must exist from day one, because adding `tenant_id` to every table under load is a project, not a migration.',
    },
    {
      kind: 'production-implementation',
      body: 'A worked expand-migrate-contract on one real change: splitting `full_name` into `given_name` and `family_name`. Add both columns nullable. Dual-write them on every mutation while `full_name` stays authoritative. Backfill the existing rows in batches with a sleep between so you never hold the table. Read from the new columns with a fallback to the old. Cut reads over once the fallback is empty. Then, in a later release, drop `full_name` once nothing references it. Every step is deployable and reversible on its own, and each step names its own constraint.\n```svg\n<svg viewBox="0 0 720 260" role="img">\n<title>Expand, migrate, verify, contract timeline with the irreversible step marked</title>\n<defs><marker id="ext-arrow" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="var(--color-dim)"/></marker></defs>\n<rect x="16" y="44" width="148" height="150" rx="8" fill="var(--color-surface)" stroke="var(--color-accent)" stroke-width="2"/>\n<text x="30" y="70" fill="var(--color-accent)" font-size="13">1 EXPAND</text>\n<text x="30" y="100" fill="var(--color-muted)" font-size="11">add given_name,</text>\n<text x="30" y="120" fill="var(--color-muted)" font-size="11">family_name</text>\n<text x="30" y="140" fill="var(--color-muted)" font-size="11">both nullable</text>\n<rect x="196" y="44" width="148" height="150" rx="8" fill="var(--color-surface)" stroke="var(--color-held)" stroke-width="2"/>\n<text x="210" y="70" fill="var(--color-held)" font-size="13">2 MIGRATE</text>\n<text x="210" y="100" fill="var(--color-muted)" font-size="11">dual-write both</text>\n<text x="210" y="120" fill="var(--color-muted)" font-size="11">batched backfill</text>\n<text x="210" y="140" fill="var(--color-muted)" font-size="11">+ a sleep</text>\n<rect x="376" y="44" width="148" height="150" rx="8" fill="var(--color-surface)" stroke="var(--color-held)" stroke-width="2"/>\n<text x="390" y="70" fill="var(--color-held)" font-size="13">3 VERIFY</text>\n<text x="390" y="100" fill="var(--color-muted)" font-size="11">reads use new</text>\n<text x="390" y="120" fill="var(--color-muted)" font-size="11">fallback to old</text>\n<text x="390" y="140" fill="var(--color-muted)" font-size="11">fallback empty</text>\n<rect x="556" y="44" width="148" height="150" rx="8" fill="var(--color-weak)" stroke="var(--color-due)" stroke-width="2"/>\n<text x="570" y="70" fill="var(--color-due)" font-size="13">4 CONTRACT</text>\n<text x="570" y="100" fill="var(--color-muted)" font-size="11">reads cut over</text>\n<text x="570" y="120" fill="var(--color-muted)" font-size="11">DROP full_name</text>\n<text x="570" y="150" fill="var(--color-due)" font-size="12">IRREVERSIBLE</text>\n<line x1="166" y1="119" x2="194" y2="119" stroke="var(--color-dim)" stroke-width="2" marker-end="url(#ext-arrow)"/>\n<line x1="346" y1="119" x2="374" y2="119" stroke="var(--color-dim)" stroke-width="2" marker-end="url(#ext-arrow)"/>\n<line x1="526" y1="119" x2="554" y2="119" stroke="var(--color-dim)" stroke-width="2" marker-end="url(#ext-arrow)"/>\n<text x="16" y="230" fill="var(--color-ink)" font-size="11">Every step deploys and reverses on its own \u2014 except CONTRACT: once the column is dropped, the data is gone.</text>\n</svg>\n```',
    },
    {
      kind: 'bad-implementation',
      body: 'Three anti-patterns. EAV for everything \u2014 "flexible attributes" in rows \u2014 so one product listing needs nine self-joins and a pivot just to render a price. A JSON column queried with `->>` in the hot path while the functional index you needed was never created, so every read is a sequential scan. Or the single migration that adds a `NOT NULL` column to a busy table in one statement: Postgres takes ACCESS EXCLUSIVE for the rewrite and holds it long enough to queue every reader behind it.',
    },
    {
      kind: 'testing',
      body: 'What to assert is that the database says no. Write the row that should violate the invariant and watch the insert fail \u2014 if the check lives only in a controller, a batch job will eventually bypass it. Test the migration on a copy of production data and confirm it rolls back, not just applies. And pin the reads: assert the app never depends on a column a later release plans to drop, because that dependency is exactly what turns CONTRACT from reversible to irreversible.',
    },
    {
      kind: 'failure-scenarios',
      body: 'The soft-delete that broke a unique index \u2014 the deleted row still owns the email, so "active" uniqueness silently fails until a second signup collides; EngineerOS sidesteps this with an `activeMarker` set to null on deactivation. The tenant key added late, now a cross-tenant read waiting to happen. The enum value a consumer crashed on two deploys after it shipped. The archive job that deleted rows a long-lived report was still reading, because nothing recorded who depended on the table.',
    },
    {
      kind: 'performance',
      body: 'Normalisation buys integrity and charges for it on reads: the form that stops a double-booked seat also means the listing query touches four tables. JSON buys flexibility and charges for the constraints you gave up and the index you now must hand-build. The real question is which side of that trade your access pattern sits on \u2014 mostly writes over aggregates, or mostly reads over wide joined projections \u2014 because a model tuned for the wrong one spends your budget forever.',
    },
    {
      kind: 'security',
      body: 'A model is an access-control surface. Multi-tenancy in a shared schema leans on a `tenant_id` predicate in every query, and one forgotten predicate leaks another tenant\u2019s row; Postgres row-level security moves that guarantee into the database so the code can forget it less dangerously. A schema per tenant trades that leak risk against an N-times migration surface. And an unbounded JSON column becomes injection-shaped once its contents get concatenated into a raw query or a report template.',
    },
    {
      kind: 'trade-offs',
      body: 'Shared-schema tenancy is cheapest to run and easiest to leak; schema-per-tenant isolates hardest and multiplies your migrations by customers. Fully normalised models are boring to extend and wonderful to query; JSON columns extend instantly and constrain nothing. The ladder and the expand-migrate-contract loop exist to make these choices cheap to reverse: pick the lowest rung that is honestly full, and take each step so you can undo it until the moment you deliberately cannot.',
    },
    {
      kind: 'system-design',
      body: 'The data model is the part of a design you cannot quietly refactor later. Storage topology follows it: the key you choose today becomes the partition key you are stuck with when the table shards, and the tenancy column you skipped becomes the cross-region rewrite. Services are drawn along aggregate boundaries, so a model without real boundaries produces services without real boundaries and every team edits every table. Model the seams here and the later extractions are moves; skip them and the later extractions are rewrites.',
    },
    {
      kind: 'interview',
      body: 'Sixty-second version: name the entities, the relationships and the invariants, say which change you actually expect, and show the ladder rung plus the expand-migrate-contract plan you would deploy it with, without downtime. The follow-up to expect: "how do you add a NOT NULL column to a 200M-row table?" The answer is the ladder \u2014 add it nullable, backfill in batches, then set the constraint once the column is clean, never one statement that rewrites the table under a lock.',
    },
    {
      kind: 'real-world',
      body: 'A SaaS put every customer-specific field in one JSONB blob. Two years later an invoice dispute needed a query across 41 million rows with no index, so the report ran six minutes and ops could not answer it on a live call. The fix was three real tables \u2014 terms, discounts, adjustment lines \u2014 with foreign keys and a check constraint, plus a backfill that ran about nine hours in production in batches with a sleep. The blob did not cause the incident; owning an invariant in code where no one could enforce it did.',
    },
    {
      kind: 'mini-project',
      body: 'Take one EngineerOS table \u2014 `topics`, `questions` or `interview_rooms`. List the invariants the database already enforces, the ones only code enforces such as an append-only ledger or a soft-delete rule, and decide which belong in the schema. Then write a full expand-migrate-contract plan for one change you would actually like: adding a column, or moving a status into a state table. Name every step, its constraint, and whether it rolls back. Finish by identifying the single step that is not reversible and what would make it so.\n[[source: Extensible data modeling \u00b7 fanout.sh | https://fanout.sh/system/archive/extensible-data-modeling]]',
    },
  ],
};
