import { describe, expect, test } from 'bun:test';
import { answerDepth, asVerdict, moduleBlocks, partTone, phaseStandings, rungTone, shortDate, verdictTone } from '@/lib/view';
import type { Phase, Topic } from '@/lib/types';

describe('rung tone', () => {
  test('exposure is neutral, work in progress is accent, held rungs are green', () => {
    expect(rungTone(0)).toBe('neutral');
    expect(rungTone(1)).toBe('accent');
    expect(rungTone(2)).toBe('accent');
    expect(rungTone(3)).toBe('held');
    expect(rungTone(7)).toBe('held');
  });
});

describe('verdict wording', () => {
  test('every grading verdict has a colour and the three verdicts that mean "not yet" stay quiet', () => {
    expect(verdictTone('correct')).toBe('held');
    expect(verdictTone('partially-correct')).toBe('accent');
    expect(verdictTone('shallow')).toBe('due');
    expect(verdictTone('incorrect')).toBe('weak');
    expect(verdictTone('unverifiable')).toBe('neutral');
  });

  test('an unanswered diagnostic item reads as unverifiable rather than crashing the palette', () => {
    expect(asVerdict('unanswered')).toBe('unverifiable');
    expect(asVerdict('shallow')).toBe('shallow');
  });
});

describe('answer depth', () => {
  test('the blank page is not an error, it is simply nothing', () => {
    expect(answerDepth(0)).toEqual({ label: 'not written', tone: 'neutral' });
  });

  test('the grader floors are named while the learner is still typing', () => {
    expect(answerDepth(12).tone).toBe('weak');
    expect(answerDepth(80).tone).toBe('due');
    expect(answerDepth(200).tone).toBe('accent');
    expect(answerDepth(400).tone).toBe('held');
  });

  test('the character floors are named, not invented per screen', () => {
    expect(answerDepth(39).label).toBe('too short to assess');
    expect(answerDepth(40).label).toBe('below the depth floor');
    expect(answerDepth(149).label).toBe('below the depth floor');
    expect(answerDepth(150).label).toBe('developed');
    expect(answerDepth(399).label).toBe('developed');
    expect(answerDepth(400).label).toBe('explanatory depth');
  });
});

describe('dates', () => {
  test('a missing date reads as never, not as today', () => {
    expect(shortDate(null)).toBe('never');
    expect(shortDate(undefined)).toBe('never');
  });

  test('a review date renders short enough to sit in a row', () => {
    expect(shortDate('2026-09-29T00:00:00Z')).toBe('Sep 29');
  });
});

const phase = (key: string, number: number): Phase => ({
  key,
  number,
  title: `Phase ${key}`,
  summary: '',
  topicCount: 0,
});

const topic = (phaseKey: string, slug: string, unlocked: boolean, level = 0): Topic => ({
  slug,
  title: slug,
  summary: '',
  phaseKey,
  number: 1,
  skillKey: null,
  module: null,
  unlockRequiredLevel: 3,
  level,
  unlocked,
  blockedBy: unlocked ? [] : [{ slug: 'below-it', requiredLevel: 3, currentLevel: level }],
  warnings: [],
});

const described = (slug: string, module: string | null): Topic => ({ ...topic('p18', slug, true), module });

describe('module blocks', () => {
  test('a phase with no modules is one unlabelled block, exactly as it was', () => {
    const blocks = moduleBlocks([described('a', null), described('b', null)]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].module).toBeNull();
    expect(blocks[0].topics.map((entry) => entry.slug)).toEqual(['a', 'b']);
  });

  test('consecutive topics sharing a label read as one block, in order', () => {
    const blocks = moduleBlocks([
      described('l1', 'Module 01 · Foundations'),
      described('l2', 'Module 01 · Foundations'),
      described('free', null),
      described('m1', 'Module 02 · APIs'),
    ]);
    expect(blocks.map((entry) => [entry.module, entry.topics.length])).toEqual([
      ['Module 01 · Foundations', 2],
      [null, 1],
      ['Module 02 · APIs', 1],
    ]);
  });

  test('an empty phase has no blocks to render', () => {
    expect(moduleBlocks([])).toEqual([]);
  });
});

describe('exam readiness', () => {
  test('a phase is sittable only when every topic in it is open', () => {
    const standings = phaseStandings([phase('p00', 0)], [topic('p00', 'a', true), topic('p00', 'b', true)]);
    expect(standings[0].ready).toBe(true);
    expect(standings[0].open).toBe(2);
    expect(standings[0].blocked).toEqual([]);
  });

  test('one locked topic is enough to hold the whole phase', () => {
    const standings = phaseStandings([phase('p00', 0)], [topic('p00', 'a', true), topic('p00', 'b', false, 1)]);
    expect(standings[0].ready).toBe(false);
    expect(standings[0].blocked.map((entry) => entry.slug)).toEqual(['b']);
  });

  test('a phase with no topics has nothing to examine', () => {
    expect(phaseStandings([phase('p00', 0)], []).map((entry) => entry.ready)).toEqual([false]);
  });

  test('each phase is counted against its own topics, in the order the graph gave them', () => {
    const standings = phaseStandings(
      [phase('p01', 1), phase('p00', 0)],
      [topic('p01', 'c', false), topic('p00', 'a', true), topic('p00', 'b', true)],
    );
    expect(standings.map((entry) => [entry.key, entry.open, entry.total])).toEqual([
      ['p01', 0, 1],
      ['p00', 2, 2],
    ]);
  });

  test('a part that was never answered reads differently from one that was answered badly', () => {
    expect(partTone({ answered: 2, passed: true })).toBe('held');
    expect(partTone({ answered: 2, passed: false })).toBe('weak');
    expect(partTone({ answered: 0, passed: false })).toBe('neutral');
  });
});
