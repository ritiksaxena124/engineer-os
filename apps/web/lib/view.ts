import type { Tone } from '@/components/ui';
import type { ExamPartScore, Phase, Topic, Verdict } from '@/lib/types';

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

/**
 * An exam judges a whole phase, so the phase has to be open end to end before it can be sat.
 * Examining a learner across a gap measures the gap, not the phase — which is the reason the
 * control plane refuses `PHASE_NOT_REACHED` rather than handing out a partial paper.
 */
export interface PhaseStanding {
  key: string;
  title: string;
  number: number;
  open: number;
  total: number;
  ready: boolean;
  blocked: { slug: string; title: string; level: number }[];
}

export function phaseStandings(phases: Phase[], topics: Topic[]): PhaseStanding[] {
  return phases.map((phase) => {
    const rows = topics
      .filter((topic) => topic.phaseKey === phase.key)
      .sort((a, b) => a.number - b.number);
    const blocked = rows
      .filter((topic) => !topic.unlocked)
      .map((topic) => ({ slug: topic.slug, title: topic.title, level: topic.level }));

    return {
      key: phase.key,
      title: phase.title,
      number: phase.number,
      open: rows.length - blocked.length,
      total: rows.length,
      ready: rows.length > 0 && blocked.length === 0,
      blocked,
    };
  });
}

/** A blank part is not a failed part — it is a part that was never attempted. */
export function partTone(part: Pick<ExamPartScore, 'answered' | 'passed'>): Tone {
  if (part.passed) return 'held';
  return part.answered === 0 ? 'neutral' : 'weak';
}

/**
 * The two banks that keep the sheet's vocabulary. A drill from either of them is labelled Easy,
 * Medium or Hard everywhere it is read, and the D-rung stays on the general bank, so a learner
 * never sees one question described two ways.
 */
export const isBanded = (slug: string) => slug.startsWith('dsa-') || slug.startsWith('int-');

/** The rung in the vocabulary the row's own bank uses. */
export function difficultyLabel(row: { slug: string; difficulty: number; band?: string | null }): string {
  return isBanded(row.slug) ? (row.band ?? 'Medium') : `D${row.difficulty}`;
}
