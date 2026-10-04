import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';
import {
  concepts as step14aConcepts,
  expects as step14aExpects,
  problems as step14aProblems,
} from './step14a';
import {
  concepts as step14bConcepts,
  expects as step14bExpects,
  problems as step14bProblems,
} from './step14b';

/**
 * The sheet steps authored as separate batches, in sheet order.
 *
 * A batch is part of the bank the moment it is listed here — that is the whole merge, because the
 * content test and the seed read what dsa-problems.ts composes from these three maps. Steps 14 to
 * 18 stay out of dsa-problems.ts so one step can be authored, verified and reviewed on its own.
 */
export const DSA_STEP_CONCEPTS: Record<string, ConceptSpec> = {
  ...step14aConcepts,
  ...step14bConcepts,
};

export const DSA_STEP_PROBLEMS: DsaProblem[] = [...step14aProblems, ...step14bProblems];

export const DSA_STEP_EXPECTS: Record<string, string> = {
  ...step14aExpects,
  ...step14bExpects,
};
