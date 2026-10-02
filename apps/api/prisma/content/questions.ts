import { QUESTIONS_CORE } from './questions-core';
import { QUESTIONS_DIAGNOSTIC } from './questions-diagnostic';
import { QUESTIONS_DSA } from './questions-dsa';
import { QUESTIONS_INTERVIEW } from './questions-interview';
import { QUESTION_CATEGORIES, MASTERY_LEVELS } from './reference';
import { ALL_TOPICS } from './curriculum';
import type { QuestionSpec } from './types';

export const ALL_QUESTIONS: QuestionSpec[] = [
  ...QUESTIONS_DIAGNOSTIC,
  ...QUESTIONS_CORE,
  ...QUESTIONS_DSA,
  ...QUESTIONS_INTERVIEW,
];

const MIN_LENGTHS: Record<string, number> = {
  shortAnswer: 20,
  idealAnswer: 120,
  deepAnswer: 150,
  commonMistakes: 60,
  whyWrong: 60,
  followUps: 40,
  exercise: 40,
};

/**
 * Questions are graded by a deterministic rubric until the AI evaluator exists, so a question
 * without expected concepts is ungradeable and a concept without terms is unmatchable. Both
 * are refused here rather than discovered by a learner sitting an empty drill.
 */
export function validateQuestions(questions: QuestionSpec[] = ALL_QUESTIONS): string[] {
  const problems: string[] = [];
  const topics = new Map(ALL_TOPICS.map((topic) => [topic.slug, topic]));
  const categories = new Set<string>(QUESTION_CATEGORIES.map((row) => row.key));
  const levels = new Set<string>(MASTERY_LEVELS.map((row) => row.key));

  const seenSlugs = new Set<string>();
  const conceptDefinitions = new Map<string, string>();

  for (const question of questions) {
    const at = `question ${question.slug}`;
    if (seenSlugs.has(question.slug)) problems.push(`${at}: duplicate question slug`);
    seenSlugs.add(question.slug);

    if (!topics.has(question.topicSlug)) problems.push(`${at}: unknown topic "${question.topicSlug}"`);
    if (!categories.has(question.categoryKey)) problems.push(`${at}: unknown category "${question.categoryKey}"`);
    if (!levels.has(question.levelKey)) problems.push(`${at}: unknown mastery level "${question.levelKey}"`);
    if (question.difficulty < 1 || question.difficulty > 7 || !Number.isInteger(question.difficulty)) {
      problems.push(`${at}: difficulty ${question.difficulty} is outside 1..7`);
    }
    if (question.stem.trim().length < 15) problems.push(`${at}: stem is too short to stand alone`);
    if (question.body.trim().length < 20) problems.push(`${at}: body must give the learner something to work with`);

    if (question.concepts.length === 0) problems.push(`${at}: no expected concepts, so nothing to grade`);
    const withinQuestion = new Set<string>();
    for (const concept of question.concepts) {
      if (withinQuestion.has(concept.slug)) problems.push(`${at}: concept ${concept.slug} listed twice`);
      withinQuestion.add(concept.slug);
      if (concept.name.trim().length < 5) problems.push(`${at}/${concept.slug}: name missing`);
      if (concept.detail.trim().length < 20) problems.push(`${at}/${concept.slug}: detail too thin to be guidance`);
      if (concept.terms.length === 0) problems.push(`${at}/${concept.slug}: no terms, so never matchable`);
      for (const term of concept.terms) {
        if (term.trim().length < 3) problems.push(`${at}/${concept.slug}: term "${term}" is noise`);
      }
      if ((concept.weight ?? 1) < 1) problems.push(`${at}/${concept.slug}: weight must be at least 1`);

      const fingerprint = `${concept.name}|${concept.detail}|${[...concept.terms].sort().join(',')}`;
      const prior = conceptDefinitions.get(concept.slug);
      if (prior !== undefined && prior !== fingerprint) {
        problems.push(`${at}: concept ${concept.slug} is defined differently than in another question`);
      }
      conceptDefinitions.set(concept.slug, fingerprint);
    }

    for (const [field, minimum] of Object.entries(MIN_LENGTHS)) {
      const value = (question.answer as unknown as Record<string, string>)[field];
      if (typeof value !== 'string' || value.trim().length < minimum) {
        problems.push(`${at}: answer.${field} is missing or under ${minimum} characters`);
      }
    }
  }

  return problems;
}
