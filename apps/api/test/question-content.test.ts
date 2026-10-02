import { describe, expect, test } from 'bun:test';
import { ALL_QUESTIONS, validateQuestions } from '../prisma/content/questions';
import { ASKED_AT, COMPANIES, validateCompanies } from '../prisma/content/companies';
import { QUESTION_CATEGORIES } from '../prisma/content/reference';
import { ALL_TOPICS } from '../prisma/content/curriculum';
import type { QuestionSpec } from '../prisma/content/types';

const clone = (question: QuestionSpec): QuestionSpec =>
  JSON.parse(JSON.stringify(question)) as QuestionSpec;

const bankSlugs = () => new Set(ALL_QUESTIONS.map((question) => question.slug));

describe('question content', () => {
  test('the authored bank validates', () => {
    expect(validateQuestions()).toEqual([]);
  });

  test('the curated company table resolves against the bank', () => {
    expect(validateCompanies(bankSlugs())).toEqual([]);
  });

  test('every company the browser can filter on has questions behind it', () => {
    const tagged = new Set(Object.values(ASKED_AT).flat());
    for (const company of COMPANIES) {
      expect(tagged.has(company.key), `facet "${company.key}" lists nothing`).toBe(true);
    }
  });

  test('a tag renamed away from its question is refused rather than silently dropped', () => {
    expect(validateCompanies(new Set(['dsa-2sum-problem']))).toContain(
      'ASKED_AT: question "dsa-find-missing-number-in-an-array" does not exist',
    );
  });

  test('every question sits on a real topic', () => {
    const topics = new Set(ALL_TOPICS.map((topic) => topic.slug));
    for (const question of ALL_QUESTIONS) expect(topics.has(question.topicSlug)).toBe(true);
  });

  test('the bank exercises all 13 categories and the full 1-7 difficulty ladder', () => {
    const categories = new Set(ALL_QUESTIONS.map((question) => question.categoryKey));
    expect([...categories].sort()).toEqual(QUESTION_CATEGORIES.map((row) => row.key).sort());

    const difficulties = new Set(ALL_QUESTIONS.map((question) => question.difficulty));
    expect([...difficulties].sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('the interview bank is banded, answerable, and never a sheet duplicate', () => {
    const interview = ALL_QUESTIONS.filter((question) => question.slug.startsWith('int-'));
    expect(interview.length).toBeGreaterThanOrEqual(20);
    // Easy, Medium and Hard are stored as 3, 4 and 5 so the badge and the filter cannot drift
    expect(new Set(interview.map((question) => question.difficulty))).toEqual(new Set([3, 4, 5]));
    expect(interview.every((question) => question.answer.idealAnswer.length > 200)).toBe(true);
    expect(interview.every((question) => question.concepts.length > 1)).toBe(true);
    expect(new Set(ALL_QUESTIONS.map((question) => question.slug)).size).toBe(ALL_QUESTIONS.length);
  });

  test('the diagnostic is thirty answerable items and nothing else claims to be', () => {
    const diagnostic = ALL_QUESTIONS.filter((question) => question.isDiagnostic);
    expect(diagnostic).toHaveLength(30);
    expect(diagnostic.every((question) => question.concepts.length > 0)).toBe(true);
  });

  test('a question with no expected concepts is refused', () => {
    const broken = clone(ALL_QUESTIONS[0]);
    broken.concepts = [];
    expect(validateQuestions([broken])).toContain(
      `question ${broken.slug}: no expected concepts, so nothing to grade`,
    );
  });

  test('a concept nobody could ever match is refused', () => {
    const broken = clone(ALL_QUESTIONS[0]);
    broken.concepts = [{ ...broken.concepts[0], terms: [] }];
    expect(validateQuestions([broken]).some((problem) => problem.includes('no terms'))).toBe(true);
  });

  test('difficulty outside the ladder is refused', () => {
    const broken = clone(ALL_QUESTIONS[0]);
    broken.slug = 'broken-difficulty';
    broken.difficulty = 8;
    expect(validateQuestions([broken]).some((p) => p.includes('outside 1..7'))).toBe(true);
  });

  test('an answer model with an empty deep answer is refused', () => {
    const broken = clone(ALL_QUESTIONS[0]);
    broken.slug = 'thin-answer';
    broken.answer.deepAnswer = 'trust me';
    expect(validateQuestions([broken]).some((p) => p.includes('deepAnswer'))).toBe(true);
  });

  test('the same concept slug cannot mean two different things', () => {
    const first = clone(ALL_QUESTIONS[0]);
    const second = clone(ALL_QUESTIONS[1]);
    second.slug = 'second-question';
    second.concepts = [{ ...first.concepts[0], name: 'something else entirely' }];
    expect(validateQuestions([first, second]).some((p) => p.includes('defined differently'))).toBe(true);
  });
});
