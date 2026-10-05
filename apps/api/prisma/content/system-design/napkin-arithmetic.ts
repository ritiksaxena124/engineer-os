import type { LessonSpec } from '../types';

export const LESSON: LessonSpec = {
  slug: 'napkin-arithmetic',
  title: 'Back-of-the-Envelope Capacity Arithmetic',
  topicSlug: 'sd-capacity-arithmetic',
  sections: [
    {
      kind: 'why-it-exists',
      body:
        'A design brief arrives as words: ten million users, images, feeds. Nothing in that sentence picks a storage engine, a replica count or a monthly bill, and arithmetic is what does. It is also the only part of a capacity conversation a reviewer can check without reading your code. Three minutes on a napkin turns an unbounded claim into a row size, a write rate, a yearly storage total and a box count \u2014 each one falsifiable by one week of counters.',
    },
    {
      kind: 'naive-solution',
      body:
        'Two opposite errors, and both are common. The first is the confident guess: "we will need about three servers", written into a ticket, never re-examined, still being defended eighteen months later. The second is its mirror image \u2014 a spreadsheet carrying six decimal places of precision on inputs nobody ever measured, because the format looked like rigour. Both skip the one step that earns trust, which is naming every assumption out loud before multiplying it.',
    },
    {
      kind: 'why-naive-fails',
      body:
        'The classic misses are each worth 10x, and they compound. A plan built on the average meets the evening spike: 1,157 writes/s becomes about 3,500/s at peak, so a primary provisioned for the average is three times short before anyone has shipped a bug. The second miss counts the row and not the system around it \u2014 indexes commonly add 50\u2013100%, and replicas multiply that again. An estimate that survives review states its assumptions; precision on an unknown input is decoration.',
    },
    {
      kind: 'mental-model',
      body:
        'A ladder, one rung per assumption, walked in a single line: daily active users, actions per user per day, reads-to-writes ratio, bytes per record, retention in days, peak factor. One number per rung, one unit per number, rounded to one significant figure, with the multiplication left visible so a reviewer can attack a specific rung instead of the whole shape. If you cannot name which rung you are standing on at the moment the design changes, you do not have an estimate \u2014 you have a preference.',
    },
    {
      kind: 'internals',
      body:
        'Walk it once, decimal units, one significant figure. 100M daily actives writing once each is 100M writes/day; a day has 86,400 seconds, so the average is 1,157 writes/s and a 3x peak factor puts the evening near 3,500/s. At 500 bytes a record that is 50 GB/day, about 18 TB/year of raw rows; indexes take it to 36 TB and three replicas to roughly 110 TB under management. Reads at 50 per user per day are 5e9/day, so 58k/s average and 175k/s at peak \u2014 which stops being a database question and becomes a cache-hit-ratio question.\n' +
        '\n' +
        '```svg\n' +
        '<svg viewBox="0 0 720 320" role="img" xmlns="http://www.w3.org/2000/svg">\n' +
        '  <title>Capacity ladder from 100M daily actives to about 110 TB under management</title>\n' +
        '  <defs>\n' +
        '    <marker id="ladDown" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">\n' +
        '      <path d="M0 0 L10 5 L0 10 z" fill="var(--color-muted)" />\n' +
        '    </marker>\n' +
        '    <marker id="ladSide" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">\n' +
        '      <path d="M0 0 L10 5 L0 10 z" fill="var(--color-dim)" />\n' +
        '    </marker>\n' +
        '  </defs>\n' +
        '  <text x="40" y="12" font-size="11" fill="var(--color-dim)">one rung, one number, one unit</text>\n' +
        '  <rect x="40" y="20" width="300" height="34" rx="4" fill="var(--color-surface)" stroke="var(--color-line)" />\n' +
        '  <text x="52" y="42" font-size="12" fill="var(--color-ink)">100M DAU x 1 write = 100M writes/day</text>\n' +
        '  <line x1="190" y1="54" x2="190" y2="64" stroke="var(--color-muted)" marker-end="url(#ladDown)" />\n' +
        '  <rect x="40" y="66" width="300" height="34" rx="4" fill="var(--color-surface)" stroke="var(--color-line)" />\n' +
        '  <text x="52" y="88" font-size="12" fill="var(--color-ink)">/ 86,400 s = 1,157 writes/s average</text>\n' +
        '  <line x1="190" y1="100" x2="190" y2="110" stroke="var(--color-muted)" marker-end="url(#ladDown)" />\n' +
        '  <rect x="40" y="112" width="300" height="34" rx="4" fill="var(--color-surface)" stroke="var(--color-line)" />\n' +
        '  <text x="52" y="134" font-size="12" fill="var(--color-ink)">x 3 peak factor = about 3,500 writes/s</text>\n' +
        '  <line x1="190" y1="146" x2="190" y2="156" stroke="var(--color-muted)" marker-end="url(#ladDown)" />\n' +
        '  <rect x="40" y="158" width="300" height="34" rx="4" fill="var(--color-surface)" stroke="var(--color-line)" />\n' +
        '  <text x="52" y="180" font-size="12" fill="var(--color-ink)">x 500 B record = 50 GB/day</text>\n' +
        '  <line x1="190" y1="192" x2="190" y2="202" stroke="var(--color-muted)" marker-end="url(#ladDown)" />\n' +
        '  <rect x="40" y="204" width="300" height="34" rx="4" fill="var(--color-surface)" stroke="var(--color-line)" />\n' +
        '  <text x="52" y="226" font-size="12" fill="var(--color-ink)">x 365 = about 18 TB/year raw rows</text>\n' +
        '  <line x1="190" y1="238" x2="190" y2="248" stroke="var(--color-muted)" marker-end="url(#ladDown)" />\n' +
        '  <rect x="40" y="250" width="300" height="34" rx="4" fill="var(--color-surface)" stroke="var(--color-line-strong)" />\n' +
        '  <text x="52" y="272" font-size="12" fill="var(--color-ink)">x 2 indexes x 3 replicas = 110 TB managed</text>\n' +
        '  <line x1="344" y1="221" x2="396" y2="190" stroke="var(--color-dim)" stroke-dasharray="4 3" marker-end="url(#ladSide)" />\n' +
        '  <rect x="400" y="96" width="288" height="104" rx="4" fill="var(--color-raised)" stroke="var(--color-line)" stroke-dasharray="4 3" />\n' +
        '  <text x="414" y="118" font-size="12" fill="var(--color-ink)">the two multipliers</text>\n' +
        '  <text x="414" y="140" font-size="11" fill="var(--color-muted)">18 TB raw</text>\n' +
        '  <text x="414" y="160" font-size="11" fill="var(--color-muted)">x 2 indexes = 36 TB</text>\n' +
        '  <text x="414" y="180" font-size="11" fill="var(--color-muted)">x 3 replicas = 108 TB</text>\n' +
        '  <text x="414" y="196" font-size="11" fill="var(--color-dim)">state these, not the decimals</text>\n' +
        '</svg>\n' +
        '```',
    },
    {
      kind: 'production-implementation',
      body:
        'The napkin is a deliverable: a small table with the assumption beside each rung and an "if this is 10x wrong" column, reviewed the way you review a schema change. Keep it in the repo beside the infrastructure that implements it, so the estimate ages in one place with the counters that test it. The same lines become a latency budget through Little\u2019s law: 2,000 requests/s at 50 ms means 100 in flight. So the connection pool wants 100 slots plus headroom and the worker count follows from that arithmetic rather than from taste.',
    },
    {
      kind: 'bad-implementation',
      body:
        'Two shipped examples of the same sin. The write path sized on the average \u2014 1,200 writes/s of primary, and the 18:00 spike at 3,500/s arrives to a saturated box, replication lag climbs, and a failover nobody asked for happens in the worst possible window. Or the record counted at 500 bytes when the payload carries a 40 KB media reference list: 80 times the plan, so 50 GB/day is 4 TB/day, the invoice follows it, and the backup window stops fitting inside a night.',
    },
    {
      kind: 'testing',
      body:
        'An estimate you never reconcile against counters is a preference with units. Take one week of production counters \u2014 accepted writes, mean stored row size read from the table statistics rather than from the DTO, read QPS, and peak-to-mean measured by hour \u2014 then plot measured divided by estimated, rung by rung. Anything outside 0.5x to 2x is a bug in an assumption, not noise in a measurement. Keep that plot beside the ladder so a change to record size fails review until the ladder is updated with it.',
    },
    {
      kind: 'failure-scenarios',
      body:
        'Four usuals. Product keeps ninety days and compliance keeps the audit log for seven years: 2,555 days against 90 is 28x the retention nobody priced, discovered on an invoice. Media that dwarfs the database \u2014 thumbnails and originals in object storage at a hundred times the row bytes, counted as free because they are not rows. A "temporary" backfill that lifts the daily average from 1,157 writes/s to 3,500/s for a fortnight, which is the peak line running as a steady state.',
    },
    {
      kind: 'performance',
      body:
        'The ladder doubles as a hit-ratio budget. A 175k/s read peak against replicas that sustain roughly 20k/s each is nine boxes if every read misses; a 95% cache-hit ratio leaves 8,750/s for the database, and a 99% ratio leaves 1,750/s. That is the same multiplication run backwards, and it is why the hit-ratio target belongs in the design document with a number attached rather than on a dashboard nobody opens during the incident that proves it wrong.',
    },
    {
      kind: 'security',
      body:
        'Under-provisioning is an availability failure, and availability is a security property. A write path sized for user actions has no rung for a credential-stuffing run at 20x the average, so add the hostile line explicitly: the rate limit, the queue bound, and the cost of keeping the log that records the attempt for as long as it must be kept. An estimate that cannot carry seven years of audit rows is an estimate that will quietly drop audit rows \u2014 a detection failure with a storage cause.',
    },
    {
      kind: 'trade-offs',
      body:
        'One significant figure beats false accuracy: you are choosing between orders of magnitude, not between 1,157 and 1,160 writes/s. Fix a prefix convention and footnote it honestly \u2014 50 GB/day decimal is 46.6 GiB once a volume is formatted, a 7% gap, which is 1.3 TB of drift on an 18 TB plan before a single assumption is wrong. Then the standing trade: headroom bought as always-on capacity, or as elasticity that costs more per unit and depends on an autoscaler you have actually tested.',
    },
    {
      kind: 'system-design',
      body:
        'These numbers are what turn a brief into a topology. 3,500 writes/s of 500-byte rows is one primary with read replicas and no sharding, and a partition key chosen for availability rather than throughput. The same ladder on an event stream at 50 GB/day, hot for a month and retained for years, forces tiering and the retention job into the design before anyone picks a cloud. A 175k/s read peak is what buys the cache tier and sets its required hit ratio; without the arithmetic the cache is a vibe.',
    },
    {
      kind: 'interview',
      body:
        'Say the chain out loud before you touch the whiteboard: users, active days, actions per user, reads-to-writes ratio, record bytes, retention, peak factor, boxes. Ask for two inputs \u2014 DAU and the ratio \u2014 then narrate the rounding so the interviewer can stop you on the rung they dispute instead of guessing where you went. Expect "what if it is 10x?", and answer with which rung breaks first: record size, peak factor, or the assumption of one row per user. Naming the fragile rung is the senior signal.',
    },
    {
      kind: 'real-world',
      body:
        'A team sized a notification queue for the average: workers with 1,200 events/s of capacity against 1,200/s of average arrivals, which is a design with no headroom by construction. Monday at 09:00 the spike ran at 4.1x the average for two hours, so the backlog grew at 3.1x capacity for 7,200 seconds \u2014 6.2 hours of queued work \u2014 and it took until the afternoon to drain while retries put fuel on it. The fix was one number written on the brief: peak factor 4.1x, not 3x.',
    },
    {
      kind: 'mini-project',
      body:
        'Pick a feed you genuinely open every day and walk the whole ladder: DAU from a number you can look up, actions per user, the read-to-write ratio you observe in your own session, record bytes measured from a real response body rather than estimated from the schema, retention, peak factor. Then re-run it with the two assumptions most likely wrong and write down which decision flips \u2014 the engine, the replica count, or whether the write path is the product. Report the rung you reconciled against a public figure and the ratio between the two.\n' +
        '\n' +
        '[[source: Back-of-the-envelope capacity planning \u00b7 fanout.sh | https://fanout.sh/system/archive/back-of-the-envelope-capacity-planning]]',
    },
  ],
};
