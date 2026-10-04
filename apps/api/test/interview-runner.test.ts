import { describe, expect, test } from 'bun:test';
import { runFiles, summarize } from '../src/interview/runner';

const source = (path: string, contents: string) => ({ path, contents, isCheck: false });
const check = (path: string, contents: string) => ({ path, contents, isCheck: true });

describe('interview sandbox', () => {
  test('a passing check and a failing check come back with verdicts', async () => {
    const outcome = await runFiles([
      source('add.js', 'module.exports = { add: (a, b) => a + b };'),
      check('add.check.js', `
        const { add } = require('./add.js');
        defineCheck('adds', () => assert.equal(add(2, 3), 5));
        defineCheck('does not subtract', () => assert.equal(add(2, 3), 6, 'sum is wrong'));
      `),
    ]);
    expect(outcome.crashed).toBeNull();
    expect(outcome.results.map((result) => result.name)).toEqual(['adds', 'does not subtract']);
    expect(outcome.results[0].passed).toBe(true);
    expect(outcome.results[1].passed).toBe(false);
    expect(outcome.results[1].message).toContain('sum is wrong');
    expect(summarize(outcome)).toEqual({ passed: 1, failed: 1, allGreen: false });
  });

  test('all green only when every check passed and something was checked', async () => {
    const outcome = await runFiles([
      source('flag.js', 'module.exports = { on: true };'),
      check('flag.check.js', "defineCheck('is on', () => assert(require('./flag.js').on, 'flag is off'));"),
    ]);
    expect(summarize(outcome).allGreen).toBe(true);
    expect(summarize(await runFiles([check('empty.check.js', 'void 0;')]))).toEqual({
      passed: 0,
      failed: 0,
      allGreen: false,
    });
  });

  test('each check gets a fresh module graph, so cache state does not leak between checks', async () => {
    const outcome = await runFiles([
      source('counter.js', 'let calls = 0; module.exports = { hit: () => (calls += 1) };'),
      check('counter.check.js', `
        const { hit } = require('./counter.js');
        defineCheck('first', () => assert.equal(hit(), 1));
        defineCheck('still first', () => assert.equal(hit(), 1, 'state leaked between checks'));
      `),
    ]);
    expect(outcome.results.map((result) => result.passed)).toEqual([true, true]);
  });

  test('the fake clock is what a timed fix is measured against', async () => {
    const outcome = await runFiles([
      source('ttl.js', `
        module.exports = { create: (store) => ({ set: (key, value, ms) => store.put(key, value, clock.now() + ms), get: (key) => store.get(clock.now()) }) };
      `),
      check('ttl.check.js', `
        const { create } = require('./ttl.js');
        defineCheck('entry dies when the clock passes its ttl', () => {
          clock.at(0);
          const seen = [];
          const store = { put: (value, until) => seen.push([value, until]), get: (now) => (seen[0][1] > now ? seen[0][0] : null) };
          const cache = create(store);
          cache.set('a', 'A', 1000);
          clock.advance(1500);
          assert.equal(cache.get('a'), null, 'expired entry was served');
        });
      `),
    ]);
    expect(outcome.results[0]).toEqual({ name: 'entry dies when the clock passes its ttl', passed: true, message: 'ok' });
  });

  test('the candidate cannot reach the filesystem through require', async () => {
    const outcome = await runFiles([
      check('escape.check.js', "defineCheck('fs', () => require('fs').readFileSync('/etc/passwd'));"),
    ]);
    expect(outcome.results[0].passed).toBe(false);
    expect(outcome.results[0].message).toContain('cannot require');
  });

  test('eval and the Function constructor are not routes out of the sandbox', async () => {
    const outcome = await runFiles([
      check('codegen.check.js', "defineCheck('function ctor', () => { const f = Function('return 1'); assert(f() === 1); });"),
    ]);
    expect(outcome.results.length + (outcome.crashed ? 1 : 0)).toBeGreaterThan(0);
    const blocked = outcome.crashed ?? outcome.results[0]?.message ?? '';
    expect(blocked).toMatch(/code generation|Function|not allowed|denied/i);
  });

  test('a loop that never ends is killed instead of hanging the caller', async () => {
    const started = Date.now();
    const outcome = await runFiles(
      [check('spin.check.js', "defineCheck('spin', () => { while (true) { void 0; } });")],
      { timeoutMs: 700 },
    );
    expect(Date.now() - started).toBeLessThan(6_000);
    expect(outcome.results[0]?.passed ?? false).toBe(false);
    expect((outcome.crashed ?? outcome.results[0]?.message ?? '').length).toBeGreaterThan(0);
  });

  test('a project layout resolves sibling and parent requires the way node does', async () => {
    const outcome = await runFiles([
      source('src/orders/repository.js', 'module.exports = { load: () => ({ id: "o-1" }) };'),
      source('src/orders/cache.js', "const repository = require('./repository.js');\nmodule.exports = { peek: () => repository.load('o-1') };"),
      source('src/index.js', "const cache = require('./orders/cache.js');\nmodule.exports = { entry: () => cache.peek() };"),
      check('test/index.check.js', `
        const { entry } = require('../src/index.js');
        defineCheck('reaches the module two directories down', () => assert.equal(entry().id, 'o-1'));
      `),
    ]);
    expect(outcome.crashed).toBeNull();
    expect(outcome.results.map((result) => result.passed)).toEqual([true]);
  });

  test('console output is captured rather than lost', async () => {
    const outcome = await runFiles([
      check('log.check.js', "defineCheck('logs', () => { console.log('saw', 42); assert(true); });"),
    ]);
    expect(outcome.logs).toContain('saw 42');
  });
});
