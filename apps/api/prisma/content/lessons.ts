import { SD_MODULE_01_LESSONS } from './system-design';
import type { LessonSpec } from './types';

/**
 * §43 anatomy, in order, for every lesson. The lesson engine refuses to seed a lesson that
 * skips a rung: a lesson that never shows the naive solution cannot explain why the real one
 * is worth its complexity.
 */
export const LESSON_ANATOMY = [
  'why-it-exists',
  'naive-solution',
  'why-naive-fails',
  'mental-model',
  'internals',
  'production-implementation',
  'bad-implementation',
  'testing',
  'failure-scenarios',
  'performance',
  'security',
  'trade-offs',
  'system-design',
  'interview',
  'real-world',
  'mini-project',
] as const;

const CORE_LESSONS: LessonSpec[] = [
  {
    slug: 'the-life-of-a-program',
    title: 'What Actually Happens When a Program Runs',
    topicSlug: 'how-programs-run',
    sections: [
      {
        kind: 'why-it-exists',
        body: 'Your source file is text. A CPU executes fixed-width instructions on registers. Nothing in between cares about your intentions, so something must translate "sort this list" into voltages, and something must own the memory those instructions touch. That translation and that ownership are the entire reason processes, compilers, linkers and loaders exist.',
      },
      {
        kind: 'naive-solution',
        body: 'The model almost everyone carries: "Node reads my file top to bottom and runs each line." It is easy, it is what the REPL feels like, and it is wrong in ways that show up as money.',
      },
      {
        kind: 'why-naive-fails',
        body: 'A line-at-a-time model cannot explain why a 2 MB bundle boots in 40 ms while a 200-line script takes 300 ms of CPU, why the second run of the same script is faster than the first, or why a boring for-loop over a Float64Array beats an elegant reduce by 30x. None of those are statements being read. They are parse, compile, optimise, page-in and cache effects happening before and around your code.',
      },
      {
        kind: 'mental-model',
        body: 'Hold this picture: source becomes tokens, tokens become an AST, the AST becomes an intermediate representation, the IR becomes machine code, and machine code runs in a fetch-decode-execute loop on a core. In parallel, the kernel gives your process an address space, a file-descriptor table, and a main thread with a stack; your objects live on a heap the runtime manages. Every interaction with anything outside that address space is a syscall.',
      },
      {
        kind: 'internals',
        body: 'The loader maps the executable into pages, resolves shared libraries, jumps to the entry point. V8 does not compile everything: functions start as Ignition bytecode, run interpreted, and get tiered up to Maglev or TurboFan once they are hot enough to justify the compile time, with deoptimisation back to bytecode when an assumption (like "this property always exists") fails. The CPU feeds instructions through a decoder, a branch predictor and an out-of-order window; L1i and L1d caches sit between it and RAM, and a cache miss is roughly 100x a hit.',
      },
      {
        kind: 'production-implementation',
        body: 'This model has three operational consequences. Keep hot code monomorphic so the optimiser keeps its assumptions. Decide deliberately whether a task is CPU-bound or I/O-bound before choosing a concurrency model. And measure process behaviour rather than trusting intuition: startup time, resident set size, syscall count, and CPU profile shape all belong in your checks.',
      },
      {
        kind: 'bad-implementation',
        body: 'A NestJS handler that does `fs.readFileSync(path, "utf8")` because "it is just one line" and the file is small. It blocks the event loop for the duration of a syscall whose latency you do not control, it does it on every request, and it shows up in the profile as a wall of identical stack frames while every other request in the process waits.',
      },
      {
        kind: 'testing',
        body: 'You understand this when you can predict the measurements before taking them. What is the RSS of an idle Node process? How many syscalls does a TCP accept cost? Why does the second execution of a script run faster than the first? Write the prediction, run `strace -c`, `time`, and `--cpu-prof`, and read the diff between your story and the numbers.',
      },
      {
        kind: 'failure-scenarios',
        body: 'The page cache is evicted under memory pressure and the identical binary is suddenly eight times slower. A container hits its cgroup CPU quota and the code is unchanged but every request pays a throttle. Swap turns a 2 ms pause into a 200 ms one. A background job forks per request until the box runs out of PIDs and nothing can start, including your shell.',
      },
      {
        kind: 'performance',
        body: 'Cost is dominated by misses, not by instructions: cache misses, branch mispredictions, TLB misses, and syscalls that leave the cheap world. JIT warm-up means a benchmark that measures the first thousand iterations is measuring the compiler. Traversing an array of structs is slower than two parallel arrays of primitives even though it does the same work, because the hardware prefetcher cannot read your intent.',
      },
      {
        kind: 'security',
        body: 'Everything that runs has instructions and a stack, so memory safety is the boundary that matters. ASLR, DEP and stack canaries exist because the failure mode of a bounds error is arbitrary execution. In your own layer: the interpreter or compiler you ship becomes part of the attack surface, and code that reaches an assembler, a shell, or a plugin loader is a different risk class from code that only reads data.',
      },
      {
        kind: 'trade-offs',
        body: 'AOT compilation buys predictable startup and costs portability and peak-case optimisation. JIT buys peak performance and adds warm-up and deoptimisation variance. Threads share memory and are cheap to start but every shared byte is a concurrency bug waiting; processes copy or map memory and isolate failures but cost more to spawn. Managed runtimes give you a GC you can reason about and take away the ability to control when it runs.',
      },
      {
        kind: 'system-design',
        body: 'This is why Node runs one JavaScript thread per isolate, why CPU work in a request path is the wrong shape and belongs in a worker pool or a queue, why a service is usually sized as N processes on N cores rather than one process with N threads, and why "just add more instances" works only when the process itself is not the bottleneck.',
      },
      {
        kind: 'interview',
        body: 'Sixty-second answer to "what happens when you run node index.js?": the shell resolves the command, forks and execs the Node binary, the loader maps it into a new address space, V8 parses your file into an AST and emits bytecode, the event loop starts, hot functions get compiled and tiered up by the optimiser, and any work that leaves the process goes through syscalls. Follow-ups you should expect: why the first run is slower, what a deoptimisation is, and how you would prove a service is CPU-bound rather than I/O-bound.',
      },
      {
        kind: 'real-world',
        body: 'A booking service ships a change; p99 goes from 120 ms to 900 ms with no new queries and no new dependencies. The profile shows one hot stack: a helper that used to be inlined now receives two different object shapes from two call sites, so TurboFan deoptimised it and the whole request path fell back to interpreted bytecode. The fix is not clever: make the two call sites pass the same shape, then assert on the profile rather than on the code.',
      },
      {
        kind: 'mini-project',
        body: 'Write a script that, for a given program, reports cold versus warm startup time, peak RSS, syscall count and categories, and the CPU time of the same sum computed three ways: an object array, two parallel typed arrays, and a reduce over an iterator. Then write one paragraph per metric explaining the difference in terms of caches, allocation and deoptimisation. If your explanation does not mention a number, you are still guessing.',
      },
    ],
  },
  {
    slug: 'the-event-loop-from-the-inside',
    title: 'The Event Loop, From the Inside',
    topicSlug: 'event-loop',
    sections: [
      {
        kind: 'why-it-exists',
        body: 'A thread per connection costs a stack, a scheduling slot and kernel memory, and it sits idle waiting for bytes. Someone needed one thread to hold thousands of mostly-idle sockets. The answer is not magic concurrency: it is a loop that asks an OS multiplexer which file descriptors are ready, then runs only the callbacks for those.',
      },
      {
        kind: 'naive-solution',
        body: 'Blocking in a loop: accept a connection, read it fully, handle it, write it, close it, then take the next one. Correct, simple, and the throughput is one request at a time for the whole process.',
      },
      {
        kind: 'why-naive-fails',
        body: 'Most request time is waiting on something else: a database, an upstream API, a disk. A blocking loop makes every other connection pay for the slowest one currently in hand. You can see the shape of the failure in the latency histogram: average 12 ms, p99 nine hundred, because one slow dependency held the single thread.',
      },
      {
        kind: 'mental-model',
        body: 'One call stack, one queue of ready callbacks, and a scheduler that drains them in a fixed order. Your function runs on the stack until it returns. Anything asynchronous is registered with libuv and its continuation is queued later. Between macrotasks, the microtask queue empties completely \u2014 every resolved promise continuation, before the next timer or socket event gets a turn.',
      },
      {
        kind: 'internals',
        body: 'libuv wraps the platform multiplexer: epoll on Linux, kqueue on macOS, IOCP on Windows. Its event loop runs phases in order \u2014 timers, pending callbacks, poll (where sockets report ready), check (setImmediate), close callbacks \u2014 and after each callback the microtask queue is drained. DNS and heavy fs/crypto work go to a thread pool because those syscalls cannot be made non-blocking; network I/O does not.',
      },
      {
        kind: 'production-implementation',
        body: 'Treat the loop as a shared resource with a budget. Never hold it for more than a few milliseconds. Bound concurrency with a semaphore rather than firing unbounded parallel promises, propagate AbortController so abandoned work actually stops, and put CPU-bound work in worker_threads or a queue process so the request path keeps its latency promise.',
      },
      {
        kind: 'bad-implementation',
        body: 'The single-line killer: `crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512")` inside a login handler. It is asynchronous in spirit and synchronous in fact, and during its 90 ms no other request in the process advances, including health checks that then get restarted by the orchestrator.',
      },
      {
        kind: 'testing',
        body: 'Output-prediction drills are the honest test: interleaved then/setImmediate/setTimeout(0) callbacks, a promise resolved inside an async handler, a recursive microtask starved loop. Then measure: log loop lag with a setInterval(1) drift histogram, and assert the 99th percentile stays under your budget when a request handler runs. A test that cannot tell a blocked loop from an idle one is not testing the loop.',
      },
      {
        kind: 'failure-scenarios',
        body: 'A recursive promise chain that never yields starves timers. An unbounded Promise.all opens ten thousand sockets and the syscall queue, not your code, becomes the bottleneck. A stream with no drain handler buffers into an out-of-memory kill. One tenant\u2019s slow dependency becomes every tenant\u2019s latency, because all of them share the one stack.',
      },
      {
        kind: 'performance',
        body: 'Async is not free: each continuation allocates, and microtasks are cheap but not costless. Throughput comes from keeping the loop fed, latency comes from keeping each callback short. A CPU-bound service cannot be fixed by making the code asynchronous, because the constraint was never the waiting \u2014 it was the one stack doing arithmetic.',
      },
      {
        kind: 'security',
        body: 'Starvation is a denial-of-service vector: one authenticated user can send work that keeps the loop busy for everyone. Unbounded concurrency amplifies credential-stuffing because your code has no queue discipline. And a callback that captures request-scoped secrets into a long-lived closure can leak them into another tenant\u2019s request.',
      },
      {
        kind: 'trade-offs',
        body: 'Evented single-threaded: cheap idle cost, great for many slow sockets, hopeless for arithmetic, and one bug poisons the whole process. Thread pool: parallel CPU, shared-memory races, scheduling cost. Processes: isolation and simple reasoning, heavier memory and IPC. Multi-threaded JavaScript with worker pools gets you both, priced in message serialisation and state you must now reason about across threads.',
      },
      {
        kind: 'system-design',
        body: 'Design consequence: size and place work by its shape. I/O-bound fan-out belongs on the loop with bounded concurrency; CPU-bound work belongs behind a queue and a pool of workers sized to cores; long-running jobs must not sit on the request path at all. That split is why an API process and a worker process are separate deployables even in a monolith.',
      },
      {
        kind: 'interview',
        body: '"Why can a single-threaded runtime handle ten thousand concurrent connections?" \u2014 because concurrency is not parallelism: connections are mostly idle, readiness is reported by one kernel multiplexer call, and the loop only runs callbacks that have something to do. Expect the follow-up: "what kills it?" \u2014 and the answer is CPU-bound work, unbounded fan-out, and a microtask recursion that starves the phases.',
      },
      {
        kind: 'real-world',
        body: 'A notification service dropped 30% of its webhooks overnight while CPU sat at 8%. Cause: a retry helper awaited a ten-thousand-item Promise.all against a dependency that had started responding in 4 seconds. The loop was not busy; it was waiting in bulk, the socket buffer filled, and the health check timed out. Bounded concurrency to fifty, plus a queue, fixed it \u2014 the same CPU, the same dependency.',
      },
      {
        kind: 'mini-project',
        body: 'Build a 30-line loop-lag probe: a setInterval(1) that records drift, plus a histogram you print every second. Then make it worse on purpose \u2014 insert a 50 ms busy loop, a 5 ms synchronous regex, a recursive microtask, and an unbounded Promise.all against a slow endpoint. Report the observed p99 lag for each. If you cannot attribute each spike to a mechanism, rerun it with --cpu-prof.',
      },
    ],
  },
];

/** Every authored lesson: the two hand-written foundations plus each module in the curriculum. */
export const LESSONS: LessonSpec[] = [...CORE_LESSONS, ...SD_MODULE_01_LESSONS];
