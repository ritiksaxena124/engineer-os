import type { LessonSpec } from '../types';

export const LESSON: LessonSpec = {
  slug: 'the-component-you-did-not-add',
  title: 'The Component You Did Not Add',
  topicSlug: 'sd-when-not-to-add-infrastructure',
  sections: [
    {
      kind: 'why-it-exists',
      body: 'Every component you add is an operational commitment with five parts: an upgrade path, a failure mode, a security surface, a person on call, and a dashboard nobody looks at. Design reviews evaluate what a component does; almost none evaluate what keeping it alive costs for three years. The skill this lesson names is the one that separates senior engineers from diagram collectors \u2014 deletion as a first-class design move.',
    },
    {
      kind: 'naive-solution',
      body: 'The credible-looking diagram: Redis for sessions, Kafka for events, a service mesh between services, Kubernetes as the platform, a search cluster \u201cfor flexibility\u201d \u2014 drawn before a single user has hit a p99, justified by \u201cwe will need it\u201d. It reads like experience because every box is a technology someone famous runs at enormous scale. What it costs is a quarter of the team\u2019s attention, and the cost never appears as a line you can point at; it appears as every other feature being slower.',
    },
    {
      kind: 'why-naive-fails',
      body: 'Added components multiply failure modes faster than they divide load. A cache is a new source of wrong answers \u2014 staleness, skew, a cold-start stampede. A queue is a new source of lost work \u2014 rebalances, poison messages, lag nobody watches. A mesh is a new place a request can die between two services that were each healthy. At low volume the benefit of each addition is invisible while its cost is permanent, and a six-component system has far more combinations of two things going wrong at once than a two-component system has ways of going wrong. Reliability often goes down.',
    },
    {
      kind: 'mental-model',
      body: 'The escalation ladder, climbed in order, with a named trigger at each rung: index and query shape, in-process cache, read replicas, external cache, queue and async jobs, partition the data, split the service, multiple regions. Each rung answers a different measured problem, so skipping a rung requires the number that rung actually answers \u2014 not a general sense of unease. The default move is to stay on your current rung and make it work, because everything above it costs money and attention that compound.\n\n```svg\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 340" role="img">\n<title>The eight-rung escalation ladder with trigger numbers and a marker at the rung the system stands on</title>\n<text x="90" y="24" font-size="11" fill="var(--color-muted)">The escalation ladder \u2014 climb in order, and only with the number the next rung answers</text>\n<line x1="140" y1="75" x2="140" y2="315" stroke="var(--color-line-strong)" stroke-width="2" />\n<line x1="240" y1="75" x2="240" y2="315" stroke="var(--color-line-strong)" stroke-width="2" />\n<line x1="140" y1="90" x2="240" y2="90" stroke="var(--color-line-strong)" stroke-width="1.5" />\n<text x="258" y="94" font-size="11" fill="var(--color-ink)">8 \u2014 multi-region: p50 users sit 150 ms or more from the nearest region</text>\n<line x1="140" y1="120" x2="240" y2="120" stroke="var(--color-line-strong)" stroke-width="1.5" />\n<text x="258" y="124" font-size="11" fill="var(--color-ink)">7 \u2014 split the service: two deploys contend for one table</text>\n<line x1="140" y1="150" x2="240" y2="150" stroke="var(--color-line-strong)" stroke-width="1.5" />\n<text x="258" y="154" font-size="11" fill="var(--color-ink)">6 \u2014 partition the data: single-table scans break the latency budget</text>\n<line x1="140" y1="180" x2="240" y2="180" stroke="var(--color-line-strong)" stroke-width="1.5" />\n<text x="258" y="184" font-size="11" fill="var(--color-ink)">5 \u2014 queue and workers: sustained backlog above 2x arrival rate</text>\n<line x1="140" y1="210" x2="240" y2="210" stroke="var(--color-line-strong)" stroke-width="1.5" />\n<text x="258" y="214" font-size="11" fill="var(--color-ink)">4 \u2014 external cache: in-process hit ratio has capped out</text>\n<line x1="140" y1="240" x2="240" y2="240" stroke="var(--color-line-strong)" stroke-width="1.5" />\n<text x="258" y="244" font-size="11" fill="var(--color-ink)">3 \u2014 read replica: read QPS above 3k with lag under SLO</text>\n<line x1="140" y1="270" x2="240" y2="270" stroke="var(--color-line-strong)" stroke-width="1.5" />\n<text x="258" y="274" font-size="11" fill="var(--color-ink)">2 \u2014 in-process cache: one key carries over 60% of reads</text>\n<line x1="140" y1="300" x2="240" y2="300" stroke="var(--color-line-strong)" stroke-width="1.5" />\n<text x="258" y="304" font-size="11" fill="var(--color-ink)">1 \u2014 index and query shape: any hot query above 100 ms</text>\n<polygon points="112,290 112,310 134,300" fill="var(--color-weak)" />\n<text x="258" y="322" font-size="10" fill="var(--color-weak)">the current system is actually standing on this rung</text>\n</svg>\n```',
    },
    {
      kind: 'internals',
      body: 'Each addition has a real bill behind the box in the diagram. A cache means an eviction policy you must reason about and invalidation you must do right on the write path, under concurrency. A queue means a consumer you operate and monitor for lag, a schema policy once payloads evolve, a dead-letter queue for poison messages, retries with an idempotency story. A mesh or scheduler platform means upgrades that cannot be rolled back and a blast radius from a dependency you did not build but own anyway. Two questions kill most additions on the spot: which measured number does this change, and who debugs it at 3 a.m.?',
    },
    {
      kind: 'production-implementation',
      body: 'At this repo\u2019s scale the rules are written and boring: Postgres with the right index and one read replica, a queue table with a worker process instead of a streaming platform, `pgcrypto` on the column instead of a secrets service, a cron in the deployable instead of a scheduler cluster. Each escalation names its evidence: replica lag above the SLO for a week, not an hour; sustained job backlog at twice the average arrival rate, not one slow morning; more than one process competing for the same table, not a feature area someone wants extracted. The number has to be the rung\u2019s own number.',
    },
    {
      kind: 'bad-implementation',
      body: 'The Kafka cluster bought for \u201cscalability\u201d at 200 events a minute. Within a quarter it needs a schema policy so producers and consumers cannot drift apart, a consumer-group retry design so a poison message cannot wedge it, a plan for the rebalance that lands during deploys, and runbooks costing a second team\u2019s worth of attention. The same 200 events a minute arrive in the old table the next quarter \u2014 the queue table was already fast enough, and the platform is still being paid for.',
    },
    {
      kind: 'testing',
      body: 'The ladder is provable: measure the number the missing component claims to fix, before and after the cheap rung. Query time with and without the index; replica lag under real traffic; in-process cache hit ratio and the staleness it buys. If the cheap rung closes the gap, the expensive rung has no evidence and stays out of the design. The review rule that follows from this: every component in the diagram must own one metric, named before it is added \u2014 a design where nobody can say what number a box moves is not a plan, it is a diagram.',
    },
    {
      kind: 'failure-scenarios',
      body: 'Four ways the unnecessary component fails in production. The cache makes the p99 worse on the cold path: hits are fast, but a five-minute expiry means every expiry sweep briefly re-issues the slow query for everyone at once. The queue silently drops a consumer-group rebalance\u2019s worth of work because a manual offset commit assumed the group was permanent. The mesh turns a 30 ms dependency timeout into an un-debuggable 3-second one, retried invisibly at a layer nobody owns. The six-component system has one on-call engineer, so paging stops being information and becomes theatre.',
    },
    {
      kind: 'performance',
      body: 'The counterintuitive result is that an added component makes the fast path faster and the system slower overall: a cache gives you two performance stories instead of one, and the cold one is what your users meet right after every deploy. Simplicity has a speed property too \u2014 fewer hops means fewer timeouts, fewer serialisation boundaries, and a profile you can read in one pass instead of four. Measure the whole request\u2019s p99 and pages per month, not the box you wish existed.',
    },
    {
      kind: 'security',
      body: 'Every component is attack surface with a lifecycle you do not control: a cache speaking an unauthenticated protocol inside the VPC, a broker whose access control was bolted on, a mesh sidecar that can impersonate any service to any other. The real cost of a dependency you cannot patch is measured in CVEs you track but cannot fix, upgrades that break the cluster, and a second team\u2019s runbook between you and the hotfix. One data store with one access path is not just simpler \u2014 it is auditable in an afternoon.',
    },
    {
      kind: 'trade-offs',
      body: 'Simplicity is an availability multiplier: fewer components, fewer ways to be partitioned from yourself. But the opposite failure is real \u2014 there is a Dunning-Kruger of infrastructure in which \u201cit will just be a small Kafka\u201d looks trivial precisely because you have not operated one, and there is also the engineer who stays on one box past the point where the pager is the design. The trade is not components versus none; it is which failures you can afford, at what volume, with how many humans on call.',
    },
    {
      kind: 'system-design',
      body: 'This belongs at the end of every design review as a deletion pass: point at each box and ask what number justifies it. It is also the strongest candidate answer to \u201chow would you scale this?\u201d in the middle of a design \u2014 \u201cnot yet, and here is the number that would change my mind\u201d \u2014 because the reviewer is testing whether you can price a decision, not whether you can list technologies. An architecture of two boxes with named escalation triggers beats twelve boxes and vibes.',
    },
    {
      kind: 'interview',
      body: 'The sixty-second version is the ladder, its trigger numbers, and one sentence of intent: \u201cI would not add X until Y is measured at Z.\u201d Expect the reverse question \u2014 \u201cwhat breaks first?\u201d \u2014 and answer with the component you kept, naming its failure: the single Postgres dies first, which is why the replica and the queue table are already designed and costed. The senior signal is not the restraint itself; it is that the restraint has a published number attached and an upgrade path you state before being asked.',
    },
    {
      kind: 'real-world',
      body: 'A report at 900 ms p99. A team\u2019s first instinct was three components: a cache in front of the query, a queue to precompute in the background, a small service to own both \u2014 each individually defensible, together a quarter of the on-call load. The actual fix was one covering index and a materialised view refreshed every five minutes: 40 ms p99 on the same data and the same traffic. The cache, the queue and the service were deleted two weeks later, and three of the quarter\u2019s four incidents were deleted with them \u2014 all of them had been side effects of components answering no measured number.',
    },
    {
      kind: 'mini-project',
      body: 'List every component in a system you own \u2014 process, database, cache, queue, cron, third-party service. For each, write the measured number it exists to fix and the date that number was last checked. Delete one that has no number, or state the measurement that would justify keeping it. Then run one real change on this repo the other way: fix the hottest query with an index instead of adding a cache, and report p99 and on-call pages for the month before and the month after.\n[[source: When not to add infrastructure \u00b7 fanout.sh | https://fanout.sh/system/archive/when-not-to-add-infrastructure]]',
    },
  ],
};
