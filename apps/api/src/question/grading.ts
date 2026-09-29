export interface GradeableConcept {
  slug: string;
  name: string;
  terms: string[];
  weight: number;
}

export type VerdictKey = 'correct' | 'partially-correct' | 'shallow' | 'incorrect' | 'unverifiable';

export interface GradeResult {
  verdict: VerdictKey;
  score: number;
  coverage: number;
  matched: string[];
  missing: string[];
  feedback: string;
}

/** Below this the learner has not written something a rubric can judge. */
const MIN_ASSESSABLE_CHARS = 40;
/** Naming every concept in two lines is recall, not explanation. */
const MIN_EXPLANATORY_CHARS = 400;
const MIN_DEVELOPED_CHARS = 150;

const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/ {2,}/g, ' ');

const escapeForMatch = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A term starts a phrase boundary: "lock" alone cannot earn "lock ordering", but
 * "microtask" earns "microtasks" and "drain" earns "drained". */
function mentionsTerm(answer: string, term: string): boolean {
  const needle = normalise(term);
  if (!needle) return false;
  return new RegExp(`(^| )${escapeForMatch(needle)}`).test(` ${answer} `);
}

/**
 * Coverage is weighted, so a missing load-bearing concept costs more than a missing extra one.
 * The depth floors exist because name-dropping is the most common way a shallow answer scores
 * well on a keyword rubric, and the mentor voice should not reward it.
 */
export function gradeAnswer(answerText: string, concepts: GradeableConcept[]): GradeResult {
  const answer = normalise(answerText);
  const chars = answerText.trim().length;
  const total = concepts.reduce((sum, concept) => sum + concept.weight, 0);

  const matched: GradeableConcept[] = [];
  const missing: GradeableConcept[] = [];
  for (const concept of concepts) {
    (concept.terms.some((term) => mentionsTerm(answer, term)) ? matched : missing).push(concept);
  }

  const earned = matched.reduce((sum, concept) => sum + concept.weight, 0);
  const coverage = total === 0 ? 0 : earned / total;

  let verdict: VerdictKey;
  if (chars < MIN_ASSESSABLE_CHARS) verdict = 'unverifiable';
  else if (coverage >= 0.9) verdict = 'correct';
  else if (coverage >= 0.6) verdict = 'partially-correct';
  else if (coverage > 0) verdict = 'shallow';
  else verdict = 'incorrect';

  if (chars < MIN_DEVELOPED_CHARS && (verdict === 'correct' || verdict === 'partially-correct')) {
    verdict = 'shallow';
  } else if (chars < MIN_EXPLANATORY_CHARS && verdict === 'correct') {
    verdict = 'partially-correct';
  }

  const score = verdict === 'unverifiable' ? 0 : Math.round(coverage * 100);
  const names = missing.map((concept) => concept.name);

  return {
    verdict,
    score,
    coverage,
    matched: matched.map((concept) => concept.slug),
    missing: names.length ? names : [],
    feedback: feedbackFor(verdict, matched.length, concepts.length, names),
  };
}

function feedbackFor(verdict: VerdictKey, matchedCount: number, total: number, missing: string[]): string {
  const missingList = missing.slice(0, 4).join('; ');
  switch (verdict) {
    case 'correct':
      return `That holds. You covered ${matchedCount} of ${total} concepts and explained them rather than naming them. Now take the follow-ups.`;
    case 'partially-correct':
      return `The shape is right, the mechanism is not finished. Missing: ${missingList}. Say what actually happens, in order, and what it costs.`;
    case 'shallow':
      return `Name-dropping. ${matchedCount} of ${total} concepts appeared, but a correct answer in three lines is not an answer — explain the mechanism. Still absent: ${missingList}.`;
    case 'incorrect':
      return `Nothing here is what a working answer must contain. Expected: ${missingList}. Go back to the lesson for this topic and rebuild from the failure it prevents.`;
    case 'unverifiable':
      return `I cannot evaluate that — it is not an explanation of anything. Say what happens, in what order, and why.`;
  }
}
