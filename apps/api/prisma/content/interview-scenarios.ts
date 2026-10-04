/**
 * Interview scenarios: a small buggy project, the ticket that describes the symptom, and the authored
 * fix a strong prompt has to describe. The files run in the interview sandbox, so every check is
 * synchronous and only reaches for the module graph it is given plus the injected fake `clock`.
 */

export interface ScenarioFileSpec {
  path: string;
  contents: string;
  isCheck?: boolean;
}

export interface ScenarioFixSpec {
  /** Groups of accepted prompt terms, ';' between groups and '|' between the terms of a group. */
  requiredText: string;
  filePath: string;
  fixedText: string;
  rationale: string;
}

export interface InterviewScenarioSpec {
  slug: string;
  title: string;
  roleKey: string;
  ticketTitle: string;
  ticketBody: string;
  signalNotes: string;
  files: ScenarioFileSpec[];
  fixes: ScenarioFixSpec[];
}

const STATUS_CACHE_BUGGY = `// src/orders/status-cache.js
const repository = require('./repository.js');

const cache = new Map();
const TTL_MS = 60000;

// Returns the order when its status says it may ship, otherwise null.
function shippable(id) {
  let entry = cache.get(id);
  if (!entry) {
    entry = { order: repository.load(id) };
    cache.set(id, entry);
  }
  const order = entry.order;
  if (!order) return null;
  return order.status === 'paid' ? order : null;
}

function cancel(id) {
  const order = repository.load(id);
  if (!order) return null;
  repository.put({ ...order, status: 'cancelled' });
  return order;
}

module.exports = { shippable, cancel, TTL_MS };
`;

const STATUS_CACHE_FIXED = `// src/orders/status-cache.js
const repository = require('./repository.js');

const cache = new Map();
const TTL_MS = 60000;

function cached(id) {
  const entry = cache.get(id);
  if (entry && clock.now() - entry.at < TTL_MS) return entry;
  const fresh = { order: repository.load(id), at: clock.now() };
  cache.set(id, fresh);
  return fresh;
}

// Returns the order when its status says it may ship, otherwise null.
function shippable(id) {
  const order = cached(id).order;
  if (!order) return null;
  return order.status === 'paid' ? order : null;
}

function cancel(id) {
  const order = repository.load(id);
  if (!order) return null;
  repository.put({ ...order, status: 'cancelled' });
  cache.delete(id);
  return order;
}

module.exports = { shippable, cancel, TTL_MS };
`;

const STATUS_CACHE_CHECK = `// test/status-cache.check.js
const repository = require('../src/orders/repository.js');
const shipments = require('../src/orders/shipments.js');
const cache = require('../src/orders/status-cache.js');

repository.put({ id: 'o-1', status: 'paid', sku: 'hammer' });

defineCheck('a paid order ships', () => {
  clock.at(0);
  assert.equal(shipments.fulfil('o-1').orderId, 'o-1');
});

defineCheck('a cancelled order stops shipping', () => {
  clock.at(0);
  assert(shipments.fulfil('o-1') !== null, 'the seed order did not ship');
  cache.cancel('o-1');
  assert.equal(shipments.fulfil('o-1'), null, 'the cancelled order shipped from a stale cache');
});

defineCheck('a cached status goes stale after the ttl', () => {
  clock.at(0);
  repository.put({ id: 'o-2', status: 'paid', sku: 'drill' });
  assert(shipments.fulfil('o-2') !== null, 'the order never shipped');
  repository.put({ id: 'o-2', status: 'refunded', sku: 'drill' });
  clock.advance(cache.TTL_MS + 1);
  assert.equal(shipments.fulfil('o-2'), null, 'an expired cache entry was served');
});

defineCheck('the cache spares the repository inside the ttl', () => {
  clock.at(0);
  repository.put({ id: 'o-3', status: 'paid', sku: 'chisel' });
  const before = repository.readOnly();
  shipments.fulfil('o-3');
  shipments.fulfil('o-3');
  assert.equal(repository.readOnly() - before, 1, 'every read went through to the repository');
});
`;

const RETRY_BUGGY = `// src/http/client.js
const transport = require('./transport.js');

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 100;

function request(url, options) {
  let attempt = 0;
  let response;
  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    response = transport.send(url, options);
    if (response.status < 500) return response;
    if (attempt < MAX_ATTEMPTS) clock.advance(BASE_DELAY_MS);
  }
  return response;
}

module.exports = { request, MAX_ATTEMPTS, BASE_DELAY_MS };
`;

const RETRY_FIXED = `// src/http/client.js
const transport = require('./transport.js');

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 100;

function retryable(response) {
  return response.status === 429 || response.status >= 500;
}

function waitMs(response, attempt) {
  if (response.status === 429 && response.retryAfterMs > 0) return response.retryAfterMs;
  return BASE_DELAY_MS * Math.pow(2, attempt - 1);
}

function request(url, options) {
  let attempt = 0;
  for (;;) {
    attempt += 1;
    const response = transport.send(url, options);
    if (!retryable(response) || attempt >= MAX_ATTEMPTS) return response;
    clock.advance(waitMs(response, attempt));
  }
}

module.exports = { request, MAX_ATTEMPTS, BASE_DELAY_MS };
`;

const RETRY_TRANSPORT = `// src/http/transport.js
const script = [];
const attempts = [];

function enqueue(...responses) {
  for (const response of responses) script.push(response);
}

function send(url, options) {
  attempts.push({ url, at: clock.now(), method: options.method || 'GET' });
  if (script.length === 0) return { status: 200, body: { ok: true } };
  const next = script.shift();
  return { status: next.status, body: next.body, retryAfterMs: next.retryAfterMs };
}

function attemptCount() {
  return attempts.length;
}

// Milliseconds the caller spent waiting between one attempt and the next.
function gaps() {
  return attempts.slice(1).map((attempt, index) => attempt.at - attempts[index].at);
}

module.exports = { enqueue, send, attemptCount, gaps };
`;

const RETRY_CHECK = `// test/retry.check.js
const transport = require('../src/http/transport.js');
const client = require('../src/http/client.js');

defineCheck('a 500 is retried until it succeeds', () => {
  clock.at(0);
  transport.enqueue({ status: 500 }, { status: 500 }, { status: 200, body: { ok: true } });
  const response = client.request('https://inventory.internal/reserve', {});
  assert.equal(response.status, 200, 'gave up before the attempt that would succeed');
  assert.equal(transport.attemptCount(), 3, 'wrong number of attempts');
});

defineCheck('a 404 is not retried', () => {
  clock.at(0);
  transport.enqueue({ status: 404 });
  const response = client.request('https://inventory.internal/missing', {});
  assert.equal(response.status, 404);
  assert.equal(transport.attemptCount(), 1, 'a permanent client error was retried');
});

defineCheck('a rate limit waits for the advertised retry-after', () => {
  clock.at(0);
  transport.enqueue({ status: 429, retryAfterMs: 2000 }, { status: 200, body: { ok: true } });
  const response = client.request('https://inventory.internal/reserve', {});
  assert.equal(response.status, 200, 'the 429 was handed back instead of retried');
  assert.equal(transport.gaps()[0], 2000, 'the caller ignored Retry-After');
});

defineCheck('the backoff doubles between attempts', () => {
  clock.at(0);
  transport.enqueue({ status: 500 }, { status: 500 }, { status: 500 }, { status: 200 });
  client.request('https://inventory.internal/reserve', {});
  assert.equal(transport.gaps().join(','), '100,200,400', 'the waits did not grow exponentially');
});
`;

export const INTERVIEW_SCENARIOS: InterviewScenarioSpec[] = [
  {
    slug: 'cancelled-order-still-ships',
    title: 'A cancelled order keeps shipping',
    roleKey: 'backend',
    ticketTitle: 'ORD-418 · Cancelled order shipped anyway',
    ticketBody: `Support escalated a duplicate shipment: a customer cancelled within a minute of paying and
the warehouse still picked the parcel.

Reading the fulfilment logs, the worker calls orders.shippable(orderId) on every queue drain. The
first call goes to the repository; later ones come back instantly from the in-process cache, even
after a cancel has been written. There is a TTL_MS constant sitting at the top of that file, and
cancel() obviously touches the repository but the cache never hears about it.

Fix the caching so a cancelled or refunded order cannot be picked, without turning the cache back
on for every read. The checks in test/status-cache.check.js are the acceptance criteria.`,
    signalNotes: `Look for the two separate defects rather than one lucky edit: entries never age out, and the write
path never invalidates. A candidate who only adds a TTL still fails the cancel check; one who only
clears the cache still serves a status that drifted underneath it. The strongest answers say "read
after write" out loud and note that a null lookup is cached too on purpose.`,
    files: [
      {
        path: 'src/orders/repository.js',
        contents: `// src/orders/repository.js
const orders = new Map();
let reads = 0;

function put(order) {
  orders.set(order.id, { ...order });
}

function load(id) {
  reads += 1;
  const found = orders.get(id);
  return found ? { ...found } : null;
}

function readOnly() {
  return reads;
}

module.exports = { put, load, readOnly };
`,
      },
      { path: 'src/orders/status-cache.js', contents: STATUS_CACHE_BUGGY },
      {
        path: 'src/orders/shipments.js',
        contents: `// src/orders/shipments.js
const statusCache = require('./status-cache.js');

const shipped = [];

function fulfil(id) {
  const order = statusCache.shippable(id);
  if (!order) return null;
  const shipment = { orderId: id, carrier: 'blue' };
  shipped.push(shipment);
  return shipment;
}

function list() {
  return shipped.slice();
}

module.exports = { fulfil, list };
`,
      },
      { path: 'test/status-cache.check.js', contents: STATUS_CACHE_CHECK, isCheck: true },
    ],
    fixes: [
      {
        requiredText:
          'stale|ttl|expire|outdated|age out ; invalidate|evict|purge|clear the cache|drop the entry|delete the entry ; cancel|write path|after write|on write',
        filePath: 'src/orders/status-cache.js',
        fixedText: STATUS_CACHE_FIXED,
        rationale:
          'Stamp each entry with clock.now(), serve it only inside TTL_MS, and drop the entry whenever the write path changes the order.',
      },
    ],
  },
  {
    slug: 'retry-ignores-rate-limits',
    title: 'The HTTP client hammers a rate-limited upstream',
    roleKey: 'fullstack',
    ticketTitle: 'INV-77 · 429s from the inventory API turn into an outage',
    ticketBody: `This morning the inventory API shed load with 429s for four minutes and our reservation calls
went to zero success for the whole window. The client in src/http/client.js treats anything under
500 as "done", so a rate limit is returned to the caller as if it were a good response, and the
retries it does make for 5xx are spaced a flat 100ms apart — which is how we kept getting throttled.

The upstream sends Retry-After in milliseconds on its 429 body (the fake transport already exposes
it as retryAfterMs). Make the client honour that hint and back off exponentially otherwise, without
starting to retry errors that will never heal.

The checks in test/retry.check.js are the acceptance criteria. clock.now() and clock.advance(ms) are
the sandbox clock: the tests read the timestamps the transport recorded, so waiting must go through
the clock rather than a busy loop.`,
    signalNotes: `The three defects are separable: 429 classified as success, Retry-After ignored, flat backoff. Watch
whether the candidate keeps 4xx (other than 429) out of the retry path and whether they bound the
wait by MAX_ATTEMPTS instead of looping forever. Naming "exponential backoff", "jitter" or
"retry-after" unprompted is the signal for this role.`,
    files: [
      { path: 'src/http/transport.js', contents: RETRY_TRANSPORT },
      { path: 'src/http/client.js', contents: RETRY_BUGGY },
      { path: 'test/retry.check.js', contents: RETRY_CHECK, isCheck: true },
    ],
    fixes: [
      {
        requiredText:
          '429|rate limit|too many requests|retry-after ; exponential|backoff|back off|double ; retry|attempt|status code',
        filePath: 'src/http/client.js',
        fixedText: RETRY_FIXED,
        rationale:
          'Classify 429 alongside 5xx as retryable, wait retryAfterMs when the upstream advertises it and otherwise double the base delay per attempt, and leave 4xx alone.',
      },
    ],
  },
];

const ROLE_KEYS = new Set(['backend', 'fullstack', 'agentic-ai']);

/** Structure only — the behaviour proof lives in test/interview-scenario-content.test.ts. */
export function validateInterviewScenarios(
  scenarios: InterviewScenarioSpec[] = INTERVIEW_SCENARIOS,
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const scenario of scenarios) {
    const at = `scenario ${scenario.slug}`;
    if (seen.has(scenario.slug)) problems.push(`${at}: duplicate slug`);
    seen.add(scenario.slug);
    if (!ROLE_KEYS.has(scenario.roleKey)) problems.push(`${at}: unknown roleKey "${scenario.roleKey}"`);
    if (!scenario.ticketBody.includes('test/')) {
      problems.push(`${at}: the ticket must point the candidate at the check file`);
    }

    const paths = new Set<string>();
    for (const [index, file] of scenario.files.entries()) {
      if (paths.has(file.path)) problems.push(`${at}: ${file.path} is authored twice`);
      paths.add(file.path);
      if (!file.contents.trim()) problems.push(`${at}: ${file.path} is empty`);
      if (!file.path.startsWith('test/') !== !file.isCheck) {
        problems.push(`${at}: ${file.path} must be a check file exactly when it lives under test/`);
      }
      if (index === scenario.files.length - 1 && !file.isCheck) {
        problems.push(`${at}: the check files should come last so the project reads top-down`);
      }
    }
    if (!scenario.files.some((file) => file.isCheck)) problems.push(`${at}: has no check files`);
    if (!scenario.files.some((file) => !file.isCheck)) problems.push(`${at}: has no project files`);

    if (scenario.fixes.length === 0) problems.push(`${at}: has no authored fix`);
    for (const fix of scenario.fixes) {
      if (!paths.has(fix.filePath)) problems.push(`${at}: fix targets unauthored file ${fix.filePath}`);
      if (!scenario.files.some((file) => file.path === fix.filePath && !file.isCheck)) {
        problems.push(`${at}: a fix may not rewrite the check file ${fix.filePath}`);
      }
      if (fix.requiredText.split(';').filter((group) => group.trim()).length < 2) {
        problems.push(`${at}: ${fix.filePath} needs at least two distinct requirements`);
      }
    }
  }
  return problems;
}

/** The patched file set a candidate's prompt buys, ready to hand back to the sandbox. */
export function applyFixes(
  scenario: InterviewScenarioSpec,
  appliedPaths: string[],
): ScenarioFileSpec[] {
  return scenario.files.map((file) => {
    const fix = scenario.fixes.find((entry) => entry.filePath === file.path);
    return fix && appliedPaths.includes(file.path) ? { ...file, contents: fix.fixedText } : file;
  });
}
