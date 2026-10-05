import type { LessonSpec } from '../types';

export const LESSON: LessonSpec = {
  slug: 'the-repository-that-pays',
  title: 'The Repository Pattern and Where It Stops Paying',
  topicSlug: 'sd-repository-pattern',
  sections: [
    {
      kind: 'why-it-exists',
      body: 'A repository exists because a domain should not know how its facts are stored. Booking, billing, catalog: each has a moment where the same requirement is satisfiable by Postgres today and by something else after the next acquisition or the next shard. The pattern gives that moment a single place to happen. It pays twice \u2014 once when the storage decision could actually change, and once when a use case must load and save an aggregate as one unit under one concurrency rule. If neither is true you are not buying insurance, you are paying a premium on nothing.',
    },
    {
      kind: 'naive-solution',
      body: 'The reasonable first cut is a generic `Repository<T>` generated per table with `find`, `save` and `delete`, injected everywhere so every service talks to the same tidy shape. Its opposite is equally common: the ORM client imported into every service and every route, so a query is one `prisma.hold.findMany` away from any handler. Both look clean in a diagram, and both answer the wrong question.',
    },
    {
      kind: 'why-naive-fails',
      body: 'The generic version re-exposes the database in domain clothing: `find(where: any)` returns storage-shaped rows that callers then reshape, so the leakage you meant to prevent simply moves one layer up and the tests get harder. An interface with exactly one implementation and no expected variation is indirection with a test-cost and no substitution. Meanwhile the everywhere-ORM version makes every query a possible product decision and leaves no seam to test the use case at all. Neither hides the questions that matter \u2014 which aggregate loads, under which lock, in which transaction.',
    },
    {
      kind: 'mental-model',
      body: 'Separate the three concerns people blur into one word. One: the port, the use case\u2019s need stated in domain language \u2014 load the hold with its seat lock. Two: the adapter, how Postgres actually answers that need. Three: the unit of work, which transaction the write joins. The repository is (1) plus (2); the transaction is (3), and by default it belongs to neither. The mistake is letting the repository method decide where the boundary sits.\n```svg\n<svg viewBox="0 0 720 320" role="img">\n<title>Repository layering: use-case port, transaction boundary, Prisma adapter</title>\n<defs><marker id="rep-stop" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto"><path d="M2 2 L10 10 M10 2 L2 10" stroke="var(--color-due)" stroke-width="2"/></marker></defs>\n<rect x="40" y="30" width="640" height="64" rx="8" fill="var(--color-raised)" stroke="var(--color-line-strong)"/>\n<text x="56" y="56" fill="var(--color-ink)" font-size="14">Use case \u2014 the port (domain need)</text>\n<text x="56" y="80" fill="var(--color-muted)" font-size="12">findActiveHold()  \u00b7  reserveSeat()  \u2014 one method per need</text>\n<line x1="20" y1="150" x2="700" y2="150" stroke="var(--color-accent)" stroke-width="2" stroke-dasharray="7 5"/>\n<text x="24" y="143" fill="var(--color-accent)" font-size="12">transaction boundary (unit of work)</text>\n<rect x="40" y="180" width="640" height="84" rx="8" fill="var(--color-surface)" stroke="var(--color-line-strong)"/>\n<text x="56" y="208" fill="var(--color-ink)" font-size="14">Adapter \u2014 Prisma + Postgres</text>\n<text x="56" y="230" fill="var(--color-muted)" font-size="12">one SELECT per aggregate root with its children</text>\n<text x="56" y="250" fill="var(--color-muted)" font-size="12">rows mapped to domain objects on the way out</text>\n<line x1="470" y1="176" x2="470" y2="100" stroke="var(--color-due)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#rep-stop)"/>\n<text x="482" y="140" fill="var(--color-due)" font-size="12">the ORM must not cross up</text>\n<text x="40" y="300" fill="var(--color-dim)" font-size="11">Aggregate load prevents the N+1: 1 query, not 200 lazy SELECTs.</text>\n</svg>\n```',
    },
    {
      kind: 'internals',
      body: 'Five decisions have to be written down, not improvised. Aggregate loading: one query per root with its children, or lazy loads that become an N+1 and turn 200 rows into 200 statements. Concurrency: an optimistic version column or `SELECT FOR UPDATE`, chosen deliberately per aggregate. Transaction placement: it starts in the use case, never inside a repository method. Mapping cost between rows and domain objects, paid on every read. And a hard limit: a `save()` that knows only one table cannot express an invariant that spans two.',
    },
    {
      kind: 'production-implementation',
      body: 'The shape that pays, in this repo\u2019s idiom: a NestJS provider with a small port interface and a Prisma adapter behind it, methods named after use-case needs (`findActiveHold`, `reserveSeat`) rather than after tables, and the transaction handed in from the caller so the use case owns the boundary via `prisma.$transaction`. Domain tests substitute a fake; one integration test runs the real adapter against Postgres and proves the locking. EngineerOS itself reads this way \u2014 Prisma models at the edge, code that talks to a port inside. The rule stays blunt: put a repository only where a real substitution or a real aggregate boundary exists.',
    },
    {
      kind: 'bad-implementation',
      body: 'Three shapes that pass review and cause incidents. `update(id, partial)` that overwrites whatever column the caller happened to pass \u2014 the lost-update bug wearing a clean signature. A repository that returns the ORM entity, so every service now imports Prisma types anyway and the seam was decorative. A `save()` that issues a whole-row UPDATE and silently clobbers a concurrent writer\u2019s column. Each is the generic repository\u2019s sin in a different costume: the storage shape leaks, and the concurrency story is never told.',
    },
    {
      kind: 'testing',
      body: 'Assert three separate things. The domain test runs with a fake and no database at all. The adapter test proves the concurrency contract: two writers hit `reserveSeat` on the same row and exactly one wins while the other gets a version conflict or blocks. No repository method commits on its own. The falsifiable check is mechanical \u2014 delete the ORM import from the domain layer and watch whether the use-case tests still compile. If they do not, your abstraction has been leaking the whole time.',
    },
    {
      kind: 'failure-scenarios',
      body: 'The N+1 that looked fine at twenty rows per page and cost four seconds at two thousand, because two thousand extra round trips at two milliseconds each is arithmetic nobody ran. The database-agnostic repository that leaked Postgres SQL through a `queryRaw` anyway, so the promised swappability was fiction and the migration got harder to see, not easier. Two aggregates saved through two repositories inside one assumed-atomic call, where the first commit lands and the second fails and the invariant is now true only half the time.',
    },
    {
      kind: 'performance',
      body: 'A repository buys expressiveness and charges for it in mapping: every read turns rows into domain objects, and a hot list path can spend more CPU constructing aggregates than the database spent finding them. That is the honest reason a read-model query returning rows directly is often correct and should not be forced behind a repository. Know the price before you insist the abstraction is always the right shape for a read that nobody ever mutates.',
    },
    {
      kind: 'security',
      body: 'The repository is a good place to force tenancy and authorization into every query. Because the port is one method per need, the adapter can append the `tenant_id` predicate and the role check in exactly one spot instead of trusting each caller to remember it. The failure mode is the inverse: a `find(where: any)` that lets a caller build a predicate the service never intended and reach a row belonging to someone else. Narrow the port and you narrow the attack surface.',
    },
    {
      kind: 'trade-offs',
      body: 'A generic repository and a direct ORM are both answers to the same question: how much does the storage decision actually vary. When it never varies and there is no aggregate, the ORM in the service is cheaper and more honest. A team of three rarely earns a full hexagonal repository layer; a team of thirty needs the seams to stop stepping on each other. And when the database is the domain \u2014 reporting, set-based updates, bulk reconciliation \u2014 a repository per table is actively harmful, because it hides the one operation that should be visible.',
    },
    {
      kind: 'system-design',
      body: 'In a larger system the repository is the port in hexagonal architecture and the seam that keeps a modular monolith modular. It is also why a service can be extracted with its own data instead of quietly reusing another service\u2019s tables: the boundary the port describes becomes the network boundary later. Cross that seam by reaching into a neighbour\u2019s schema and you have not avoided the coupling, you have only moved it out of the diagram where no one reviews it.',
    },
    {
      kind: 'interview',
      body: 'Sixty-second version: a repository is a domain-shaped collection over storage that hides how facts are persisted; it pays when storage could change or when an aggregate loads and saves as one unit, and it is pure indirection when neither is true. Then the question that separates seniors: who owns the transaction? The use case, not the repository. Expect "one interface, one implementation \u2014 worth it?" A fake in tests is a real second implementation and I count it, but I would not add the layer for the fake alone; the aggregate boundary and the transaction placement are what justify it.',
    },
    {
      kind: 'real-world',
      body: 'A billing service where every route imported Prisma directly. A column rename ("status" to "lifecycle_state") broke nine endpoints and two scheduled reports, because eleven files each held an opinion about one table shape. The fix was small: one port per aggregate, a Prisma adapter behind each, and fourteen adapter tests pinning the queries. The next storage change \u2014 moving an aggregate to its own schema \u2014 became a two-day task touching one adapter and its tests, instead of the quarter-long hunt the first change had been.',
    },
    {
      kind: 'mini-project',
      body: 'Pick one use case already in EngineerOS \u2014 promoting a topic rung, or scheduling an interview room. Write its port as a small interface with methods named after the need, its Prisma adapter, and a fake. Prove the domain test runs with no database. Then write one adapter test that fires two concurrent writers at the same aggregate and shows it catching a lost update \u2014 a version column or `SELECT FOR UPDATE` will do it. Finish by deleting the Prisma import from the domain layer and confirming the use-case tests still compile.\n[[source: Repository pattern \u00b7 fanout.sh | https://fanout.sh/system/archive/repository-pattern]]',
    },
  ],
};
