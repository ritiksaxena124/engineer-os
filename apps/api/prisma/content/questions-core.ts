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
  {
    slug: 'drill-interview-process-model',
    topicSlug: 'how-programs-run',
    categoryKey: 'interview',
    levelKey: 'production',
    difficulty: 5,
    lessonSlug: 'the-life-of-a-program',
    stem:
      'Sixty seconds: an interviewer asks what a process actually is and why a backend engineer should care. ' +
      'Answer it, then take the interruptions.',
    body: [
      'Expect to be cut off, and expect each interruption to be a production story:',
      '1. "I keep a Map at module scope as a cache. I run four cluster workers. How many caches are there?"',
      '2. "One worker segfaulted and the other three kept serving. Why did the box survive?"',
      '3. "The machine says EMFILE. Where is that limit actually living?"',
    ].join('\n'),
    concepts: [
      {
        slug: 'process-private-address-space',
        name: 'A process owns a private address space',
        detail: 'Page tables the kernel maintains for that process alone; nothing inside is visible from outside.',
        terms: ['address space', 'page table', 'private', 'virtual memory', 'isolated memory'],
        weight: 2,
      },
      {
        slug: 'kernel-bookkeeping-not-code',
        name: 'A process is kernel bookkeeping, not code',
        detail: 'pid, file-descriptor table, signal dispositions, a scheduler entry — the running half of a program.',
        terms: ['pid', 'file descriptor table', 'file descriptors', 'signal', 'scheduler'],
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
        slug: 'process-boundary-is-failure-domain',
        name: 'The process boundary is the failure domain',
        detail: 'A crash destroys one address space; the kernel reclaims its memory and descriptors.',
        terms: ['failure domain', 'segfault', 'crash', 'kernel reclaims', 'does not take down', 'isolated failure'],
        weight: 1,
      },
      {
        slug: 'cluster-shares-a-socket-not-a-heap',
        name: 'Cluster shares the listening socket and nothing else',
        detail: 'The kernel distributes accepted connections across workers; every heap stays apart.',
        terms: ['listening socket', 'shared port', 'accept', 'round robin', 'cluster workers'],
        weight: 1,
      },
    ],
    answer: {
      shortAnswer:
        'A process is the kernel carrying one instance of a program: a private address space, its own descriptor ' +
        'table, its own signal state. You care because every "shared" thing in your service is actually per worker.',
      idealAnswer:
        'The program is a file; the process is the live object the kernel built from it — page tables mapping a ' +
        'private virtual address space, a file-descriptor table, heaps and thread stacks, signal dispositions, and ' +
        'a place in the scheduler. Nothing crosses that boundary by accident. So four cluster workers are four ' +
        'copies of every module-level Map, four separate limits on open descriptors, and four independent ways to ' +
        'die: a segfault in one is reclaimed by the kernel while the master keeps accepting into the other three. ' +
        'What they share is the listening socket, which the kernel hands connections out from — which is exactly ' +
        'why sticky in-memory state breaks the first time you scale past one worker.',
      deepAnswer:
        'The interview answer becomes a production answer in three places. Session storage: an in-memory session ' +
        'store on a four-worker service has four stores, so a user is authenticated on one request and logged out ' +
        'on the next, and it reproduces only in staging where you ran one worker. Rate limiting: a counter in a ' +
        'module variable divides your limit by the worker count, so a "100 requests per minute" limiter silently ' +
        'becomes 400. And EMFILE: descriptors are a per-process table, so raising the machine-wide ulimit without ' +
        'raising the process limit is the classic half-fix that "works" the first day and fails under load. Every ' +
        'one of these is the same fact: the address space is private and the kernel is the only thing that lets ' +
        'processes cooperate — sockets, shared memory segments, pipes, files with locking.',
      commonMistakes:
        '- "A process is a program in memory" and stopping there, with no consequences named.\n' +
        '- Claiming cluster workers share memory because they run the same binary.\n' +
        '- Answering the interruption about EMFILE with a machine-level fix.\n' +
        '- Reaching for "thread" when the question was about process isolation.',
      whyWrong:
        'The vague version is indistinguishable from not knowing it, and the interviewer takes the follow-up as ' +
        'the real test. In production the same vagueness is what produces the four-caches bug, a rate limiter four ' +
        'times looser than the spec, and a week spent on a "stochastic" logout that only happens in production.',
      followUps:
        '1. What exactly do two cluster workers share, and who shares it for them?\n' +
        '2. If you need one cache across workers, what are your options and their costs?\n' +
        '3. A thread differs from a process in which two structures?\n' +
        '4. How would you prove the per-process limit from the command line?',
      exercise:
        'Start a Node service with four cluster workers, put a counter at module scope, and load it with 400 ' +
        'requests. Print the sum each worker saw, then explain the four numbers to someone who expected one.',
    },
  },
  {
    slug: 'drill-interview-cpu-io-shape',
    topicSlug: 'cpu-bound-vs-io-bound',
    categoryKey: 'interview',
    levelKey: 'judgment',
    difficulty: 6,
    stem:
      'Sixty seconds: why did hashing a password inside the login handler take down an API that still had CPU ' +
      'capacity free?',
    body: [
      'Then the follow-ups, in order:',
      '1. "How much of a normal request was waiting, and how much was computing?"',
      '2. "You are single threaded — so more cores do nothing for me?"',
      '3. "What do you change, and what number tells you it worked?"',
    ].join('\n'),
    concepts: [
      {
        slug: 'loop-is-one-queue-for-everyone',
        name: 'One loop, every request in line behind it',
        detail: 'Code on the stack is a resource every other request has to wait behind.',
        terms: ['single thread', 'event loop', 'one at a time', 'queue behind', 'head of line', 'head-of-line'],
        weight: 2,
      },
      {
        slug: 'blocking-work-is-everyones-latency',
        name: 'CPU work in a handler is latency for unrelated endpoints',
        detail: 'A 120 ms hash holds the loop, so health checks and reads pay for it too.',
        terms: ['latency for everyone', 'unrelated endpoints', 'loop lag', 'p99', 'blocks the loop', 'stalls'],
        weight: 2,
      },
      {
        slug: 'workload-shape-decides-the-fix',
        name: 'Know which shape the workload has',
        detail: 'I/O-bound traffic spends its time waiting; CPU-bound work spends it computing. Only one of them ' +
          'is helped by concurrency tricks on the loop.',
        terms: ['io bound', 'cpu bound', 'workload shape', 'waiting dominates', 'computing dominates'],
        weight: 2,
      },
      {
        slug: 'waiting-is-delegated-computing-is-not',
        name: 'Waiting gets delegated, computing does not',
        detail: 'The kernel and the pool hold I/O while the loop serves others; a hash has nobody to hand off to.',
        terms: ['epoll', 'libuv', 'thread pool', 'non-blocking', 'delegated', 'kernel does the waiting'],
        weight: 2,
      },
      {
        slug: 'offload-is-a-trade',
        name: 'Offloading is a trade, not a free fix',
        detail: 'Worker threads cost memory and start-up; a separate service costs a hop and another deploy.',
        terms: ['worker thread', 'separate service', 'trade-off', 'extra hop', 'startup cost', 'serialisation'],
        weight: 1,
      },
    ],
    answer: {
      shortAnswer:
        'The login handler was doing 120 ms of CPU work on the one loop that serves every request, so the whole ' +
        'API waited behind it. Free cores do not help: only the loop thread can run your JavaScript.',
      idealAnswer:
        'Start with the shape. An API that is 90% database reads spends its wall clock waiting, and waiting is ' +
        'cheap — the kernel holds the socket while the loop takes the next request. bcrypt is the opposite: 100+ ' +
        'ms of synchronous arithmetic on the loop thread, during which nothing else runs. At 60 logins a second ' +
        'that is 6 seconds of loop occupancy per second, which is over budget, so queue depth grows and every ' +
        'endpoint — including /healthz — inherits the delay. The idle cores are irrelevant: exactly one thread ' +
        'executes your JavaScript, and the other cores only hold the I/O the loop already released. The fix is to ' +
        'get the computing off the loop: a worker pool or a separate hashing service, plus a cost check on the ' +
        'hash itself. The number that proves it is loop lag and p99 on an unrelated endpoint, not login latency.',
      deepAnswer:
        'The diagnostic that settles this in minutes is a CPU profile plus loop lag, side by side. If loop lag ' +
        'tracks the login rate, you have a CPU-bound slice inside an I/O-bound service, which is the most ' +
        'common Node performance incident and the one teams misdiagnose most often, because the dashboard says ' +
        '"CPU 15%". At 15% average across eight cores, one core pinned is invisible. That is why the honest ' +
        'answer names per-thread utilisation, not machine average. It also explains why clustering to eight ' +
        'workers helps throughput and does nothing about the login: the same 120 ms still blocks each worker\'s ' +
        'own loop, and now eight workers each burn it. The cheapest correct move is usually to make the work ' +
        'smaller — tune the cost factor, move hashing to the write path or an async job, batch it — before ' +
        'paying for worker-thread start-up and serialisation of the payload across the boundary.',
      commonMistakes:
        '- Saying "Node is single threaded so it is slow" and stopping there.\n' +
        '- Prescribing more cores or more cluster workers before naming which resource is actually saturated.\n' +
        '- Confusing blocking the event loop with being CPU-bound as a workload.\n' +
        '- Quoting machine-wide CPU average as evidence the loop was free.',
      whyWrong:
        'The "add workers" answer makes the incident worse and costs a redeploy to discover it, because the ' +
        'bottleneck is per-loop, not per-machine. And quoting machine CPU while one thread is pinned is how a ' +
        'team concludes the monitoring is lying and stops trusting their own dashboards.',
      followUps:
        '1. What is the difference between blocking the loop and being CPU bound?\n' +
        '2. How would you size the worker pool, and what does each worker cost?\n' +
        '3. Which metric tells you the fix worked, and which metric would still lie to you?\n' +
        '4. If hashing moved to a separate service, what new failure modes did you buy?',
      exercise:
        'Write a handler that runs a 100 ms synchronous busy loop on one route and a trivial read on another. ' +
        'Load the trivial route, add the busy route at 50 rps, and report p50 and p99 for both before and after ' +
        'moving the busy work into a worker thread.',
    },
  },
  {
    slug: 'drill-scale-before-shape',
    topicSlug: 'processes-threads',
    categoryKey: 'senior-judgment',
    levelKey: 'teaching',
    difficulty: 7,
    stem:
      'A team wants to go from 2 to 16 cluster workers because "Node is single threaded and we need to scale". ' +
      'Traffic is 90% Postgres reads and the box has 4 cores. What do you say?',
    body:
      'Not a yes or no. Name what you would measure before deciding, what an extra worker actually buys here, ' +
      'and what you would do instead. Say what you would tell them to do on Monday.',
    concepts: [
      {
        slug: 'limiting-resource-before-scaling',
        name: 'Find the limiting resource before adding capacity',
        detail: 'Workers add loop concurrency. They add no database capacity, no bandwidth, no cores.',
        terms: ['bottleneck', 'limiting resource', 'measure first', 'profile', 'cpu saturation', 'what is saturated'],
        weight: 2,
      },
      {
        slug: 'workers-oversubscribe-cores',
        name: 'Sixteen workers on four cores is contention',
        detail: 'Beyond the core count, extra workers add context switches and scheduling delay, not throughput.',
        terms: ['context switch', 'oversubscribe', 'contention', 'cores available', 'four cores', 'thrash'],
        weight: 2,
      },
      {
        slug: 'connection-pool-is-the-ceiling',
        name: 'The connection pool is the real ceiling',
        detail: 'Sixteen workers each holding a pool multiply the load on one Postgres that has one limit.',
        terms: ['connection pool', 'database connections', 'postgres limit', 'pool per process', 'max_connections'],
        weight: 2,
      },
      {
        slug: 'heap-multiplies-per-worker',
        name: 'Every worker brings its own heap',
        detail: 'Module caches, buffers and compiled code footprint multiply with the process count.',
        terms: ['heap per process', 'memory footprint', 'rss', 'cache duplication', 'out of memory', 'container limit'],
        weight: 1,
      },
      {
        slug: 'cheaper-fix-before-processes',
        name: 'Prefer the fix that does not need more processes',
        detail: 'Cache the hot read, kill the N+1, add the index — then re-measure.',
        terms: ['cache', 'n+1', 'batch', 'index', 'cheaper fix', 'query optimisation', 're-measure'],
        weight: 1,
      },
    ],
    answer: {
      shortAnswer:
        'Refuse the number, not the goal: sixteen workers on four cores is contention, and a read-heavy service ' +
        'is limited by Postgres, not by the loop. Measure which resource is saturated, then fix that one.',
      idealAnswer:
        'First the measurement, because the premise has two claims in it and only one is checkable. Is the loop ' +
        'saturated? That is loop lag and per-process CPU, not machine average — and with 90% Postgres reads the ' +
        'answer is almost always no, the requests are waiting. Then what is saturated: usually database ' +
        'connections or query time, and a worker cannot add either. Second the arithmetic the proposal skips: ' +
        'sixteen workers on four cores oversubscribe the CPU and each worker carries its own heap, its own ' +
        'connection pool, and its own copy of every module-level cache, so sixteen workers means sixteen pools ' +
        'against a Postgres that has one max_connections — the change converts a latency problem into a ' +
        'connection-exhaustion outage. On Monday: profile one endpoint, take the top query, add the missing index ' +
        'or the cache, and set workers at cores minus one. If the loop genuinely is the ceiling on a read-heavy ' +
        'path, the argument for more processes is over anyway.',
      deepAnswer:
        'The judgment here is naming what is really driving the request. Usually it is a dashboard that shows ' +
        'high p99 and a team that has read "Node is single threaded" as a confession. Sometimes it is honest ' +
        'excitement about a number going up, which is legitimate and should be satisfied with a bounded ' +
        'experiment: two to three workers is free, sixteen is a change to memory limits, pool sizing and the ' +
        'container spec, all of which have to be re-derived. There is also a quiet correctness cost: every piece ' +
        'of state the team believes is shared becomes N copies, so rate limits loosen by N, in-memory caches ' +
        'drift, and any scheduled job fires N times unless someone gates it. Write the decision as an ADR with ' +
        'the two numbers that would change your mind — loop lag above X at p95, or per-process CPU pinned — and ' +
        'the plan stops being a belief.',
      commonMistakes:
        '- Agreeing to the worker count because it feels like action.\n' +
        '- Refusing without a measurement, which loses the room and teaches nothing.\n' +
        '- Ignoring that each worker multiplies the connection pool and the heap.\n' +
        '- Treating "Node is single threaded" as a workload fact rather than a per-loop fact.',
      whyWrong:
        'Sixteen workers on a four-core box against one Postgres is the rare change that makes latency worse and ' +
        'correctness weaker at the same time: the queues move from the loop to the database, where they are ' +
        'harder to see. And an unmeasured yes on performance is how a team learns that their metrics cannot ' +
        'answer the question they actually care about.',
      followUps:
        '1. Which two metrics would tell you the loop was the ceiling?\n' +
        '2. How do you size the pool when workers × pool size exceeds max_connections?\n' +
        '3. What breaks when a cron scheduled in module scope runs sixteen times?\n' +
        '4. What is the cheapest change that halves p99 on this service?',
      exercise:
        'Write the ADR: current p99 and its breakdown, what you measured, the worker count you chose and why, ' +
        'the pool and memory consequences of it, and the number that would reopen the decision.',
    },
  },

  // ─── system-calls-io (3 questions) ──────────────────────────────────────

  {
    slug: 'drill-what-is-a-syscall',
    topicSlug: 'system-calls-io',
    categoryKey: 'conceptual',
    levelKey: 'understanding',
    difficulty: 2,
    stem: 'What is a system call, and how does it differ from calling a function in your own code?',
    body: 'Name the boundary crossed and who owns each side. One sentence for the mechanism, one for the cost.',
    concepts: [
      {
        slug: 'syscall-crosses-user-kernel-boundary',
        name: 'A syscall crosses from user space into kernel space',
        detail: 'The CPU switches privilege rings; the kernel validates arguments and executes on behalf of the caller.',
        terms: ['user space', 'kernel space', 'privilege ring', 'boundary', 'context switch'],
        weight: 2,
      },
      {
        slug: 'syscall-is-expensive-context-switch',
        name: 'A syscall is expensive because of the context switch',
        detail: 'Registers saved, TLB entries flushed, scheduler may run — not a free jump like a normal function call.',
        terms: ['expensive', 'context switch', 'registers saved', 'TLB flush', 'not free'],
        weight: 2,
      },
      {
        slug: 'kernel-validates-syscall-args',
        name: 'The kernel validates every syscall argument',
        detail: 'Pointers are checked against the caller\'s address space, permissions verified, so a bad pointer returns EFAULT rather than crashing the machine.',
        terms: ['validates', 'checks pointers', 'permissions', 'EFAULT', 'address space'],
      },
    ],
    answer: {
      shortAnswer:
        'A system call is a controlled entry into the kernel where the OS performs privileged work on behalf of ' +
        'a process. It differs from a normal function call because it crosses a privilege boundary and costs a ' +
        'full context switch.',
      idealAnswer:
        'When your code calls read(), the CPU traps into the kernel, saves all registers, checks that the buffer ' +
        'pointer belongs to this process and has write permission, then performs the actual I/O. A normal function ' +
        'call stays in user space: no privilege change, no validation, no TLB flush. The syscall is orders of ' +
        'magnitude more expensive — which is why batching reads or using epoll matters.',
      deepAnswer:
        'This distinction explains almost every performance surprise in systems programming. When someone says ' +
        '"my loop is slow" and it turns out they are calling stat() on every file instead of reading a directory ' +
        'once, the root cause is treating syscalls as free. And when a containerised service hits "too many open ' +
        'files", the limit is per-process but enforced by the kernel at the syscall boundary. Understanding the ' +
        'cost also makes sense of io_uring: it exists to amortise that context-switch overhead across many ' +
        'operations.',
      commonMistakes:
        '- "A syscall is just a function in the OS library."\n' +
        '- Thinking the kernel trusts your pointers.\n' +
        '- Not realising that every console.log goes through a syscall.',
      whyWrong:
        'Treating syscalls as cheap produces the classic N+1 pattern at the filesystem level, and believing the ' +
        'kernel trusts you is how a segfault becomes an exploit.',
      followUps:
        '1. How many syscalls does console.log("hi") actually make?\n' +
        '2. What happens if you pass a pointer to freed memory into read()?\n' +
        '3. Why does strace slow down a program so much?',
      exercise:
        'Run `strace -c node -e "console.log(42)"` and count the syscalls. Then rewrite the script to print 1000 ' +
        'lines and compare the syscall count per line.',
    },
  },

  {
    slug: 'drill-blocking-read-vs-nonblocking',
    topicSlug: 'system-calls-io',
    categoryKey: 'internal',
    levelKey: 'implementation',
    difficulty: 4,
    stem: 'Explain the difference between a blocking read() and a non-blocking read() on a socket. What does the kernel do differently, and what must the application do to handle each?',
    body: 'Two paragraphs: one for the kernel behaviour, one for the application pattern.',
    concepts: [
      {
        slug: 'blocking-read-waits-in-kernel',
        name: 'A blocking read puts the thread to sleep until data arrives',
        detail: 'The kernel marks the thread as waiting on the file descriptor and schedules another thread. The caller gets control back only when bytes are available.',
        terms: ['sleep', 'wait', 'blocked', 'scheduled away', 'control returned later'],
        weight: 2,
      },
      {
        slug: 'nonblocking-read-returns-immediately',
        name: 'A non-blocking read returns immediately with EAGAIN if no data is ready',
        detail: 'The kernel checks the socket buffer once and returns either the available bytes or EAGAIN/EWOULDBLOCK. The application must retry later.',
        terms: ['EAGAIN', 'EWOULDBLOCK', 'immediate return', 'retry', 'poll again'],
        weight: 2,
      },
      {
        slug: 'application-must-poll-or-use-event-loop',
        name: 'Non-blocking I/O requires the application to poll or use an event multiplexer',
        detail: 'Without epoll/kqueue/select, the app would busy-loop. The event loop batches readiness notifications so the app only acts when data is actually there.',
        terms: ['epoll', 'kqueue', 'select', 'event loop', 'readiness notification', 'no busy loop'],
      },
    ],
    answer: {
      shortAnswer:
        'A blocking read sleeps the thread inside the kernel until data arrives. A non-blocking read returns ' +
        'immediately with EAGAIN if nothing is ready, so the application must use an event multiplexer like epoll ' +
        'to know when to retry.',
      idealAnswer:
        'With O_NONBLOCK set, read(fd, buf, n) checks the socket receive buffer once. If it is empty, the kernel ' +
        'returns -1 with errno EAGAIN — the thread never leaves user space. With blocking mode, the kernel parks ' +
        'the thread on a wait queue attached to that fd and wakes it when the NIC DMA\'s data into the buffer. ' +
        'The application using non-blocking I/O cannot spin; it registers the fd with epoll and only calls read ' +
        'when epoll_wait reports EPOLLIN. That is the entire Node.js event loop.',
      deepAnswer:
        'This is the fork in the road between thread-per-request servers and event-driven ones. Apache pre-fork ' +
        'uses blocking reads and pays for thousands of sleeping threads; nginx uses non-blocking reads with epoll ' +
        'and handles tens of thousands of connections on a handful of threads. The cost model is completely ' +
        'different: blocking ties up a stack (8 MB default on Linux) per connection, while non-blocking ties up ' +
        'only a few bytes of kernel state per fd. But non-blocking shifts complexity into the application: you ' +
        'must handle partial reads, reassembly, and backpressure yourself.',
      commonMistakes:
        '- "Non-blocking means the kernel does the work in the background."\n' +
        '- Busy-looping on a non-blocking fd without epoll.\n' +
        '- Forgetting that a non-blocking read can return fewer bytes than requested.',
      whyWrong:
        'Busy-looping burns a core for zero throughput, and assuming the kernel buffers everything leads to data ' +
        'loss when the receive buffer fills. Both are production incidents waiting to happen.',
      followUps:
        '1. What does a partial read look like, and how do you reassemble it?\n' +
        '2. Why does epoll scale better than select?\n' +
        '3. What is edge-triggered vs level-triggered epoll?',
      exercise:
        'Write a Node.js TCP server that reads a line from each client using only net.Socket in non-blocking mode ' +
        '(setEncoding(null), read() in a loop). Handle partial lines and backpressure. Compare it to the same ' +
        'server using the standard "data" event emitter.',
    },
  },

  {
    slug: 'drill-file-descriptor-table',
    topicSlug: 'system-calls-io',
    categoryKey: 'internal',
    levelKey: 'understanding',
    difficulty: 3,
    stem: 'Every process has a file-descriptor table. What lives in it, and what happens when you exceed the limit?',
    body: 'Name three kinds of things that share this table. Say what error the kernel returns and what the symptom looks like in a Node process.',
    concepts: [
      {
        slug: 'fd-table-holds-open-files-sockets-pipes',
        name: 'The fd table maps small integers to kernel objects: files, sockets, pipes',
        detail: 'fd 0/1/2 are stdin/stdout/stderr; everything else is allocated sequentially. Sockets, regular files, and pipes all live here.',
        terms: ['stdin stdout stderr', 'socket', 'pipe', 'regular file', 'integer mapping'],
        weight: 2,
      },
      {
        slug: 'emfile-error-on-exhaustion',
        name: 'Exceeding the limit returns EMFILE ("Too many open files")',
        detail: 'The kernel refuses new open()/socket() calls. In Node, this surfaces as uncaught exceptions on accept() or connect().',
        terms: ['EMFILE', 'Too many open files', 'refuses new', 'accept fails', 'connect fails'],
        weight: 2,
      },
      {
        slug: 'ulimit-controls-fd-limit',
        name: 'The limit is configurable via ulimit -n or /proc/sys/fs/file-max',
        detail: 'Per-process soft/hard limits and a system-wide ceiling. Raising the soft limit is often enough for a single service.',
        terms: ['ulimit', 'soft limit', 'hard limit', 'file-max', 'configurable'],
      },
    ],
    answer: {
      shortAnswer:
        'The fd table maps integers to kernel objects: regular files, sockets, and pipes. When exhausted, the ' +
        'kernel returns EMFILE ("Too many open files"), which in Node crashes accept() or connect() unless caught.',
      idealAnswer:
        'Every open resource — a log file, an outgoing HTTP socket, a child-process pipe — consumes one entry. ' +
        'The default soft limit on most Linux distros is 1024, which sounds like a lot until you realise each ' +
        'HTTP connection uses two fds (one for the socket, one internally for the TLS layer if present). When ' +
        'the table is full, open() returns -1 with errno EMFILE. In a Node server, this means the next incoming ' +
        'connection is silently dropped at the TCP level because accept() fails, and the client sees a timeout.',
      deepAnswer:
        'This is why connection pooling matters even for outbound requests: creating a new https.Agent per request ' +
        'leaks fds faster than garbage collection can close them. And it is why graceful shutdown must drain active ' +
        'connections before exit — otherwise the OS forcibly closes all fds, truncating in-flight writes. The ' +
        'table is also inherited across fork(), which is how cluster workers share listening sockets: the parent ' +
        'opens the listen fd, forks, and each child inherits the same fd number pointing at the same kernel ' +
        'socket.',
      commonMistakes:
        '- "Closing the file handle in JS is enough" without awaiting the close.\n' +
        '- Creating a new Agent per request instead of reusing one.\n' +
        '- Ignoring that child_process.spawn() opens three pipes by default.',
      whyWrong:
        'Leaking fds is the silent killer of long-running services: the first symptom is sporadic timeouts that ' +
        'look like network issues, and by the time anyone runs lsof, the process is already at 1023.',
      followUps:
        '1. How do you find which fds a running Node process has open?\n' +
        '2. What does graceful shutdown have to do with fd cleanup?\n' +
        '3. Why does cluster inherit the listen fd?',
      exercise:
        'Write a Node script that opens 1050 files in a loop without closing them. Observe the EMFILE error, then ' +
        'fix it by raising ulimit -n and by properly closing each fd. Use `lsof -p $$` to verify.',
    },
  },

  // ─── networking-basics (3 questions) ────────────────────────────────────

  {
    slug: 'drill-latency-vs-bandwidth',
    topicSlug: 'networking-basics',
    categoryKey: 'conceptual',
    levelKey: 'understanding',
    difficulty: 2,
    stem: 'Latency and bandwidth are often confused. Define each, give their units, and explain why reducing latency helps more than increasing bandwidth for small requests.',
    body: 'One sentence per definition. One example with numbers.',
    concepts: [
      {
        slug: 'latency-is-round-trip-time',
        name: 'Latency is the time for a single packet to travel round-trip',
        detail: 'Measured in milliseconds. Determined by distance, router hops, and queuing delay.',
        terms: ['round trip', 'RTT', 'milliseconds', 'time', 'delay'],
        weight: 2,
      },
      {
        slug: 'bandwidth-is-throughput-capacity',
        name: 'Bandwidth is the maximum data rate the link can carry',
        detail: 'Measured in bits per second (Mbps, Gbps). Determined by the physical medium and link aggregation.',
        terms: ['throughput', 'bits per second', 'Mbps', 'capacity', 'data rate'],
        weight: 2,
      },
      {
        slug: 'small-requests-are-latency-bound',
        name: 'Small requests are latency-bound because they fit in one or two packets',
        detail: 'A 1 KB response takes the same RTT whether the link is 10 Mbps or 10 Gbps; only the last byte\'s transmission time changes, which is negligible.',
        terms: ['one packet', 'two packets', 'fits in MTU', 'RTT dominates', 'transmission time negligible'],
      },
    ],
    answer: {
      shortAnswer:
        'Latency is round-trip time in ms; bandwidth is throughput in bits/s. A 1 KB response fits in one packet, ' +
        'so sending it over a 10 Gbps link instead of 10 Mbps saves microseconds while the RTT stays at 50 ms.',
      idealAnswer:
        'Latency (RTT) is the time for a signal to go there and back — say 50 ms from Mumbai to Frankfurt. ' +
        'Bandwidth is how much data the pipe carries per second — 100 Mbps vs 1 Gbps. For a 1 KB API response, ' +
        'the transmission time at 100 Mbps is 0.08 ms, dwarfed by the 50 ms RTT. Doubling bandwidth to 200 Mbps ' +
        'saves 0.04 ms; halving latency to 25 ms saves 25 ms. That is why CDN edge locations matter more than ' +
        'fat pipes for JSON APIs.',
      deepAnswer:
        'This distinction underlies every distributed-systems decision. Database replication across regions is ' +
        'limited by latency, not bandwidth: you can ship terabytes overnight, but you cannot make a synchronous ' +
        'write cross an ocean in under 100 ms. It also explains why HTTP/2 multiplexing helps: it reduces the ' +
        'number of round trips by packing multiple streams into one TCP handshake, whereas increasing bandwidth ' +
        'does nothing for the handshake itself.',
      commonMistakes:
        '- "More bandwidth means faster responses" for small payloads.\n' +
        '- Confusing throughput (bytes delivered over time) with latency (time for one unit).\n' +
        '- Not realising that TCP slow start makes the first RTT even more expensive.',
      whyWrong:
        'Throwing bandwidth at a latency problem is like widening a highway to fix traffic lights: the bottleneck ' +
        'is the stop-and-go, not the lane count.',
      followUps:
        '1. What is the bandwidth-delay product, and why does it matter for TCP window sizing?\n' +
        '2. How does TCP slow start interact with latency?\n' +
        '3. Why does QUIC reduce latency compared to TCP+TLS?',
      exercise:
        'Use `curl -w "%{time_total} %{size_download}"` to fetch a 100-byte endpoint from localhost and from a ' +
        'server in another region. Compare the times and calculate what fraction is transmission vs RTT.',
    },
  },

  {
    slug: 'drill-tcp-handshake-steps',
    topicSlug: 'networking-basics',
    categoryKey: 'internal',
    levelKey: 'implementation',
    difficulty: 4,
    stem: 'Describe the TCP three-way handshake step by step. What state does each side transition through, and what does each segment carry?',
    body: 'Name the three segments in order. Say what SYN and ACK mean. Mention the initial sequence numbers.',
    concepts: [
      {
        slug: 'syn-sends-initial-sequence-number',
        name: 'SYN carries the client\'s initial sequence number (ISN)',
        detail: 'The client sends SYN with ISN=c. The server records this and replies with its own ISN=s.',
        terms: ['initial sequence number', 'ISN', 'SYN', 'client sends first'],
        weight: 2,
      },
      {
        slug: 'syn-ack-acknowledges-and-assigns-server-isn',
        name: 'SYN-ACK acknowledges the client\'s ISN and sends the server\'s ISN',
        detail: 'The server replies with SYN+ACK: ack=c+1 (acknowledging the client), seq=s (its own ISN).',
        terms: ['SYN-ACK', 'ack=c+1', 'seq=s', 'server responds', 'acknowledges client'],
        weight: 2,
      },
      {
        slug: 'ack-completes-handshake',
        name: 'The final ACK completes the handshake and both sides enter ESTABLISHED',
        detail: 'Client sends ACK with seq=c+1, ack=s+1. Both sockets are now ESTABLISHED and can exchange data.',
        terms: ['ESTABLISHED', 'ack=s+1', 'handshake complete', 'can send data'],
      },
    ],
    answer: {
      shortAnswer:
        'Client sends SYN with ISN=c. Server replies SYN-ACK with ack=c+1 and its own ISN=s. Client sends ACK ' +
        'with ack=s+1. Both sides enter ESTABLISHED.',
      idealAnswer:
        'Step 1: Client → Server: SYN, seq=c (client\'s random ISN). Server moves to SYN_RECEIVED. Step 2: ' +
        'Server → Client: SYN+ACK, seq=s (server\'s random ISN), ack=c+1 (acknowledging the client\'s SYN). ' +
        'Client moves to ESTABLISHED. Step 3: Client → Server: ACK, seq=c+1, ack=s+1. Server moves to ' +
        'ESTABLISHED. Now both sides have agreed on initial sequence numbers and can send payload. The ISNs are ' +
        'random to prevent prediction attacks.',
      deepAnswer:
        'This handshake is why HTTPS adds ~100 ms of latency on a cold connection: TCP handshake (1 RTT) + TLS ' +
        'handshake (2 RTTs for full handshake, 1 RTT for TLS 1.3 session resumption). Connection pooling and ' +
        'keep-alive exist to amortise this cost. The random ISN is critical: if it were predictable, an attacker ' +
        'could inject packets into an existing connection (TCP spoofing). Modern kernels use cryptographic ISN ' +
        'generation to prevent this.',
      commonMistakes:
        '- "The server sends ACK first" — forgetting the SYN part of SYN-ACK.\n' +
        '- Thinking the handshake exchanges capabilities like window size only.\n' +
        '- Not knowing that ISNs are random, not zero.',
      whyWrong:
        'Misunderstanding the handshake leads to debugging failures: thinking a firewall dropping SYN-ACK is a ' +
        '"server issue" when it is actually a network policy. And not knowing ISNs are random hides the security ' +
        'rationale behind the design.',
      followUps:
        '1. What is a SYN flood, and how does SYN cookies mitigate it?\n' +
        '2. Why does TLS 1.3 need only 1 RTT for resumption?\n' +
        '3. What happens if the final ACK is lost?',
      exercise:
        'Use `tcpdump -i any port 443` while curling an HTTPS URL. Identify the SYN, SYN-ACK, and ACK packets ' +
        'by their flags. Note the sequence numbers and verify ack = previous seq + 1.',
    },
  },

  {
    slug: 'drill-dns-resolution-chain',
    topicSlug: 'networking-basics',
    categoryKey: 'internal',
    levelKey: 'understanding',
    difficulty: 3,
    stem: 'When you type api.example.com into a browser, DNS resolution happens before any TCP connection. Walk through the chain of servers queried, and say what each one knows.',
    body: 'Name four levels: stub resolver, recursive resolver, root/TLD servers, authoritative nameserver. Say which one caches.',
    concepts: [
      {
        slug: 'stub-resolver-asks-local-cache',
        name: 'The stub resolver checks the local cache and forwards to the recursive resolver',
        detail: 'Built into the OS. Checks /etc/hosts and the local DNS cache first, then queries the configured recursive resolver (usually the ISP or 8.8.8.8).',
        terms: ['OS resolver', '/etc/hosts', 'local cache', 'forwards to recursive', 'ISP DNS'],
        weight: 2,
      },
      {
        slug: 'recursive-resolver-caches-and-iterates',
        name: 'The recursive resolver caches answers and iterates through the hierarchy',
        detail: 'It starts at the root servers, follows referrals to TLD (.com), then to the domain\'s authoritative nameservers. It caches each answer with its TTL.',
        terms: ['caches', 'TTL', 'root servers', 'TLD', 'authoritative', 'iterative query'],
        weight: 2,
      },
      {
        slug: 'authoritative-nameserver-owns-the-zone',
        name: 'The authoritative nameserver holds the zone file and returns the definitive answer',
        detail: 'Configured by the domain owner (e.g., Route 53, Cloudflare DNS). Returns A/AAAA/CNAME records for the requested name.',
        terms: ['zone file', 'definitive', 'A record', 'AAAA record', 'domain owner'],
      },
    ],
    answer: {
      shortAnswer:
        'Stub resolver checks local cache, then asks the recursive resolver. The recursive resolver queries root ' +
        'servers → TLD servers (.com) → authoritative nameserver for example.com, caching each answer. The ' +
        'authoritative server returns the A record.',
      idealAnswer:
        '1. Stub resolver (in the OS): checks /etc/hosts and local DNS cache. If miss, forwards to the recursive ' +
        'resolver configured in /etc/resolv.conf. 2. Recursive resolver (ISP or public like 8.8.8.8): checks its ' +
        'own cache. If miss, queries a root server (.), which refers it to the .com TLD servers. 3. TLD server: ' +
        'refers to the authoritative nameservers for example.com (e.g., ns1.example.com). 4. Authoritative ' +
        'nameserver: returns the A record (e.g., 93.184.216.34) with a TTL. The recursive resolver caches this ' +
        'answer and returns it to the stub resolver, which caches it locally too.',
      deepAnswer:
        'DNS is the most cached protocol on the internet, which is both its strength and its weakness. Strength: ' +
        'once cached, resolution is instant and free. Weakness: stale caches serve old IPs after a migration, and ' +
        'DNS propagation delays are really TTL expiry delays. This is why blue-green deployments update DNS with ' +
        'low TTLs ahead of time. And DNS-over-HTTPS (DoH) exists because traditional DNS is plaintext UDP, visible ' +
        'to every router on the path.',
      commonMistakes:
        '- "The browser queries DNS directly" — it uses the OS stub resolver.\n' +
        '- Thinking the root server knows every domain.\n' +
        '- Not realising that DNS caching happens at multiple levels.',
      whyWrong:
        'Believing the browser talks directly to DNS hides the OS layer, which is where /etc/hosts overrides live. ' +
        'And not understanding caching leads to "why is my DNS change not taking effect" panic during deploys.',
      followUps:
        '1. What is DNSSEC, and what attack does it prevent?\n' +
        '2. How does a CNAME record differ from an A record?\n' +
        '3. Why is DNS over UDP, and when does it fall back to TCP?',
      exercise:
        'Run `dig +trace api.example.com` and trace the full resolution chain. Note which server returns the ' +
        'final answer and what the TTL is. Then run it again immediately and observe the cached response.',
    },
  },

  // ─── concurrency-parallelism (3 questions) ──────────────────────────────

  {
    slug: 'drill-concurrency-vs-parallelism',
    topicSlug: 'concurrency-parallelism',
    categoryKey: 'conceptual',
    levelKey: 'understanding',
    difficulty: 2,
    stem: 'What is the difference between concurrency and parallelism? Give one example of each in Node.js.',
    body: 'One sentence per definition. One concrete Node.js example per concept.',
    concepts: [
      {
        slug: 'concurrency-is-interleaving',
        name: 'Concurrency is interleaving multiple tasks on a single thread',
        detail: 'The event loop switches between pending callbacks, giving the illusion of simultaneity. Only one task runs at any instant.',
        terms: ['interleaving', 'single thread', 'event loop', 'one at a time', 'illusion'],
        weight: 2,
      },
      {
        slug: 'parallelism-is-simultaneous-execution',
        name: 'Parallelism is executing multiple tasks simultaneously on multiple cores',
        detail: 'True simultaneity: two CPU instructions execute at the same clock cycle on different cores.',
        terms: ['simultaneous', 'multiple cores', 'same clock cycle', 'true parallelism', 'hardware threads'],
        weight: 2,
      },
      {
        slug: 'node-concurrency-example',
        name: 'Node achieves concurrency via the event loop handling multiple I/O callbacks',
        detail: 'Two HTTP requests arrive; the event loop processes their callbacks one after another, interleaving with timers and microtasks.',
        terms: ['event loop', 'HTTP requests', 'callbacks', 'timers', 'microtasks'],
      },
      {
        slug: 'node-parallelism-example',
        name: 'Node achieves parallelism via worker_threads or cluster workers on separate cores',
        detail: 'Eight cluster workers each run their own event loop on a different CPU core, processing requests truly in parallel.',
        terms: ['worker_threads', 'cluster', 'separate cores', 'multiple event loops', 'CPU parallelism'],
      },
    ],
    answer: {
      shortAnswer:
        'Concurrency is interleaving tasks on one thread (Node\'s event loop handling multiple requests). ' +
        'Parallelism is simultaneous execution on multiple cores (Node cluster workers on different CPUs).',
      idealAnswer:
        'Concurrency: two async functions await different promises; the event loop suspends one, runs the other, ' +
        'then resumes the first. They overlap in wall-clock time but never execute JavaScript simultaneously. ' +
        'Parallelism: eight cluster workers each handle requests on their own core; at any given nanosecond, eight ' +
        'different V8 instances are executing JavaScript instructions at the same time. Concurrency is about ' +
        'structure; parallelism is about hardware.',
      deepAnswer:
        'This distinction is where most "Node is slow" complaints originate: someone measures a CPU-bound hash ' +
        'on a single thread, sees 100% CPU, and concludes Node cannot scale. The fix is not rewriting in Go; it ' +
        'is recognising that the workload is parallelisable and using worker_threads or offloading to a GPU. ' +
        'Conversely, adding workers to an I/O-bound service that already saturates the event loop adds coordination ' +
        'overhead for zero gain. The right model depends on whether the bottleneck is CPU cycles or I/O latency.',
      commonMistakes:
        '- Using "concurrent" and "parallel" interchangeably.\n' +
        '- Thinking async/await gives parallelism.\n' +
        '- Adding cluster workers to solve an I/O-bound latency problem.',
      whyWrong:
        'Confusing the two leads to wrong scaling decisions: throwing cores at a problem that needs better I/O ' +
        'multiplexing, or trying to interleave CPU work that genuinely needs simultaneous execution.',
      followUps:
        '1. Can a single-threaded event loop be concurrent but not parallel?\n' +
        '2. What is the difference between a thread and a process in terms of parallelism?\n' +
        '3. When would you choose worker_threads over cluster?',
      exercise:
        'Write a CPU-bound loop that takes 2 seconds. Run it in the main thread and measure total time. Then split ' +
        'it across 4 worker_threads and measure again. Explain why the speedup is less than 4x.',
    },
  },

  {
    slug: 'drill-race-condition-definition',
    topicSlug: 'concurrency-parallelism',
    categoryKey: 'debugging',
    levelKey: 'debugging',
    difficulty: 4,
    stem: 'What is a race condition? Describe one in a Node.js context involving a shared counter incremented by two async functions, and explain how to fix it.',
    body: 'Show the buggy code in three lines. Name the fix and why it works.',
    concepts: [
      {
        slug: 'race-condition-is-order-dependent',
        name: 'A race condition occurs when correctness depends on the relative timing of concurrent operations',
        detail: 'Two threads or async flows read-modify-write the same variable; the final value depends on which write happens last.',
        terms: ['timing dependent', 'read-modify-write', 'order matters', 'non-deterministic', 'last write wins'],
        weight: 2,
      },
      {
        slug: 'async-counter-bug',
        name: 'Two async functions incrementing a shared counter without synchronisation lose updates',
        detail: 'Both read counter=0, both write counter=1, losing one increment. The bug is invisible in single-step debugging.',
        terms: ['lost update', 'counter=0', 'both write 1', 'invisible in debugger', 'non-deterministic failure'],
        weight: 2,
      },
      {
        slug: 'fix-with-atomic-operation-or-lock',
        name: 'Fix with an atomic operation, a mutex, or by avoiding shared mutable state',
        detail: 'Use Atomics in SharedArrayBuffer, a mutex library, or redesign to avoid sharing (e.g., message passing between workers).',
        terms: ['atomic', 'mutex', 'lock', 'SharedArrayBuffer', 'message passing', 'no shared state'],
      },
    ],
    answer: {
      shortAnswer:
        'A race condition is when correctness depends on timing. Two async functions reading counter=0 and both ' +
        'writing counter=1 lose an increment. Fix with a mutex or by avoiding shared mutable state entirely.',
      idealAnswer:
        '```js\nlet counter = 0;\nasync function inc() { const c = counter; await delay(1); counter = c + 1; }\n```\n' +
        'If inc() runs twice concurrently, both read 0, both write 1, and one increment is lost. The fix is to ' +
        'serialise access: use a mutex so only one inc() executes the read-modify-write at a time, or avoid the ' +
        'shared variable by having each flow return its delta and summing at the end. In multi-worker Node, the ' +
        'real fix is to not share state at all — use message passing or a database.',
      deepAnswer:
        'Race conditions are the hardest bugs because they do not reproduce under a debugger (which serialises ' +
        'execution) and they surface only under load. The classic fix — a mutex — introduces its own problems: ' +
        'deadlock if two locks are acquired in different orders, and priority inversion if a low-priority thread ' +
        'holds the lock a high-priority thread needs. This is why functional programming emphasises immutability: ' +
        'if nothing is mutated, nothing races. In distributed systems, the equivalent is idempotency: designing ' +
        'operations so that running them twice has the same effect as running them once.',
      commonMistakes:
        '- "Adding await fixes it" — await yields but does not serialise.\n' +
        '- Using a global variable across cluster workers (each has its own copy).\n' +
        '- Thinking setTimeout ordering is guaranteed.',
      whyWrong:
        'Awaiting between read and write does not help; it actually makes the race more likely by increasing the ' +
        'window. And global variables in cluster are per-process, so the bug disappears in testing but appears in ' +
        'production when you add a second instance.',
      followUps:
        '1. What is a deadlock, and how does it differ from a race condition?\n' +
        '2. Why does SharedArrayBuffer require Atomics?\n' +
        '3. How do databases prevent lost updates?',
      exercise:
        'Write the buggy counter code above. Run it 10,000 times in a loop and observe that the final counter is ' +
        'less than 10,000. Then fix it with a simple mutex (use async-mutex or implement one with a promise queue) ' +
        'and verify the counter reaches 10,000.',
    },
  },

  {
    slug: 'drill-event-loop-phases',
    topicSlug: 'concurrency-parallelism',
    categoryKey: 'internal',
    levelKey: 'implementation',
    difficulty: 5,
    stem: 'List the six phases of the Node.js event loop in order. For each phase, name one kind of callback that runs there.',
    body: 'Say which phase runs setTimeout, which runs setImmediate, and which runs process.nextTick. Explain why nextTick is not a phase.',
    concepts: [
      {
        slug: 'timers-phase-runs-settimeout',
        name: 'Timers phase executes setTimeout and setInterval callbacks',
        detail: 'Checks if any timer\'s threshold has been reached since the last iteration. Does not guarantee exact timing.',
        terms: ['setTimeout', 'setInterval', 'threshold', 'not exact', 'timer expiry'],
        weight: 2,
      },
      {
        slug: 'poll-phase-handles-io-callbacks',
        name: 'Poll phase retrieves and executes I/O callbacks',
        detail: 'Where most application code runs: fs.readFile completions, HTTP response handlers, database query results.',
        terms: ['I/O callbacks', 'fs.readFile', 'HTTP response', 'database result', 'most code runs here'],
        weight: 2,
      },
      {
        slug: 'check-phase-runs-setimmediate',
        name: 'Check phase executes setImmediate callbacks',
        detail: 'Runs after the poll phase, before the next iteration. Useful for breaking up long-running sync work.',
        terms: ['setImmediate', 'after poll', 'break up work', 'before next iteration'],
      },
      {
        slug: 'nexttick-is-not-a-phase',
        name: 'process.nextTick is not an event-loop phase; it runs between every phase transition',
        detail: 'nextTick queue is drained after each phase completes, before moving to the next phase. This is why it can starve I/O.',
        terms: ['between phases', 'drained after each phase', 'starves I/O', 'not a phase', 'microtask-like'],
      },
    ],
    answer: {
      shortAnswer:
        '1. Timers (setTimeout/setInterval). 2. Pending callbacks. 3. Idle/prepare. 4. Poll (I/O callbacks). ' +
        '5. Check (setImmediate). 6. Close callbacks. process.nextTick runs between every phase, not in one.',
      idealAnswer:
        'Phase 1 — Timers: setTimeout and setInterval callbacks whose thresholds have elapsed. Phase 2 — Pending ' +
        'callbacks: system-level callbacks deferred from the previous iteration (rarely used by applications). ' +
        'Phase 3 — Idle/prepare: internal housekeeping. Phase 4 — Poll: the main phase, where I/O callbacks ' +
        '(fs, net, http) execute. If the poll queue is empty and setImmediate was scheduled, Node exits the poll ' +
        'phase early. Phase 5 — Check: setImmediate callbacks. Phase 6 — Close: close handlers (socket.on("close")). ' +
        'Between every phase, Node drains the nextTick queue, then the microtask queue (Promise.then). nextTick ' +
        'is not a phase because it interrupts the loop: it runs after every phase, which is why a recursive ' +
        'nextTick can block I/O forever.',
      deepAnswer:
        'Understanding these phases explains subtle bugs: calling setImmediate inside a polling I/O callback ' +
        'guarantees it runs before the next I/O event, making it useful for yielding to the loop without ' +
        'setTimeout\'s minimum 1 ms delay. And knowing that nextTick runs before microtasks explains why ' +
        'Promise.resolve().then(...) runs after nextTick but before setTimeout. This ordering is critical for ' +
        'libraries that need to defer work without introducing visible latency.',
      commonMistakes:
        '- "setTimeout(fn, 0) runs immediately" — it waits for the next timers phase.\n' +
        '- Thinking nextTick is the same as Promise.then.\n' +
        '- Not knowing that setImmediate is designed to run after I/O, not before.',
      whyWrong:
        'Using setTimeout(0) for deferral introduces unnecessary latency (minimum 1 ms, often more under load). ' +
        'And confusing nextTick with microtasks leads to incorrect assumptions about when Promises resolve.',
      followUps:
        '1. Why does setImmediate exist when setTimeout(0) seems similar?\n' +
        '2. What is the maximum delay for setTimeout?\n' +
        '3. How does libuv\'s thread pool interact with the event loop?',
      exercise:
        'Write code that schedules setTimeout, setImmediate, process.nextTick, and Promise.resolve().then() in ' +
        'that order. Run it and observe the execution order. Then wrap the whole thing in a setTimeout(0) and ' +
        'observe how the order changes.',
    },
  },
];
