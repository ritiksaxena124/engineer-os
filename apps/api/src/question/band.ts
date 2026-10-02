import type { Prisma } from '@prisma/client';

/**
 * Easy/Medium/Hard is the sheet's name for rungs the row already carries as D1–D7, so it is derived
 * here instead of stored: the badge, the band filter and the difficulty number can never disagree.
 */
export const bandFor = (difficulty: number): 'Easy' | 'Medium' | 'Hard' =>
  difficulty <= 3 ? 'Easy' : difficulty === 4 ? 'Medium' : 'Hard';

/**
 * A bank is a slug namespace rather than a column. The tab a learner opens is a scope over the rows
 * the seed already wrote, which keeps one question engine and one rubric underneath both.
 */
export const BANK_SCOPE: Record<string, Prisma.QuestionWhereInput> = {
  dsa: { slug: { startsWith: 'dsa-' } },
  interview: { slug: { startsWith: 'int-' } },
};
