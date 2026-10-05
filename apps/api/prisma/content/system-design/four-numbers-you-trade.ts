import type { LessonSpec } from '../types';

export const LESSON: LessonSpec = {
  slug: 'four-numbers-you-trade',
  title: 'Four Numbers You Trade',
  topicSlug: 'sd-availability-durability-consistency-cost',
  sections: [
    {
      kind: 'why-it-exists',
      body: 'Every store you run owes you four numbers: availability, durability, consistency and cost. Each one is produced by a mechanism \u2014 replica placement and failover produce availability; replication mode and backups produce durability; the read and write protocol produces consistency; all three together produce the bill. People collapse them constantly, because in marketing copy they look like a single adjective about reliability. A design that confuses the axes cannot price any of them, and cannot prove any of them either.',
    },
    {
      kind: 'naive-solution',
      body: 'The sentence that ships in half of all infrastructure reviews: "we have three replicas and a nightly backup, so the database is highly available and durable." It sounds complete, because the replica count and the backup schedule are real facts. But it never says whether replication is synchronous, what a reader sees on a replica, how long failover takes, or what any of it costs. Four numbers are hiding behind two adjectives.',
    },
    {
      kind: 'why-naive-fails',
      body: 'Async replication loses acknowledged writes when the primary fails over: acknowledged is not the same as durable, and RPO is the honest word for the gap. A cached read is available and stale. A deleted-but-backed-up database is durable and unavailable. A quorum of 2 of 3 gives you accepted writes with no guarantee that a reader will see them. Each sentence is a different dial sitting in a different place, all described with the same word.',
    },
    {
      kind: 'mental-model',
      body: 'Hold this picture: four separate dials, each turned by a named mechanism, with cost understood as the price of the other three set to a given position. The skill being trained is refusing to move one dial by accident while reaching for another. Every reliability claim you make should map to a mark on one of these four lines, plus the machinery that put it there.\n```svg\n<svg viewBox="0 0 720 300" role="img" aria-label="each of the four numbers sits at a position produced by a named mechanism">\n  <title>The four dials and where one Postgres design actually sits</title>\n  <text x="360" y="30" fill="var(--color-dim)" font-size="12" text-anchor="middle">where the catalogue design sits</text>\n  <text x="28" y="88" fill="var(--color-ink)" font-size="12">availability</text>\n  <line x1="170" y1="84" x2="620" y2="84" stroke="var(--color-line)" stroke-width="2" />\n  <line x1="210" y1="78" x2="210" y2="90" stroke="var(--color-line-strong)" />\n  <text x="210" y="70" fill="var(--color-dim)" font-size="11" text-anchor="middle">99.9%, 8.8 h/yr</text>\n  <line x1="390" y1="78" x2="390" y2="90" stroke="var(--color-line-strong)" />\n  <text x="390" y="70" fill="var(--color-dim)" font-size="11" text-anchor="middle">99.95%, 4.4 h/yr</text>\n  <line x1="570" y1="78" x2="570" y2="90" stroke="var(--color-line-strong)" />\n  <text x="570" y="70" fill="var(--color-dim)" font-size="11" text-anchor="middle">99.99%, 53 min/yr</text>\n  <circle cx="570" cy="84" r="7" fill="var(--color-accent)" />\n  <text x="170" y="106" fill="var(--color-muted)" font-size="11">mechanism: multi-AZ replicas + 30 s automated failover</text>\n  <text x="28" y="148" fill="var(--color-ink)" font-size="12">durability</text>\n  <line x1="170" y1="144" x2="620" y2="144" stroke="var(--color-line)" stroke-width="2" />\n  <line x1="210" y1="138" x2="210" y2="150" stroke="var(--color-line-strong)" />\n  <text x="210" y="130" fill="var(--color-dim)" font-size="11" text-anchor="middle">RPO 24 h</text>\n  <line x1="390" y1="138" x2="390" y2="150" stroke="var(--color-line-strong)" />\n  <text x="390" y="130" fill="var(--color-dim)" font-size="11" text-anchor="middle">RPO 5 min</text>\n  <line x1="570" y1="138" x2="570" y2="150" stroke="var(--color-line-strong)" />\n  <text x="570" y="130" fill="var(--color-dim)" font-size="11" text-anchor="middle">RPO 0</text>\n  <circle cx="390" cy="144" r="7" fill="var(--color-accent)" />\n  <text x="170" y="166" fill="var(--color-muted)" font-size="11">pgBackRest WAL archive every 5 min, RPO 0 in-zone</text>\n  <text x="28" y="208" fill="var(--color-ink)" font-size="12">consistency</text>\n  <line x1="170" y1="204" x2="620" y2="204" stroke="var(--color-line)" stroke-width="2" />\n  <line x1="210" y1="198" x2="210" y2="210" stroke="var(--color-line-strong)" />\n  <text x="210" y="190" fill="var(--color-dim)" font-size="11" text-anchor="middle">eventual</text>\n  <line x1="390" y1="198" x2="390" y2="210" stroke="var(--color-line-strong)" />\n  <text x="390" y="190" fill="var(--color-dim)" font-size="11" text-anchor="middle">read-your-writes</text>\n  <line x1="570" y1="198" x2="570" y2="210" stroke="var(--color-line-strong)" />\n  <text x="570" y="190" fill="var(--color-dim)" font-size="11" text-anchor="middle">linearizable</text>\n  <circle cx="390" cy="204" r="7" fill="var(--color-held)" />\n  <text x="170" y="226" fill="var(--color-muted)" font-size="11">primary reads fresh, replica reads up to 40 ms stale</text>\n  <text x="28" y="268" fill="var(--color-ink)" font-size="12">cost</text>\n  <line x1="170" y1="264" x2="620" y2="264" stroke="var(--color-line)" stroke-width="2" />\n  <line x1="210" y1="258" x2="210" y2="270" stroke="var(--color-line-strong)" />\n  <text x="210" y="250" fill="var(--color-dim)" font-size="11" text-anchor="middle">$</text>\n  <line x1="390" y1="258" x2="390" y2="270" stroke="var(--color-line-strong)" />\n  <text x="390" y="250" fill="var(--color-dim)" font-size="11" text-anchor="middle">$$</text>\n  <line x1="570" y1="258" x2="570" y2="270" stroke="var(--color-line-strong)" />\n  <text x="570" y="250" fill="var(--color-dim)" font-size="11" text-anchor="middle">$$$</text>\n  <circle cx="450" cy="264" r="7" fill="var(--color-due)" />\n  <text x="170" y="286" fill="var(--color-muted)" font-size="11">primary + two standbys: 3x storage, three instances billed</text>\n</svg>\n```\nNotice that no dial moved because of a wish: each mark is a placement, a replication mode, a protocol and a bill.',
    },
    {
      kind: 'internals',
      body: 'Quorum arithmetic does the work: with N copies, a read of R nodes and a write of W nodes must intersect when R + W > N, so every read touches a node holding the newest write. N=3, R=2, W=2 buys read-your-writes inside a region, and you pay for three copies of everything to be allowed to lose one. Synchronous replication waits for the standby to flush before acknowledging: the commit pays the standby\u2019s distance. Asynchronous acknowledges early, so its RPO is a measured lag rather than zero. A fencing token \u2014 a monotonic epoch the old primary cannot answer with \u2014 stops two nodes accepting writes at once, and PITR covers what failover never does: the committed mistake.',
    },
    {
      kind: 'production-implementation',
      body: 'A concrete stack: Postgres, one primary, two synchronous in-zone standbys with `synchronous_commit` at remote_apply, one asynchronous cross-region replica, and pgBackRest archiving WAL every 5 minutes. Its availability: automated failover in about 30 s, and twelve failovers a year is 6 minutes out of 525,600, comfortably inside the 99.99% budget of 52.6 minutes. Its durability: RPO 0 for a zone loss because the sync standbys flushed before the ack, 2 s of WAL behind on the async cross-region copy, and a worst case of 5 min for a full-region PITR \u2014 seconds of WAL, not zero. Its consistency: linearizable reads on the primary, with replicas up to 40 ms behind. Its cost: three instances and three copies of storage, plus 0.6 ms added to every commit.',
    },
    {
      kind: 'bad-implementation',
      body: '"Multi-region for high availability": two regions, asynchronous replication between them, one logical database, and the local primary accepting writes in both. When region A fails over while region B never stopped answering, both say yes to the same INSERT, and you have split-brain with two accepted order numbers and no merge story for the customers who now hold both. Or the nightly-only backup: restorable, even tested, quietly setting RPO at 24 hours in a contract that promises nothing at all about it.',
    },
    {
      kind: 'testing',
      body: 'Prove each dial separately, because each comes from different machinery. Kill the primary mid-transaction and count how many acknowledged writes vanished \u2014 that count is your real RPO. Read immediately after a write from a replica and see what you actually get. Restore the latest backup into an empty cluster and time it: an untested backup is a rumour about durability, and the rumour is worth exactly nothing at 3am. Force a failover and watch the fencing token reject the old primary\u2019s writes. Report the measured number, because the advertised one is marketing.',
    },
    {
      kind: 'failure-scenarios',
      body: 'The failover that lost 40 minutes of writes because the async replica had been lagging since a schema change nobody monitored, and the RPO had never been tested. The leader lease that expired during a 3 s pause while the old primary kept accepting writes \u2014 two versions of one row and no tooling to pick a winner. The backup that restored perfectly into an empty database because the dump ran before the migration. The cache that served 200 OK for ten minutes while the origin was down: availability bought with correctness, and spent without anyone noticing.',
    },
    {
      kind: 'performance',
      body: 'The sharpest latency lever is synchronous replication: `synchronous_commit` on a same-region standby costs about 0.5 ms per commit, while a cross-region standby adds the full RTT \u2014 about 60 ms between Dublin and Virginia \u2014 to every single write. A quorum of W=2 of N=3 touches two nodes per write and R=2 reads touch two per read, so the write throughput of the cluster is about 1.5x its useful output: N/W = 3/2. And every dial has a cost curve: going from 99.9% to 99.99% cuts the downtime budget by a factor of ten \u2014 8.76 h a year to 52.6 min \u2014 which is a new mechanism, not a new config flag.',
    },
    {
      kind: 'security',
      body: 'Every mechanism carries a security cost that belongs in the same row as its number. Backups are a full copy of the dataset in another bucket, usually with a weaker access policy than the database itself, and PITR keeps that copy live enough to query. Cross-region replication is data residency: the durability dial just moved customer rows across a jurisdiction boundary. Failover tooling holds root on every node, so the runbook automation is now a privileged attack path. And a replica serving a stale ACL read after a revocation is a consistency dial with a security consequence.',
    },
    {
      kind: 'trade-offs',
      body: 'The trade with no universal right answer is staleness, so price it per operation instead of per system. The activity feed may be 30 s stale and nobody loses money, while the balance at checkout may not be stale at all, so that read goes to the leader even when the client is across an ocean. Single-leader replication buys consistency and simple failover reasoning and costs a leader bottleneck; a quorum store buys availability under partition and pays in write latency; active-active buys locality and pays in conflict resolution, which is the consistency dial turned down and renamed.',
    },
    {
      kind: 'system-design',
      body: 'These four numbers are how a requirement becomes a topology. RPO 0 for money means synchronous replicas in at least two zones plus a tested restore; read-your-writes for a session means fresh reads pinned to the leader; 99.99% means multi-AZ with automated failover inside the downtime budget. Note what the numbers do not require: a single region with sync standbys is cheaper than active-active and much easier to be correct about, because the availability dial can often be paid for with failover speed rather than with extra regions.',
    },
    {
      kind: 'interview',
      body: 'The sixty-second version: define each number and name its mechanism \u2014 availability from replica placement and failover time; durability from replication mode plus backups, stated as RPO; consistency from the read and write protocol, quorum if you like; cost as the sum of the other three. Then, unprompted, name one place you deliberately trade consistency for availability: the feed may be 30 s stale off replicas, while the payment balance always reads from the leader. Finish with how you would prove one number: restore the backup into an empty cluster and time it.',
    },
    {
      kind: 'real-world',
      body: 'A booking service acknowledged holds as durable while its async replica lagged, because three replicas felt like three copies of the truth. A region failover lost 11 minutes of holds: rooms sold twice, with arrivals and no reservation behind them. The fix had two parts \u2014 a synchronous in-zone standby, which took RPO for a zone loss from 11 minutes to 0, and a per-hold idempotency key, which made duplicate submissions mergeable instead of catastrophic. The price was 9 ms added to write p99, and one honest edit to the contract: durable became acknowledged.',
    },
    {
      kind: 'mini-project',
      body: 'Take one store you own and write its four numbers, each with the mechanism that produces it \u2014 not the intention, the mechanism. Then prove one of them by breaking it on purpose in a staging cluster: kill the primary mid-transaction, restore the backup into an empty instance, read from a replica immediately after a write. Report what you actually lost, in minutes of data and seconds of downtime. If the number you wrote down and the number you measured disagree, the measured one is the spec.\n[[source: Availability, durability, consistency, cost \u00b7 fanout.sh | https://fanout.sh/system/archive/availability-durability-consistency-cost]]',
    },
  ],
};
