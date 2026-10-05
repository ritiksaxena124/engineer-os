import type { LessonSpec } from '../types';

export const LESSON: LessonSpec = {
  slug: 'cost-is-a-design-input',
  title: 'Cost as a Design Input',
  topicSlug: 'sd-cost-aware-architecture',
  sections: [
    {
      kind: 'why-it-exists',
      body: 'Every architecture decision converts into a monthly invoice, yet most design reviews never ask what that invoice is. Cost per request is not a finance artifact that appears after launch; it is a property of the structure you drew \u2014 how many systems one request touches, how much data crosses boundaries, what gets written down along the way. If you do not decide it deliberately on day one, someone decides it for you on day one thousand, from a bill you cannot cut without redesigning.',
    },
    {
      kind: 'naive-solution',
      body: 'The reasonable first instinct is \u201cstart cheap and optimise later\u201d: one small instance, no cache, deal with scale when it arrives. Its mirror image is just as naive: the r\u00e9sum\u00e9-driven design \u2014 three regions, five replicas, a streaming platform for 200 events a minute \u2014 buying reliability the product never asked for. Both treat cost as external to the design: one defers it indefinitely, the other assumes an infinite budget.',
    },
    {
      kind: 'why-naive-fails',
      body: 'Some costs are structural, which means permanent. A design where every request fans out to another availability zone pays transfer on every call \u2014 assume single-digit cents per GB between zones in most clouds, and the multiplication is arithmetic you cannot argue with: 100 GB a day, every day. A service that logs at debug into a hot cluster pays ingest every month. A table without a partition key pays full scans for the rest of its life. \u201cLater\u201d cannot shrink any of those without a redesign, and the bill is the first place anyone notices.',
    },
    {
      kind: 'mental-model',
      body: 'Hold a per-request stack of lines, not one total: service compute, database compute, data moved (client egress, zone-to-zone, region-to-region), storage written and read, cache and queue units, observability (metrics, traces, log volume), and the idle floor you pay at zero traffic. Each line has its own driver, so each scales differently. Once every line is named, naive monthly-total arithmetic becomes a unit price per action \u2014 the only cost number you can actually design against.\n\n```svg\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 320" role="img">\n<title>Per-request cost stack before and after two structural changes</title>\n<text x="90" y="22" font-size="11" fill="var(--color-muted)">Per-request cost stack \u2014 segment sizes are illustrative share assumptions, not vendor prices</text>\n<rect x="110" y="90" width="110" height="80" fill="var(--color-accent)" />\n<rect x="110" y="170" width="110" height="44" fill="var(--color-due)" />\n<rect x="110" y="214" width="110" height="28" fill="var(--color-muted)" />\n<rect x="110" y="242" width="110" height="16" fill="var(--color-line-strong)" />\n<rect x="110" y="258" width="110" height="20" fill="var(--color-held)" />\n<rect x="110" y="278" width="110" height="12" fill="var(--color-dim)" />\n<rect x="500" y="150" width="110" height="80" fill="var(--color-accent)" />\n<rect x="500" y="230" width="110" height="8" fill="var(--color-due)" />\n<rect x="500" y="238" width="110" height="26" fill="var(--color-muted)" />\n<rect x="500" y="264" width="110" height="12" fill="var(--color-line-strong)" />\n<rect x="500" y="276" width="110" height="2" fill="var(--color-held)" />\n<rect x="500" y="278" width="110" height="12" fill="var(--color-dim)" />\n<rect x="286" y="90" width="14" height="14" fill="var(--color-accent)" />\n<text x="306" y="101" font-size="11" fill="var(--color-ink)">service compute</text>\n<rect x="286" y="110" width="14" height="14" fill="var(--color-due)" />\n<text x="306" y="121" font-size="11" fill="var(--color-ink)">database</text>\n<rect x="286" y="130" width="14" height="14" fill="var(--color-muted)" />\n<text x="306" y="141" font-size="11" fill="var(--color-ink)">transfer</text>\n<rect x="286" y="150" width="14" height="14" fill="var(--color-line-strong)" />\n<text x="306" y="161" font-size="11" fill="var(--color-ink)">storage</text>\n<rect x="286" y="170" width="14" height="14" fill="var(--color-held)" />\n<text x="306" y="181" font-size="11" fill="var(--color-ink)">observability</text>\n<rect x="286" y="190" width="14" height="14" fill="var(--color-dim)" />\n<text x="306" y="201" font-size="11" fill="var(--color-ink)">idle floor</text>\n<text x="286" y="228" font-size="10" fill="var(--color-dim)">After a 90% cache hit on the read path and a 10x smaller</text>\n<text x="286" y="242" font-size="10" fill="var(--color-dim)">log line: unit cost \u2248 70% of before (same assumptions).</text>\n<line x1="90" y1="290" x2="630" y2="290" stroke="var(--color-line-strong)" stroke-width="1" />\n<text x="165" y="306" font-size="11" fill="var(--color-muted)" text-anchor="middle">one request, today</text>\n<text x="555" y="306" font-size="11" fill="var(--color-muted)" text-anchor="middle">same request, two structural changes</text>\n</svg>\n```',
    },
    {
      kind: 'internals',
      body: 'The levers have mechanisms, not vibes. Reducing fan-out is the biggest lever because every hop a request makes costs latency and money on top of the work itself. Caching converts hit ratio directly into unit cost: a 90 percent hit on the read path removes nine tenths of that spend \u2014 but adds a component and an invalidation duty. Right-sizing matches instances and pools to measured utilisation; storage tiering moves cold rows to cheaper media, and batching amortises a thousand actions into one. Committed-use pricing is a reliability discount that is also a forecasting obligation, and the replica that exists only to serve a dashboard nobody opens is still a monthly line.',
    },
    {
      kind: 'production-implementation',
      body: 'Work a unit-cost model with named assumptions. A read path at 1,200 requests per second is roughly 3.1 billion requests a month; at 8 KB returned per request that is about 25 TB of egress, and at 2 KB of logs and traces it is about 6.2 TB of ingest \u2014 two lines that already say where the money goes. Now change structure: a 90 percent cache hit on the read path removes nine tenths of the served database-read spend, and a 10x smaller log line turns 6.2 TB of ingest into roughly 620 GB. One change you cannot wave away: adding a sync replica raises the idle floor \u2014 that cost is incurred whether or not there is traffic.',
    },
    {
      kind: 'bad-implementation',
      body: 'The \u201cserverless is cheaper\u201d bet made on the average request and broken by the peak: per-invocation and per-GB-second pricing punishes chatty fan-out, so a handler making forty internal calls per request multiplies its own bill with every call. Or the split that puts the database in another zone \u201cfor isolation\u201d, so normal traffic crosses the zone boundary on every request. The bill doubles with no dependency change, no new endpoint, no regression on any dashboard \u2014 only the invoice moves, and nobody owns invoices.',
    },
    {
      kind: 'testing',
      body: 'You test a cost decision the way you test latency. Instrument cost per action as a metric: divide each monthly line by measured volume and publish the number where engineers see it. Assert on it in load tests \u2014 unit cost should stay flat as volume grows, and a unit cost that climbs with volume is a structural bug like N+1 fan-out or per-request full scans. Treat a step change in unit cost after a deploy as a regression with an owner and a revert threshold, exactly as you would a p99 jump. If nobody can state the unit cost before and after a change, nobody tested the change.',
    },
    {
      kind: 'failure-scenarios',
      body: 'Four real shapes. A backfill writes 400 GB to a provisioned-throughput table and bills more than the quarter\u2019s traffic \u2014 provisioned means you committed to a number and the backfill ignored it. A retry storm against a slow dependency pays for 6x the requests it actually serves. A JSON column added \u201cfor flexibility\u201d turns every report into a full scan, and every scan is priced. A debug log switched on \u201ctemporarily\u201d during an incident fills a 1 TB bucket and makes search unusable for everyone \u2014 the temporary flag nobody remembered is now a permanent line.',
    },
    {
      kind: 'performance',
      body: 'The interesting engineering lives in the interaction between cost and speed. A cache placed closer to the user costs money and buys milliseconds; a same-region read is both cheaper and faster than a cross-region one, so that second structural change is free. But optimise against the shape of the load, not the invoice: a batch job tuned to a cheap instance that misses its window still failed. The healthy obsession is bytes moved across boundaries per action \u2014 bytes are latency and money at the same time.',
    },
    {
      kind: 'security',
      body: 'Security writes its own cost lines, usually in storage. Encrypted blobs, audit logs kept for compliance, detection rules, multi-year snapshots \u2014 none can be tiered into archive if policy demands they stay queryable hot. The inverse danger is a cost cut that quietly removes a control: log sampling that drops the security-relevant lines, or a retention shortening that undercuts an audit obligation. Give security artifacts a retention floor before anyone is allowed to optimise them away.',
    },
    {
      kind: 'trade-offs',
      body: 'Every dial is priced, and the honest sentence is short: the cheapest system that meets the SLO wins, not the cheapest system. Cost versus availability \u2014 each replica, each region, each failover budget adds an idle floor paid at zero traffic. Cost versus latency \u2014 caches and edges buy milliseconds with money. Committed-use discounts \u2014 assume single-digit-twenties to low-forties percent off; an assumption, not a quote \u2014 trade away the elasticity a spiky product actually needs, and you eat the difference when volume dips. Reserved capacity is a bet on your own forecast; on-demand is the premium you pay for admitting you cannot forecast.',
    },
    {
      kind: 'system-design',
      body: 'Put cost in the brief as the fourth constraint next to latency, availability and consistency, and make it an explicit line in every design document: estimated unit cost at launch, at ten times, and at rest. It decides region count, replica count, retention windows \u2014 whether the elegant event-sourced design survives review at all. A design that cannot state its per-request stack has not finished designing; it has decorated.',
    },
    {
      kind: 'interview',
      body: 'The sixty-second version: \u201cI model cost per request as a stack \u2014 compute, database, transfer, storage, observability, idle floor \u2014 and most lines are structural, so they are decided by the design, not the instance size.\u201d The follow-up you should expect: \u201chow would you cut this bill by 40 percent?\u201d Answer with the structural levers in order \u2014 fan-out first, then log volume, retention, cache hit ratio \u2014 and only after that look at instances. Opening with \u201cuse a smaller instance\u201d tells the interviewer you have never read a bill: compute is usually one line, rarely the biggest.',
    },
    {
      kind: 'real-world',
      body: 'A team\u2019s monthly bill tripled while traffic only doubled \u2014 the classic tell of structural cost. One new feature had written each event to a hot table with no partition scheme, logged the full payload at info level, and read it back through a cross-region endpoint \u201cin case of\u201d failover. None of it showed in the latency dashboard; all of it showed in the invoice. Three changes: payload out of the log line, partition by day with a 30-day hot window and a cold tier after, read in-region. Unit cost fell below the original number \u2014 at double the traffic, without deleting a component.',
    },
    {
      kind: 'mini-project',
      body: 'Write out the cost stack for one request in EngineerOS: name every assumption \u2014 instance-hours per thousand requests, bytes returned, bytes logged, rows scanned, the idle floor at 3 a.m. Then write the three structural changes that would reduce it most, with the arithmetic for each, and name the one you would refuse to make and why: retention an audit obligation forbids, a cache whose invalidation you cannot reason about, or fan-out that is actually your consistency model.\n[[source: Cost-aware architecture \u00b7 fanout.sh | https://fanout.sh/system/archive/cost-aware-architecture]]',
    },
  ],
};
