import { describe, expect, test } from 'bun:test';
import { gradeAnswer, type GradeableConcept } from '../src/question/grading';

const concepts: GradeableConcept[] = [
  { slug: 'microtask-queue', name: 'The microtask queue', terms: ['microtask', 'promise queue'], weight: 2 },
  { slug: 'timer-queue', name: 'Timers are macrotasks', terms: ['macrotask', 'timer queue'], weight: 2 },
  { slug: 'drain-order', name: 'Microtasks drain before the next tick', terms: ['drain', 'before the next'], weight: 1 },
  { slug: 'call-stack', name: 'Synchronous code runs first', terms: ['call stack', 'synchronous'], weight: 1 },
];

describe('answer grading', () => {
  test('a strong answer names every concept in enough words to be an explanation', () => {
    const answer =
      'A and D print first, because the script itself is one synchronous task and the call stack has to empty ' +
      'before the loop looks at any queue. B is a promise reaction, so it is queued as a microtask, and the ' +
      'microtask queue drains completely — including anything those microtasks push — before the next thing runs. ' +
      'C is a timer callback, which is a macrotask, so it waits for a later turn of the loop entirely. That is ' +
      'why setTimeout with 0 does not mean immediately: it means no sooner than zero, on a future tick, and under ' +
      'load the distance between B and C is loop lag rather than anything you can reason about statically.';
    const result = gradeAnswer(answer, concepts);

    expect(result.verdict).toBe('correct');
    expect(result.coverage).toBe(1);
    expect(result.score).toBe(100);
    expect(result.missing).toEqual([]);
  });

  test('missing the load-bearing concepts costs proportionally to their weight', () => {
    const answer =
      'The call stack runs A and D first, and then the promise prints before the timer because promises are ' +
      'microtasks. I would not rely on the exact tick distance between engines, and under load the gap between ' +
      'them grows because the loop is busy with other work, which shows up as latency in unrelated endpoints.';
    const result = gradeAnswer(answer, concepts);

    expect(result.coverage).toBeCloseTo(3 / 6, 5);
    expect(result.verdict).toBe('shallow');
    expect(result.missing).toContain('Timers are macrotasks');
  });

  test('name-dropping in two lines cannot buy a correct verdict', () => {
    const answer = 'call stack, then microtask queue drains, then macrotask timer queue on the next tick.';
    const result = gradeAnswer(answer, concepts);

    expect(result.coverage).toBe(1);
    expect(result.verdict).toBe('shallow');
    expect(result.score).toBe(100);
  });

  test('a long answer with nothing relevant is incorrect, not shallow', () => {
    const answer =
      'In my last role we moved everything to Kubernetes and rewrote the deploy pipeline, then set up argocd ' +
      'with progressive delivery and canary analysis, and we also introduced a service mesh so that mTLS was ' +
      'enabled between every pod, which let us delete most of the feature flags we had accumulated over the ' +
      'years and finally get a clean read on which endpoints were actually receiving production traffic.';
    const result = gradeAnswer(answer, concepts);

    expect(result.coverage).toBe(0);
    expect(result.verdict).toBe('incorrect');
  });

  test('an answer too short to judge is unverifiable and scores zero', () => {
    const result = gradeAnswer('promises are faster', concepts);

    expect(result.verdict).toBe('unverifiable');
    expect(result.score).toBe(0);
  });

  test('part coverage with a full explanation is partially correct', () => {
    const answer =
      'The promise reaction is a microtask, so it runs off the microtask queue as soon as the current work ' +
      'finishes, and that queue drains completely before anything else gets a turn. The setTimeout callback is a ' +
      'macrotask held by the timer queue, so it has to wait for a later pass of the loop. In production the gap ' +
      'between them is loop lag: a busy poll phase can push the timer out by hundreds of milliseconds, which is ' +
      'why no correctness decision should depend on how far apart two queues actually are.';
    const result = gradeAnswer(answer, concepts);

    expect(result.coverage).toBeCloseTo(5 / 6, 5);
    expect(result.verdict).toBe('partially-correct');
    expect(result.missing.length).toBeGreaterThan(0);
  });

  test('a term only counts as a phrase, not as a stray word', () => {
    const narrow: GradeableConcept[] = [
      { slug: 'lock-order', name: 'Consistent lock ordering', terms: ['lock order'], weight: 1 },
      { slug: 'other', name: 'Something else entirely', terms: ['backoff'], weight: 1 },
    ];
    const answer =
      'We have a lock on the row and we retry with a backoff when it times out, which mostly works until two ' +
      'workers grab them in a different sequence and the whole nightly job starts failing intermittently, at ' +
      'which point everybody blames the database instead of the order the code acquires things in.';
    const result = gradeAnswer(answer, narrow);

    expect(result.matched).toEqual(['other']);
    expect(result.missing).toEqual(['Consistent lock ordering']);
  });
});
