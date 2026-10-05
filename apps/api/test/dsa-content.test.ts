import { describe, expect, test } from 'bun:test';
import { DSA_CONCEPTS, DSA_PROBLEMS, sheetKey } from '../prisma/content/dsa-problems';
import { DSA_EXPECTS_CORE } from '../prisma/content/dsa-expects';
import { QUESTIONS_DSA } from '../prisma/content/questions-dsa';
import { ALL_TOPICS } from '../prisma/content/curriculum';
import { validateQuestions } from '../prisma/content/questions';

/**
 * The DSA bank is imported content, so the tests hold the import to the same line as the authored
 * bank: every row must be unique, every concept reference must resolve, and every JavaScript
 * solution must actually produce the answer it claims. A reference solution that is merely
 * well-formed is worse than no solution, because a learner reads it as truth.
 */

/** The solution runs in its own function scope with console captured, so a printing solution is testable too. */
function run(solution: string, expression: string): boolean {
  return new Function(
    `${solution}\nconst logged = [];\nconst console = { log: (value) => logged.push(String(value)) };\nreturn (${expression});`,
  )() as boolean;
}

describe('dsa content', () => {
  test('every authored problem became a question, in order', () => {
    expect(QUESTIONS_DSA).toHaveLength(DSA_PROBLEMS.length);
    expect(QUESTIONS_DSA.map((question) => question.topicSlug)).toEqual(DSA_PROBLEMS.map((problem) => problem.topicSlug));
  });

  test('a problem cannot cite a concept that does not exist', () => {
    for (const problem of DSA_PROBLEMS) {
      expect(problem.concepts.length).toBeGreaterThan(0);
      for (const key of problem.concepts) {
        expect(DSA_CONCEPTS[key as keyof typeof DSA_CONCEPTS]).toBeDefined();
      }
    }
  });

  test('the sheet names the app claims are unique per step', () => {
    const keys = DSA_PROBLEMS.map((problem) => sheetKey(problem.step, problem.name));
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('question slugs collide with nothing in the bank', () => {
    const slugs = QUESTIONS_DSA.map((question) => question.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(validateQuestions()).toEqual([]);
  });

  test('every DSA topic is in the phase the sheet belongs to', () => {
    const dsa = new Set(ALL_TOPICS.filter((topic) => topic.phaseKey === 'p03').map((topic) => topic.slug));
    for (const problem of DSA_PROBLEMS) {
      expect(dsa.has(problem.topicSlug), `${problem.name} sits outside p03`).toBe(true);
    }
  });

  test('every reference solution runs and gives the answer the explanation claims', () => {
    for (const problem of DSA_PROBLEMS) {
      const expression = DSA_EXPECTS_CORE[problem.name];
      expect(expression, `${problem.name} has no executable check`).toBeTruthy();
      expect(run(problem.solution, expression), `${problem.name}: the shipped solution is wrong`).toBe(true);
    }
  });

  test('a solution is never paired with an empty explanation or a missing edge case', () => {
    for (const problem of DSA_PROBLEMS) {
      expect(problem.walkthrough.length).toBeGreaterThan(150);
      expect(problem.followUps.length).toBeGreaterThanOrEqual(3);
      expect(problem.modify.length).toBeGreaterThan(20);
    }
  });

  test('the rung a DSA answer demonstrates is set by the sheet difficulty, not by the writer', () => {
    const rungs = DSA_PROBLEMS.map((problem, index) => `${problem.difficulty}:${QUESTIONS_DSA[index].levelKey}`);
    expect(rungs.filter((entry) => entry === 'Easy:implementation').length).toBeGreaterThan(0);
    expect(rungs.filter((entry) => entry === 'Medium:implementation').length).toBeGreaterThan(0);
    expect(rungs.every((entry) => /:(implementation|design)$/.test(entry))).toBe(true);
  });
});
