import type { QuestionSpec } from './types';

/**
 * The 30-question opening diagnostic (docs/diagnostic.md). Its purpose is gap discovery, not
 * a score: every item names the concepts a real answer must touch, so a miss tells the learner
 * *which* idea is missing rather than "you got 6/10".
 */
export const QUESTIONS_DIAGNOSTIC: QuestionSpec[] = [
  {
    slug: 'diag-event-loop-order',
    topicSlug: 'event-loop',
    categoryKey: 'output-prediction',
    levelKey: 'understanding',
    difficulty: 3,
    isDiagnostic: true,
    stem: 'What prints, and why?',
    body: [
      '```js',
      'console.log("A");',
      'setTimeout(() => console.log("C"), 0);',
      'Promise.resolve().then(() => console.log("B"));',
      'console.log("D");',
      '```',
      'Name the queue each callback waits in and what drains it.',
    ].join('\n'),
    concepts: [
      {
        slug: 'call-stack-synchronous-first',
        name: 'Synchronous code runs to completion first',
        detail: 'A and D print because the stack must empty before the loop looks at any queue.',
        terms: ['call stack', 'synchronous', 'stack empty', 'sync first'],
      },
      {
        slug: 'microtask-queue',
        name: 'The microtask queue',
        detail: 'Promise reactions are microtasks queued after the current task, before the next timer.',
        terms: ['microtask', 'promise queue', 'job queue', 'tick'],
        weight: 2,
      },
      {
        slug: 'macrotask-timer-queue',
        name: 'Timers are macrotasks',
        detail: 'setTimeout registers a timer handle; it fires on a later loop turn, after all microtasks.',
        terms: ['macrotask', 'timer queue', 'task queue', 'setTimeout phase', 'poll phase'],
        weight: 2,
      },
      {
        slug: 'drain-microtasks-before-next-tick',
        name: 'Microtasks drain fully before the next macrotask',
        detail: 'The queue is emptied completely, including microtasks added by other microtasks.',
        terms: ['drain', 'fully drained', 'before the next tick', 'until empty'],
      },
    ],
    answer: {
      shortAnswer: 'A, D, B, C — the stack empties before the loop consults any queue.',
      idealAnswer:
        'A and D print immediately — the script is a synchronous task and the stack must empty before ' +
        'anything else runs. B is a microtask (a promise reaction) and the microtask queue is drained ' +
        'completely once the current stack unwinds. C is a timer callback, a macrotask, so it waits for ' +
        'the next loop turn. "setTimeout 0" never means "immediately"; it means "no sooner than 0 ms, ' +
        'on a later turn".',
      deepAnswer:
        'Node runs one task at a time: pop the stack, then drain microtasks (including any pushed by ' +
        'those microtasks), then move to the next phase of the libuv loop — timers, pending callbacks, ' +
        'poll, check, close. A timer with 0 ms is scheduled into the timers phase and also has a floor: ' +
        'nested timers beyond 15 levels clamp to 1 ms. In practice the delay you observe between B and C ' +
        'is loop lag: if the poll phase is busy, C can land several milliseconds after B, and under load ' +
        'that gap becomes hundreds of milliseconds. Anything whose correctness depends on timer ordering ' +
        'is depending on something you do not control.',
      commonMistakes:
        '- Saying "promises are faster than setTimeout" as if it were a property of promises.\n' +
        '- Claiming C and B race each other.\n' +
        '- Predicting A, D, C, B because 0 ms looks sooner than a promise.',
      whyWrong:
        'Reasoning by speed rather than by queue discipline is folklore. It survives easy cases and ' +
        'breaks the moment you add a microtask that itself schedules another, or an await inside a loop — ' +
        'which is exactly how starvation bugs and "impossible" out-of-order logs get shipped.',
      followUps:
        '1. What changes if B schedules a second promise internally?\n' +
        '2. Where does setImmediate(C) land relative to the timer?\n' +
        '3. What if the synchronous block takes 3 seconds — when does C run?',
      exercise:
        'Write a script that starves the timers phase by enqueueing a self-rescheduling promise 100,000 ' +
        'times, log the delay of a setTimeout(0), then explain the number you measured.',
    },
  },
  {
    slug: 'diag-await-continuation',
    topicSlug: 'promises-async',
    categoryKey: 'output-prediction',
    levelKey: 'debugging',
    difficulty: 4,
    isDiagnostic: true,
    stem: 'Same output, different mechanism: where does execution actually go when it hits `await`?',
    body: [
      '```js',
      'async function run() {',
      '  console.log("A");',
      '  await Promise.resolve();',
      '  console.log("B");',
      '}',
      'run();',
      'console.log("C");',
      '```',
      'Give the order and explain what `await` does to the function.',
    ].join('\n'),
    concepts: [
      {
        slug: 'implicit-continuation',
        name: 'await suspends the function and registers the rest as a continuation',
        detail: 'The code after await is not run inline; it becomes a reaction attached to the awaited promise.',
        terms: ['continuation', 'suspends', 'paused', 'resumes later', 'unwinds'],
        weight: 2,
      },
      {
        slug: 'async-function-returns-promise',
        name: 'An async function returns a promise immediately',
        detail: 'run() hands back a pending promise; the caller keeps executing synchronously.',
        terms: ['returns a promise', 'pending promise', 'caller continues', 'does not block'],
        weight: 2,
      },
      {
        slug: 'microtask-boundary',
        name: 'Resumption is a microtask',
        detail: 'B runs from the microtask queue, so C prints before B.',
        terms: ['microtask', 'job queue', 'tick boundary'],
      },
      {
        slug: 'not-a-thread-block',
        name: 'No thread is blocked',
        detail: 'The single thread keeps running other work; only this function is parked.',
        terms: ['not blocking', 'no thread blocked', 'non-blocking', 'single thread still runs'],
      },
    ],
    answer: {
      shortAnswer: 'A, C, B — await parks this function and lets the caller keep running.',
      idealAnswer:
        'A prints synchronously inside run(). At the await, the remainder of run() — the console.log("B") ' +
        '— is packaged as a continuation and attached to the resolved promise; the stack unwinds and C ' +
        'prints. B then runs as a microtask. No thread was ever blocked; only this function was parked.',
      deepAnswer:
        'await is a coroutine yield with a promise-shaped API. The async function is compiled into a state ' +
        'machine; each await is a suspension point that stores local variables in the closure and returns to ' +
        'the caller. Because resumption is a microtask, an await chain inside a hot loop can starve the timers ' +
        'phase entirely — a 10,000-item `for` loop over awaits keeps the microtask queue non-empty forever. ' +
        'Also note the extra tick: `await awaitSomething` historically added more microtask hops than a plain ' +
        '`.then`, so exact tick counting between engines is fragile. Never build logic on tick distance.',
      commonMistakes:
        '- Predicting A, B, C, treating await as a blocking read.\n' +
        '- Saying the event loop "waits" for the promise.\n' +
        '- Believing an async function blocks its caller because it contains await.',
      whyWrong:
        'If you think await blocks, you will write request handlers that serialise independent work and ' +
        'wonder why p99 is the sum of every downstream call. It is the difference between 3 parallel 200 ms ' +
        'calls (200 ms) and 600 ms of latency you built yourself.',
      followUps:
        '1. Rewrite it so B prints before C — what does that prove?\n' +
        '2. What happens to loop lag with 10,000 sequential awaits?\n' +
        '3. How do you cancel the continuation?',
      exercise:
        'Wrap this in a function that awaits 5,000 resolved promises in a row while a setTimeout(100) also ' +
        'runs; measure whether the timer fires on time, then fix it with Promise.all.',
    },
  },
  {
    slug: 'diag-closure-leak',
    topicSlug: 'closures-scope',
    categoryKey: 'why',
    levelKey: 'debugging',
    difficulty: 4,
    isDiagnostic: true,
    stem: 'Define a closure without the word "closure", then show how one leaks memory in a server.',
    body:
      'Give a real retention path: what holds the reference, and how you would prove it with a heap snapshot.',
    concepts: [
      {
        slug: 'captured-lexical-environment',
        name: 'A function plus the scope it captured',
        detail: 'The inner body resolves free variables against the environment recorded at definition time.',
        terms: ['captured', 'lexical scope', 'scope chain', 'environment', 'remembers variables'],
        weight: 2,
      },
      {
        slug: 'lifetime-outlives-scope',
        name: 'The captured environment lives as long as the function does',
        detail: 'Returning the function keeps its whole lexical environment reachable.',
        terms: ['lives as long', 'outlives', 'stays reachable', 'kept alive'],
        weight: 2,
      },
      {
        slug: 'retained-reference-path',
        name: 'A retention path from a live root',
        detail: 'Listener, cache map, timer or interval holding the closure keeps the request object alive.',
        terms: ['retainer', 'retention', 'still referenced', 'gc root', 'listener', 'cache map', 'setInterval'],
      },
    ],
    answer: {
      shortAnswer:
        'A function that resolves names against the scope it was created in, not the scope it runs in — so ' +
        'as long as that function is reachable, everything it can see is reachable.',
      idealAnswer:
        'Registering a per-request handler in a module-level array, or passing a closure to setInterval and ' +
        'never clearing it, keeps the entire request alive: headers, body, parsed JSON, the connection object. ' +
        'The leak is invisible in code review because nothing looks like a global — the retainer is a variable ' +
        'in an enclosing scope.',
      deepAnswer:
        'Take two heap snapshots minutes apart, filter by the constructor name (IncomingMessage, or your own ' +
        'RequestContext), and read the retainer path in the third snapshot: it names exactly which Map entry ' +
        'or Timer object keeps the generation alive. The V8 detail that bites people is over-capture: closing ' +
        'over a whole `req` because you wanted `req.headers` allocates a context object containing the entire ' +
        'scope. Destructure the specific fields you need and the captured context shrinks to those.',
      commonMistakes:
        '- "A function that remembers variables" with no retention path.\n' +
        '- Blaming the garbage collector instead of your own long-lived references.\n' +
        '- Assuming a closure leaks only when it holds a large object directly.',
      whyWrong:
        'A steady climb in RSS that never plateaus, then OOM kill at 3 a.m. Leaked request contexts also keep ' +
        'sockets and file descriptors reachable, so you get the leak twice: memory and handles. The classic ' +
        'signature is a heap that returns to baseline only after a restart.',
      followUps:
        '1. Which is the retainer and which is the retained object?\n' +
        '2. How do you leak this with an EventEmitter and fix it with one line?\n' +
        '3. Why does storing per-request state in a module-level Map break horizontal scaling too?',
      exercise:
        'Write a 20-line server that leaks one request object per request by pushing a closure into a ' +
        'module-level array; prove it with a snapshot delta, then fix it and prove the fix.',
    },
  },
  {
    slug: 'diag-single-thread-10k',
    topicSlug: 'cpu-bound-vs-io-bound',
    categoryKey: 'conceptual',
    levelKey: 'understanding',
    difficulty: 4,
    isDiagnostic: true,
    stem: 'Why can one thread serve 10,000 concurrent connections?',
    body:
      'Explain what a connection costs in memory and what actually consumes CPU. Contrast with Apache prefork.',
    concepts: [
      {
        slug: 'non-blocking-sockets-epoll',
        name: 'Non-blocking sockets plus an OS readiness multiplexer',
        detail: 'epoll/kqueue/io_uring report readiness for thousands of fds in one syscall.',
        terms: ['epoll', 'kqueue', 'non-blocking', 'event notification', 'io_uring', 'select'],
        weight: 2,
      },
      {
        slug: 'connection-is-not-a-thread',
        name: 'A connection is state, not a thread',
        detail: 'Each connection costs a small object plus kernel buffers, not an 8 MB stack.',
        terms: ['not a thread', 'per-connection state', 'small buffer', 'no thread per connection'],
        weight: 2,
      },
      {
        slug: 'waiting-is-free',
        name: 'Waiting is not work',
        detail: 'I/O wait dominates; the thread has nothing useful to do during it anyway.',
        terms: ['idle waiting', 'waits for i/o', 'waiting costs nothing', 'mostly waiting'],
      },
      {
        slug: 'c10k-thread-cost',
        name: 'Thread-per-connection does not scale',
        detail: 'Scheduler pressure, context switches and stack memory cap a machine at hundreds to a few thousand.',
        terms: ['context switch', 'thread stack', 'scheduler', 'prefork', 'memory per thread'],
      },
    ],
    answer: {
      shortAnswer:
        'Because connections spend almost all their time waiting, and waiting costs one entry in a kernel ' +
        'readiness set, not a thread.',
      idealAnswer:
        'The event loop registers every socket with epoll and asks the kernel which fds are ready. A ' +
        'connection costs a JS object, a file descriptor and kernel buffers — hundreds of bytes, versus ' +
        'roughly 8 MB of thread stack. The thread is only busy when bytes actually move, and for a typical ' +
        'CRUD API that is a few percent of wall-clock time.',
      deepAnswer:
        'The model breaks on CPU: one handler that hashes a password in 80 ms blocks all 10,000 connections ' +
        'for 80 ms, so throughput caps near 12 such requests per second per process. It also breaks on ' +
        'accept-queue overflow: epoll notifies, but if your loop is busy the backlog fills and the kernel ' +
        'drops SYNs. That is why the honest answer is "N processes on N cores plus an event loop each", ' +
        'sized so that CPU-bound work per request stays in the low single-digit milliseconds.',
      commonMistakes:
        '- "Because it is asynchronous" — a label, not a mechanism.\n' +
        '- Claiming Node uses multiple threads for network I/O.\n' +
        '- Ignoring the CPU-bound case entirely.',
      whyWrong:
        'Teams that believe the folklore put bcrypt in a request handler, or run a 400 ms JSON parse over ' +
        'the loop, and watch every unrelated endpoint go slow. Latency becomes coupled across tenants ' +
        'sharing the process, which is an outage pattern with a name: head-of-line blocking on the loop.',
      followUps:
        '1. What is the memory cost of an idle connection here versus a Java thread-per-connection server?\n' +
        '2. Where does the libuv thread pool help, and where does it not?\n' +
        '3. How do you know you are loop-bound rather than downstream-bound?',
      exercise:
        'Hold 10,000 idle sockets open with a small script and report RSS and fd count; then add a 100 ms ' +
        'sync loop and show what it does to p99 for everyone else.',
    },
  },
  {
    slug: 'diag-what-blocks-node',
    topicSlug: 'event-loop',
    categoryKey: 'debugging',
    levelKey: 'debugging',
    difficulty: 4,
    isDiagnostic: true,
    stem: 'List the things that actually block the Node main thread. Not "long loops" — the real list.',
    body: 'For each one, say how you would detect it in a running process.',
    concepts: [
      {
        slug: 'cpu-on-main-thread',
        name: 'Any synchronous CPU work on the main thread',
        detail: 'Regex backtracking, JSON parse of huge payloads, crypto, compression, image work.',
        terms: ['synchronous', 'cpu-bound', 'blocks the loop', 'main thread'],
        weight: 2,
      },
      {
        slug: 'sync-fs-crypto-apis',
        name: 'The fs/crypto/zlib sync APIs',
        detail: 'readFileSync, pbkdf2Sync, createGzip-sync variants — they run inline, no thread pool.',
        terms: ['readFileSync', 'sync fs', 'pbkdf2Sync', 'crypto sync', 'writeFileSync'],
        weight: 2,
      },
      {
        slug: 'gc-pause',
        name: 'Garbage collection pauses',
        detail: 'A full major GC on a large heap is a real multi-hundred-ms stall.',
        terms: ['gc pause', 'garbage collection', 'major gc', 'stw'],
      },
      {
        slug: 'loop-lag-detection',
        name: 'Measuring loop lag',
        detail: 'A timer histogram or monitorEventLoopDelay shows stall distribution directly.',
        terms: ['loop lag', 'monitorEventLoopDelay', 'perf histogram', 'lag metric'],
      },
    ],
    answer: {
      shortAnswer:
        'Anything that occupies the single JS thread: sync syscalls, sync crypto/compression, heavy parse and ' +
        'serialise work, pathological regex, and GC pauses.',
      idealAnswer:
        'Detect it by measuring, not by reading code. Publish loop lag as a metric ' +
        '(perf_hooks.monitorEventLoopDelay) and alert on p99 lag, not average — one 900 ms stall is an ' +
        'incident while the mean still looks fine. Then use `--prof` or a wall-clock CPU profile over the ' +
        'stall window to name the function. A flame graph with a wide single bar is the fingerprint.',
      deepAnswer:
        'The sneaky ones are third-party: a JSON.parse of a 400 MB upstream response, a YAML parser in a ' +
        'config hot path, `new Date()` string comparisons in a sort, or a synchronous migration runner at ' +
        'boot. Also note the distinction between blocking the loop and saturating it — a full libuv pool ' +
        'delays fs operations by queueing them (uv_threadpool_size defaults to 4), which looks like blocking ' +
        'but shows up as thread-pool queue time, not loop lag.',
      commonMistakes:
        '- Naming only "long loops".\n' +
        '- Believing any `await` means the loop is free.\n' +
        '- Confusing high CPU with high loop lag; they can be independent.',
      whyWrong:
        'A single blocking call is a shared-fate outage: every health check, every other tenant request and ' +
        'your own load balancer probes all queue behind it. Teams that only watch CPU miss this entirely ' +
        'because the box looks 20% busy.',
      followUps:
        '1. Why does await axios(...) not block, but JSON.parse of the body can?\n' +
        '2. Where does the thread pool help and where does it hurt?\n' +
        '3. What alert threshold on p99 loop lag is defensible for a 200 ms SLO?',
      exercise:
        'Instrument loop lag in any service you own, deliberately call crypto.pbkdf2Sync in one handler, and ' +
        'screenshot the latency histogram change.',
    },
  },
  {
    slug: 'diag-fs-readfile-where',
    topicSlug: 'node-libuv',
    categoryKey: 'internal',
    levelKey: 'understanding',
    difficulty: 4,
    isDiagnostic: true,
    stem: 'Where does `fs.readFile` actually execute?',
    body: 'Name the layers: JS binding, C++, thread pool, kernel, and where the callback runs.',
    concepts: [
      {
        slug: 'libuv-thread-pool',
        name: 'The libuv thread pool',
        detail: 'File system work runs on pool threads, default size 4, set with UV_THREADPOOL_SIZE.',
        terms: ['thread pool', 'libuv pool', 'uv_threadpool_size', '4 threads'],
        weight: 2,
      },
      {
        slug: 'not-the-event-loop',
        name: 'Not the event loop itself',
        detail: 'The loop registers the request and continues; it never does the read.',
        terms: ['not on the loop', 'loop only registers', 'does not run in the loop'],
        weight: 2,
      },
      {
        slug: 'completion-callback',
        name: 'Completion is delivered back on the loop',
        detail: 'The pool thread signals the loop, which queues the JS callback as a next phase.',
        terms: ['completion callback', 'callback on the loop', 'queued back', 'poll phase'],
      },
      {
        slug: 'sockets-not-pooled',
        name: 'Network I/O does not use the pool',
        detail: 'Sockets are handled by epoll directly; only fs, crypto, dns and zlib use threads.',
        terms: ['sockets use epoll', 'network not pooled', 'dns is pooled', 'fs uses threads'],
      },
    ],
    answer: {
      shortAnswer:
        'On a libuv pool thread (or the kernel via io_uring on newer libuv), with the completion callback ' +
        'delivered back on the event loop.',
      idealAnswer:
        'The JS call becomes a binding request handed to libuv, which queues a work item for one of its pool ' +
        'threads — UV_THREADPOOL_SIZE defaults to 4. That thread issues the blocking syscall against the real ' +
        'file system, then wakes the loop over the io watcher. Your callback runs as a normal task on the main ' +
        'thread. The loop never blocks; the pool queue can.',
      deepAnswer:
        'Pool starvation is the failure mode nobody plans for: 5 concurrent readFileSync-sized jobs on a 4-thread ' +
        'pool means the fifth waits behind all of them, and crypto.pbkdf2 / scrypt share that same pool, so a ' +
        'login spike silently slows your file reads too. That coupling is a sizing decision with an incident ' +
        'attached: size the pool per process deliberately, or move hashing off the pool to a worker or a sidecar.',
      commonMistakes:
        '- "It runs in the event loop."\n' +
        '- Assuming every async API is off-thread.\n' +
        '- Forgetting crypto and DNS share the pool.',
      whyWrong:
        'If you think the pool is free, you will not size it, and then a bcrypt spike turns into a mysterious ' +
        'upload-latency problem at 4 p.m. on deploy day. The pool is the classic hidden shared resource in a ' +
        'Node service.',
      followUps:
        '1. What does raising UV_THREADPOOL_SIZE cost?\n' +
        '2. Which APIs bypass the pool entirely?\n' +
        '3. How would you measure pool queue time?',
      exercise:
        'Fire 20 concurrent 50 MB readFileSync-free async reads with the pool at 4, then at 16; report total ' +
        'wall time and explain the shape of the difference.',
    },
  },
  {
    slug: 'diag-worker-vs-process',
    topicSlug: 'processes-threads',
    categoryKey: 'trade-off',
    levelKey: 'design',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'Worker threads vs child_process vs cluster: pick each one and justify it in one sentence.',
    body: 'Say what memory boundary each gives and what the data hand-off costs.',
    concepts: [
      {
        slug: 'isolate-boundary',
        name: 'Isolate and memory boundaries',
        detail: 'Workers get a separate V8 isolate (no shared JS objects except SAB); processes get a separate address space.',
        terms: ['isolate', 'separate heap', 'no shared memory', 'address space', 'sharedarraybuffer'],
        weight: 2,
      },
      {
        slug: 'message-serialisation-cost',
        name: 'Message passing costs serialisation',
        detail: 'structuredClone / IPC copies; large payloads pay in CPU and latency, transferables avoid it.',
        terms: ['serialisation', 'structured clone', 'ipc overhead', 'copying', 'transfer list'],
        weight: 2,
      },
      {
        slug: 'cluster-for-listen-sockets',
        name: 'cluster shares listening sockets across processes',
        detail: 'The right tool for using all cores on one HTTP listener with independent failure domains.',
        terms: ['cluster', 'shared listening socket', 'multiple processes', 'round robin accept'],
      },
      {
        slug: 'cpu-bound-justification',
        name: 'CPU-bound work is the only real justification',
        detail: 'Choosing these is about parallel CPU, not about making I/O faster.',
        terms: ['cpu-bound', 'parallel cpu', 'cores', 'not for i/o'],
      },
    ],
    answer: {
      shortAnswer:
        'cluster for scaling the listener across cores, worker threads for CPU-heavy work inside one service, ' +
        'child_process for isolation, a different runtime, or a crash blast radius you want contained.',
      idealAnswer:
        'cluster keeps one port with several processes sharing the accept queue, so a crash or a runaway loop ' +
        'takes out one worker, and each gets its own heap. worker_threads give you a second V8 isolate inside ' +
        'the process, so you keep the deploy shape but must pass messages, not objects. child_process gives ' +
        'the hardest boundary — separate address space, separate binary if needed, full isolation from a segfault.',
      deepAnswer:
        'The cost model: a worker message round trip is roughly 1-10 microseconds for small values and ' +
        'milliseconds for megabytes, because serialisation happens on whichever thread must stay responsive. ' +
        'SharedArrayBuffer plus Atomics moves bytes without copying but drags in the whole Spectre review. ' +
        'In Kubernetes the calculus shifts again: if you have CPU limits and replicas, horizontal scaling is ' +
        'cheaper and more observable than an in-process pool, so worker threads win mainly for streaming, ' +
        'image, crypto and parsing work where per-request process spawn is impossible.',
      commonMistakes:
        '- Reaching for worker threads to make HTTP calls faster.\n' +
        '- Expecting shared objects between workers.\n' +
        '- Running 16 workers inside a pod that has 2 CPUs.',
      whyWrong:
        'Concurrency model chosen without a CPU-bound reason buys you serialisation cost, a second failure ' +
        'mode and a leak surface — and the p99 you were chasing stays exactly where it was.',
      followUps:
        '1. How do you shut a worker down without losing in-flight work?\n' +
        '2. What breaks about singletons when you go multi-process?\n' +
        '3. When does an external queue beat in-process workers?',
      exercise:
        'Benchmark hashing 10,000 passwords inline, on a worker pool, and on cluster workers; report p99 and ' +
        'loop lag for each and name the trade-off you would present.',
    },
  },
  {
    slug: 'diag-backpressure-contract',
    topicSlug: 'streams-backpressure',
    categoryKey: 'internal',
    levelKey: 'debugging',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'Explain backpressure as a contract. What does ignoring it do to a process?',
    body: 'Name the mechanism, the signal, and the measurable consequence.',
    concepts: [
      {
        slug: 'highwatermark',
        name: 'highWaterMark',
        detail: 'The byte/object threshold that flips a stream to buffered and pauses the source.',
        terms: ['highwatermark', 'high water mark', 'buffer threshold', 'watermark'],
        weight: 2,
      },
      {
        slug: 'pause-drain-signalling',
        name: 'write() returning false, then drain',
        detail: 'The producer must stop at false and resume on the drain event — that is the flow-control signal.',
        terms: ['drain', 'write returns false', 'pause', 'flow control', 'pipeline'],
        weight: 2,
      },
      {
        slug: 'unbounded-buffer-rss',
        name: 'Ignoring it means unbounded buffering in RAM',
        detail: 'A fast producer and slow consumer grow internal buffers until RSS spikes and GC or OOM intervenes.',
        terms: ['unbounded buffer', 'memory growth', 'rss', 'oom', 'out of memory'],
      },
      {
        slug: 'destroy-and-error-propagation',
        name: 'Error and cleanup propagation',
        detail: 'Every stream in the chain must be destroyed or descriptors leak.',
        terms: ['destroy', 'leaked fd', 'error handler', 'pipeline cleanup'],
      },
    ],
    answer: {
      shortAnswer:
        'The consumer tells the producer to slow down. write() returns false at highWaterMark and the ' +
        'producer must wait for drain; ignore that and the data waits in memory instead.',
      idealAnswer:
        'Backpressure is a signal path, not a setting. In a correct chain each hop pauses the previous one, ' +
        'so the source ends up throttled at the true bottleneck — the slowest disk, network or database write. ' +
        'The mistake is treating async("data" handlers) as a stream: reading a 4 GB file into a buffer with ' +
        'readFile, or pushing rows from a query cursor into an array.',
      deepAnswer:
        'Concretely: an export endpoint that collects rows in memory and streams them to S3 will look fine at ' +
        '100k rows and kill the pod at 10M rows, because the S3 part-upload rate is the limiter and the ' +
        'difference piles up in the heap. With streams wired correctly the process stays flat at roughly ' +
        'highWaterMark times the number of hops. Use stream.pipeline (or the composed iterator API), which ' +
        'propagates errors and destroys every source — the classic descriptor leak lives in the manual ' +
        '.on("data") version.',
      commonMistakes:
        '- Naming highWaterMark without explaining who reads the false return.\n' +
        '- Claiming async I/O "backpressures automatically" because it is promise-based.\n' +
        '- Forgetting to destroy the read side on error.',
      whyWrong:
        'Unbounded buffering turns a slow consumer into an availability outage for the whole pod, and it is ' +
        'the kind of bug that only appears on the largest customer — the one you cannot afford to fail.',
      followUps:
        '1. How do you size highWaterMark for a network-backed writable?\n' +
        '2. How do you test backpressure in CI?\n' +
        '3. What does an AbortController add that the stream does not already do?',
      exercise:
        'Write a producer/consumer pair where the consumer takes 10 ms per chunk; log bufferLength at every ' +
        'hop with and without honouring drain, and show the RSS difference.',
    },
  },
  {
    slug: 'diag-graceful-shutdown',
    topicSlug: 'node-process-lifecycle',
    categoryKey: 'production',
    levelKey: 'production',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'SIGTERM arrives with 400 in-flight requests. What happens, in order?',
    body: 'Give the sequence, the timeouts, and what you do about jobs that outlive them.',
    concepts: [
      {
        slug: 'stop-accepting-connections',
        name: 'Stop accepting new connections',
        detail: 'server.close() stops the listener; keep-alive sockets must be destroyed or the process waits forever.',
        terms: ['stop accepting', 'server.close', 'drain connections', 'keep-alive sockets'],
        weight: 2,
      },
      {
        slug: 'drain-in-flight-work',
        name: 'Drain in-flight requests and jobs',
        detail: 'Wait for handlers to finish, including acking queue messages.',
        terms: ['in-flight', 'drain', 'finish current requests', 'wait for handlers'],
        weight: 2,
      },
      {
        slug: 'sigterm-sigkill-deadline',
        name: 'The SIGTERM to SIGKILL deadline',
        detail: 'Kubernetes gives terminationGracePeriodSeconds then SIGKILL; your internal timeout must be shorter.',
        terms: ['sigkill', 'grace period', 'timeout then force', 'terminationGracePeriod', '15 seconds'],
      },
      {
        slug: 'deregister-from-lb',
        name: 'Deregister before draining',
        detail: 'Stop routing new traffic (readiness gate, LB target removal) or you drain into a stream of new requests.',
        terms: ['deregister', 'readiness', 'load balancer target', 'health check', 'preStop'],
      },
    ],
    answer: {
      shortAnswer:
        'Deregister from the load balancer, stop accepting, drain in-flight work with a deadline shorter than ' +
        'the platform grace period, then exit 0.',
      idealAnswer:
        'Order matters. A preStop hook or readiness flip removes the pod from rotation, then the drain starts; ' +
        'otherwise the load balancer keeps sending connections to a process that intends to die. server.close ' +
        'stops the listener, but Node keeps idle keep-alive sockets open, so you must also track and destroy ' +
        'them — server.closeAllConnections() (Node 18.2+) or your own socket set. Everything else is a ' +
        'deadline: internal drain timeout at 20-25 s against a 30 s grace period, then exit.',
      deepAnswer:
        'The part teams skip: queue consumers and cron jobs also have to drain, and their work can outlast any ' +
        'reasonable grace period. The right design is a lease with a visibility timeout so the message returns ' +
        'to the queue and is re-delivered to another worker — which requires idempotent handlers. Exit codes ' +
        'matter for the platform: exit 0 on a clean SIGTERM, non-zero only on a real failure, or PM2 and ' +
        'systemd will restart-loop on purpose.',
      commonMistakes:
        '- Calling process.exit() first, truncating responses and leaving messages unacked.\n' +
        '- Only closing the HTTP server and keeping the process alive on keep-alive sockets.\n' +
        '- Setting the internal timeout longer than the platform timeout, so SIGKILL wins.',
      whyWrong:
        'Every deploy becomes a source of dropped requests, 502s at the edge, and duplicate or lost jobs. It ' +
        'also poisons your error budget permanently, so the alert on 500s is never trustworthy enough to page on.',
      followUps:
        '1. How do you prove the drain works?\n' +
        '2. What if a request needs 3 minutes?\n' +
        '3. How do graceful shutdown and idempotency interact?',
      exercise:
        'Add a shutdown sequence to any service you own and verify it under a 30 rps load during rollout: zero ' +
        'connection resets, and prove it with client-side error counts.',
    },
  },
  {
    slug: 'diag-as-is-not-validation',
    topicSlug: 'type-vs-runtime-validation',
    categoryKey: 'why',
    levelKey: 'understanding',
    difficulty: 3,
    isDiagnostic: true,
    stem: 'Why is `as PaymentResponse` not validation?',
    body: 'Say what the compiler actually erases and where the runtime shape comes from.',
    concepts: [
      {
        slug: 'compile-time-erasure',
        name: 'Types are erased at compile time',
        detail: 'Nothing survives into the emitted JS; the cast compiles away to nothing.',
        terms: ['erased', 'erasure', 'compile-time only', 'no runtime check', 'stripped'],
        weight: 2,
      },
      {
        slug: 'boundary-validation',
        name: 'Validate at the boundary',
        detail: 'HTTP bodies, env vars, queues, LLM output — every edge outside your process.',
        terms: ['boundary', 'parse at the edge', 'zod', 'runtime validation', 'schema parse'],
        weight: 2,
      },
      {
        slug: 'untrusted-data-shape',
        name: 'External data can be any shape',
        detail: 'A partner renames a field and the compiler cannot see it.',
        terms: ['untrusted', 'arbitrary json', 'api changes', 'malformed', 'attacker controlled'],
      },
    ],
    answer: {
      shortAnswer:
        'A cast is a note to the compiler, and to the compiler only. It asserts a shape; it does not check one.',
      idealAnswer:
        'TypeScript types do not exist after transpilation, so `as` cannot fail — it just tells the checker to ' +
        'stop arguing, and every downstream property access trusts an assertion made about data that came from ' +
        'outside. Correct code parses at the boundary (Zod, class-validator, io-ts) and keeps types out of the ' +
        'core: the parse returns a typed value, and everything inside is safe because the edge did the work.',
      deepAnswer:
        'The failure is deferred and displaced: the field arrives as undefined, your code reads ' +
        'user.profile.name and throws three layers away from the HTTP handler, in a code path with no record ' +
        'of the original payload. A boundary parse fails once, at the edge, with the payload and the schema ' +
        'error in the log. And the cast is not just weak, it is actively harmful in review: `as` in a diff is ' +
        'a request for a runtime validation conversation, because it tells you somebody expected the data to ' +
        'be wrong.',
      commonMistakes:
        '- "It tells TypeScript the type," as if the type existed at runtime.\n' +
        '- Validating only where a bug already happened.\n' +
        '- Treating interface declarations as a contract the remote server signed.',
      whyWrong:
        'Null-pointer-style crashes in a language without null pointers, 500s whose root cause is a renamed ' +
        'field, and a whole class of injection bugs where a nested optional was quietly trusted.',
      followUps:
        '1. Where is the boundary in a NestJS app — and is the DTO layer really it?\n' +
        '2. What is the difference between unknown and any here?\n' +
        '3. How do you type an LLM tool call?',
      exercise:
        'Take one external API you consume, remove every `as`, make it compile, and show the parse function ' +
        'that replaced them.',
    },
  },
  {
    slug: 'diag-exhaustive-unions',
    topicSlug: 'narrowing-unions',
    categoryKey: 'implementation',
    levelKey: 'implementation',
    difficulty: 4,
    isDiagnostic: true,
    stem: 'Show how a discriminated union plus a `never` exhaustiveness check makes adding a state a build error.',
    body: 'Use a payment intent: created, requires_action, succeeded, failed — and a new one you invent.',
    concepts: [
      {
        slug: 'discriminant-property',
        name: 'A literal discriminant field',
        detail: 'One shared tag key whose literal type narrows the union.',
        terms: ['discriminant', 'tag field', 'literal type', 'kind field'],
        weight: 2,
      },
      {
        slug: 'control-flow-narrowing',
        name: 'Control-flow narrowing',
        detail: 'The checker removes handled variants inside each branch.',
        terms: ['narrowing', 'type guard', 'switch on', 'refines'],
        weight: 2,
      },
      {
        slug: 'never-exhaustiveness',
        name: 'never as an exhaustiveness assertion',
        detail: 'After all variants are handled, the leftover must be never; anything else fails to compile.',
        terms: ['never', 'exhaustive', 'assertNever', 'unhandled variant'],
        weight: 2,
      },
      {
        slug: 'illegal-states-unrepresentable',
        name: 'Illegal states unrepresentable',
        detail: 'No nullable pile of flags; the shape says which fields exist in which state.',
        terms: ['unrepresentable', 'no nullable flags', 'sum type', 'invalid state'],
      },
    ],
    answer: {
      shortAnswer:
        'Model each state as its own object with a literal tag, switch on the tag, and end the switch with an ' +
        'assignment to never so a new variant breaks the build instead of the payment.',
      idealAnswer:
        'type Payment = {kind:"requires_action"; challengeUrl:string} | {kind:"succeeded"; capturedAt:Date} | ' +
        '{kind:"failed"; reason:string}. A helper like `const check: (v: never) => never = (v) => { throw v }` ' +
        'called in the default arm means that adding {kind:"refunded"; ...} produces an error at every switch ' +
        'site that has to handle it. Optional-field modelling gets this exactly backwards: every consumer has ' +
        'to remember which combinations are legal.',
      deepAnswer:
        'The payoff is at the boundary: you parse the webhook into the union once, and every downstream branch ' +
        'is forced by the compiler to acknowledge new states. That is the difference between a partner adding ' +
        'a status being a compile error and being an incident. Limits worth knowing: exhaustiveness holds at ' +
        'compile time only, so the parse is what protects you at runtime, and a default arm that silently ' +
        'swallows unknown variants destroys the entire guarantee.',
      commonMistakes:
        '- One big interface with nullable fields and comments about which combinations are valid.\n' +
        '- A default case that returns silently or logs "unknown" and moves on.\n' +
        '- Claiming the union itself validates anything.',
      whyWrong:
        'Silent defaults are how refund states got treated as success. The compiler was offering to find every ' +
        'call site and the code chose not to listen.',
      followUps:
        '1. Why is the default arm a bug in this pattern?\n' +
        '2. How do you do the same thing in a runtime language, e.g. Python or JS?\n' +
        '3. What is a branded type and when do you need one?',
      exercise:
        'Take one state machine in your codebase, model it as a union, add the never check, and count how many ' +
        'real bugs the compiler found.',
    },
  },
  {
    slug: 'diag-illegal-state-payment',
    topicSlug: 'structural-typing',
    categoryKey: 'implementation',
    levelKey: 'design',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'Model a payment intent so that "succeeded but no captured amount" cannot be written down.',
    body: 'Show the type, the constructor, and the transition. Say what the type cannot protect you from.',
    concepts: [
      {
        slug: 'sum-type-per-state',
        name: 'One variant per legal state',
        detail: 'Each state carries exactly the fields that exist in it.',
        terms: ['sum type', 'union of states', 'per state fields', 'variant'],
        weight: 2,
      },
      {
        slug: 'smart-constructor-invariant',
        name: 'A smart constructor that checks the invariant',
        detail: 'The only way to obtain the type is through a function that parses and rejects.',
        terms: ['smart constructor', 'parse function', 'invariant check', 'make payment', 'return error'],
        weight: 2,
      },
      {
        slug: 'total-transition-functions',
        name: 'Transitions are total functions returning the next state',
        detail: 'confirm(): Succeeded | RequiresAction, so callers must handle both.',
        terms: ['transition function', 'returns a result', 'state machine', 'next state'],
        weight: 2,
      },
      {
        slug: 'branded-nominal-types',
        name: 'Branded types where structure alone is ambiguous',
        detail: 'PaymentId vs OrderId are structurally identical strings without a brand.',
        terms: ['branded type', 'nominal', 'unique symbol', 'opaque type'],
      },
      {
        slug: 'erasure-limits',
        name: 'The type does not protect the boundary',
        detail: 'JSON from a webhook still needs runtime parsing before it may be called a Payment.',
        terms: ['runtime validation', 'boundary parse', 'erasure', 'untrusted json'],
      },
    ],
    answer: {
      shortAnswer:
        'A union with one variant per state, a smart constructor as the only way in, and transitions that return ' +
        'the next state instead of mutating fields.',
      idealAnswer:
        'type Payment = {kind:"requires_confirmation"; clientSecret:string} | ' +
        '{kind:"succeeded"; capturedAmount:number; currency:string; capturedAt:Date} | ' +
        '{kind:"failed"; code:string; reason:string}. There is no nullable capturedAmount to forget, so "succeeded ' +
        'with no amount" is not an existing value. The constructor is what enforces the invariant on the way in, ' +
        'and a transition like capture() returns the union, so every caller handles both outcomes.',
      deepAnswer:
        'Two honest limits. First, structural typing means an unrelated object with the same shape is assignable, ' +
        'so identifiers that must not be confused take a brand: type PaymentId = string & {readonly brand: unique symbol}. ' +
        'Second, none of this survives deserialisation — a webhook payload is untrusted JSON, and the union is a ' +
        'claim about it until a Zod or io-ts parse makes it true. The pattern is therefore parse at the boundary, ' +
        'then let the type make the illegal state unwriteable for the rest of the codebase.',
      commonMistakes:
        '- One interface with optional fields and a comment about which combinations are valid.\n' +
        '- A status enum plus nullable columns, which is the database expressing the same weakness.\n' +
        '- Treating the type as runtime safety.',
      whyWrong:
        'Nullable-everywhere models push the invariant check into every consumer, and one of them will forget. ' +
        'That is how a succeeded payment with a null amount reaches a ledger and becomes an accounting incident.',
      followUps:
        '1. Where does the invariant live at runtime?\n' +
        '2. What breaks when a new state appears?\n' +
        '3. How do you represent a partial refund on top of this?',
      exercise:
        'Write the three-variant Payment type, the parse function that returns a Result, and one transition; then ' +
        'delete every `| null` from the file and see what the compiler complains about.',
    },
  },
  {
    slug: 'diag-mvcc',
    topicSlug: 'mvcc-isolation',
    categoryKey: 'internal',
    levelKey: 'understanding',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'What is MVCC and why does PostgreSQL prefer it to lock-and-modify-in-place?',
    body: 'Name the row version mechanism and what it buys readers and writers.',
    concepts: [
      {
        slug: 'row-versions-xmin-xmax',
        name: 'Row versions with xmin/xmax',
        detail: 'Each tuple carries the transaction id that created it and the one that deleted it.',
        terms: ['xmin', 'xmax', 'tuple version', 'row version', 'dead tuple'],
        weight: 2,
      },
      {
        slug: 'snapshot-visibility',
        name: 'Snapshot visibility rules',
        detail: 'A reader sees versions whose creation is committed and not deleted as of its snapshot.',
        terms: ['snapshot', 'visibility', 'consistent view', 'as of'],
        weight: 2,
      },
      {
        slug: 'readers-do-not-block-writers',
        name: 'Readers never block writers and vice versa',
        detail: 'That is the whole point versus in-place locking.',
        terms: ['readers do not block', 'no read lock', 'concurrent read write'],
        weight: 2,
      },
      {
        slug: 'vacuum-reclaims',
        name: 'Vacuum reclaims the versions',
        detail: 'Old tuples are garbage, so autovacuum has to keep up or bloat follows.',
        terms: ['vacuum', 'bloat', 'reclaim', 'dead tuples grow'],
      },
    ],
    answer: {
      shortAnswer:
        'Instead of overwriting a row, Postgres appends a new version and lets each transaction decide which ' +
        'versions are visible to it, so reads never wait for writes.',
      idealAnswer:
        'UPDATE writes a new tuple version and marks the old one with xmax; a reader whose snapshot began before ' +
        'that transaction cannot see the new one, so it reads the old version without taking a lock that fights ' +
        'the writer. Snapshot isolation gives a stable view for the whole transaction, and serialised isolation ' +
        'adds write-detection on top. The bill for this design is dead tuples: the table grows, indexes point ' +
        'at both versions, and autovacuum becomes a capacity component you must monitor.',
      deepAnswer:
        'The consequences people discover in production: a long-running transaction or an idle-in-transaction ' +
        'session pins the xmin horizon, vacuum cannot remove anything, and a table can double in size in an hour ' +
        'while working set and query plans both degrade. The hot visibility map lets index-only scans skip heap ' +
        'fetches for all-visible pages, which is why vacuum also shows up in your latency graph. Lock-and-modify ' +
        'would avoid bloat and give simpler semantics but would let a 400-second analytical read stall an OLTP ' +
        'write — that trade was made in 1986 and Postgres chose availability.',
      commonMistakes:
        '- Expanding the acronym and stopping.\n' +
        '- Saying "it avoids locks" — row locks still exist for writers.\n' +
        '- Never mentioning the vacuum cost.',
      whyWrong:
        'An engineer who thinks MVCC means "no locking" is surprised by write-write serialisation failures and ' +
        'by a 300 GB table that shrinks to 40 GB after a vacuum — and cannot explain either to the team.',
      followUps:
        '1. What does REPEATABLE READ actually pin?\n' +
        '2. Why does a long transaction cause bloat far away from the busy table?\n' +
        '3. What is the difference between optimistic locking here and row-level locks?',
      exercise:
        'In a sandbox, run a 100k-row update loop with one idle-in-transaction session open; watch n_dead_tup ' +
        'and pg_stat_user_tables, then vacuum and report the size difference.',
    },
  },
  {
    slug: 'diag-update-not-in-place',
    topicSlug: 'postgres-storage',
    categoryKey: 'internal',
    levelKey: 'debugging',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'An UPDATE of one integer column does not touch the original bytes. What happens instead?',
    body: 'Walk from the write through WAL to the page, then to vacuum.',
    concepts: [
      {
        slug: 'new-tuple-append',
        name: 'A new tuple version is written',
        detail: 'The old one becomes dead; both live in the heap until vacuum.',
        terms: ['new tuple', 'appends', 'insert a copy', 'hot field'],
        weight: 2,
      },
      {
        slug: 'wal-before-page',
        name: 'WAL is written first',
        detail: 'The log record lands before the dirty page, so crash recovery replays forward.',
        terms: ['wal', 'write ahead log', 'fsync', 'redo'],
        weight: 2,
      },
      {
        slug: 'index-entries-duplicate',
        name: 'Indexes gain entries for both versions',
        detail: 'An update on an indexed column writes a new index entry too.',
        terms: ['index entry', 'index bloat', 'both versions indexed'],
      },
      {
        slug: 'page-pruning-vacuum',
        name: 'Page pruning and vacuum',
        detail: 'hint bits and pruning remove dead versions when visibility allows.',
        terms: ['page pruning', 'hint bit', 'vacuum', 'visibility map'],
      },
    ],
    answer: {
      shortAnswer:
        'The new row version is inserted into the heap (same page if it fits), the old one is marked dead with ' +
        'xmax, WAL records the change first, and vacuum eventually removes the dead version.',
      idealAnswer:
        'A hot update stays on the same page with a pointer from old to new version, which keeps index entries ' +
        'unchanged for non-indexed columns — that is the HOT optimisation. Everything still has to go through ' +
        'WAL before the heap page is considered durable, so write latency is commit-latency-to-WAL plus ' +
        'checkpoint behaviour, not page rewrite latency.',
      deepAnswer:
        'This design is why the table is bigger than its live data, why an UPDATE of a column in a wide index ' +
        'costs index space twice, and why a high-update-rate table needs an aggressive autovacuum storage ' +
        'fillfactor (say 80) to leave room for HOT chains on the page. It also explains the shape of the classic ' +
        'incident: a batch job updates 10M rows in one transaction, dead tuples pile up faster than vacuum can ' +
        'clear them, the working set exceeds RAM, and every read slows for a day afterwards.',
      commonMistakes:
        '- "Because of locks."\n' +
        '- Claiming the page is rewritten in place.\n' +
        '- Forgetting the WAL and fsync cost.',
      whyWrong:
        'If you believe updates are free in-place edits, you will happily update a 50M-row table inside one ' +
        'transaction and be surprised when the vacuum storm and index bloat cost you a day of latency.',
      followUps:
        '1. What does fillfactor buy you?\n' +
        '2. Why does updating an indexed column cost more?\n' +
        '3. How do you see bloat quantitatively?',
      exercise:
        'Create a table with 1M rows, update one non-indexed column 1M times, and record pg_total_relation_size ' +
        'and pg_stat_user_tables.n_dead_tup at each step; then repeat with fillfactor 70.',
    },
  },
  {
    slug: 'diag-planner-chooses-seqscan',
    topicSlug: 'query-planner-explain',
    categoryKey: 'debugging',
    levelKey: 'debugging',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'You added an index. The planner chose a sequential scan anyway. Give three reasons.',
    body: 'Read the EXPLAIN (ANALYZE, BUFFERS) output like someone who has to fix it.',
    concepts: [
      {
        slug: 'selectivity-cost-model',
        name: 'Cost model and selectivity',
        detail: 'Above a few percent of the table, reading every page sequentially is cheaper than random lookups.',
        terms: ['selectivity', 'cost model', 'planner estimate', 'random io', 'seq io'],
        weight: 2,
      },
      {
        slug: 'stale-statistics',
        name: 'Stale or missing statistics',
        detail: 'Analyzed rows, extended statistics, correlations — ANALYZE fixes estimates the planner got wrong.',
        terms: ['analyze', 'pg_stats', 'stale statistics', 'correlation'],
        weight: 2,
      },
      {
        slug: 'small-table-or-expression',
        name: 'Small table, or an index the predicate cannot use',
        detail: 'Function on the column, wrong collation, type mismatch, leading wildcard, non-matching column order.',
        terms: ['small table', 'expression on column', 'function wrapper', 'collation', 'sargable', 'left wildcard'],
        weight: 2,
      },
      {
        slug: 'explain-analyze-buffers',
        name: 'Diagnose with EXPLAIN ANALYZE BUFFERS',
        detail: 'Compare estimated rows against actual rows to find the bad guess.',
        terms: ['explain analyze', 'buffers', 'estimated rows', 'actual rows'],
      },
    ],
    answer: {
      shortAnswer:
        'The index does not look cheaper: the predicate is not selective enough, the statistics are wrong, or the ' +
        'predicate is not sargable against that index.',
      idealAnswer:
        'Random I/O costs roughly 100x sequential I/O in the planner model, so scanning a few percent of the ' +
        'table through an index beats fetching 30% of it row by row. Second, if ANALYZE has not run since the ' +
        'bulk load, estimates are fiction and the plan follows them. Third, upper(email) = ..., ILIKE with a ' +
        'leading %, a text column compared against a uuid, or a composite index whose leading column is not in ' +
        'the predicate are all indexes that cannot be used at all.',
      deepAnswer:
        'Read estimated versus actual rows first: a 1000x gap points straight at statistics or a join-order ' +
        'problem. Buffers tells you whether you actually avoided I/O; a bitmap heap scan may be the correct ' +
        'answer for moderately selective predicates. The genuinely dangerous version of this incident is a plan ' +
        'that flips after ANALYZE: the query was fine at 10k rows and terrible at 10M, so capacity work has to ' +
        'be rehearsed at production scale, not asserted from a laptop database.',
      commonMistakes:
        '- "The index is broken."\n' +
        '- Adding a second index before reading the estimate gap.\n' +
        '- Testing on a dev database with 200 rows.',
      whyWrong:
        'Index-for-index whack-a-mole grows write cost and planner uncertainty. Meanwhile the actual fix — ' +
        'ANALYZE, or rewriting the predicate — takes seconds and is provable from the plan.',
      followUps:
        '1. What is the difference between Index Scan and Bitmap Heap Scan?\n' +
        '2. When would you use an expression index instead of rewriting the query?\n' +
        '3. How do you keep a plan stable across an autoanalyze?',
      exercise:
        'Take one slow query from your database, paste EXPLAIN (ANALYZE, BUFFERS), and identify the row where ' +
        'estimated and actual diverge most. Fix that, and only that.',
    },
  },
  {
    slug: 'diag-deadlock',
    topicSlug: 'locks-deadlocks',
    categoryKey: 'debugging',
    levelKey: 'debugging',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'Two transactions deadlock every evening. Diagnose and fix without adding a lock.',
    body: 'One updates orders then items by id, the other updates items then orders, in different id orders.',
    concepts: [
      {
        slug: 'lock-ordering',
        name: 'Inconsistent lock acquisition order',
        detail: 'Cycles only appear when two paths take the same locks in different order.',
        terms: ['lock order', 'acquisition order', 'cycle', 'opposite order'],
        weight: 2,
      },
      {
        slug: 'select-for-update',
        name: 'SELECT FOR UPDATE row locks',
        detail: 'Explicit pessimistic locking is where these usually come from.',
        terms: ['select for update', 'row lock', 'pessimistic', 'for update skip locked'],
        weight: 2,
      },
      {
        slug: 'sort-before-update',
        name: 'Deterministic ordering of the work set',
        detail: 'Sort ids before updating so every path takes locks in the same order.',
        terms: ['sort ids', 'consistent order', 'order by id'],
        weight: 2,
      },
      {
        slug: 'retry-with-backoff',
        name: 'Retry the deadlock victim with backoff',
        detail: 'Postgres aborts one transaction; the retry is the fix, not an option.',
        terms: ['retry', 'backoff', 'deadlock_detected', '40001', '40P01'],
      },
    ],
    answer: {
      shortAnswer:
        'Two paths lock the same rows in opposite order. Impose one global lock order — sort the ids — and make ' +
        'the caller retry on 40P01 with backoff.',
      idealAnswer:
        'Deadlocks are not bugs in Postgres; it detects the cycle and aborts one transaction, which is the mercy. ' +
        'The design fix is ordering: every code path touches the same rows in the same sequence, or the same ' +
        'order within a table when several tables are involved. Retry is mandatory regardless, because the ' +
        'transaction that got killed has to run.',
      deepAnswer:
        'Deadlock details go to the log with the offending statements, so the diagnosis is a grep, not a guess. ' +
        'Watch the pathological cases: batch jobs that lock thousands of rows in one transaction, key-share ' +
        'locks from unique-constraint checks, and advisory locks used to serialise a business entity. When you ' +
        'cannot control order, take an advisory lock per account or aggregate key at the start, which converts ' +
        'a cycle into a queue with predictable wait time. Optimistic locking moves the conflict to a version ' +
        'check and a retry, which is often the better trade under contention.',
      commonMistakes:
        '- "Add a lock" or "increase lock_timeout" as if either removed the cycle.\n' +
        '- Treating retries as a bug rather than part of the design.\n' +
        '- Shrinking the transaction nobody measured.',
      whyWrong:
        'Un-fixed deadlocks under load are a partial outage that looks random: the same nightly job fails 3% of ' +
        'rows and the reconciliation is silently incomplete.',
      followUps:
        '1. Why does retry need jitter?\n' +
        '2. What is the difference between a deadlock and a lock wait timeout?\n' +
        '3. When does serializable isolation make this worse?',
      exercise:
        'Reproduce a deadlock with two psql sessions on a 2-row table, read the log entry, then fix it with ' +
        'ordering and prove zero deadlocks over 1,000 runs.',
    },
  },
  {
    slug: 'diag-offset-slow',
    topicSlug: 'keyset-pagination',
    categoryKey: 'performance',
    levelKey: 'implementation',
    difficulty: 4,
    isDiagnostic: true,
    stem: 'LIMIT 10 OFFSET 500000 takes 4 seconds. Why, and what replaces it?',
    body: 'Explain what the engine does with those 500,000 rows.',
    concepts: [
      {
        slug: 'offset-scans-and-discards',
        name: 'OFFSET materialises and discards rows',
        detail: 'The engine still reads and sorts 500,010 rows to hand you 10.',
        terms: ['scans and discards', 'reads all rows', 'offset counts rows', 'throws away'],
        weight: 2,
      },
      {
        slug: 'keyset-seek',
        name: 'Keyset / seek pagination',
        detail: 'Filter on the last seen sort key and index-range into the next page.',
        terms: ['keyset', 'seek', 'cursor', 'where created_at <', 'after id'],
        weight: 2,
      },
      {
        slug: 'covering-index-tiebreak',
        name: 'Index on the sort columns, with a unique tiebreaker',
        detail: 'Deterministic ordering needs a tiebreaker or pages skip and repeat rows.',
        terms: ['covering index', 'composite index', 'tiebreaker', 'deterministic order', 'stable sort'],
      },
      {
        slug: 'deferred-join',
        name: 'Deferred join as a partial mitigation',
        detail: 'Select ids in the index first, then join back for the wide rows.',
        terms: ['deferred join', 'covering subquery', 'index only scan'],
      },
    ],
    answer: {
      shortAnswer:
        'OFFSET is a counter, not a seek: the database walks and discards half a million rows to return ten. Use ' +
        'a cursor on the sort key.',
      idealAnswer:
        'Replace page numbers with WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 10 ' +
        'backed by a matching composite index, and hand the client a cursor. Cost is now an index range scan ' +
        'proportional to the page size, not the offset. If you must keep page numbers, a deferred join over an ' +
        'index-only scan helps the wide-row case but keeps the linear cost.',
      deepAnswer:
        'The detail people miss is stability: the sort key must be unique per row, which is why id rides along in ' +
        'the cursor — otherwise two rows with the same timestamp land on both sides of a page boundary and the ' +
        'user sees a row twice or never. Encoding the cursor as an opaque base64 of the tuple also lets you ' +
        'change the underlying ordering without breaking clients. The honest downside of keyset is "jump to page ' +
        '200" becoming impossible, which is why the right product answer is usually infinite scroll plus filters.',
      commonMistakes:
        '- "Add an index on id" — the scan cost is not the problem.\n' +
        '- Paginating on a non-unique column.\n' +
        '- Calling it a cursor while still sending an offset.',
      whyWrong:
        'Deep offsets are a load amplifier: every page request costs the same as reading the whole table prefix, ' +
        'so a crawler walking pages becomes a self-inflicted DoS.',
      followUps:
        '1. What happens to the cursor when a row is deleted mid-scroll?\n' +
        '2. How do you sort by a column the index does not have?\n' +
        '3. Why is OFFSET still fine at page 3?',
      exercise:
        'Load 1M rows, time LIMIT 10 OFFSET 500000, implement keyset pagination, and report the ratio. Then ' +
        'break your own cursor by deleting the anchor row and fix it.',
    },
  },
  {
    slug: 'diag-cache-stampede',
    topicSlug: 'cache-stampede',
    categoryKey: 'production',
    levelKey: 'production',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'A hot key expires and 800 requests hit the primary at once. Give three mitigations with trade-offs.',
    body: 'Name what each one costs and which failure it actually prevents.',
    concepts: [
      {
        slug: 'ttl-jitter',
        name: 'TTL jitter',
        detail: 'Spread expiry so keys do not all die at the same second.',
        terms: ['jitter', 'random ttl', 'spread expiry'],
        weight: 2,
      },
      {
        slug: 'singleflight-coalescing',
        name: 'Request coalescing / singleflight',
        detail: 'One caller does the work, everyone else awaits the same promise.',
        terms: ['singleflight', 'coalesc', 'request dedup', 'one caller', 'shared promise', 'mutex per key'],
        weight: 2,
      },
      {
        slug: 'logical-expiry-serve-stale',
        name: 'Logical expiry with serve-stale-while-revalidate',
        detail: 'Soft TTL returns the old value immediately and refreshes in the background.',
        terms: ['logical expiry', 'stale while revalidate', 'soft ttl', 'background refresh'],
        weight: 2,
      },
      {
        slug: 'lock-based-refresh',
        name: 'Distributed refresh lock',
        detail: 'A SET NX lock elects one refresher; needs a timeout and a fallback path.',
        terms: ['refresh lock', 'set nx', 'leader election', 'distributed lock refresh'],
      },
    ],
    answer: {
      shortAnswer:
        'Jitter the TTLs, collapse concurrent misses into one loader, and let slightly stale data answer while ' +
        'a refresh happens in the background.',
      idealAnswer:
        'Jitter removes synchronised expiry across many keys — cheap, and it fixes the thundering herd at ' +
        'midnight, but not a single hot key. Coalescing (a process-local Map of in-flight promises, or Redis ' +
        'SET NX across pods) means the true cost after a miss is one query, not N. Logical expiry stores ' +
        'softTtl/hardTtl with the value: after softTtl you still return the cached value and trigger an async ' +
        'refresh, so the user never pays for the miss and only one writer touches the database.',
      deepAnswer:
        'The failure nobody designs for is the cascade when the cache is down rather than cold: every read ' +
        'becomes a database read, and connection-pool exhaustion turns one slow table into an outage for every ' +
        'endpoint. So the mitigation set has to include a bounded queue for refreshers, a stale-on-error policy ' +
        'that keeps the old value when the loader throws, and a timeout on the coalesced call so a stuck loader ' +
        'cannot hold every waiter. Numbers: 800 concurrent misses on a 40 ms query is 32 seconds of database ' +
        'work; coalescing makes it 40 ms.',
      commonMistakes:
        '- "Increase the TTL" — it postpones the event and makes the miss bigger.\n' +
        '- Adding a distributed lock with no timeout, converting a stampede into a deadlock.\n' +
        '- Claiming cache-aside without saying who writes back.',
      whyWrong:
        'A stampede is a self-inflicted availability event that recurs on a schedule. It is also the classic ' +
        'second fault: the cache eviction you shipped to fix staleness creates the outage.',
      followUps:
        '1. What is the memory cost of serve-stale?\n' +
        '2. How do you pre-warm after deploy?\n' +
        '3. When is negative caching the right answer?',
      exercise:
        'Reproduce a stampede with 500 concurrent requests against a 50 ms fake query, implement coalescing, ' +
        'and show downstream call count go from 500 to 1.',
    },
  },
  {
    slug: 'diag-redis-gone',
    topicSlug: 'redis-failure-modes',
    categoryKey: 'architecture',
    levelKey: 'design',
    difficulty: 6,
    isDiagnostic: true,
    stem: 'Redis is gone. What breaks in your service, and what should it do?',
    body: 'Answer for cache, rate limiting, sessions and queues. Fail-open or fail-closed, and why.',
    concepts: [
      {
        slug: 'fail-open-vs-closed',
        name: 'Explicit fail-open versus fail-closed per function',
        detail: 'Cache should fail open into the database with a bound; rate limiting should fail closed on money paths.',
        terms: ['fail open', 'fail closed', 'per feature policy', 'degrade'],
        weight: 2,
      },
      {
        slug: 'db-load-amplification',
        name: 'Load amplification on the primary',
        detail: 'Cache-down means every read hits Postgres; the pool is the fuse.',
        terms: ['amplification', 'all reads hit db', 'connection pool', 'cache miss storm'],
        weight: 2,
      },
      {
        slug: 'circuit-breaker-bulkhead',
        name: 'Circuit breaker and bounded fallback',
        detail: 'Open the circuit, cap concurrency to the fallback, shed load rather than queue it.',
        terms: ['circuit breaker', 'bulkhead', 'load shedding', 'fallback queue limit'],
        weight: 2,
      },
      {
        slug: 'degradation-plan',
        name: 'Written degradation plan with a test',
        detail: 'Which features you turn off, in what order, and who decides.',
        terms: ['degradation plan', 'feature flag off', 'runbook', 'shed features'],
      },
    ],
    answer: {
      shortAnswer:
        'Decide per function: cache should degrade to the database with bounded concurrency, rate limits on ' +
        'money endpoints should fail closed, and sessions should fall back to token verification.',
      idealAnswer:
        'The failure mode that gets you is not the missing cache, it is the load that arrives when the cache ' +
        'stops absorbing it — usually 20-100x the read rate hitting a connection pool sized for the cached ' +
        'world. So the mitigation is a circuit breaker in front of Redis plus a semaphore in front of the ' +
        'fallback path: shed requests with 503 and Retry-After instead of queueing them until everything times ' +
        'out. Rate limiting with no store is a decision, not an accident: allow-list small, fail closed on ' +
        'checkout, fail open on read-only pages.',
      deepAnswer:
        'The architecture answer is that Redis should not be a single point of correctness. Sessions belong in ' +
        'self-verifiable tokens with a server-side revocation list that is allowed to be stale; queues need a '
        + 'durable broker with at-least-once delivery, so Redis being down delays rather than loses; and caches ' +
        'must be provably optional. Then run the game day: kill Redis under load and watch for the three ' +
        'tells — pool exhaustion, retry storms, and health checks failing for the wrong reason.',
      commonMistakes:
        '- "Use Redis Sentinel" — that is about failover, not about your behaviour during it.\n' +
        '- Falling back to the database with no concurrency bound.\n' +
        '- Treating one policy (fail open) as universal.',
      whyWrong:
        'A dependency treated as mandatory but not designed for is an outage you schedule yourself. Every retry ' +
        'without a budget multiplies the load at exactly the moment the system cannot take it.',
      followUps:
        '1. Which of your Redis uses would survive a 5-minute partition?\n' +
        '2. How long should the breaker stay open?\n' +
        '3. What is the fallback for a distributed lock?',
      exercise:
        'Write the degradation table for one service you own: function, Redis dependency, behaviour when down, ' +
        'bound, and the metric that proves it. Then test one row of it.',
    },
  },
  {
    slug: 'diag-distributed-lock',
    topicSlug: 'distributed-locks',
    categoryKey: 'security',
    levelKey: 'judgment',
    difficulty: 6,
    isDiagnostic: true,
    stem: 'Make a distributed lock correct. What does SET NX PX not give you?',
    body: 'Assume a process can be paused for longer than the TTL — GC, VM steal, network partition.',
    concepts: [
      {
        slug: 'atomic-set-nx-px',
        name: 'Atomic acquire with expiry',
        detail: 'SET key value NX PX ms is the primitive; release must also be atomic via Lua comparing value.',
        terms: ['set nx px', 'atomic acquire', 'lua release', 'compare owner'],
        weight: 2,
      },
      {
        slug: 'fencing-token',
        name: 'Fencing token',
        detail: 'A monotonic number the resource validates so a stale holder is rejected.',
        terms: ['fencing token', 'monotonic', 'fence', 'reject stale'],
        weight: 2,
      },
      {
        slug: 'lease-vs-work-duration',
        name: 'Lease duration versus work duration',
        detail: 'If the work can outlive the TTL the lock is a lie; renew, or bound the work.',
        terms: ['lease ttl', 'work longer than ttl', 'renew', 'watchdog', 'bound duration'],
        weight: 2,
      },
      {
        slug: 'pause-and-clock-skew',
        name: 'Process pause and clock skew',
        detail: 'A 40-second GC pause or a frozen VM means two holders; Redlock depends on clocks.',
        terms: ['gc pause', 'clock skew', 'process freeze', 'two holders', 'redlock criticism'],
      },
    ],
    answer: {
      shortAnswer:
        'SET NX PX gives mutual exclusion only while every holder behaves. Add a fencing token the resource ' +
        'checks, and a renewal that bounds how long a stale holder can act.',
      idealAnswer:
        'The unsafe sequence is: A takes the lock, stalls past TTL, B takes it, A wakes and writes. A value ' +
        'check on release does not help — the write already happened. Correctness therefore moves to the ' +
        'resource: every write carries the monotonic lock token and the resource rejects anything older. ' +
        'Postgres can do that with a version column or an advisory lock; that is also why "use Redis for ' +
        'coordination" is usually the wrong instinct when a database constraint would do it.',
      deepAnswer:
        'The lease model also has to be explicit about the failure it accepts: lock loss is possible, so the ' +
        'handler must be idempotent and its effects reversible or versioned. Redlock tries to raise the odds ' +
        'with quorum instances, and its critics (Martin Kleppmann among them) are right that it does not buy ' +
        'correctness under pause or clock skew — it buys availability. Where the invariant is "exactly one ' +
        'writer per partition", the honest designs are a database row lock, a single-partition Kafka consumer, ' +
        'or a lease held in the storage system that already validates writes.',
      commonMistakes:
        '- "SETNX is enough."\n' +
        '- Releasing with DEL without checking ownership — you delete someone else lock.\n' +
        '- Long TTLs to avoid renewal, which trades a stall for a permanent lockout.',
      whyWrong:
        'Two writers holding the same lease is how double charges, duplicate payouts and corrupt aggregate state ' +
        'ship. It is invisible until the reconciliation report, and it is the one bug class that cannot be ' +
        'fixed by adding retries.',
      followUps:
        '1. Where does the fencing token get validated?\n' +
        '2. What is the difference between a lock and a lease?\n' +
        '3. What operation could replace the lock entirely?',
      exercise:
        'Write the adversarial test first: holder A pauses 2x the TTL, resumes and attempts a write; prove the ' +
        'resource rejects it by token, not by luck.',
    },
  },
  {
    slug: 'diag-500-blast-radius',
    topicSlug: 'idempotency-retries',
    categoryKey: 'production',
    levelKey: 'production',
    difficulty: 6,
    isDiagnostic: true,
    stem: 'Your payment endpoint returns 500. Type, duration, blast radius — and what you alert on.',
    body: 'Assume the client is a mobile app with automatic retry on failure.',
    concepts: [
      {
        slug: 'retry-safety-and-idempotency-key',
        name: 'Retry safety depends on an idempotency key',
        detail: 'Without one, every client retry is a second charge.',
        terms: ['idempotency key', 'retry safety', 'duplicate charge', 'dedupe key'],
        weight: 2,
      },
      {
        slug: 'partial-failure',
        name: 'Partial failure and unknown state',
        detail: 'A 500 after the gateway accepted means you do not know whether money moved.',
        terms: ['partial failure', 'unknown state', 'in doubt', 'reconcile'],
        weight: 2,
      },
      {
        slug: 'error-contract',
        name: 'A typed error contract',
        detail: 'Retryable versus terminal codes, plus a correlation id the client can quote.',
        terms: ['error contract', 'retryable code', 'problem details', 'correlation id', 'request id'],
      },
      {
        slug: 'alert-on-rate-not-count',
        name: 'Alert on error rate and affected users',
        detail: 'One 500 is noise; 2% over 5 minutes on a money path is a page.',
        terms: ['error rate', 'alert on rate', 'slo burn', 'affected users', 'window'],
      },
    ],
    answer: {
      shortAnswer:
        'It is a correctness incident, not just an availability one: with an auto-retrying client and no ' +
        'idempotency key, a 500 becomes duplicate charges. Alert on error rate against an SLO, not on count.',
      idealAnswer:
        'Type: a 500 on a write path with side effects. Duration: from the first bad deploy until the client ' +
        'gives up — and clients retry, so the tail is minutes, not seconds. Blast radius: every session that ' +
        'hit the endpoint during the window, multiplied by their retry count, against a gateway that may have ' +
        'already captured funds. So the response has two tracks: stop the bleeding (rollback or flag off) and ' +
        'find out what actually charged (reconcile against the gateway report).',
      deepAnswer:
        'The design lessons that come out of this: 5xx must never be returned for a state you have not settled ' +
        '— return 202 with a status endpoint instead; retries need a key the server stores and replays the same ' +
        'response for; and the alert should be a burn rate over two windows, fast and slow, so you get paged ' +
        'when 3% of payments fail for 5 minutes and not when one user has a bad day. Count-based alerting also ' +
        'fails the other way: it pages on traffic spikes and sleeps through low-traffic failures.',
      commonMistakes:
        '- "Return 500 with a message" and let the client show it.\n' +
        '- Treating a payment 500 as an availability blip.\n' +
        '- Alerting on raw 500 counts.',
      whyWrong:
        'Duplicates found in next-day reconciliation are the most expensive possible discovery path: refund ' +
        'work, support load, and a trust cost with the payment processor attached.',
      followUps:
        '1. What should the response body contain?\n' +
        '2. How do you tell the client to retry safely?\n' +
        '3. What is your paged threshold and why?',
      exercise:
        'Write the error contract for one money endpoint you own: every failure mode, its code, whether it is ' +
        'retryable, and what the client does. Then check whether the code matches.',
    },
  },
  {
    slug: 'diag-idempotent-charge',
    topicSlug: 'idempotency-retries',
    categoryKey: 'implementation',
    levelKey: 'implementation',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'POST is non-idempotent. Make charging a card retry-safe.',
    body: 'Give the storage, the key scope, and the race you have to close.',
    concepts: [
      {
        slug: 'idempotency-token-store',
        name: 'Client-supplied key plus a server-side store',
        detail: 'Persist key, request hash and response; replay the stored response.',
        terms: ['idempotency token', 'key store', 'store and replay', 'request hash'],
        weight: 2,
      },
      {
        slug: 'unique-constraint-race',
        name: 'Unique constraint closes the race',
        detail: 'Two concurrent requests with the same key: the insert that wins proceeds, the other waits or replays.',
        terms: ['unique constraint', 'unique index', 'race', 'conflict', 'insert on conflict'],
        weight: 2,
      },
      {
        slug: 'at-least-once-delivery',
        name: 'Design for at-least-once, not exactly-once',
        detail: 'The network guarantees duplicates; the server absorbs them.',
        terms: ['at least once', 'duplicates expected', 'retry arrives'],
      },
      {
        slug: 'key-scope-and-expiry',
        name: 'Key scope, mismatch and expiry',
        detail: 'Same key with a different body is an error; keys expire after a retention window.',
        terms: ['key scope', 'per user key', '422 mismatch', 'retention', 'expiry'],
      },
    ],
    answer: {
      shortAnswer:
        'Accept an Idempotency-Key header, store key plus request hash plus the eventual response, and replay ' +
        'the stored response for a repeat. Enforce uniqueness in the database.',
      idealAnswer:
        'The row is inserted before the gateway call, in progress state, and the unique index is what makes two ' +
        'simultaneous requests pick one winner. The loser either waits on the winner or returns 409 — never ' +
        'starts its own charge. On completion the stored response is written, so a retry days later gets the ' +
        'same answer it got the first time. Reuse of a key with a different body must be rejected as a client ' +
        'bug, not silently honoured.',
      deepAnswer:
        'The subtle part is the crash between "charge accepted by the gateway" and "response stored": the record ' +
        'is still in progress, so the correct replay behaviour is to ask the gateway for the outcome by its ' +
        'reference id before doing anything else. Scope keys to the user and endpoint, keep a retention window ' +
        'longer than the client retry horizon, and log the key on every line so the audit question — "was this ' +
        'charged once?" — has an answer that is not a guess.',
      commonMistakes:
        '- "Check if already charged" with a read-then-write and no constraint.\n' +
        '- Storing only the key, so a replay has no response to return.\n' +
        '- Letting the key live forever in a table nobody prunes.',
      whyWrong:
        'The read-then-write version works perfectly in tests and fails under exactly the condition it exists ' +
        'for: two retries arriving together because the client timed out while the first was still running.',
      followUps:
        '1. Where does the key live during the gateway call?\n' +
        '2. What do you return while the first request is still running?\n' +
        '3. How do you test this without a real gateway?',
      exercise:
        'Implement it with a fake gateway that has 30% latency, then hammer it with 50 concurrent requests ' +
        'sharing one key and prove exactly one charge.',
    },
  },
  {
    slug: 'diag-cache-control-session',
    topicSlug: 'http-caching',
    categoryKey: 'why',
    levelKey: 'understanding',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'Why `Cache-Control: private, max-age=0, must-revalidate` on a session page — and is it the same as no-store?',
    body: 'Say who may hold a copy and what happens on back navigation.',
    concepts: [
      {
        slug: 'shared-vs-private-cache',
        name: 'private marks it non-shareable',
        detail: 'A CDN or proxy must not serve one user response to another.',
        terms: ['private directive', 'shared cache', 'cdn caching', 'proxy cache'],
        weight: 2,
      },
      {
        slug: 'revalidate-on-back-nav',
        name: 'max-age=0 plus must-revalidate forces a check',
        detail: 'The copy may stay for layout but freshness must be reconfirmed — back button shows current state.',
        terms: ['must-revalidate', 'max-age=0', 'revalidate', 'conditional get', 'etag', '304'],
        weight: 2,
      },
      {
        slug: 'no-store-difference',
        name: 'no-store is a different guarantee',
        detail: 'no-store forbids writing any copy at all, including the browser disk cache.',
        terms: ['no-store', 'not cached at all', 'different from no-cache', 'nothing stored'],
        weight: 2,
      },
      {
        slug: 'authorization-leakage',
        name: 'The risk being managed is data leakage',
        detail: 'A cached authenticated page behind a shared cache exposes one user data to another.',
        terms: ['authorization leakage', 'data leak', 'cache poisoning', 'vary'],
      },
    ],
    answer: {
      shortAnswer:
        'It keeps the page out of shared caches while letting the browser revalidate, so back navigation never ' +
        'shows stale state and no CDN can serve one user to another. no-store is stricter and forbids any copy.',
      idealAnswer:
        'private restricts storage to the end browser. max-age=0 with must-revalidate means the browser may keep ' +
        'the document for rendering but must ask the server before using it, which is exactly what you want for ' +
        'a page whose contents change with session state. no-store forbids storing anything, so the back button ' +
        'refetches and re-renders from scratch — better for a payment confirmation, worse for perceived speed.',
      deepAnswer:
        'The pair that actually prevents the leak is Cache-Control: private plus a correct Vary on Cookie / ' +
        'Authorization when a shared cache cannot be ruled out — a middlebox that ignores Vary on an ' +
        'authenticated response is a cache-poisoning incident waiting to happen. The other half is that an ' +
        'unauthenticated CDN edge that caches an HTML document containing a CSRF token or a name has now ' +
        'published it. Rule of thumb: HTML responses that vary by user are never cacheable by anything except ' +
        'the browser; assets that vary by user are versioned into the URL instead.',
      commonMistakes:
        '- "no-store is the same thing."\n' +
        '- Forgetting that a shared cache sits between the user and you in production but not in dev.\n' +
        '- Setting it on the API and not the HTML shell, or the reverse.',
      whyWrong:
        'Wrong-direction caching produces two distinct incidents: stale session state that looks like a data ' +
        'corruption bug, and cross-user disclosure, which is a security report with a deadline.',
      followUps:
        '1. What does Vary do here?\n' +
        '2. Which layers do you test this through?\n' +
        '3. What is stale-while-revalidate good for?',
      exercise:
        'Put your app behind a caching proxy, request an authenticated page twice with different users, and ' +
        'observe whether the second response is the first user. Then fix the headers.',
    },
  },
  {
    slug: 'diag-bola',
    topicSlug: 'authn-authz-sessions-tokens',
    categoryKey: 'security',
    levelKey: 'debugging',
    difficulty: 5,
    isDiagnostic: true,
    stem: 'GET /orders/:id sits behind a valid JWT. What is still broken and how do you fix it properly?',
    body: 'Name the vulnerability class and the layer where the fix belongs.',
    concepts: [
      {
        slug: 'object-level-authorization',
        name: 'Object-level authorization (BOLA/IDOR)',
        detail: 'Authentication proves who; it says nothing about which rows.',
        terms: ['bola', 'idor', 'object level authorization', 'broken access control'],
        weight: 2,
      },
      {
        slug: 'ownership-tenant-check',
        name: 'Ownership and tenant scoping in the query',
        detail: 'WHERE id = $1 AND userId = $2 / tenantId, not an if after the fetch.',
        terms: ['ownership check', 'tenant scope', 'where user id', 'scoped query'],
        weight: 2,
      },
      {
        slug: 'guessable-identifiers',
        name: 'Enumerability of identifiers',
        detail: 'Sequential ids make the whole table a loop away; uuids reduce noise, they do not authorize.',
        terms: ['sequential id', 'guessable', 'enumerat', 'uuid', 'opaque id'],
      },
      {
        slug: 'central-policy-check',
        name: 'A central policy layer, not scattered ifs',
        detail: 'One place that answers "may this subject read this object", so new endpoints inherit it.',
        terms: ['policy engine', 'central authorization', 'guard', 'middleware check', 'ability'],
      },
    ],
    answer: {
      shortAnswer:
        'Authentication is not authorization. Every object fetch must be scoped to the caller, enforced in one ' +
        'place, and tested with a second valid account.',
      idealAnswer:
        'The fix belongs in the data access, not the handler: the query carries the owner predicate, so a ' +
        'forgetful developer cannot produce a leak. For multi-tenant systems that predicate includes tenant id, ' +
        'and the cleanest enforcement is a row-level-security policy in Postgres, which survives application ' +
        'bugs. Random ids lower the scan noise but are not a control — a leaked uuid is still a leaked record.',
      deepAnswer:
        'This is OWASP API1 (Broken Object Level Authorization) and it is the most common real-world API ' +
        'vulnerability precisely because every framework makes authentication easy. Detection: a test that ' +
        'registers two users, has A create a resource, and asserts B gets 404 — not 403, which leaks existence. ' +
        'Then grep the routes for parameter reads that reach a repository without a scoped predicate, and put ' +
        'that grep in CI so the next endpoint cannot regress it.',
      commonMistakes:
        '- "JWT already authenticates them."\n' +
        '- Trusting the client to send only its own ids.\n' +
        '- Treating unguessable ids as the control.',
      whyWrong:
        'One leaked endpoint is a full-table dump with a script, and the audit trail shows you serving it ' +
        'willingly for months. It is also the bug that turns a small XSS into a data breach.',
      followUps:
        '1. 404 or 403, and why does it matter?\n' +
        '2. Where do admin overrides live?\n' +
        '3. How do you test this automatically?',
      exercise:
        'Add the two-user authorization test to one endpoint you own, then run it across every route that takes ' +
        'an id and report how many fail.',
    },
  },
  {
    slug: 'diag-refresh-token-theft',
    topicSlug: 'authn-authz-sessions-tokens',
    categoryKey: 'internal',
    levelKey: 'production',
    difficulty: 6,
    isDiagnostic: true,
    stem: 'A refresh token is stolen. What does rotation do about it, and how do you know it worked?',
    body: 'Cover storage at rest, reuse detection, and revocation scope.',
    concepts: [
      {
        slug: 'hash-at-rest',
        name: 'Tokens hashed at rest',
        detail: 'A dump of the table must not be a list of usable tokens.',
        terms: ['hash at rest', 'sha256', 'plaintext token', 'digest'],
        weight: 2,
      },
      {
        slug: 'rotation-and-reuse-detection',
        name: 'Rotation with reuse detection',
        detail: 'Each refresh issues a new token and invalidates the old; an old one presented again is theft.',
        terms: ['rotation', 'one-time use', 'reuse detection', 'invalidated old token', 'replacedby'],
        weight: 2,
      },
      {
        slug: 'family-revocation',
        name: 'Family/session-wide revocation',
        detail: 'On reuse, revoke the whole lineage, forcing re-login rather than a cat-and-mouse.',
        terms: ['token family', 'revoke family', 'revoke all sessions', 'lineage'],
        weight: 2,
      },
      {
        slug: 'cookie-storage-httponly',
        name: 'Transport and storage hardening',
        detail: 'httpOnly, Secure, SameSite cookies, and a short access TTL so XSS cannot mint sessions.',
        terms: ['httponly', 'samesite', 'secure cookie', 'short access ttl', 'xss'],
      },
    ],
    answer: {
      shortAnswer:
        'Rotate on every use so a stolen token is single-use, and treat any replay of an already-rotated token ' +
        'as proof of theft: revoke the whole family and force re-authentication.',
      idealAnswer:
        'Store a hash of the opaque token, never the token. On refresh, find by hash, mark it replaced, issue a ' +
        'successor. If a token arrives that is already marked replaced, the legitimate client cannot be the one ' +
        'presenting it — an attacker has a copy — so revoke everything descended from it, not just that token. ' +
        'Short access TTLs limit the window per request but do nothing about a refresh token, which is why the ' +
        'detection design matters more than the expiry.',
      deepAnswer:
        'Operational details decide whether this works: record the reuse event with user id, timestamp and the ' +
        'two user agents (the original and the thief), because that pair is the signal for a support conversation ' +
        'and for a possible account-takeover pattern across users. Bind tokens to a device or fingerprint if you ' +
        'want higher confidence, and accept the support cost. Then verify with a test: refresh twice with the ' +
        'same token and assert the second call revokes the lineage and cannot authenticate either session.',
      commonMistakes:
        '- "Short access token TTL" as the answer to a refresh-token theft.\n' +
        '- Rotating but keeping the old token valid for grace.\n' +
        '- Storing tokens in plaintext "so we can look them up".',
      whyWrong:
        'A grace period is an attacker session that quietly coexists with the real one for the whole grace. And ' +
        'a plaintext token table is a breach multiplier: the dump is the session list.',
      followUps:
        '1. What is the difference between revoking a token and revoking a family?\n' +
        '2. Where does the user id go in the token?\n' +
        '3. How do you handle two legitimate devices?',
      exercise:
        'Write the reuse-detection test against the service you own and make it pass; then find every place a ' +
        'token is logged and delete it.',
    },
  },
  {
    slug: 'diag-prompt-injection-tools',
    topicSlug: 'prompt-injection-and-exfiltration',
    categoryKey: 'security',
    levelKey: 'judgment',
    difficulty: 6,
    isDiagnostic: true,
    stem: 'Untrusted web content reaches an agent that has a filesystem tool. Where is the boundary?',
    body: 'Say what a system prompt can and cannot do, and what actually stops exfiltration.',
    concepts: [
      {
        slug: 'untrusted-content-boundary',
        name: 'Data is never an instruction',
        detail: 'Retrieved or user-fetched text is content; only the developer channel may carry instructions.',
        terms: ['untrusted content', 'data vs instruction', 'instruction hierarchy', 'content boundary'],
        weight: 2,
      },
      {
        slug: 'tool-allowlist-least-privilege',
        name: 'Tool allowlist and least privilege',
        detail: 'Scope the tool: read-only, per-directory, no network egress, no secrets in the mount.',
        terms: ['tool allowlist', 'least privilege', 'scoped filesystem', 'no network egress', 'sandbox'],
        weight: 2,
      },
      {
        slug: 'human-confirmation',
        name: 'Confirmation on irreversible actions',
        detail: 'Write, send, purchase and delete need a human gate.',
        terms: ['human in the loop', 'confirm', 'approval gate', 'irreversible action'],
        weight: 2,
      },
      {
        slug: 'output-and-egress-validation',
        name: 'Output and egress validation',
        detail: 'Validate what leaves: URL allowlist, no secrets in arguments, size and format limits.',
        terms: ['output validation', 'egress allowlist', 'url allowlist', 'secret scrubbing', 'argument validation'],
      },
    ],
    answer: {
      shortAnswer:
        'The boundary is capability, not instruction. A prompt that says "ignore previous instructions" is ' +
        'stopped by having no dangerous tool available, not by asking nicely.',
      idealAnswer:
        'System-prompt text is not a security control: it is the same channel as the injected content, so a ' +
        'sufficiently worded instruction competes with your rules. The controls are architectural — the model ' +
        'cannot read outside a mounted directory, cannot reach the network, cannot spend money, and every ' +
        'irreversible action needs a human. Treat the model as an untrusted caller of your tools and validate ' +
        'each argument as you would from a public endpoint.',
      deepAnswer:
        'The realistic exfiltration paths are the boring ones: a tool that accepts an arbitrary URL and posts ' +
        'file contents, a "summarize this and email it" chain, or error text that echoes a secret into a ' +
        'log shipped to a third party. Defence in depth therefore includes a egress allowlist at the network ' +
        'layer, not just in the tool schema, plus per-tenant budgets so an injected loop burns cents instead of ' +
        'thousands of dollars. And test it: keep a corpus of injected documents and run it against your agent ' +
        'as a regression suite, because model upgrades change susceptibility.',
      commonMistakes:
        '- "Add a system prompt saying don\'t."\n' +
        '- Giving the agent a general-purpose HTTP tool "for convenience".\n' +
        '- Treating the tool description as a sandbox.',
      whyWrong:
        'Prompt injection is not a model bug you wait out; it is the intended consequence of a machine accepting ' +
        'instructions from data. An agent with a filesystem and network tool is a remote code execution primitive ' +
        'wrapped in a chat box.',
      followUps:
        '1. Which of your tools can cause irreversible harm?\n' +
        '2. How do you prove a fix?\n' +
        '3. What changes when a second agent consumes the first output?',
      exercise:
        'Write three injection payloads against your own agent that would exfiltrate a file, run them, and fix ' +
        'the two that work.',
    },
  },
  {
    slug: 'diag-a-commits-b-down',
    topicSlug: 'distributed-transactions-and-sagas',
    categoryKey: 'architecture',
    levelKey: 'design',
    difficulty: 6,
    isDiagnostic: true,
    stem: 'Service A commits to its database; Service B is down. Give three designs with trade-offs.',
    body: 'No distributed transaction available. Say what each one guarantees and what it costs.',
    concepts: [
      {
        slug: 'outbox-pattern',
        name: 'Transactional outbox plus relay',
        detail: 'Write the event in the same transaction; a relay publishes it with retries.',
        terms: ['outbox', 'relay', 'same transaction', 'cdc', 'debezium'],
        weight: 2,
      },
      {
        slug: 'saga-compensation',
        name: 'Saga with compensating actions',
        detail: 'Ordered local transactions plus explicit undo, and a terminal state.',
        terms: ['saga', 'compensating transaction', 'undo', 'orchestration', 'choreography'],
        weight: 2,
      },
      {
        slug: 'dual-write-avoidance',
        name: 'Avoid the dual write',
        detail: 'Committing to a database and then calling a broker is two systems that cannot agree.',
        terms: ['dual write', 'two systems', 'inconsistent commit', 'publish after commit'],
        weight: 2,
      },
      {
        slug: 'eventual-consistency-window',
        name: 'Named the consistency window',
        detail: 'State honestly how long readers may see the old value and what depends on it.',
        terms: ['eventual consistency', 'lag window', 'staleness bound', 'read your writes'],
      },
    ],
    answer: {
      shortAnswer:
        'Outbox plus relay for guaranteed eventual publication, a saga when a rollback path exists, and synchronous ' +
        'call-with-retry only when B is genuinely required to proceed.',
      idealAnswer:
        'Outbox: A inserts the event row in the same database transaction as its own change, so the two commit ' +
        'together or not at all; a relay publishes with backoff, so B is down only means delay. Saga: a chain ' +
        'of local transactions with declared compensation for each step — you give up atomicity and gain an ' +
        'auditable intermediate state. Synchronous retry with an idempotent receiver is the smallest option and ' +
        'is right when the call is fast and failure must block the user.',
      deepAnswer:
        'The one mistake to refuse: writing to the database and then publishing to a broker in application code. ' +
        'Either the publish succeeds and the transaction rolls back, or the transaction commits and the process ' +
        'dies before publishing — both are silent. So every design here answers "where does intent get recorded ' +
        'atomically with state". Then name the guarantees: at-least-once plus an idempotent consumer, a bounded ' +
        'lag you can state to product, and a replay path with a dead letter and an alert for the poison messages.',
      commonMistakes:
        '- "Use Kafka for exactly-once" — the transactional producer does not span your database commit and your ' +
        'downstream handler.\n' +
        '- Choreography without an owner, where nobody can say what state the business object is in.\n' +
        '- Compensation written as a delete when it must be a reversal.',
      whyWrong:
        'The dual-write failure is invisible until reconciliation: some orders never reach fulfilment and the ' +
        'customer calls you. Compensating actions without a defined terminal state leave half-refunded orders ' +
        'that nobody owns.',
      followUps:
        '1. What is the relay retry policy and its failure signal?\n' +
        '2. Which part must be idempotent?\n' +
        '3. How do you debug a saga stuck mid-flight?',
      exercise:
        'Draw the outbox for one flow you own, including the poison-message path, then implement the relay ' +
        'duplicate case and prove the consumer absorbs it.',
    },
  },
  {
    slug: 'diag-at-least-once',
    topicSlug: 'queue-delivery-semantics',
    categoryKey: 'trade-off',
    levelKey: 'judgment',
    difficulty: 6,
    isDiagnostic: true,
    stem: 'Argue that at-least-once plus an idempotent consumer beats any "exactly-once" claim.',
    body: 'Cover ack semantics, duplicate delivery, and what the broker config cannot do.',
    concepts: [
      {
        slug: 'ack-semantics-and-redelivery',
        name: 'Acknowledgement semantics',
        detail: 'Ack after processing; a crash before ack redelivers, so duplicates are the design assumption.',
        terms: ['ack after processing', 'redelivery', 'manual ack', 'visibility timeout', 'at-least-once'],
        weight: 2,
      },
      {
        slug: 'idempotent-consumer-dedupe',
        name: 'Idempotent consumer with a dedupe key',
        detail: 'A natural key plus a unique constraint or processed-events table makes the second delivery a no-op.',
        terms: ['idempotent consumer', 'dedupe key', 'unique constraint', 'processed events table', 'natural key'],
        weight: 2,
      },
      {
        slug: 'exactly-once-limits',
        name: 'What exactly-once actually covers',
        detail: 'Broker transactions span the producer and broker state, not your external side effects.',
        terms: ['exactly once limits', 'transactional producer', 'kafka eos', 'external side effects', 'eos scope'],
        weight: 2,
      },
      {
        slug: 'poison-message-dlq',
        name: 'Dead letter and retry budget',
        detail: 'The duplicate path and the failure path are the same code; without a DLQ it is an infinite loop.',
        terms: ['dead letter', 'dlq', 'retry budget', 'poison message', 'backoff'],
      },
    ],
    answer: {
      shortAnswer:
        'Because the delivery you cannot control is the one after your side effect and before your ack. Make ' +
        'redelivery harmless and the guarantee stops mattering.',
      idealAnswer:
        'At-least-once with manual ack after commit means a crash produces a duplicate — a fact, not a defect. ' +
        'Idempotency turns that duplicate into a no-op with a dedupe key the consumer checks atomically, usually ' +
        'a unique index. Kafka "exactly-once" is a transactional producer writing to the broker: it does not ' +
        'cover the email you sent or the charge you made, so anyone claiming exactly-once end to end is lying ' +
        'about the boundary.',
      deepAnswer:
        'Concretely: consumer writes a row and acks; the ack is lost; redelivery arrives; the unique insert ' +
        'conflicts and the handler returns success. That is correct behaviour under duplication, and it also ' +
        'needs a retention window on the dedupe table longer than the redelivery horizon. Order matters too — ' +
        'if the handler assumes sequential events, dedupe by aggregate version rather than by message id, and ' +
        'partition by aggregate key so the ordering assumption is at least locally true.',
      commonMistakes:
        '- "Exactly-once is a config."\n' +
        '- Deduplicating in memory, which resets with the pod.\n' +
        '- Auto-ack before processing, which turns at-least-once into at-most-once and loses data.',
      whyWrong:
        'Auto-ack gives you silent message loss on every crash, which is discovered in reconciliation. In-memory ' +
        'dedupe gives you duplicates every redeploy. Both are the same class of error: believing the guarantee ' +
        'lives in the broker instead of in your handler.',
      followUps:
        '1. Where does the dedupe key come from?\n' +
        '2. What is your retry policy before the DLQ?\n' +
        '3. How do you test redelivery?',
      exercise:
        'Kill the consumer between commit and ack so one message is delivered twice; prove the second delivery ' +
        'changes nothing and that a DLQ catches the poison case.',
    },
  },
  {
    slug: 'diag-rag-confident-wrong',
    topicSlug: 'rag-pipeline-engineering',
    categoryKey: 'debugging',
    levelKey: 'production',
    difficulty: 6,
    isDiagnostic: true,
    stem: 'Your RAG answers are confidently wrong. Where do you instrument first?',
    body: 'Name the stages and the metric for each, in the order you would actually check them.',
    concepts: [
      {
        slug: 'retrieval-eval-recall',
        name: 'Retrieval metrics before generation',
        detail: 'Recall@k, precision@k and MRR on a labelled set; most bad answers are missing context.',
        terms: ['recall at k', 'precision', 'mrr', 'retrieval eval', 'relevant chunk missing'],
        weight: 2,
      },
      {
        slug: 'chunking-indexing-quality',
        name: 'Chunking and indexing',
        detail: 'Boundary splitting, table and code handling, metadata filters, freshness of the index.',
        terms: ['chunking', 'chunk size', 'overlap', 'metadata filter', 'index freshness'],
        weight: 2,
      },
      {
        slug: 'groundedness-citations',
        name: 'Groundedness and citation checks',
        detail: 'Does every claim trace to a retrieved span; answer-attribution catches invented facts.',
        terms: ['groundedness', 'attribution', 'citation', 'faithfulness', 'unsupported claim'],
        weight: 2,
      },
      {
        slug: 'golden-set-evals',
        name: 'A golden set with regression runs',
        detail: 'A fixed question-answer-expected-source set you score on every change.',
        terms: ['golden set', 'eval harness', 'regression eval', 'labelled questions'],
        weight: 2,
      },
      {
        slug: 'reranking-context-budget',
        name: 'Reranking and context budget',
        detail: 'Top-k from embedding search is rarely the right k for the prompt window.',
        terms: ['rerank', 'cross encoder', 'context budget', 'top k'],
      },
    ],
    answer: {
      shortAnswer:
        'Instrument retrieval first, then generation. Most "hallucinations" are the right document never being ' +
        'in the window, and no amount of prompt tuning fixes that.',
      idealAnswer:
        'Build a golden set of 50-200 questions with the expected source, then measure recall@k on the retriever ' +
        'alone — cheap, fast, and it separates the two failure classes. When retrieval is good but answers are ' +
        'still wrong, check groundedness: an answer-attribution pass that requires each claim to cite a span, ' +
        'plus a refusal path when nothing supports the answer. Reranking after top-50 retrieval usually moves ' +
        'recall@5 more than a new embedding model.',
      deepAnswer:
        'The instrumentation that pays for itself: log the query, the retrieved chunks with scores, the assembled ' +
        'prompt and the answer, keyed by one id, so an incident review can say whether retrieval missed or the ' +
        'model ignored good context. Chunking failures have signatures — answers that stop mid-table, wrong units, ' +
        'a stale document beating a fresh one — and they are fixed in the indexer, not the prompt. Set a ' +
        'regression gate: any change must hold recall@5 and groundedness within a stated tolerance before it ships.',
      commonMistakes:
        '- "Better embeddings" or "a better model" before measuring retrieval.\n' +
        '- Judging by eyeballing ten answers.\n' +
        '- Evaluating the answer only, so the two failure causes stay fused.',
      whyWrong:
        'A confident wrong answer in a shipped assistant is a trust event with a customer-visible cost, and it ' +
        'is unreproducible without logs of what was in the window. Teams that tune prompts on vibes regress the ' +
        'cases that were already working.',
      followUps:
        '1. What metric would you put on a dashboard tomorrow?\n' +
        '2. How do you handle documents that contradict each other?\n' +
        '3. When is no answer the right answer?',
      exercise:
        'Write 30 golden questions with expected sources for one corpus you own, measure recall@5, and fix the ' +
        'single worst failure cause. Report the number before and after.',
    },
  },
  {
    slug: 'diag-agent-loop-guardrails',
    topicSlug: 'agent-loops-and-termination',
    categoryKey: 'senior-judgment',
    levelKey: 'judgment',
    difficulty: 7,
    isDiagnostic: true,
    stem: 'An agent loops 12 times and burns tokens. What guardrails do you add, and what design question does it raise?',
    body: 'Answer as the engineer who has to defend the budget and the outcome.',
    concepts: [
      {
        slug: 'step-and-budget-cap',
        name: 'Hard caps on steps, cost and wall-clock',
        detail: 'Termination conditions must exist independently of the model deciding to stop.',
        terms: ['step cap', 'max iterations', 'budget cap', 'token limit', 'timeout'],
        weight: 2,
      },
      {
        slug: 'tool-error-feedback',
        name: 'Structured tool failures the model can act on',
        detail: 'Vague errors cause retry loops; specific, actionable errors end them.',
        terms: ['tool error', 'structured failure', 'actionable error', 'retry loop', 'error message quality'],
        weight: 2,
      },
      {
        slug: 'plan-vs-act',
        name: 'Explicit plan, verification, and progress detection',
        detail: 'Detect repeated identical tool calls with repeated arguments — that is the loop signature.',
        terms: ['plan then act', 'repeat detection', 'no progress', 'identical call', 'verification step'],
        weight: 2,
      },
      {
        slug: 'deterministic-workflow-alternative',
        name: 'The workflow-versus-agent decision',
        detail: 'If the task has a known shape, a graph with fixed nodes is cheaper, faster and testable.',
        terms: ['deterministic workflow', 'fixed pipeline', 'state graph', 'does not need autonomy', 'when not to use an agent'],
        weight: 2,
      },
      {
        slug: 'escalate-to-human',
        name: 'A defined escalation exit',
        detail: 'The correct terminal state for a stuck agent is a human, not another attempt.',
        terms: ['escalate', 'human handoff', 'give up path', 'abort state'],
      },
    ],
    answer: {
      shortAnswer:
        'Caps, structured errors, repeat detection and an escalation exit — but the senior answer is to ask ' +
        'whether this needed an agent at all.',
      idealAnswer:
        'Guardrails are cheap: a step cap, a cost cap, a wall-clock budget, tool results that say exactly what ' +
        'went wrong and what to try instead, and a detector for the loop signature (same tool, same arguments, ' +
        'same failure). Then a defined terminal state for "stuck" that hands off to a human with the trace. Those ' +
        'make the agent safe, but they do not make it right.',
      deepAnswer:
        'The design question is where autonomy earns its cost. Twelve iterations usually means the model is ' +
        'guessing at a procedure that has a known shape — and a fixed graph with typed node outputs gives you ' +
        'determinism, a test suite, per-node latency, and roughly the token cost of one attempt instead of ' +
        'twelve. Autonomy pays only when the path genuinely cannot be enumerated. Concretely: keep the agent for ' +
        'the ambiguous sub-step, wrap it in a workflow for everything else, and make the cap visible in the ' +
        'trace so the loop becomes a measured regression rather than a surprise invoice.',
      commonMistakes:
        '- "Retry with a smaller model" — the loop was not a capability problem.\n' +
        '- Prompting the agent to stop when it cannot tell it has stopped.\n' +
        '- No cost attribution per run, so nobody can price the behaviour.',
      whyWrong:
        'Uncapped loops turn a batch job into a four-figure invoice overnight, and they mask the real defect: a ' +
        'task whose shape you already know, being solved by search. The cost is the symptom, not the disease.',
      followUps:
        '1. What does one run cost at p99, and how do you know?\n' +
        '2. Which nodes could be plain functions?\n' +
        '3. What does the user see when the cap hits?',
      exercise:
        'Take one agent you own, replay its worst loop, and rebuild that path as a deterministic graph. Report ' +
        'tokens, latency and correctness for both.',
    },
  },
];
