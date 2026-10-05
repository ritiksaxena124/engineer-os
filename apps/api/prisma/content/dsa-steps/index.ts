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
import {
  concepts as step15aConcepts,
  expects as step15aExpects,
  problems as step15aProblems,
} from './step15a';
import {
  concepts as step15bConcepts,
  expects as step15bExpects,
  problems as step15bProblems,
} from './step15b';
import {
  concepts as step15cConcepts,
  expects as step15cExpects,
  problems as step15cProblems,
} from './step15c';
import {
  concepts as step15dConcepts,
  expects as step15dExpects,
  problems as step15dProblems,
} from './step15d';

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
  ...step15aConcepts,
  ...step15bConcepts,
  ...step15cConcepts,
  ...step15dConcepts,
};

export const DSA_STEP_PROBLEMS: DsaProblem[] = [
  ...step14aProblems,
  ...step14bProblems,
  ...step15aProblems,
  ...step15bProblems,
  ...step15cProblems,
  ...step15dProblems,
];

export const DSA_STEP_EXPECTS: Record<string, string> = {
  ...step14aExpects,
  ...step14bExpects,
  ...step15aExpects,
  ...step15bExpects,
  ...step15cExpects,
  ...step15dExpects,
};
