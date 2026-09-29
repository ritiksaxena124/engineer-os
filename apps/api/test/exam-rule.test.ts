import { describe, expect, test } from 'bun:test';
import { EXAM, judgeExam, planExam, scorePart, selectItems, teachBackTopic, EXAM_MINUTES } from '../src/assessment/exam';
import type { ExamItem, PartPlan } from '../src/assessment/exam';

const part = (key: string) => EXAM.find((entry) => entry.key === key)!;

const item = (slug: string, category: string, difficulty = 3): ExamItem => ({
  slug,
  stem: `${slug} stem`,
  body: `${slug} body`,
  difficulty,
  category,
  levelKey: 'understanding',
  topicSlug: 'how-programs-run',
  conceptCount: 3,
});

const bank = [
  item('d5', 'conceptual', 5),
  item('d1', 'why', 1),
  item('d1b', 'internal', 1),
  item('impl', 'implementation', 2),
  item('debug', 'debugging', 4),
  item('interview', 'interview', 3),
];

describe('exam parts', () => {
  test('the seven parts are A through G in order with the counts the phase exam asks for', () => {
    expect(EXAM.map((entry) => entry.position)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(EXAM.map((entry) => entry.label)).toEqual([
      'Part A — Theory',
      'Part B — Implementation',
      'Part C — Debugging',
      'Part D — Architecture',
      'Part E — Production',
      'Part F — Interview',
      'Part G — Teaching',
    ]);
    expect(EXAM.map((entry) => entry.items)).toEqual([20, 3, 2, 1, 1, 3, 1]);
    expect(EXAM_MINUTES).toBe(175);
  });

  test('a part selects only its own family, easiest first', () => {
    expect(selectItems(part('theory'), bank).map((entry) => entry.slug)).toEqual(['d1', 'd1b', 'd5']);
    expect(selectItems(part('implementation'), bank).map((entry) => entry.slug)).toEqual(['impl']);
    expect(selectItems(part('teaching'), bank)).toEqual([]);
  });

  test('a part takes at most the number of items it asks for', () => {
    const crowded = Array.from({ length: 25 }, (_, index) => item(`q${index}`, 'conceptual', 1 + (index % 5)));
    expect(selectItems(part('theory'), crowded)).toHaveLength(20);
  });

  test('teach-back goes to the topic with the most to explain', () => {
    expect(
      teachBackTopic([
        { slug: 'small', conceptCount: 2, number: 1 },
        { slug: 'wide', conceptCount: 7, number: 2 },
        { slug: 'empty', conceptCount: 0, number: 3 },
      ]),
    ).toBe('wide');
    expect(teachBackTopic([{ slug: 'empty', conceptCount: 0, number: 1 }])).toBeNull();
  });

  test('a part nobody authored for this phase is reported missing, not padded with another family', () => {
    const { plans, missing } = planExam(bank, [{ slug: 'how-programs-run', conceptCount: 4, number: 1 }]);
    expect(missing.map((entry) => entry.key)).toEqual(['architecture', 'production']);
    expect(plans.map((plan) => plan.part.key)).toEqual(['theory', 'implementation', 'debugging', 'interview', 'teaching']);
    expect(plans.find((plan) => plan.part.key === 'theory')?.short).toBe(true);
    expect(plans.find((plan) => plan.part.key === 'teaching')?.short).toBe(false);
  });

  test('a phase with nothing to teach back on has no Part G either', () => {
    const { plans } = planExam(bank, [{ slug: 'bare', conceptCount: 0, number: 1 }]);
    expect(plans.some((plan) => plan.part.key === 'teaching')).toBe(false);
  });
});

describe('exam scoring', () => {
  const paper = (key: string, handed: number): PartPlan => ({
    part: part(key),
    items: Array.from({ length: handed }, (_, index) => item(`p${index}`, key)),
    short: handed < part(key).items,
  });

  test('a blank is a zero, so ten blanks out of twenty theory carry the part down', () => {
    const tenPerfect = Array.from({ length: 10 }, (_, index) => ({ slug: `q${index}`, score: 100, verdict: 'correct' }));
    expect(scorePart(paper('theory', 20), tenPerfect)).toEqual({
      key: 'theory',
      label: 'Part A — Theory',
      items: 20,
      answered: 10,
      score: 50,
      passed: false,
    });
  });

  test('a short paper is graded against what it handed out, not what the part would have liked', () => {
    const three = paper('theory', 3);
    const perfect = Array.from({ length: 3 }, (_, index) => ({ slug: `q${index}`, score: 100, verdict: 'correct' }));
    expect(scorePart(three, perfect)).toMatchObject({ items: 3, score: 100, passed: true });
  });

  test('an empty part is not a pass on a zero denominator', () => {
    expect(scorePart(paper('architecture', 0), []).passed).toBe(false);
  });

  test('a part holds at the pass score and falls below it', () => {
    const filled = (count: number, score: number) =>
      Array.from({ length: count }, (_, index) => ({ slug: `q${index}`, score, verdict: 'partially-correct' }));
    expect(scorePart(paper('debugging', 2), filled(2, 60)).passed).toBe(true);
    expect(scorePart(paper('debugging', 2), filled(2, 59)).passed).toBe(false);
  });

  test('the exam passes only when every part holds, and names the ones that did not', () => {
    const held = (count: number, score: number) =>
      Array.from({ length: count }, (_, index) => ({ slug: `q${index}`, score, verdict: 'correct' }));
    const scores = [scorePart(paper('theory', 20), held(20, 90)), scorePart(paper('implementation', 3), held(3, 80))];
    expect(judgeExam(scores).passed).toBe(true);
    expect(judgeExam(scores).failedParts).toEqual([]);

    const teaching: PartPlan = { part: part('teaching'), items: [], short: false };
    const failed = judgeExam([...scores, scorePart(teaching, [{ slug: 'c', score: 40, verdict: 'shallow' }])]);
    expect(failed.passed).toBe(false);
    expect(failed.failedParts).toEqual([{ key: 'teaching', label: 'Part G — Teaching', score: 40 }]);
  });

  test('an exam with no parts is not a pass', () => {
    expect(judgeExam([]).passed).toBe(false);
  });
});
