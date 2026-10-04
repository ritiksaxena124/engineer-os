import type { ConceptSpec } from './types';
import type { DsaProblem } from './dsa-problems';

/**
 * A batch is one authored slice of the sheet — a step, or part of a long step. It carries its own
 * concepts, its own problems and the executable check for each solution.
 *
 * Steps 14 to 18 are batches rather than more lines in dsa-problems.ts because the bank grows
 * fastest there: a batch is verified on its own before the whole 476 has to compile together.
 */
export interface DsaBatch {
  /** short name used in reports */
  id: string;
  /** concept definitions this batch adds; may also cite slugs defined by the core bank */
  concepts: Record<string, ConceptSpec>;
  problems: DsaProblem[];
  /** keyed by problem name: an expression that must be true when evaluated against the solution */
  expects: Record<string, string>;
}
