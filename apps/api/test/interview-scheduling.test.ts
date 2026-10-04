import { describe, expect, test } from 'bun:test';
import { closesAt, isOpeningLate, minutesRemaining, roomPhase } from '../src/interview/scheduling';

const at = (iso: string) => new Date(iso);
const room = (overrides: Partial<{ scheduledAt: Date; openMinutes: number; openedAt: Date | null; endedAt: Date | null }> = {}) => ({
  scheduledAt: overrides.scheduledAt ?? at('2026-10-10T09:00:00.000Z'),
  openMinutes: overrides.openMinutes ?? 45,
  openedAt: overrides.openedAt ?? null,
  endedAt: overrides.endedAt ?? null,
});

describe('interview room scheduling', () => {
  test('a room is locked until its scheduled instant', () => {
    expect(roomPhase(room(), at('2026-10-10T08:59:59.000Z'))).toBe('locked');
    expect(roomPhase(room(), at('2026-10-10T09:00:00.000Z'))).toBe('live');
  });

  test('the window closes after openMinutes and does not reopen', () => {
    expect(roomPhase(room(), at('2026-10-10T09:44:59.000Z'))).toBe('live');
    expect(roomPhase(room(), at('2026-10-10T09:45:00.000Z'))).toBe('expired');
    expect(closesAt(room()).toISOString()).toBe('2026-10-10T09:45:00.000Z');
  });

  test('an early close beats the clock in both directions', () => {
    const closed = room({ endedAt: at('2026-10-10T09:10:00.000Z') });
    expect(roomPhase(closed, at('2026-10-10T09:05:00.000Z'))).toBe('expired');
    expect(roomPhase(closed, at('2026-10-10T11:00:00.000Z'))).toBe('expired');
  });

  test('a locked room counts down to opening, a live one counts what is left', () => {
    expect(minutesRemaining(room(), at('2026-10-10T08:30:00.000Z'))).toBe(30);
    expect(minutesRemaining(room(), at('2026-10-10T09:30:00.000Z'))).toBe(15);
    expect(minutesRemaining(room(), at('2026-10-10T12:00:00.000Z'))).toBe(0);
  });

  test('late arrival is visible so the record shows the candidate opened it late', () => {
    expect(isOpeningLate(room({ openedAt: at('2026-10-10T09:20:00.000Z') }), at('2026-10-10T09:21:00.000Z'))).toBe(true);
    expect(isOpeningLate(room({ openedAt: at('2026-10-10T09:00:00.000Z') }), at('2026-10-10T09:01:00.000Z'))).toBe(false);
    expect(isOpeningLate(room(), at('2026-10-10T08:00:00.000Z'))).toBe(false);
  });
});
