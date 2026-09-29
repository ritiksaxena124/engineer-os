import type { ConceptSpec, TopicSpec } from './types';

/**
 * Critical prerequisites gate unlocking; advisory ones only warn, so a learner can be
 * told "you should probably have done X" without being blocked by it.
 */
export const t = (
  slug: string,
  title: string,
  summary: string,
  skill: string,
  prerequisites: string[] = [],
  advisory: string[] = [],
  unlockRequiredLevel?: number,
): TopicSpec => ({
  slug,
  title,
  summary,
  skill,
  ...(unlockRequiredLevel === undefined ? {} : { unlockRequiredLevel }),
  prerequisites: [
    ...prerequisites.map((slug) => ({ slug, critical: true })),
    ...advisory.map((slug) => ({ slug, critical: false })),
  ],
});

/**
 * A concept a real answer must touch. Terms are the accepted phrasings — a learner who says
 * "timer queue" for "macrotask queue" is not wrong, and the grader has to know that.
 */
export const c = (
  slug: string,
  name: string,
  detail: string,
  terms: string[],
  weight = 1,
): ConceptSpec => ({ slug, name, detail, terms, weight });
