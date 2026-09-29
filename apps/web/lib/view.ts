import type { Tone } from '@/components/ui';
import type { Verdict } from '@/lib/types';

/** Mirrors the control plane's PASS_SCORE: a dimension holds its rung only at or above this. */
export const PASS_SCORE = 60;

/** Colour is a signal, not decoration: held rungs are green, the missing ones are red. */
export function rungTone(level: number): Tone {
  if (level === 0) return 'neutral';
  return level >= 3 ? 'held' : 'accent';
}

export function verdictTone(verdict: Verdict): Tone {
  switch (verdict) {
    case 'correct':
      return 'held';
    case 'partially-correct':
      return 'accent';
    case 'shallow':
      return 'due';
    case 'incorrect':
      return 'weak';
    case 'unverifiable':
      return 'neutral';
  }
}

const VERDICT_KEYS: Verdict[] = ['correct', 'partially-correct', 'shallow', 'incorrect', 'unverifiable'];

/** The diagnostic also reports items that were never answered, which have no colour of their own. */
export function asVerdict(value: string): Verdict {
  return (VERDICT_KEYS as string[]).includes(value) ? (value as Verdict) : 'unverifiable';
}

/** A standing can fall, so the date the recall was last reproduced is part of the record. */
export function shortDate(value: string | null | undefined): string {
  if (!value) return 'never';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ASSESSABLE = 40;
const DEVELOPED = 150;
const EXPLANATORY = 400;

/**
 * The grader's depth floors, mirrored for the writer: an answer under 150 characters gets capped
 * at shallow however many concepts it names, so telling the learner that while they type is the
 * difference between a measurement and a surprise.
 */
export function answerDepth(chars: number): { label: string; tone: Tone } {
  if (chars === 0) return { label: 'not written', tone: 'neutral' };
  if (chars < ASSESSABLE) return { label: 'too short to assess', tone: 'weak' };
  if (chars < DEVELOPED) return { label: 'below the depth floor', tone: 'due' };
  if (chars < EXPLANATORY) return { label: 'developed', tone: 'accent' };
  return { label: 'explanatory depth', tone: 'held' };
}
