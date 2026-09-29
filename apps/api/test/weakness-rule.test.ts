import { describe, expect, test } from 'bun:test';
import type { GraphTopic } from '../src/curriculum/graph';
import {
  REPEATED_FAILURE_STREAK,
  detectWeaknesses,
  type AttemptRow,
} from '../src/mastery/weakness';

const topic = (
  slug: string,
  number: number,
  prerequisites: { slug: string; critical?: boolean }[] = [],
  unlockRequiredLevel = 3,
): GraphTopic => ({ slug, number, title: slug, unlockRequiredLevel, prerequisites });

/** Attempts are written oldest first, which is how the ledger is read. */
function attempts(topicSlug: string, scores: number[], start = 0): AttemptRow[] {
  return scores.map((score, index) => ({
    topicSlug,
    questionSlug: `${topicSlug}-q${index}`,
    score,
    at: new Date(Date.UTC(2026, 0, 1, 0, 0, start + index)),
    isDiagnostic: false,
  }));
}

const MISS = 30;
const HIT = 80;

describe('weakness rule', () => {
  test('two misses in a row are noise, not a pattern', () => {
    const graph = [topic('event-loop', 1)];
    const found = detectWeaknesses(attempts('event-loop', [MISS, MISS]), graph, {});
    expect(found).toHaveLength(0);
  });

  test('the threshold is what opens the report', () => {
    const graph = [topic('event-loop', 1)];
    const scores = Array.from({ length: REPEATED_FAILURE_STREAK }, () => MISS);
    const found = detectWeaknesses(attempts('event-loop', scores), graph, {});

    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({
      topicSlug: 'event-loop',
      failedStreak: REPEATED_FAILURE_STREAK,
      attempts: REPEATED_FAILURE_STREAK,
      // nothing is underneath this topic, so the gap is here
      repairPath: [],
      rootCauseSlug: 'event-loop',
    });
  });

  test('a streak counts attempts on one topic, not on the whole ledger', () => {
    const graph = [topic('event-loop', 1), topic('memory-hierarchy', 2)];
    const rows = [
      ...attempts('event-loop', [MISS, MISS], 0),
      ...attempts('memory-hierarchy', [MISS, MISS], 10),
    ];
    expect(detectWeaknesses(rows, graph, {})).toHaveLength(0);
  });

  test('a pass breaks the streak and closes the finding', () => {
    const graph = [topic('event-loop', 1)];
    const rows = [
      ...attempts('event-loop', [MISS, MISS, MISS], 0),
      ...attempts('event-loop', [HIT], 10),
    ];
    expect(detectWeaknesses(rows, graph, {})).toHaveLength(0);
  });

  test('only the trailing streak matters, so a later collapse still opens a finding', () => {
    const graph = [topic('event-loop', 1)];
    const rows = attempts('event-loop', [HIT, MISS, MISS, HIT, MISS, MISS, MISS]);
    const found = detectWeaknesses(rows, graph, {});

    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ failedStreak: 3, attempts: 7 });
  });

  test('repeated failure walks back to the weak prerequisite', () => {
    const graph = [topic('how-programs-run', 1), topic('memory-hierarchy', 2, [{ slug: 'how-programs-run' }])];
    const found = detectWeaknesses(attempts('memory-hierarchy', [MISS, MISS, MISS]), graph, {
      'memory-hierarchy': 0,
      // the prerequisite has fallen below the level this topic needs
      'how-programs-run': 1,
    });

    expect(found).toHaveLength(1);
    expect(found[0].repairPath).toEqual(['how-programs-run']);
    expect(found[0].rootCauseSlug).toBe('how-programs-run');
  });

  test('a strong prerequisite is not blamed for a failure on top of it', () => {
    const graph = [topic('how-programs-run', 1), topic('memory-hierarchy', 2, [{ slug: 'how-programs-run' }])];
    const found = detectWeaknesses(attempts('memory-hierarchy', [MISS, MISS, MISS]), graph, {
      'memory-hierarchy': 0,
      'how-programs-run': 3,
    });

    expect(found[0].repairPath).toEqual([]);
    expect(found[0].rootCauseSlug).toBe('memory-hierarchy');
  });

  test('the walk reaches the deepest weak prerequisite, not the nearest one', () => {
    const graph = [
      topic('how-programs-run', 1),
      topic('memory-hierarchy', 2, [{ slug: 'how-programs-run' }]),
      topic('closures-scope', 3, [{ slug: 'memory-hierarchy' }]),
    ];
    const found = detectWeaknesses(attempts('closures-scope', [MISS, MISS, MISS]), graph, {
      'closures-scope': 0,
      'memory-hierarchy': 1,
      'how-programs-run': 0,
    });

    expect(found[0].repairPath).toEqual(['how-programs-run', 'memory-hierarchy']);
    expect(found[0].rootCauseSlug).toBe('how-programs-run');
  });

  test('a non-critical prerequisite does not open the repair path', () => {
    const graph = [
      topic('system-calls-io', 1),
      topic('memory-hierarchy', 2),
      topic('cpu-bound-vs-io-bound', 3, [{ slug: 'system-calls-io' }]),
      topic('streams-backpressure', 4, [{ slug: 'cpu-bound-vs-io-bound' }, { slug: 'memory-hierarchy', critical: false }]),
    ];
    const found = detectWeaknesses(attempts('streams-backpressure', [MISS, MISS, MISS]), graph, {
      'streams-backpressure': 0,
      'cpu-bound-vs-io-bound': 3,
      'memory-hierarchy': 0,
    });

    expect(found[0].repairPath).toEqual([]);
  });

  test('a diagnostic miss is placement, so it never opens a finding', () => {
    const graph = [topic('event-loop', 1)];
    const rows = attempts('event-loop', [MISS, MISS, MISS, MISS]).map((row) => ({
      ...row,
      isDiagnostic: true,
    }));
    expect(detectWeaknesses(rows, graph, {})).toHaveLength(0);
  });

  test('diagnostic misses do not dilute the streak of the drills around them', () => {
    const graph = [topic('event-loop', 1)];
    const rows = [
      ...attempts('event-loop', [MISS, MISS], 0),
      { topicSlug: 'event-loop', questionSlug: 'diag-1', score: MISS, at: new Date(Date.UTC(2026, 0, 1, 0, 5)), isDiagnostic: true },
      ...attempts('event-loop', [MISS, MISS], 10),
    ];
    const found = detectWeaknesses(rows, graph, {});

    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ failedStreak: 4, attempts: 4 });
  });

  test('findings are reported in curriculum order, because the repair comes first', () => {
    const graph = [
      topic('how-programs-run', 1),
      topic('memory-hierarchy', 2, [{ slug: 'how-programs-run' }]),
    ];
    const rows = [
      // the ledger is written newest-first here on purpose: the report must not inherit its order
      ...attempts('memory-hierarchy', [MISS, MISS, MISS], 0),
      ...attempts('how-programs-run', [MISS, MISS, MISS], 10),
    ];
    const found = detectWeaknesses(rows, graph, { 'how-programs-run': 0, 'memory-hierarchy': 0 });

    expect(found.map((entry) => entry.topicSlug)).toEqual(['how-programs-run', 'memory-hierarchy']);
  });

  test('an attempt on a topic that is no longer in the graph is ignored rather than guessed at', () => {
    const found = detectWeaknesses(attempts('withdrawn-topic', [MISS, MISS, MISS]), [topic('event-loop', 1)], {});
    expect(found).toHaveLength(0);
  });
});
