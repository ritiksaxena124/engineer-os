import { DSA_CONCEPTS, DSA_PROBLEMS, sheetKey } from './dsa-problems';
import type { ConceptSpec, QuestionSpec } from './types';

/**
 * The sheet's Easy/Medium/Hard is a difficulty of the problem, not a claim about which rung a
 * strong answer demonstrates, so the two axes are decided here once: every DSA drill is an
 * implementation question, and only the hardest ones are argued as design.
 */
const RUNG = {
  Easy: { difficulty: 3, levelKey: 'implementation' },
  Medium: { difficulty: 4, levelKey: 'implementation' },
  Hard: { difficulty: 5, levelKey: 'design' },
} as const;

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[()`"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * A DSA problem is graded on the same rubric as every other drill: the learner writes the
 * mechanism and the code, and the answer model opens afterwards. The JavaScript solution lives in
 * the model's exercise slot and the explanation in the deep slot, which is where the reveal shows
 * them.
 */
export const QUESTIONS_DSA: QuestionSpec[] = DSA_PROBLEMS.map((problem) => {
  const rung = RUNG[problem.difficulty];
  const concepts = problem.concepts.map((key) => DSA_CONCEPTS[key as keyof typeof DSA_CONCEPTS] as ConceptSpec);

  return {
    slug: `dsa-${slugify(problem.name)}`,
    topicSlug: problem.topicSlug,
    categoryKey: 'implementation',
    levelKey: rung.levelKey,
    difficulty: rung.difficulty,
    stem: `${problem.name} — ${problem.stem}`,
    body: `${problem.brief}\n\nWrite the JavaScript, then state what it costs. Say which input of yours a reviewer would test first.`,
    concepts,
    answer: {
      shortAnswer: problem.shortAnswer,
      idealAnswer: problem.idealAnswer,
      deepAnswer: problem.walkthrough,
      commonMistakes: problem.commonMistake,
      whyWrong: problem.whyWrong,
      followUps: problem.followUps.map((question, index) => `${index + 1}. ${question}`).join('\n'),
      exercise: ['```js', problem.solution, '```', '', `Then: ${problem.modify}`].join('\n'),
    },
  };
});

/** Coverage reporting for the importer: which sheet rows the app already carries. */
export const AUTHORED_SHEET_KEYS = new Set(
  DSA_PROBLEMS.map((problem) => sheetKey(problem.step, problem.name)),
);
