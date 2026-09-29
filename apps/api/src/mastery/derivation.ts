/**
 * §71 — a topic's level is derived from the eight evidence dimensions, never from a single
 * number. The rules that make mastery defensible live here as pure functions: a rung is held
 * only on evidence, rungs are climbed in order, and the aggregate is weighted across every
 * dimension so an unevidenced one drags it down instead of being quietly ignored.
 */

/** Below this a signal is activity, not proof. */
export const PASS_SCORE = 60;

export interface SignalStanding {
  key: string;
  levelKey: string;
  levelNumber: number;
  weight: number;
  score: number;
  evidenceCount: number;
}

export interface Standing {
  /** Highest rung held in order; 0 means exposure. */
  level: number;
  /** Weighted aggregate across every dimension, 0-100. */
  score: number;
  signals: SignalStanding[];
}

function rungHeld(signals: SignalStanding[], levelNumber: number): boolean {
  return signals.some(
    (signal) =>
      signal.levelNumber === levelNumber && signal.evidenceCount > 0 && signal.score >= PASS_SCORE,
  );
}

export function deriveStanding(signals: SignalStanding[]): Standing {
  let level = 0;
  // Consecutive from the first rung upward: strong evidence three rungs up says nothing about
  // the one underneath it, and the whole point of the ladder is that it cannot be skipped.
  while (rungHeld(signals, level + 1)) level += 1;

  const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const earned = signals.reduce((sum, signal) => sum + signal.weight * signal.score, 0);

  return {
    level,
    score: totalWeight === 0 ? 0 : Math.round(earned / totalWeight),
    signals: [...signals].sort(
      (a, b) => a.levelNumber - b.levelNumber || a.weight - b.weight || a.key.localeCompare(b.key),
    ),
  };
}
