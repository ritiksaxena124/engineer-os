import { describe, expect, test } from 'bun:test';
import { CycleError, repairPath, topologicalOrder, unlockState, type GraphTopic } from '../src/curriculum/graph';

const topic = (
  slug: string,
  prerequisites: { slug: string; critical?: boolean }[] = [],
  unlockRequiredLevel = 3,
): GraphTopic => ({ slug, number: 0, title: slug, unlockRequiredLevel, prerequisites });

describe('topologicalOrder', () => {
  test('puts every prerequisite before its dependent', () => {
    const order = topologicalOrder([
      topic('agents', [{ slug: 'llm-evaluation' }, { slug: 'tool-calling' }]),
      topic('llm-evaluation', [{ slug: 'structured-output' }]),
      topic('structured-output'),
      topic('tool-calling', [{ slug: 'structured-output' }]),
    ]);

    expect(order.indexOf('structured-output')).toBeLessThan(order.indexOf('llm-evaluation'));
    expect(order.indexOf('llm-evaluation')).toBeLessThan(order.indexOf('agents'));
    expect(order.indexOf('tool-calling')).toBeLessThan(order.indexOf('agents'));
  });

  test('rejects a direct cycle and names the path', () => {
    expect(() =>
      topologicalOrder([topic('a', [{ slug: 'b' }]), topic('b', [{ slug: 'a' }])]),
    ).toThrow(CycleError);

    try {
      topologicalOrder([topic('a', [{ slug: 'b' }]), topic('b', [{ slug: 'a' }])]);
    } catch (error) {
      expect((error as CycleError).cycle).toEqual(['a', 'b', 'a']);
    }
  });

  test('rejects a self-dependency', () => {
    expect(() => topologicalOrder([topic('a', [{ slug: 'a' }])])).toThrow(CycleError);
  });

  test('rejects a prerequisite that is not in the graph instead of ignoring it', () => {
    expect(() => topologicalOrder([topic('a', [{ slug: 'ghost' }])])).toThrow(/ghost/);
  });

  test('is deterministic for independent topics', () => {
    const graph = [topic('z'), topic('m'), topic('a')];
    expect(topologicalOrder(graph)).toEqual(topologicalOrder([...graph].reverse()));
  });
});

describe('unlockState', () => {
  test('unlocks when every critical prerequisite has reached the required level', () => {
    const t = topic('postgres-transactions', [{ slug: 'sql' }, { slug: 'concurrency' }]);
    expect(unlockState(t, { sql: 4, concurrency: 3 })).toEqual({ unlocked: true, blockedBy: [], warnings: [] });
  });

  test('blocks on a weak critical prerequisite and says what is missing', () => {
    const t = topic('postgres-transactions', [{ slug: 'sql' }, { slug: 'concurrency' }]);
    const state = unlockState(t, { sql: 4, concurrency: 1 });

    expect(state.unlocked).toBeFalse();
    expect(state.blockedBy).toEqual([
      { slug: 'concurrency', requiredLevel: 3, currentLevel: 1 },
    ]);
  });

  test('a topic with no level recorded is treated as untouched, not as zero evidence ignored', () => {
    const t = topic('langgraph', [{ slug: 'state-machines' }]);
    const state = unlockState(t, {});
    expect(state.blockedBy).toEqual([{ slug: 'state-machines', requiredLevel: 3, currentLevel: 0 }]);
  });

  test('an advisory prerequisite warns without blocking', () => {
    const t = topic('system-design', [{ slug: 'distributed-systems' }, { slug: 'redis', critical: false }]);
    const state = unlockState(t, { 'distributed-systems': 5, redis: 0 });

    expect(state.unlocked).toBeTrue();
    expect(state.warnings).toEqual([{ slug: 'redis', requiredLevel: 3, currentLevel: 0 }]);
  });

  test('uses the topic own required level, not a global constant', () => {
    const t = topic('agent-memory', [{ slug: 'rag' }], 2);
    expect(unlockState(t, { rag: 2 }).unlocked).toBeTrue();
  });
});

describe('repairPath', () => {
  test('returns nothing when the topic is already unblocked', () => {
    const graph = [topic('a'), topic('b', [{ slug: 'a' }])];
    expect(repairPath('b', graph, { a: 5 })).toEqual([]);
  });

  test('orders the repair path when a weak topic also depends on topics that are already strong', () => {
    const graph = [
      topic('base'),
      topic('middle', [{ slug: 'base' }]),
      topic('top', [{ slug: 'middle' }]),
    ];
    // base is strong, middle is the only gap: the subset handed to the sorter is not a graph.
    expect(repairPath('top', graph, { base: 5, middle: 1 })).toEqual(['middle']);
  });

  test('walks back through the chain and returns the deepest gap first', () => {
    const graph = [
      topic('event-loop'),
      topic('promises', [{ slug: 'event-loop' }]),
      topic('backpressure', [{ slug: 'promises' }]),
    ];
    expect(repairPath('backpressure', graph, { 'event-loop': 0, promises: 1 })).toEqual([
      'event-loop',
      'promises',
    ]);
  });

  test('does not surface advisory gaps as repair work', () => {
    const graph = [topic('redis'), topic('cache-aside', [{ slug: 'redis', critical: false }])];
    expect(repairPath('cache-aside', graph, { redis: 0 })).toEqual([]);
  });

  test('lists each blocking prerequisite once even when reached by two routes', () => {
    const graph = [
      topic('sql'),
      topic('indexes', [{ slug: 'sql' }]),
      topic('transactions', [{ slug: 'sql' }]),
      topic('mvcc', [{ slug: 'indexes' }, { slug: 'transactions' }]),
    ];
    expect(repairPath('mvcc', graph, { sql: 0, indexes: 0, transactions: 0 })).toEqual([
      'sql',
      'indexes',
      'transactions',
    ]);
  });
});
