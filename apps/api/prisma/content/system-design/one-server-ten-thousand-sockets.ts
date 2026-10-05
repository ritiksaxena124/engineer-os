import type { LessonSpec } from '../types';

export const LESSON: LessonSpec = {
  slug: 'one-server-ten-thousand-sockets',
  title: 'One Server, Ten Thousand Open Sockets',
  topicSlug: 'sd-handling-many-requests',
  sections: [
    {
      kind: 'why-it-exists',
      body:
        'Every scaling argument you will sit through sits downstream of one mechanism question: how does a single process stay responsive while ten thousand clients hold sockets open and nine thousand of them are silent? It is answered by choosing a concurrency model, not by a language\u2019s marketing page. Get it right and a four-core box serves a product comfortably. Get it wrong and you add instances forever while every instance still blocks on the same read.',
    },
    {
      kind: 'naive-solution',
      body:
        'Thread per connection: accept the socket, hand it to a freshly spawned thread, call blocking read, write the response, close. It is the easiest model to reason about \u2014 one stack per client, and the debugger shows exactly whose request you are standing in \u2014 and it is what Apache prefork and the servlet containers of the 2000s actually shipped. For a hundred clients it is genuinely fine, which is precisely the trap.',
    },
    {
      kind: 'why-naive-fails',
      body:
        'Each thread costs a stack, a scheduler slot and kernel bookkeeping. At the 1 MB stack that is the common default, 10,000 sockets are 10 GB of address space for stacks alone; at the 8 MB Linux default the same arithmetic is 80 GB. The CPU then spends its time switching between runnable threads instead of serving any of them. Worse, a thread parked on a slow database is not waiting cheaply \u2014 it holds all of that memory while doing nothing. The C10K wall is a memory and scheduling wall long before it is a CPU wall.',
    },
    {
      kind: 'mental-model',
      body:
        'Three models on one canvas. Thread per connection buys parallelism and pays in stacks. An event loop runs one thread, asks a kernel multiplexer which descriptors are ready, and executes short callbacks. A hybrid keeps the loop for I/O and adds a bounded pool for computation. The rule of thumb that follows is the whole discipline: the loop is for waiting, the pool is for computing, and mixing them badly is the entire incident.\n' +
        '\n' +
        '```svg\n' +
        '<svg viewBox="0 0 720 300" role="img" xmlns="http://www.w3.org/2000/svg">\n' +
        '  <title>Three concurrency models serving four requests, with the memory each one costs</title>\n' +
        '  <defs>\n' +
        '    <marker id="lnDown" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">\n' +
        '      <path d="M0 0 L10 5 L0 10 z" fill="var(--color-muted)" />\n' +
        '    </marker>\n' +
        '  </defs>\n' +
        '  <text x="126" y="30" font-size="12" fill="var(--color-ink)" text-anchor="middle">thread per connection</text>\n' +
        '  <text x="360" y="30" font-size="12" fill="var(--color-ink)" text-anchor="middle">event loop</text>\n' +
        '  <text x="594" y="30" font-size="12" fill="var(--color-ink)" text-anchor="middle">loop + bounded worker pool</text>\n' +
        '  <rect x="16" y="44" width="220" height="200" rx="4" fill="var(--color-surface)" stroke="var(--color-line)" />\n' +
        '  <rect x="250" y="44" width="220" height="200" rx="4" fill="var(--color-surface)" stroke="var(--color-line)" />\n' +
        '  <rect x="484" y="44" width="220" height="200" rx="4" fill="var(--color-surface)" stroke="var(--color-line)" />\n' +
        '  <rect x="32" y="56" width="40" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="84" y="56" width="40" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="136" y="56" width="40" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="188" y="56" width="40" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <line x1="52" y1="78" x2="52" y2="110" stroke="var(--color-muted)" marker-end="url(#lnDown)" />\n' +
        '  <line x1="104" y1="78" x2="104" y2="110" stroke="var(--color-muted)" marker-end="url(#lnDown)" />\n' +
        '  <line x1="156" y1="78" x2="156" y2="110" stroke="var(--color-muted)" marker-end="url(#lnDown)" />\n' +
        '  <line x1="208" y1="78" x2="208" y2="110" stroke="var(--color-muted)" marker-end="url(#lnDown)" />\n' +
        '  <rect x="32" y="116" width="40" height="90" rx="3" fill="var(--color-surface)" stroke="var(--color-line-strong)" />\n' +
        '  <rect x="84" y="116" width="40" height="90" rx="3" fill="var(--color-surface)" stroke="var(--color-line-strong)" />\n' +
        '  <rect x="136" y="116" width="40" height="90" rx="3" fill="var(--color-surface)" stroke="var(--color-line-strong)" />\n' +
        '  <rect x="188" y="116" width="40" height="90" rx="3" fill="var(--color-surface)" stroke="var(--color-line-strong)" />\n' +
        '  <text x="52" y="166" font-size="9" fill="var(--color-muted)" text-anchor="middle">1 MB</text>\n' +
        '  <text x="104" y="166" font-size="9" fill="var(--color-muted)" text-anchor="middle">1 MB</text>\n' +
        '  <text x="156" y="166" font-size="9" fill="var(--color-muted)" text-anchor="middle">1 MB</text>\n' +
        '  <text x="208" y="166" font-size="9" fill="var(--color-muted)" text-anchor="middle">1 MB</text>\n' +
        '  <text x="126" y="230" font-size="10" fill="var(--color-dim)" text-anchor="middle">one blocked read = one idle thread</text>\n' +
        '  <rect x="266" y="56" width="34" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="314" y="56" width="34" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="362" y="56" width="34" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="410" y="56" width="34" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="266" y="94" width="188" height="24" rx="3" fill="var(--color-surface)" stroke="var(--color-line)" />\n' +
        '  <text x="278" y="110" font-size="10" fill="var(--color-muted)">callback queue</text>\n' +
        '  <line x1="360" y1="118" x2="360" y2="130" stroke="var(--color-muted)" marker-end="url(#lnDown)" />\n' +
        '  <rect x="266" y="136" width="188" height="24" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <text x="278" y="152" font-size="10" fill="var(--color-muted)">epoll: one syscall for 10k fds</text>\n' +
        '  <line x1="360" y1="160" x2="360" y2="172" stroke="var(--color-muted)" marker-end="url(#lnDown)" />\n' +
        '  <rect x="320" y="178" width="80" height="44" rx="3" fill="var(--color-surface)" stroke="var(--color-line-strong)" />\n' +
        '  <text x="360" y="205" font-size="10" fill="var(--color-ink)" text-anchor="middle">1 stack</text>\n' +
        '  <text x="360" y="236" font-size="10" fill="var(--color-dim)" text-anchor="middle">waiting costs an fd, not a thread</text>\n' +
        '  <rect x="500" y="56" width="34" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="544" y="56" width="34" height="22" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="588" y="56" width="34" height="22" rx="3" fill="var(--color-held)" stroke="var(--color-line)" />\n' +
        '  <rect x="632" y="56" width="34" height="22" rx="3" fill="var(--color-held)" stroke="var(--color-line)" />\n' +
        '  <line x1="517" y1="78" x2="517" y2="126" stroke="var(--color-muted)" marker-end="url(#lnDown)" />\n' +
        '  <line x1="561" y1="78" x2="561" y2="126" stroke="var(--color-muted)" marker-end="url(#lnDown)" />\n' +
        '  <line x1="605" y1="78" x2="608" y2="146" stroke="var(--color-dim)" stroke-dasharray="4 3" marker-end="url(#lnDown)" />\n' +
        '  <line x1="649" y1="78" x2="649" y2="146" stroke="var(--color-dim)" stroke-dasharray="4 3" marker-end="url(#lnDown)" />\n' +
        '  <rect x="496" y="132" width="80" height="88" rx="3" fill="var(--color-surface)" stroke="var(--color-line-strong)" />\n' +
        '  <text x="536" y="180" font-size="10" fill="var(--color-ink)" text-anchor="middle">loop</text>\n' +
        '  <rect x="596" y="150" width="24" height="70" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="636" y="150" width="24" height="70" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <rect x="676" y="150" width="24" height="70" rx="3" fill="var(--color-raised)" stroke="var(--color-line)" />\n' +
        '  <text x="648" y="140" font-size="10" fill="var(--color-dim)" text-anchor="middle">pool of 4</text>\n' +
        '  <text x="594" y="236" font-size="10" fill="var(--color-dim)" text-anchor="middle">CPU work diverted, bounded</text>\n' +
        '  <text x="126" y="266" font-size="11" fill="var(--color-ink)" text-anchor="middle">4 sockets = 4 MB of stacks</text>\n' +
        '  <text x="360" y="266" font-size="11" fill="var(--color-ink)" text-anchor="middle">4 sockets = 1 MB + 4 queue nodes</text>\n' +
        '  <text x="594" y="266" font-size="11" fill="var(--color-ink)" text-anchor="middle">loop + 4 workers = 5 MB</text>\n' +
        '  <text x="126" y="286" font-size="10" fill="var(--color-dim)" text-anchor="middle">10,000 sockets = 10 GB of stacks</text>\n' +
        '  <text x="360" y="286" font-size="10" fill="var(--color-dim)" text-anchor="middle">10,000 fds = 1 MB + 10,000 nodes</text>\n' +
        '  <text x="594" y="286" font-size="10" fill="var(--color-dim)" text-anchor="middle">10,000 sockets: 5 MB stacks + queue bound</text>\n' +
        '</svg>\n' +
        '```',
    },
    {
      kind: 'internals',
      body:
        'In order: the accepted socket is a file descriptor; you register it with the multiplexer \u2014 `epoll` on Linux, kqueue on macOS, IOCP on Windows \u2014 and one syscall returns the ready subset out of thousands, so cost tracks activity rather than connection count. The callback runs on the loop, its continuation is queued, and the microtask queue drains completely between macrotasks. DNS and some filesystem calls go to a thread pool because those syscalls cannot be made non-blocking. A slow callback does not delay only itself \u2014 it delays every other connection in the process.',
    },
    {
      kind: 'production-implementation',
      body:
        'The shape that survives is arithmetic all the way down. Little\u2019s law sizes everything: 2,000 req/s at 50 ms is 100 in flight, so the keep-alive pool to that dependency is 100 connections plus headroom, say 120. Bound concurrency per dependency with a semaphore, put a timeout on every hop including the ones that never hang, cap the inbound queue and shed when it is full, and make the health check report loop lag so an orchestrator restarts a wedged process instead of a slow-but-alive one.',
    },
    {
      kind: 'bad-implementation',
      body:
        'An async handler that calls `crypto.pbkdf2Sync` or runs a 90 ms regex on attacker-controlled input. The code is asynchronous in shape and synchronous in fact: during those 90 ms no other socket in the process advances, including the health check, which then times out and gets the pod restarted in the middle of the spike that caused it. Ninety ms of CPU per request also caps the whole process at about 11 req/s \u2014 one over 0.09 \u2014 where four worker threads would have managed roughly 44.',
    },
    {
      kind: 'testing',
      body:
        'A load test that reports only throughput will happily pass a process with one stack in flight. Measure loop lag instead: a `setInterval(1)` drift histogram under load, asserted at p99 against a budget in milliseconds. Add interleaving prediction tests \u2014 then versus `setImmediate` versus `setTimeout(0)`, a promise resolved inside an async handler \u2014 so the phase order is encoded somewhere. Then run the same suite with a 50 ms busy callback and confirm the histogram moves; if it does not, the probe is measuring nothing.',
    },
    {
      kind: 'failure-scenarios',
      body:
        'Four ways this dies while the model still looks healthy. An unbounded `Promise.all` over 10,000 upstream calls fills the descriptor and syscall queue \u2014 your code is idle, the kernel is not. A stream with no drain handler buffers the difference between producer and consumer into an out-of-memory kill. A retry storm turns 2x load into 6x, because every failed request comes back as three attempts. And one tenant\u2019s slow dependency becomes every tenant\u2019s p99, since all of them share the same stack.',
    },
    {
      kind: 'performance',
      body:
        'Concurrency is not parallelism: ten thousand waiting sockets on a four-core box still means four streams that can finish work, so the model fixes waiting and never fixes arithmetic. Async is not free either \u2014 each continuation allocates a resumable frame, and a handler that awaits eight times creates 16,000 of them a second at 2,000 req/s. That is small and it is still real. Latency comes from keeping each callback short; throughput comes from keeping the loop fed with short callbacks.',
    },
    {
      kind: 'security',
      body:
        'One shared stack turns starvation into a cross-tenant attack: a single authenticated user who can force 90 ms of work per request owns the latency of everyone else in that process, which is denial of service sold as a feature. Unbounded fan-out amplifies credential stuffing and scraping, because nothing between the socket and the upstream has queue discipline. And keep request-scoped secrets out of long-lived closures \u2014 a callback parked on a slow dependency can outlive the session whose token it captured.',
    },
    {
      kind: 'trade-offs',
      body:
        'Threads buy parallelism and cost you shared-memory reasoning; processes buy isolation and cost memory and IPC; the loop buys ten thousand cheap waiters and costs you the right to ever run CPU work on it. Multi-threaded JavaScript with worker pools gets you both and prices it in message serialisation \u2014 structured cloning a large payload can cost more than the work you moved off the loop. Blocking-with-threads is simpler to debug and heavier to hold idle. Choose by the shape of the wait, not by the language you like.',
    },
    {
      kind: 'system-design',
      body:
        'This mechanism is why an API process and a worker process are separate deployables even inside one monolith. It is why CPU-heavy work belongs behind a queue rather than on the request path, and why a slow dependency gets a timeout instead of a longer wait. It is also why you serve requests with N processes on N cores rather than one process with N threads: the processes share the accept queue, a wedge kills one of them, and each gets its own loop with a bounded budget \u2014 100 in flight across 4 cores is 25 per process, not 100 in each.',
    },
    {
      kind: 'interview',
      body:
        '"How does one Node process handle 10k concurrent connections?" \u2014 because concurrency is waiting, not computing; sockets are mostly idle; readiness for thousands of descriptors arrives from one kernel call; and short callbacks let one stack serve all of that. Then the follow-up you should answer before it is asked: "what kills it?" \u2014 CPU-bound work on the loop, unbounded fan-out at a slow dependency, and a microtask recursion that starves the phases. Say which of the three your service is closest to.',
    },
    {
      kind: 'real-world',
      body:
        'A webhook sender dropped 30% of its deliveries overnight while CPU sat at 8%. The retry helper had awaited a 10,000-item `Promise.all` against a dependency that had begun answering in 4 seconds: the loop was not busy, it was waiting in bulk, the socket layer was the throat, and the health check timed out. Little\u2019s law gave the honest requirement \u2014 10 deliveries/s at 4 s needs 40 in flight \u2014 so a semaphore at 50 fixed it, same CPU, same dependency.',
    },
    {
      kind: 'mini-project',
      body:
        'Build a thirty-line loop-lag probe: a `setInterval(1)` that records drift and prints a p50/p99 histogram every second. Then make it worse on purpose \u2014 a 50 ms busy loop, a 5 ms synchronous regex, a recursive microtask, and an unbounded `Promise.all` against a slow local endpoint. Report the observed p99 lag for each and attribute every spike to a mechanism rather than to async overhead. If two of the four cases give you the same histogram, your probe is lying; fix it first.\n' +
        '\n' +
        '[[source: How a server handles many requests \u00b7 fanout.sh | https://fanout.sh/system/archive/concurrency-vs-parallelism]]',
    },
  ],
};
