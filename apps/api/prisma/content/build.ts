import type { TopicSpec } from './types';

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
