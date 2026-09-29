import type { QuestionSpec } from './types';

/**
 * Non-diagnostic drills attached to topics that have lessons. These are gated by the graph:
 * a locked topic refuses them, because a drill you cannot yet read is a drill you will fail
 * for the wrong reason. The diagnostic set deliberately is not.
 */
export const QUESTIONS_CORE: QuestionSpec[] = [
  {
    slug: 'drill-process-vs-program',
    topicSlug: 'how-programs-run',
    categoryKey: 'conceptual',
    levelKey: 'exposure',
    difficulty: 1,
    lessonSlug: 'the-life-of-a-program',
    stem: 'What is the difference between a program and a process?',
    body: 'Two sentences, no analogy. Name what each one is made of.',
    concepts: [
      {
        slug: 'program-is-bytes-on-disk',
        name: 'A program is static code',
        detail: 'A file of instructions, no memory, no state.',
        terms: ['on disk', 'static', 'file', 'instructions', 'executable'],
        weight: 2,
      },
      {
        slug: 'process-is-running-instance',
        name: 'A process is a running instance with its own address space',
        detail: 'Kernel structure: pid, page tables, file descriptors, heap and stack.',
        terms: ['address space', 'pid', 'running instance', 'file descriptors', 'kernel structure'],
        weight: 2,
      },
      {
        slug: 'many-processes-one-program',
        name: 'One program can be many processes',
        detail: 'Cluster workers: same binary, separate heaps, separate failure domains.',
        terms: ['multiple processes', 'same binary', 'separate heaps', 'cluster workers'],
      },
    ],
    answer: {
      shortAnswer:
        'A program is bytes on disk; a process is the kernel carrying one instance of those bytes with its own ' +
        'address space, descriptors and scheduler entry.',
      idealAnswer:
        'The program is inert — an ELF or Mach-O file that could sit on a shelf. A process is the live object: ' +
        'page tables mapping a private address space, a file-descriptor table, heap and thread stacks, and ' +
        'signal dispositions. Nothing about the program implies how many processes exist; a Node cluster of ' +
        'eight workers is one program and eight of everything else.',
      deepAnswer:
        'This distinction is where the mental model of the whole runtime comes from: because the address space ' +
        'is private, module-level state is per-process, so a Map you treat as a cache is eight different caches ' +
        'under cluster. And because descriptors are per-process, "too many open files" is a process limit, not ' +
        'a machine limit. Understanding this also explains the cost of a context switch and why a segfault kills ' +
        'one process rather than the machine.',
      commonMistakes:
        '- "A process is a program in memory" and stopping there.\n' +
        '- Thinking two Node processes share module state.\n' +
        '- Using "thread" and "process" interchangeably.',
      whyWrong:
        'The folklore version is what produces "why is my in-memory rate limiter inconsistent across pods" and ' +
        '"why did the cache not warm up" reports. Both are the same misunderstanding, and both cost a day.',
      followUps:
        '1. What is shared between two cluster workers?\n' +
        '2. Where does the heap live in that address space?\n' +
        '3. What does a thread add that a process does not already have?',
      exercise:
        'Run two Node processes that both write into a module-level Map, print the contents from each, then ' +
        'explain the output to someone who thinks it should be shared.',
    },
  },
  {
    slug: 'drill-stack-heap-where',
    topicSlug: 'how-programs-run',
    categoryKey: 'internal',
    levelKey: 'understanding',
    difficulty: 3,
    lessonSlug: 'the-life-of-a-program',
    stem: 'For each value below, say stack or heap and what has to happen before the memory is reusable.',
    body: [
      '```js',
      'function build(rows) {',
      '  const count = rows.length;',
      '  const payload = { rows, count };',
      '  return payload.rows.slice(0, count);',
      '}',
      '```',
      'Name: `count`, `payload`, the array it returns, and what `rows` costs to keep alive.',
    ].join('\n'),
    concepts: [
      {
        slug: 'primitive-in-frame',
        name: 'Primitives live in the stack frame',
        detail: 'count is a slot in the frame, reclaimed when the frame pops.',
        terms: ['stack frame', 'primitive', 'slot', 'popped', 'local variable'],
        weight: 2,
      },
      {
        slug: 'objects-on-heap-pointer',
        name: 'Objects are heap allocations behind a reference',
        detail: 'payload holds an address; the object lives until unreachable.',
        terms: ['heap', 'reference', 'pointer', 'object allocation'],
        weight: 2,
      },
      {
        slug: 'reachability-not-scope',
        name: 'Reclamation follows reachability, not leaving scope',
        detail: 'A returned object or a captured closure keeps the original alive.',
        terms: ['reachability', 'still reachable', 'gc root', 'outlives scope', 'captured'],
        weight: 2,
      },
      {
        slug: 'slice-copies-references',
        name: 'slice produces a new array of the same references',
        detail: 'New backing array, same row objects — so the rows stay alive regardless.',
        terms: ['new array', 'shallow copy', 'same references', 'slice copies'],
      },
    ],
    answer: {
      shortAnswer:
        'count sits in the stack frame; payload and the returned array are heap objects reached through ' +
        'references; the rows are heap objects that survive because the new array still points at them.',
      idealAnswer:
        'The frame pops when the function returns, so the slot for count is gone immediately, but the heap ' +
        'objects are only collectable once nothing reachable points at them. slice allocates a fresh backing ' +
        'array holding the same row references, which means the returned value keeps every selected row alive — ' +
        'and if the payload is captured by a closure or cached, all of `rows` stays alive too.',
      deepAnswer:
        'The production version of this question is memory ceilings. A function that returns a slice of a large ' +
        'array is cheap; a function that returns `array.filter` over a 2M-row result set holds the whole result ' +
        'in the heap until the request ends, and V8 promotes long-lived objects to old generation where a full ' +
        'GC has to visit them. That is why "we stream rows but RSS still climbs" is usually a retained ' +
        'reference, not a buffer — and it is why heap snapshots read by retainer path, not by size, settle the ' +
        'argument.',
      commonMistakes:
        '- Saying leaving the scope frees the object.\n' +
        '- Thinking slice copies the row objects.\n' +
        '- Placing the returned array on the stack because a local variable holds it.',
      whyWrong:
        'The scope-frees-it model makes leaks inexplicable: the code clearly "ended", so the memory must be ' +
        'back. It is not, because reachability is the rule, and that misunderstanding costs the team its only ' +
        'week of heap investigation.',
      followUps:
        '1. What changes if the function returns a closure over payload instead?\n' +
        '2. Where does a string of 10 MB live?\n' +
        '3. How do you prove retention with a snapshot?',
      exercise:
        'Build a 100k-row array, return a slice of 10 items, keep only the slice, and report RSS before and ' +
        'after a forced GC. Then explain the number.',
    },
  },
  {
    slug: 'drill-process-isolation-proof',
    topicSlug: 'how-programs-run',
    categoryKey: 'implementation',
    levelKey: 'implementation',
    difficulty: 3,
    lessonSlug: 'the-life-of-a-program',
    stem: 'Write the code that proves two Node processes do not share anything, and print the numbers that show it.',
    body: [
      'Given `worker.js`, name the parent call that starts it, what the two processes share, and the three things',
      'you print to prove isolation rather than assert it. No documentation quotes — the measurement.',
    ].join('\n'),
    concepts: [
      {
        slug: 'fork-spawn-parent',
        name: 'The parent starts the child with fork or spawn',
        detail: 'child_process.fork gives a channel, spawn gives a pipe; neither gives shared memory.',
        terms: ['child_process', 'fork', 'spawn', 'execFile'],
        weight: 2,
      },
      {
        slug: 'pid-as-identity',
        name: 'Each side prints its own pid',
        detail: 'process.pid differs, which is the cheapest proof that there are two kernels objects.',
        terms: ['process.pid', 'pid differs', 'two pids'],
        weight: 2,
      },
      {
        slug: 'module-state-not-shared',
        name: 'Module-level state is per process',
        detail: 'The same imported Map holds different contents in each address space.',
        terms: ['module state', 'not shared', 'separate copy', 'own address space', 'per process'],
        weight: 2,
      },
      {
        slug: 'rss-as-the-number',
        name: 'RSS is the memory number to print',
        detail: 'process.memoryUsage().rss per pid, plus heapUsed to separate the runtime from the kernel view.',
        terms: ['memoryusage', 'rss', 'resident set', 'heapUsed'],
        weight: 2,
      },
      {
        slug: 'argv-env-from-kernel',
        name: 'argv and env come from the kernel at exec time',
        detail: 'They are copied into the new process image, which is why changing env in the parent is invisible.',
        terms: ['argv', 'environment', 'process.env', 'exec'],
      },
      {
        slug: 'message-passing-is-the-only-channel',
        name: 'Crossing the boundary needs a message',
        detail: 'IPC channel, socket or a store — the alternative to sharing is passing.',
        terms: ['ipc', 'message passing', 'channel', 'socket'],
      },
    ],
    answer: {
      shortAnswer:
        'fork() a worker, print process.pid and memoryUsage().rss from both sides, and mutate a module-level ' +
        'Map in one of them to show the other never sees it.',
      idealAnswer:
        'The parent calls child_process.fork("./worker") — spawn works too, with an explicit stdio pipe. Inside ' +
        'each process print three things: process.pid, process.memoryUsage().rss, and Object.keys of a ' +
        'module-level Map you then write into. The pids differ, the RSS figures differ by more than the noise ' +
        'between two V8 boots, and the map written in the child reads back empty in the parent. That is the ' +
        'proof: isolation is shown by a write that does not appear, not by a sentence about address spaces.',
      deepAnswer:
        'What is genuinely shared is the page cache, the binary on disk, and whatever you deliberately put ' +
        'outside the process — a database, Redis, a file. The cost of that isolation is the number that surprises ' +
        'people: eight cluster workers are eight V8 heaps, so a 40 MB module-level cache becomes 320 MB and eight ' +
        'copies of every warm JIT structure. The benefit is failure containment: a crash, an unbounded loop, or a ' +
        'GC stall belongs to exactly one pid, which is why "restart the pod" is a real strategy and "restart the ' +
        'thread" is not. And because argv and env are copied at exec, a parent mutating process.env after forking ' +
        'changes nothing in the child — a bug that costs a day the first time it bites.',
      commonMistakes:
        '- Printing only the pid and calling that proof of isolation.\n' +
        '- Believing a module-level Map is shared between cluster workers.\n' +
        '- Using worker_threads and calling it the same experiment: those do share a SharedArrayBuffer.',
      whyWrong:
        'Teams that assume shared module state build rate limiters, sessions and caches that silently disagree ' +
        'with each other under scale. The failure looks like nondeterminism, so it is diagnosed weeks late and ' +
        'usually blamed on the load balancer.',
      followUps:
        '1. What does fork add over spawn, and what does it cost?\n' +
        '2. How would you prove the same fact with worker_threads?\n' +
        '3. What is the first thing you check when RSS grows linearly with replica count?',
      exercise:
        'Write parent and worker, log pid, RSS and the map contents from both, then run it with one, four and ' +
        'sixteen workers and report the memory slope per worker.',
    },
  },
  {
    slug: 'drill-stack-overflow-debugging',
    topicSlug: 'how-programs-run',
    categoryKey: 'debugging',
    levelKey: 'debugging',
    difficulty: 4,
    lessonSlug: 'the-life-of-a-program',
    stem: 'flatten() on a deeply nested array throws RangeError: Maximum call stack size exceeded at roughly 10k frames. Diagnose the arithmetic and give two fixes that ship.',
    body: [
      '```js',
      'function flatten(xs) {',
      '  return xs.reduce(',
      '    (acc, x) => acc.concat(Array.isArray(x) ? flatten(x) : x),',
      '    [],',
      '  );',
      '}',
      '```',
      'Say what consumes the memory per frame, what the limit actually is, and why raising it is not a fix.',
    ].join('\n'),
    concepts: [
      {
        slug: 'frame-per-call',
        name: 'Every call pushes a stack frame',
        detail: 'Return address, locals and the saved slot until the call returns — recursion holds them all.',
        terms: ['stack frame', 'per call', 'return address', 'locals', 'frame size'],
        weight: 2,
      },
      {
        slug: 'fixed-stack-limit',
        name: 'The thread stack is a fixed budget',
        detail: 'V8 default is around 1 MB of usable frames, so depth is roughly budget divided by frame size.',
        terms: ['stack size', '1mb', 'default limit', 'stack budget', 'v8 stack'],
        weight: 2,
      },
      {
        slug: 'depth-is-input-shape',
        name: 'Recursion depth is set by the data, not the code',
        detail: 'A JSON payload from a caller decides how deep you go, so the limit is attacker-controlled.',
        terms: ['input shape', 'untrusted depth', 'nesting depth', 'attacker controlled', 'data decides'],
        weight: 2,
      },
      {
        slug: 'explicit-stack-rewrite',
        name: 'Iterative rewrite with an explicit worklist',
        detail: 'Move the stack onto the heap: push items to an array you control and loop.',
        terms: ['worklist', 'explicit stack', 'loop', 'iterative', 'heap allocated'],
        weight: 2,
      },
      {
        slug: 'tail-call-not-available',
        name: 'No guarantee of tail-call elimination',
        detail: 'Only strict-mode simple calls in some engines, so reduce/recursion still frames.',
        terms: ['tail call', 'tail recursion', 'strict mode', 'not eliminated'],
      },
      {
        slug: 'raising-the-limit-is-not-a-fix',
        name: '--stack-size trades crash depth for real memory',
        detail: 'A bigger stack still ends, and a deeper recursion can now overflow the segment it lives in.',
        terms: ['stack-size flag', 'raising the limit', 'bigger stack', 'just delays'],
      },
    ],
    answer: {
      shortAnswer:
        'Each call pushes a frame, the thread stack is a fixed roughly 1 MB budget, and the input decides the ' +
        'depth. Rewrite with an explicit worklist on the heap, or bound the depth and reject the payload.',
      idealAnswer:
        'The arithmetic is the diagnosis: usable stack budget divided by frame size is the maximum depth, and a ' +
        'frame holds the return address, the arguments object, acc and x, so a few hundred to a couple thousand ' +
        'bytes per level puts the wall near ten thousand frames. Two fixes ship. First, make the stack yours: an ' +
        'iterative loop with an explicit worklist array on the heap, where the budget is the heap and the failure ' +
        'is OOM rather than a RangeError. Second, bound the input — a depth limit that rejects the payload — ' +
        'because that is the only fix that also protects availability.',
      deepAnswer:
        'The reason this is an availability bug and not a code-quality one: flatten does not choose its own depth, ' +
        'the request body does. A caller who sends 100k-nested JSON can hold your process open with one POST, and ' +
        'if the throw escapes inside a Promise it can take the worker down too. Node parsers hit exactly this and ' +
        'is why they cap nesting. Note what raising --stack-size does: it moves the wall from ten thousand frames ' +
        'to thirty thousand and spends real address space per thread — the same attacker simply sends a deeper ' +
        'payload. And the concat version has a second problem: it copies the accumulator at every level, so even ' +
        'the shallow case is quadratic, which a profile would show as GC time rather than as a stack error.',
      commonMistakes:
        '- Rebooting with --stack-size and calling the incident closed.\n' +
        '- Assuming V8 optimises the recursive tail away.\n' +
        '- Fixing the crash and leaving the quadratic concat in place.',
      whyWrong:
        'A bigger stack converts a fast, honest RangeError into a slow memory exhaustion that takes the pod out ' +
        'with an OOM kill and no useful stack — the same bug, now unobservable in production.',
      followUps:
        '1. What depth limit would you enforce and where?\n' +
        '2. How do you prove the worklist version does not leak?\n' +
        '3. Which is worse for tail latency: recursion depth or the copying, and how do you tell?',
      exercise:
        'Measure the depth at which the recursive version throws, rewrite it with a worklist, then report both ' +
        'the new ceiling and the RSS curve for a 1M-element nested array.',
    },
  },
  {
    slug: 'drill-why-locality-beats-size',
    topicSlug: 'memory-hierarchy',
    categoryKey: 'why',
    levelKey: 'understanding',
    difficulty: 3,
    stem:
      'Two loops read the same 100 million numbers. One is twelve times faster and neither touches the disk. ' +
      'Explain what the machine is actually doing differently.',
    body: [
      'One loop walks an array in the order it was built; the other follows a list of indexes that arrive in ' +
      'random order. Same values, same language, same process. Say what moves, what stalls, and what number you ' +
      'would print to prove which of the two you are blaming.',
    ].join('\n'),
    concepts: [
      {
        slug: 'fixed-size-line',
        name: 'Memory moves in fixed-size lines, not one value at a time',
        detail: 'The cache fills a whole 64-byte line per transfer, so the neighbour of a value arrives for free.',
        terms: ['cache line', '64 byte', 'fixed size', 'block of bytes', 'line is loaded'],
        weight: 2,
      },
      {
        slug: 'latency-ladder',
        name: 'The hierarchy is a latency ladder, not a capacity plan',
        detail: 'Registers, L1, L2, L3, DRAM, NVMe each cost orders of magnitude more; size is not the variable.',
        terms: ['l1 cache', 'l2 cache', 'l3 cache', 'register', 'dram', 'nvme', 'nanosecond', 'latency'],
        weight: 2,
      },
      {
        slug: 'the-miss-is-the-event',
        name: 'The cache miss is the event that costs the time',
        detail: 'A hit is a few cycles; a miss to DRAM is hundreds, and the core stalls rather than slows.',
        terms: ['cache miss', 'miss', 'stall', 'prefetch', 'speculative'],
        weight: 2,
      },
      {
        slug: 'locality-is-the-cause',
        name: 'Sequential access lets the hardware predict the next line',
        detail: 'The prefetcher walks forward on a strided access pattern; random indexes defeat prediction.',
        terms: ['locality', 'sequential', 'prefetch', 'contiguous', 'in order'],
        weight: 2,
      },
      {
        slug: 'pointer-chasing-is-strided',
        name: 'Indirection turns one loop into a chain of dependent loads',
        detail: 'Following a stored index or a next pointer serialises the misses: nothing can overlap.',
        terms: ['pointer chasing', 'indirection', 'dependent load', 'linked list', 'random access'],
      },
      {
        slug: 'measure-the-ratio',
        name: 'The claim is proved by counters, not by the clock',
        detail: 'perf shows misses per thousand instructions and the bandwidth; the runtime only reports the sum.',
        terms: ['benchmark', 'perf', 'counters', 'misses per', 'profil', 'cycle'],
      },
    ],
    answer: {
      shortAnswer:
        'Both loops read the same bytes, but the ordered one walks contiguous cache lines the hardware has ' +
        'already prefetched, and the random one takes a dependent cache miss per value.',
      idealAnswer:
        'The cpu never reads a single number: it reads a cache line, typically 64 bytes, which is eight of these ' +
        'values. Walking the array in build order means the first miss loads the line and the next seven reads ' +
        'hit, and the prefetcher notices the stride and pulls the following lines while the core is still busy. ' +
        'Following a shuffled index list breaks both: the value you need is in a line that was not loaded, so ' +
        'the request goes to L2, possibly L3, possibly DRAM, and the pipeline stalls for hundreds of cycles ' +
        'because the address of the next load depends on the value of this one. Nothing about the algorithm ' +
        'changed — the same number of adds ran. The difference is where the bytes were and how many lines had ' +
        'to be fetched, which is why the memory hierarchy is a latency ladder and not a capacity chart.',
      deepAnswer:
        'The cost per level is roughly registers in a cycle, L1 four, L2 twelve, L3 forty, DRAM three hundred, ' +
        'and NVMe tens of thousands of microseconds, so a single miss to DRAM pays for the whole loop over a ' +
        'line. Modern cores hide that with out-of-order execution and multiple outstanding misses, which is why ' +
        'an independent stride (read every 64th element) is only moderately slower than sequential: the address ' +
        'of the next load is known ahead of time, so several lines are in flight together. Pointer chasing and ' +
        'gather-by-random-index lose that overlap, and the dependent-load chain is why the gap between the two ' +
        'loops is twelve times and not two. The secondary effect is TLB reach: at 4 KB pages a working set ' +
        'above a few hundred megabytes adds a page walk to some misses, so very large random layouts get worse ' +
        'than the cache maths alone predicts. Print cache-misses per thousand instructions and dTLB-load-misses ' +
        'from perf with only the access order changed — the ratio is the argument, the wall clock is only the ' +
        'symptom.',
      commonMistakes:
        '- Calling it a memory-size problem and adding RAM or a bigger container.\n' +
        '- Blaming the garbage collector for a loop that allocates nothing.\n' +
        '- Reporting the runtime difference as the finding without ever counting a miss.\n' +
        '- Assuming the compiler will reorder the random loop into a sequential one.',
      whyWrong:
        'A bigger heap changes nothing, because the values already fit in RAM; the cost is the round trip to ' +
        'get each line, not the room to hold them. Tuning GC on this loop spends the week and leaves the twelve ' +
        'times intact — and if you only quote the elapsed time, the next engineer has no idea which of the two ' +
        'effects to fix.',
      followUps:
        '1. Which loop would an index scan on a badly-clustering Postgres table behave like, and why?\n' +
        '2. What does the same access pattern cost when the values are 8 bytes instead of 64?\n' +
        '3. At what working-set size does TLB reach start to show up in your numbers?',
      exercise:
        'Build a 100M-element array and sum it twice: once in order, once through a shuffled index list. ' +
        'Report the elapsed time and the cache-miss counters from perf for both runs, then re-run the random ' +
        'order in chunks of 512 indexes and explain what changed.',
    },
  },
  {
    slug: 'drill-loop-lag-incident',
    topicSlug: 'event-loop',
    categoryKey: 'debugging',
    levelKey: 'debugging',
    difficulty: 4,
    lessonSlug: 'the-event-loop-from-the-inside',
    stem: 'p99 on /health jumped from 4 ms to 900 ms while the database looks healthy. What do you check, in order?',
    body: 'The service is Node, single process, 1 pod. Say what each check rules out.',
    concepts: [
      {
        slug: 'loop-lag-measurement',
        name: 'Measure event loop lag',
        detail: 'monitorEventLoopDelay or a timer histogram tells you the thread was busy, not the network.',
        terms: ['loop lag', 'monitorEventLoopDelay', 'histogram', 'lag metric'],
        weight: 2,
      },
      {
        slug: 'synchronous-work-candidate',
        name: 'Find the synchronous work',
        detail: 'A CPU profile over the stall window names the function: sync crypto, big parse, regex.',
        terms: ['cpu profile', 'flame graph', 'synchronous', 'json parse', 'regex', 'pbkdf2'],
        weight: 2,
      },
      {
        slug: 'microtask-starvation',
        name: 'Microtask or promise starvation',
        detail: 'A self-rescheduling await loop can starve the timers phase completely.',
        terms: ['microtask starvation', 'starve the loop', 'await loop', 'infinite microtasks'],
      },
      {
        slug: 'gc-and-heap-pressure',
        name: 'GC pauses under heap pressure',
        detail: 'Major GC on a large heap is a real stall; check pause distribution and RSS trend.',
        terms: ['gc pause', 'heap pressure', 'major gc', 'rss growth'],
      },
      {
        slug: 'not-blame-the-db',
        name: 'Rule out the dependency before believing it',
        detail: 'Healthy database plus slow handler is a process-side problem.',
        terms: ['rule out database', 'dependency healthy', 'process side', 'not the db'],
      },
    ],
    answer: {
      shortAnswer:
        'Check loop lag first. If the loop is stalling, the problem is CPU in this process, and a wall-clock ' +
        'profile over the stall window names it.',
      idealAnswer:
        'The ordering is what makes this fast: loop lag separates "my thread was busy" from "something I called ' +
        'was slow". High lag plus a healthy database is a synchronous-work problem — the usual suspects are a ' +
        'sync crypto call, a large JSON parse, a pathological regex, or a hot await loop that never lets the ' +
        'timers phase run. Then a CPU profile over the window, then the code change, then the metric that proves ' +
        'it went back to 4 ms.',
      deepAnswer:
        'Two traps. First, health checks share the loop with the workload, so head-of-line blocking on a single ' +
        'endpoint takes the pod out of rotation and looks like an infrastructure failure — which is why a ' +
        'liveness probe should be cheap and why you should never fix it by raising the timeout. Second, GC and ' +
        'loop starvation look identical in the latency graph and have different fixes, so look at the RSS trend ' +
        'and the pause histogram together. The reason this is a single-process problem: one core, one thread, ' +
        'shared fate for every request in the pod.',
      commonMistakes:
        '- Reaching for the database dashboard first.\n' +
        '- Increasing the health check timeout instead of finding the stall.\n' +
        '- Scaling replicas before knowing whether one request caused it.',
      whyWrong:
        'Scaling replicas spreads a CPU-bound bug across more pods and hides it in the graph while doubling the ' +
        'bill. Raising the probe timeout converts a fast, honest failure into a slow, confusing one.',
      followUps:
        '1. Which metric would have caught this at deploy?\n' +
        '2. How do you profile without restarting?\n' +
        '3. What does this look like with 8 replicas?',
      exercise:
        'Add a blocking call to one handler in a local service, watch the health-check latency move, then fix it ' +
        'and show lag flat under the same load.',
    },
  },
  {
    slug: 'drill-why-event-loop-exists',
    topicSlug: 'event-loop',
    categoryKey: 'why',
    levelKey: 'understanding',
    difficulty: 2,
    lessonSlug: 'the-event-loop-from-the-inside',
    stem: 'What problem made the event loop necessary, as opposed to a thread per request?',
    body: 'Answer in two sentences, then name the one resource the loop is actually conserving.',
    concepts: [
      {
        slug: 'thread-cost-scaling',
        name: 'Threads are expensive per connection',
        detail: 'Stack memory plus scheduler work caps a box at a few thousand concurrent connections.',
        terms: ['thread cost', 'stack memory', 'context switch', 'scheduler', 'expensive per connection'],
        weight: 2,
      },
      {
        slug: 'waiting-dominates',
        name: 'Most request time is waiting on I/O',
        detail: 'A blocked thread does nothing useful, so a dedicated thread per waiter wastes the CPU.',
        terms: ['waiting', 'mostly i/o wait', 'idle thread', 'blocked thread'],
        weight: 2,
      },
      {
        slug: 'conserves-thread',
        name: 'The loop conserves execution contexts, not memory alone',
        detail: 'One thread plus a readiness set means cost per connection is bytes, not a stack.',
        terms: ['execution context', 'one thread', 'conserves threads', 'capacity'],
      },
    ],
    answer: {
      shortAnswer:
        'Thread-per-connection makes waiting expensive; the loop makes waiting nearly free by keeping one thread ' +
        'and registering for readiness.',
      idealAnswer:
        'A request spends most of its life waiting on a database or a downstream call. Giving each waiting ' +
        'connection its own thread buys nothing but memory and scheduler overhead, and the box runs out of both ' +
        'long before it runs out of bandwidth. The event loop keeps one thread busy only when bytes actually ' +
        'move, so a connection costs a small state object rather than an 8 MB stack.',
      deepAnswer:
        'The conserved resource is the execution context, and that reframes the folklore: the loop does not make ' +
        'I/O faster, it removes the cost of waiting. It also explains the limitation precisely — the same design ' +
        'that makes waiting free makes CPU work expensive, because there is one thread and it is shared by every ' +
        'connection in the process. Any answer to this question that does not name the trade in one direction is ' +
        'half an answer.',
      commonMistakes:
        '- "Because Node is asynchronous" — a label, not a cause.\n' +
        '- Claiming the loop makes code run in parallel.\n' +
        '- Saying it conserves memory and stopping, without naming the per-thread cost.',
      whyWrong:
        'Teams that think the loop is about speed try to fix CPU-bound latency by adding async, and teams that ' +
        'think it is about memory run 16 workers on a 2-core box.',
      followUps:
        '1. What does the loop cost when one handler is CPU-bound?\n' +
        '2. Where does the libuv pool fit in this story?\n' +
        '3. Why did Apache prefork need replacing?',
      exercise:
        'Serve 5,000 idle sockets on one process and report RSS and fd count, then estimate what the same ' +
        'load would cost at 8 MB of stack per connection.',
    },
  },
  {
    slug: 'drill-interview-event-loop',
    topicSlug: 'event-loop',
    categoryKey: 'interview',
    levelKey: 'judgment',
    difficulty: 6,
    lessonSlug: 'the-event-loop-from-the-inside',
    stem: 'Sixty seconds: explain the event loop to an interviewer who will interrupt. Then take the follow-ups.',
    body: [
      'Expect the interruptions:',
      '1. "So it is single threaded — how do you use multiple cores?"',
      '2. "What is the difference between a microtask and a macrotask, in production terms?"',
      '3. "When would you choose a different runtime instead?"',
    ].join('\n'),
    concepts: [
      {
        slug: 'one-task-at-a-time',
        name: 'One task at a time, callbacks queued by phase',
        detail: 'Stack empties, microtasks drain, then the next loop phase.',
        terms: ['one task at a time', 'phases', 'call stack', 'drain microtasks'],
        weight: 2,
      },
      {
        slug: 'io-off-thread',
        name: 'Waiting is delegated to the OS or the pool',
        detail: 'epoll for sockets, libuv threads for fs, crypto and dns.',
        terms: ['epoll', 'libuv', 'thread pool', 'non-blocking', 'kernel'],
        weight: 2,
      },
      {
        slug: 'cluster-for-cores',
        name: 'Cores come from processes, not from the loop',
        detail: 'cluster or replicas; the loop buys concurrency, not parallelism.',
        terms: ['cluster', 'multiple processes', 'replicas', 'parallelism needs cores'],
        weight: 2,
      },
      {
        slug: 'shared-fate-consequence',
        name: 'The cost is shared fate',
        detail: 'Any CPU-bound handler delays every other request in the process.',
        terms: ['shared fate', 'head of line', 'blocks everyone', 'one slow handler'],
        weight: 2,
      },
      {
        slug: 'runtime-choice-tradeoff',
        name: 'A defensible reason to choose otherwise',
        detail: 'CPU-heavy workloads, per-request isolation, or worker-based runtimes.',
        terms: ['go service', 'worker threads', 'cpu-bound workload', 'alternative runtime', 'per-request isolation'],
      },
    ],
    answer: {
      shortAnswer:
        'One thread runs a queue of tasks; I/O waits are handed to the kernel or a thread pool, so the thread is ' +
        'free for whatever actually needs CPU. Concurrency, not parallelism.',
      idealAnswer:
        'The sixty-second version: pop a task, drain microtasks, advance the loop phase. Concurrency comes from ' +
        'never spending thread time on waiting. Multiple cores come from processes — cluster or replicas behind ' +
        'one port. Microtasks matter because a self-rescheduling promise can starve timers entirely, which is a ' +
        'production bug, not a trivia answer. And the honest limitation: any synchronous CPU work stalls every ' +
        'request in the process, so CPU-heavy services want a runtime with real parallelism per request.',
      deepAnswer:
        'The senior differentiator is naming the failure modes rather than the API. Loop lag as a metric, the ' +
        'accept-queue when the poll phase is busy, the libuv pool shared between fs, crypto and dns so a login ' +
        'spike delays file reads, and the fact that backpressure is the consumer telling the producer to slow ' +
        'down. Then the runtime choice: for a parse-heavy or image-heavy service, Go or a worker pool is not a ' +
        'preference, it is arithmetic — 400 ms of CPU per request on one thread is 2.5 requests per second, full ' +
        'stop.',
      commonMistakes:
        '- Reciting the phase names with no consequence attached.\n' +
        '- Saying Node is single threaded "so it does not need locks" and stopping.\n' +
        '- Claiming async makes CPU work faster.',
      whyWrong:
        'An answer without failure modes reads as documentation, and the follow-up that asks "what breaks" has ' +
        'nothing behind it. The interview is decided by the second question, not the first.',
      followUps:
        '1. How would you size the process count for a 4-core box?\n' +
        '2. Where does the thread pool become your bottleneck?\n' +
        '3. What metric would you add to a dashboard first?',
      exercise:
        'Answer it out loud in sixty seconds, record it, then rewrite the parts where you named an API instead of ' +
        'a consequence.',
    },
  },
  {
    slug: 'drill-blocking-crypto-security',
    topicSlug: 'cpu-bound-vs-io-bound',
    categoryKey: 'security',
    levelKey: 'production',
    difficulty: 5,
    stem: 'Password hashing has to be expensive. How do you make it expensive without letting an attacker use it as a DoS lever?',
    body: 'Cover the work factor, the placement, and the admission control in front of it.',
    concepts: [
      {
        slug: 'memory-hard-kdf',
        name: 'A memory-hard KDF with a tuned work factor',
        detail: 'argon2id or scrypt; bcrypt only if the pipeline is legacy; never sha256 of the password.',
        terms: ['argon2', 'scrypt', 'bcrypt', 'memory hard', 'work factor', 'pepper'],
        weight: 2,
      },
      {
        slug: 'off-the-loop-placement',
        name: 'Never on the event loop',
        detail: 'pbkdf2Sync or createHash in a handler blocks every other request in the process.',
        terms: ['pbkdf2sync', 'sync crypto', 'worker thread', 'off the loop', 'blocks everyone'],
        weight: 2,
      },
      {
        slug: 'rate-limit-and-cost',
        name: 'Admission control ahead of the expensive path',
        detail: 'Rate limit by IP and account, CAPTCHA escalation, and a queue bound so hashing cannot pile up.',
        terms: ['rate limit', 'captcha', 'queue bound', 'admission control', 'lockout'],
        weight: 2,
      },
      {
        slug: 'cost-asymmetry',
        name: 'The cost asymmetry is the attack',
        detail: 'One 200 ms hash per request means 5 hashes per second kills the box; the attacker controls volume.',
        terms: ['asymmetry', 'attacker controls volume', 'cheap to send', 'amplification'],
      },
    ],
    answer: {
      shortAnswer:
        'Tune the KDF to the hardware, run it off the request thread, and put cheap rejection in front of the ' +
        'expensive step so the attacker pays before you do.',
      idealAnswer:
        'Hashing is deliberately expensive, so the endpoint turns CPU into a weapon: at 150 ms per hash, one ' +
        'core accepts roughly 6 login attempts per second, and a script with 200 connections makes the whole pod ' +
        'unavailable to real users. Fix it in layers — rate limit and lockout checked in memory or Redis before ' +
        'the hash, bounded queue with shedding so attempts cannot pile up unboundedly, and the KDF itself running ' +
        'on a worker or a separate pool so it never sits on the event loop.',
      deepAnswer:
        'Two more details separate a designed answer from a checked-boxes one. Timing: compare macs or return ' +
        'uniform errors so a response-time difference does not enumerate accounts, and hash even for unknown ' +
        'users at a comparable cost so user existence is not leaked. And the work factor is a moving number: ' +
        'argon2id with a target of roughly 100-200 ms on current hardware, recorded alongside the hash so you can ' +
        're-hash lazily on login when hardware gets faster — otherwise your security decays silently over five ' +
        'years while remaining "bcrypt".',
      commonMistakes:
        '- pbkdf2Sync inside the handler.\n' +
        '- sha256(password) because "we added a salt".\n' +
        '- Rate limiting after the hash, which is where the cost already landed.',
      whyWrong:
        'The classic login outage is not a broken hash, it is a correct hash with no admission control, and a ' +
        'sync crypto call in a handler, which is an availability failure caused by a security measure.',
      followUps:
        '1. What is your target hashing time and why?\n' +
        '2. How do you raise the work factor later?\n' +
        '3. What does an unknown-user login cost versus a known-user one?',
      exercise:
        'Measure your login endpoint under 100 concurrent attempts with and without a pre-hash rate limit; report ' +
        'p99 for an unrelated endpoint in both runs.',
    },
  },
  {
    slug: 'drill-async-duplication-bug',
    topicSlug: 'event-loop',
    categoryKey: 'output-prediction',
    levelKey: 'implementation',
    difficulty: 3,
    lessonSlug: 'the-event-loop-from-the-inside',
    stem: 'Two requests arrive for the same user. What does this do, and what is the fix that survives a redeploy?',
    body: [
      '```js',
      'let cache = new Map();',
      'async function getUser(id) {',
      '  if (cache.has(id)) return cache.get(id);',
      '  const user = await db.user.findUnique({ where: { id } });',
      '  cache.set(id, user);',
      '  return user;',
      '}',
      '```',
      'Assume 10 concurrent requests for the same id.',
    ].join('\n'),
    concepts: [
      {
        slug: 'await-boundary-race',
        name: 'The check-then-act spans an await',
        detail: 'has() is true for every caller until the first one resumes and sets.',
        terms: ['race', 'check then act', 'interleaving', 'await boundary', 'both miss'],
        weight: 2,
      },
      {
        slug: 'singleflight-promise-map',
        name: 'Coalesce on an in-flight promise',
        detail: 'Store the promise, not the value, so concurrent callers await one query.',
        terms: ['singleflight', 'promise map', 'in-flight', 'coalesc', 'dedupe concurrent'],
        weight: 2,
      },
      {
        slug: 'process-local-cache-limits',
        name: 'A module Map is per process and unbounded',
        detail: 'No eviction, no cross-pod coherence, memory growth with distinct ids.',
        terms: ['per process', 'unbounded', 'no eviction', 'lru', 'stale across pods'],
        weight: 2,
      },
      {
        slug: 'unique-constraint-fallback',
        name: 'Correctness belongs in the database',
        detail: 'A cache optimises reads; a unique index or transaction is what guarantees a fact.',
        terms: ['unique constraint', 'database guarantee', 'not a cache', 'transaction'],
      },
    ],
    answer: {
      shortAnswer:
        'All 10 miss: each one checks before the first one resumes, so you run 10 identical queries. Store the ' +
        'in-flight promise, not the resolved value — and know that this cache is per process.',
      idealAnswer:
        'The bug is check-then-act across an await boundary. Fix the stampede by writing the promise into the map ' +
        'before awaiting: const pending = db.user.findUnique(...); cache.set(id, pending); return await pending. ' +
        'Then bound it — an LRU with a max entry count and a TTL — because an unbounded Map keyed by user id is ' +
        'a memory incident scheduled for the day the traffic grows. With replicas, each pod has its own copy, so ' +
        'anything that must be true is a constraint, not a cache.',
      deepAnswer:
        'The deeper point is the difference between an optimisation and a guarantee. A cache can be wrong for ' +
        'milliseconds; a unique index cannot. If this pattern were about reserving inventory rather than reading ' +
        'a profile, promise coalescing would not be enough — you would need the database to arbitrate, either a ' +
        'unique insert or a row lock, because two processes can each hold a correct local view. That is also why ' +
        'a redeploy resets the cache and a cold pod stampedes again: the fix has to hold at the boundary that is ' +
        'durable, and TTL jitter plus a stale-while-revalidate policy is what makes that survivable.',
      commonMistakes:
        '- "Add a lock" when the query is read-only and a shared promise is enough.\n' +
        '- Leaving the Map unbounded.\n' +
        '- Believing the cache is shared between pods.',
      whyWrong:
        'An unbounded cache is a leak with a good reputation. And using a process-local cache for correctness — ' +
        'not just speed — is how double bookings get shipped.',
      followUps:
        '1. How do you invalidate on a write from another pod?\n' +
        '2. What does the fix cost under 10,000 distinct ids?\n' +
        '3. Rewrite it for an inventory reservation.',
      exercise:
        'Prove the 10 concurrent misses with a query counter, apply promise coalescing, and show the counter read ' +
        '1. Then push 50k distinct ids and report RSS.',
    },
  },
  {
    slug: 'drill-design-webhook-fanout',
    topicSlug: 'cpu-bound-vs-io-bound',
    categoryKey: 'architecture',
    levelKey: 'design',
    difficulty: 5,
    stem: 'Design the handler: one inbound webhook must fan out to 200 partner endpoints, and the box has 2 cores.',
    body: 'Give the concurrency model, the bound, the retry policy and what you measure.',
    concepts: [
      {
        slug: 'io-bound-model',
        name: 'Recognise the workload as I/O bound',
        detail: 'Waiting on 200 HTTP calls is not a CPU problem; a queue plus bounded workers fits.',
        terms: ['io-bound', 'waiting on network', 'concurrency not parallelism', 'event loop fine'],
        weight: 2,
      },
      {
        slug: 'bounded-concurrency-budget',
        name: 'Explicit concurrency budget',
        detail: 'A worker pool or p-limit with a stated number, not fire-and-forget Promise.all.',
        terms: ['concurrency budget', 'p-limit', 'bounded queue', 'worker pool', 'semaphore'],
        weight: 2,
      },
      {
        slug: 'durable-queue-retry',
        name: 'Durable per-destination queue with backoff and DLQ',
        detail: 'Slow partner cannot hold the process; failures are retried, poison ones parked.',
        terms: ['durable queue', 'backoff', 'dead letter', 'per destination', 'retry policy'],
        weight: 2,
      },
      {
        slug: 'idempotent-delivery',
        name: 'Idempotency for at-least-once delivery',
        detail: 'Deliveries duplicate, so partners need a stable event id.',
        terms: ['idempotent', 'event id', 'duplicate delivery', 'at least once'],
      },
      {
        slug: 'measurement-of-shape',
        name: 'Metrics that show the shape',
        detail: 'Queue depth, per-destination latency, oldest pending age, shed counts.',
        terms: ['queue depth', 'lag', 'oldest message age', 'latency per destination', 'throughput'],
      },
    ],
    answer: {
      shortAnswer:
        'It is I/O bound, so do not spawn 200 processes. Accept the event durably, acknowledge fast, and drain it ' +
        'with a bounded worker pool that has per-destination queues, backoff and a dead letter.',
      idealAnswer:
        'Return 202 as soon as the event is persisted; fan-out is background work, and the sender must never wait ' +
        'on your slowest partner. Bound the work with a stated concurrency budget — for example 50 in flight ' +
        'across 2 cores, sized so the loop still has headroom — and isolate partners so one endpoint at 8 seconds ' +
        'per response cannot consume the whole budget: a queue per destination, or a semaphore per destination. ' +
        'Retries with jittered exponential backoff and a ceiling, dead letters with an alert, and a stable event ' +
        'id so duplicates are absorbed.',
      deepAnswer:
        'The sizing arithmetic: 200 destinations at 300 ms each is 60 seconds of sequential wait, or 1.2 seconds ' +
        'at 50 concurrent, and none of that is CPU — so the constraint is file descriptors, memory per in-flight ' +
        'request and the partner rate limits, not cores. The failure mode to design against is the retry storm: ' +
        'a partner recovering into 20,000 queued deliveries needs a ramp, not a full-budget fire hose. Measure ' +
        'oldest-pending-age per destination — that is the number that predicts the support ticket.',
      commonMistakes:
        '- Promise.all over 200 endpoints inside the request handler.\n' +
        '- "Scale replicas" as the first answer for an I/O-bound fan-out.\n' +
        '- One shared queue where one dead partner blocks everyone.',
      whyWrong:
        'Unbounded fan-out in the handler converts one partner outage into your outage, and a shared queue turns ' +
        'a single slow endpoint into head-of-line blocking for the other 199 — a head-of-line blocking incident ' +
        'with a customer name attached.',
      followUps:
        '1. How do you size the concurrency budget?\n' +
        '2. What does the partner at 8 s latency cost the others?\n' +
        '3. How do you drain 20,000 backlog messages safely?',
      exercise:
        'Simulate 200 endpoints with three of them returning 500 and one at 5 s latency; prove the fast partners ' +
        'finish on time and the poison messages reach a dead letter.',
    },
  },
  {
    slug: 'drill-what-not-to-build',
    topicSlug: 'event-loop',
    categoryKey: 'senior-judgment',
    levelKey: 'teaching',
    difficulty: 7,
    stem: 'A team wants to rewrite their I/O-bound NestJS service in Rust "because Node is slow". What do you do?',
    body: 'Not a yes or no. Name what you would measure, what would justify the rewrite, and what would not.',
    concepts: [
      {
        slug: 'measurement-before-decision',
        name: 'Demand the measurement',
        detail: 'A rewrite is a cost of months; the case must be numbers, not sentiment.',
        terms: ['measure first', 'benchmark', 'profile', 'data', 'p99 evidence'],
        weight: 2,
      },
      {
        slug: 'io-vs-cpu-shape',
        name: 'Check whether the workload is even CPU shaped',
        detail: 'I/O-bound services are rarely runtime-bound; the rewrite cannot fix waiting.',
        terms: ['io bound', 'not cpu bound', 'waiting dominates', 'runtime is not the bottleneck'],
        weight: 2,
      },
      {
        slug: 'cheaper-alternatives',
        name: 'Enumerate cheaper fixes',
        detail: 'Move sync work off the loop, cluster, cache, trim the payload, fix the query.',
        terms: ['cheaper fix', 'cache', 'cluster', 'worker thread', 'query optimisation', 'payload size'],
        weight: 2,
      },
      {
        slug: 'total-cost-of-switch',
        name: 'Cost of the switch, honestly',
        detail: 'Rewrite time, hiring, library gaps, lost team knowledge, two systems running.',
        terms: ['opportunity cost', 'hiring', 'team knowledge', 'rewrite time', 'ecosystem', 'maintenance'],
      },
      {
        slug: 'reversibility',
        name: 'Reversibility and option value',
        detail: 'Prefer the smallest reversible step that produces evidence; carve one hot path instead of all.',
        terms: ['reversible', 'pilot', 'one endpoint', 'incremental', 'option value'],
      },
    ],
    answer: {
      shortAnswer:
        'Refuse the premise, not the frustration: get the profile, and if the hotspot really is CPU in the ' +
        'runtime, rewrite that one path — not the service.',
      idealAnswer:
        'First the evidence: p99 breakdown by component, CPU profile over the busy window, and loop lag. For an ' +
        'I/O-bound service the honest answers are usually a synchronous call in the handler, an N+1 query, a ' +
        'payload being serialised twice, or a missing cache — each fixable in a day. Then the cost of the switch: ' +
        'a rewrite buys microseconds of runtime speed and spends months of feature time, a hiring pool, and every ' +
        'library the team currently relies on. If a genuine CPU-bound kernel exists, extract that one path as a ' +
        'service or worker and keep the rest.',
      deepAnswer:
        'The judgment part is naming the real driver, because it is rarely the runtime. Sometimes it is "we want ' +
        'to learn Rust", which is legitimate and should be paid for with a bounded pilot, not with a migration ' +
        'roadmap. Sometimes it is a team that has never seen their own latency breakdown and is guessing — in ' +
        'which case the deliverable is the measurement, and the rewrite conversation ends by itself. Write the ' +
        'decision down as an ADR with the numbers that would change your mind, and the reversibility of each ' +
        'option: a pilot is reversible, a rewrite is a one-way door.',
      commonMistakes:
        '- Agreeing because the enthusiasm is real.\n' +
        '- Refusing without data, which loses the room.\n' +
        '- Treating a rewrite as a performance plan with no measurement attached.',
      whyWrong:
        'A framework rewrite is the most expensive way to discover that the fix was a missing index. And a ' +
        'rejected-without-data answer teaches the team that performance is a matter of opinion, so nobody ' +
        'measures next time either.',
      followUps:
        '1. What number would make you support the rewrite?\n' +
        '2. What is the smallest reversible experiment?\n' +
        '3. Who maintains it in two years?',
      exercise:
        'Write the ADR for this decision: options, the measurement you took, the cost of each, and the trigger ' +
        'that would reopen it.',
    },
  },
];
