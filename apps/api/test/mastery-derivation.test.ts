import { describe, expect, test } from 'bun:test';
import { deriveStanding, PASS_SCORE, type SignalStanding } from '../src/mastery/derivation';
import { MASTERY_LEVELS, SIGNALS } from '../prisma/content/reference';

/** The eight authored dimensions, as the rows the service loads from the database. */
const levelNumber = (key: string) => MASTERY_LEVELS.find((level) => level.key === key)!.number;

type Overrides = Record<string, Partial<SignalStanding>>;

const make = (overrides: Overrides = {}): SignalStanding[] =>
  SIGNALS.map((signal) => ({
    key: signal.key,
    levelKey: signal.levelKey,
    levelNumber: levelNumber(signal.levelKey),
    weight: signal.weight,
    score: 0,
    evidenceCount: 0,
    ...overrides[signal.key],
  }));

const passed = (evidenceCount = 1): Partial<SignalStanding> => ({ score: PASS_SCORE + 10, evidenceCount });
const everySignal = (value: Partial<SignalStanding>): Overrides =>
  Object.fromEntries(SIGNALS.map((signal) => [signal.key, value]));

describe('mastery derivation', () => {
  test('nothing evidenced is exposure with no score', () => {
    const standing = deriveStanding(make());
    expect(standing.level).toBe(0);
    expect(standing.score).toBe(0);
  });

  test('a passing signal holds its own rung once the rungs below it are held', () => {
    expect(deriveStanding(make({ understanding: passed() })).level).toBe(1);
    expect(deriveStanding(make({ recall: passed(), understanding: passed() })).level).toBe(1);
    expect(
      deriveStanding(
        make({
          understanding: passed(),
          implementation: passed(),
          debugging: passed(),
          design: passed(),
        }),
      ).level,
    ).toBe(4);
  });

  test('a rung cannot be skipped, however strong the evidence above it', () => {
    expect(deriveStanding(make({ debugging: { score: 100, evidenceCount: 4 } })).level).toBe(0);
    expect(deriveStanding(make({ implementation: passed(), debugging: passed() })).level).toBe(0);

    const everythingButUnderstanding = deriveStanding(
      make({
        implementation: passed(),
        testing: passed(),
        debugging: passed(),
        design: passed(),
        'production-reasoning': passed(),
        'interview-explanation': passed(),
      }),
    );
    expect(everythingButUnderstanding.level).toBe(0);
  });

  test('the chain stops at the first rung that is not passing', () => {
    const standing = deriveStanding(
      make({ understanding: passed(), implementation: passed(), debugging: { score: 55, evidenceCount: 2 } }),
    );
    expect(standing.level).toBe(2);
  });

  test('a score without evidence is not mastery', () => {
    expect(deriveStanding(make({ understanding: { score: 100, evidenceCount: 0 } })).level).toBe(0);
  });

  test('several signals can hold the same rung', () => {
    const standing = deriveStanding(make({ understanding: { score: 40, evidenceCount: 1 }, recall: passed() }));
    expect(standing.level).toBe(1);
  });

  test('no signal feeds the teaching rung, so attempts alone ceiling at judgment', () => {
    expect(deriveStanding(make(everySignal(passed()))).level).toBe(6);
    expect(MASTERY_LEVELS.length).toBe(8);
  });

  test('the aggregate counts unevidenced dimensions as zero, so a topic is never nearly mastered', () => {
    const totalWeight = SIGNALS.reduce((sum, signal) => sum + signal.weight, 0);
    const understanding = SIGNALS.find((signal) => signal.key === 'understanding')!;

    const onlyUnderstanding = deriveStanding(make({ understanding: { score: 100, evidenceCount: 1 } }));
    expect(onlyUnderstanding.score).toBe(Math.round((understanding.weight * 100) / totalWeight));
    expect(onlyUnderstanding.score).toBeLessThan(15);

    const all = deriveStanding(make(everySignal({ score: 100, evidenceCount: 1 })));
    expect(all.score).toBe(100);
  });

  test('the signal breakdown travels with the standing', () => {
    const standing = deriveStanding(make({ debugging: passed(3) }));
    expect(standing.signals).toHaveLength(SIGNALS.length);
    expect(standing.signals.find((signal) => signal.key === 'debugging')?.evidenceCount).toBe(3);
    expect(standing.signals.every((signal) => signal.levelNumber >= 0)).toBe(true);
  });
});
