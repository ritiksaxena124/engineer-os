/**
 * The diagnostic is read by concept gap, not by score (docs/diagnostic.md): misses cluster by the
 * skill the missed concepts belong to, and each cluster has one first repair that is a way of
 * working, not a reading list.
 */
const FIRST_REPAIR: Record<string, string> = {
  javascript:
    'Concurrency internals are folklore. Go back to async internals and drill output prediction until you can predict the queue, then run the blocking experiment and measure the loop.',
  node:
    'The runtime is being guessed at. Profile loop lag and the libuv pool on a real workload before changing any code, then re-decide the concurrency model from the numbers.',
  typescript:
    'Types are being treated as runtime safety. Move every boundary to a parse, delete the casts, and rebuild the state model as a union with a total transition.',
  linux:
    'The kernel boundary is invisible. Work from the box: syscalls, file descriptors, signals, and what a process actually costs, before touching a framework.',
  postgresql:
    'The database is a black box. Run pages, tuple and WAL experiments and read EXPLAIN output before taking any indexing advice.',
  redis:
    'Caching is being treated as a setting rather than a dependency. Work the stampede, the failure modes and lock correctness before adjusting another TTL.',
  http:
    'Header semantics are superstition. Put the app behind a real caching proxy, observe what it stores, then write the cache policy on purpose.',
  rest:
    'The API is designed as if the network never fails. Implement idempotency with a stored response and prove it under duplicate delivery.',
  security:
    'Trust boundaries are being assumed rather than enforced. Test every object fetch with a second valid account, then centralise the authorization decision.',
  'system-design':
    'Design is being argued from preference. Convert the requirement into numbers first — traffic, payload, storage, failure budget — then let the numbers decide.',
  'distributed-systems':
    'Failure is being treated as exceptional. Enumerate partial failure, duplicate delivery and clock skew for one flow, and write the retry budget beside it.',
  llm:
    'LLM calls are being treated as functions. Instrument latency, cost and nondeterminism on real traffic before building on top of them.',
  rag:
    'Retrieval quality is being eyeballed. Build the golden set and measure recall@k before changing a chunk size or a prompt.',
  evaluation:
    'There is no way to know whether it got better. Ship the eval harness first, then every change has a number attached.',
  agents:
    'The agent is doing unmeasured work. Cap steps, cost and wall-clock, give the tools structured failures, and ask whether a deterministic graph would do it cheaper.',
};

const DEFAULT_REPAIR =
  'This area has no evidence yet. Do the smallest real build that uses it, then come back and answer the drill again.';

export function firstRepairFor(skill: string): string {
  return FIRST_REPAIR[skill] ?? DEFAULT_REPAIR;
}
