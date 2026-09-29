import { EXAM_PARTS } from '../../prisma/content/reference';
import { PASS_SCORE } from '../mastery/derivation';

/**
 * §70 asks a phase in seven different kinds of work, so an exam is not one long quiz: every part
 * selects from a different family of the bank, and a part that cannot be filled is a part nobody
 * authored for this phase. Saying so is better than padding the set with a question from the wrong
 * family, because the learner would then be graded on something the part never claimed to measure.
 */
export const EXAM: readonly ExamPartRule[] = EXAM_PARTS;

export interface ExamPartRule {
  key: string;
  label: string;
  position: number;
  minutes: number;
  items: number;
  sessionTypeKey: string;
  instructions: string;
  categoryKeys: readonly string[];
  generated: string | null;
}

export interface ExamItem {
  slug: string;
  stem: string;
  body: string;
  difficulty: number;
  category: string;
  levelKey: string;
  topicSlug: string;
  conceptCount: number;
}

export interface GradedItem {
  slug: string;
  score: number;
  verdict: string;
}

export interface PartPlan {
  part: ExamPartRule;
  items: ExamItem[];
  /** the bank has fewer in this family than the part asks for, which the report says out loud */
  short: boolean;
}

/**
 * Deterministic on purpose: the same phase assembles the same exam for every learner, so a retake
 * is a retake and not a different test. Difficulty first, because a part that opens with a D6
 * question measures nerve rather than knowledge.
 */
export function selectItems(part: ExamPartRule, bank: ExamItem[]): ExamItem[] {
  if (part.generated) return [];
  return bank
    .filter((item) => part.categoryKeys.includes(item.category))
    .sort((a, b) => a.difficulty - b.difficulty || (a.slug < b.slug ? -1 : 1))
    .slice(0, part.items);
}

/** The teach-back item has no question row, so its slug is made from the topic it addresses. */
export function teachBackSlug(topicSlug: string): string {
  return `teach-back::${topicSlug}`;
}

/** The teach-back has no question row: it is addressed to the topic with the most to explain. */
export function teachBackTopic(topics: { slug: string; conceptCount: number; number: number }[]): string | null {
  const candidates = topics.filter((topic) => topic.conceptCount > 0);
  if (candidates.length === 0) return null;
  const best = candidates.reduce((a, b) => (b.conceptCount > a.conceptCount ? b : a));
  return best.slug;
}

export function planExam(bank: ExamItem[], topics: { slug: string; conceptCount: number; number: number }[]): {
  plans: PartPlan[];
  missing: ExamPartRule[];
  teachBackSlug: string | null;
} {
  const teachBackSlug = teachBackTopic(topics);
  const plans: PartPlan[] = [];
  const missing: ExamPartRule[] = [];

  for (const part of EXAM) {
    const items = part.generated ? [] : selectItems(part, bank);
    if (part.generated && !teachBackSlug) {
      missing.push(part);
      continue;
    }
    if (!part.generated && items.length === 0) {
      missing.push(part);
      continue;
    }
    plans.push({ part, items, short: !part.generated && items.length < part.items });
  }

  return { plans, missing, teachBackSlug };
}

export interface PartScore {
  key: string;
  label: string;
  items: number;
  answered: number;
  score: number;
  passed: boolean;
}

/**
 * A blank is a zero, so an unanswered item carries its part down. The denominator is what the paper
 * actually handed out, not what the part would like to ask: a phase whose bank is thin gets a short
 * paper, and grading it against the ideal count would make it unsittable rather than merely narrow.
 */
export function scorePart(plan: PartPlan, graded: GradedItem[]): PartScore {
  const expected = plan.part.generated ? 1 : plan.items.length;
  const answered = graded.length;
  const total = graded.reduce((sum, item) => sum + item.score, 0);
  const score = expected === 0 ? 0 : Math.round(total / expected);

  return {
    key: plan.part.key,
    label: plan.part.label,
    items: expected,
    answered,
    score,
    passed: answered > 0 && score >= PASS_SCORE,
  };
}

/**
 * Every part has to hold: a phase is not passed by being strong in five of seven kinds of work.
 * The next phase is recommended here and nowhere else, which is the §70 rule that a pass is what
 * opens the next phase — a completed lesson never does.
 */
export function judgeExam(scores: PartScore[]): {
  passed: boolean;
  score: number;
  failedParts: { key: string; label: string; score: number }[];
} {
  const failed = scores
    .filter((part) => !part.passed)
    .map((part) => ({ key: part.key, label: part.label, score: part.score }));
  const score = scores.length === 0 ? 0 : Math.round(scores.reduce((sum, part) => sum + part.score, 0) / scores.length);
  return { passed: scores.length > 0 && failed.length === 0, score, failedParts: failed };
}

export const EXAM_MINUTES = EXAM.reduce((sum, part) => sum + part.minutes, 0);
