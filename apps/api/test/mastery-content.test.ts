import { describe, expect, test } from 'bun:test';
import { MASTERY_LEVELS, QUESTION_CATEGORIES, SIGNALS, validateReference } from '../prisma/content/reference';
import { ALL_TOPICS } from '../prisma/content/curriculum';
import { ALL_QUESTIONS } from '../prisma/content/questions';

const levelNumber = (key: string) => MASTERY_LEVELS.find((level) => level.key === key)?.number ?? -1;
const rungOfCategory = (categoryKey: string) => {
  const category = QUESTION_CATEGORIES.find((row) => row.key === categoryKey);
  const signal = SIGNALS.find((row) => row.key === category?.signalKey);
  return signal ? levelNumber(signal.levelKey) : 0;
};

describe('mastery content contract', () => {
  test('the lookup tables agree with each other', () => {
    expect(validateReference()).toHaveLength(0);
  });

  test('every category is evidence for exactly one dimension, and one dimension belongs to reviews', () => {
    expect(QUESTION_CATEGORIES.every((category) => category.signalKey)).toBe(true);
    expect(SIGNALS.filter((signal) => signal.evidencedByReview).map((signal) => signal.key)).toEqual(['recall']);
  });

  test('no rung below the top of the ladder is unreachable from evidence', () => {
    const fed: Set<number> = new Set(SIGNALS.map((signal) => levelNumber(signal.levelKey)));
    const highestFed = Math.max(...fed);
    for (const level of MASTERY_LEVELS) {
      // the rungs above the highest fed one are the future signals, not holes in the ladder
      if (level.number === 0 || level.number > highestFed) continue;
      expect(fed.has(level.number)).toBe(true);
    }
    expect(highestFed).toBe(6);
  });

  test('the entry topic can actually be climbed, so promotion is reachable in the seeded bank', () => {
    const roots = ALL_TOPICS.filter((topic) => topic.prerequisites.length === 0).map((topic) => topic.slug);
    expect(roots.length).toBeGreaterThan(0);

    const climbable = roots.filter((slug) => {
      const rungs: Set<number> = new Set(
        ALL_QUESTIONS.filter((question) => question.topicSlug === slug && !question.isDiagnostic).map(
          (question) => rungOfCategory(question.categoryKey),
        ),
      );
      // topics unlock their dependents at rung 3, so 1, 2 and 3 each need their own evidence
      return [1, 2, 3].every((rung) => rungs.has(rung));
    });
    expect(climbable).toContain('how-programs-run');
  });

  test('every authored drill sits on a rung its category can evidence', () => {
    const drills = ALL_QUESTIONS.filter((question) => !question.isDiagnostic);
    expect(drills.length).toBeGreaterThan(0);
    expect(drills.every((question) => rungOfCategory(question.categoryKey) > 0)).toBe(true);
  });
});
