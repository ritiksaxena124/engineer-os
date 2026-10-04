export type RoomPhase = 'locked' | 'live' | 'expired';

export interface RoomClockInput {
  scheduledAt: Date;
  openMinutes: number;
  openedAt?: Date | null;
  endedAt?: Date | null;
}

/**
 * A room is only open inside its window. endedAt wins over the arithmetic because the interviewer
 * can close a room early, and a closed room must not reopen when the clock passes the window.
 */
export function roomPhase(room: RoomClockInput, now: Date): RoomPhase {
  if (room.endedAt) return 'expired';
  if (now.getTime() < room.scheduledAt.getTime()) return 'locked';
  if (now.getTime() >= closesAt(room).getTime()) return 'expired';
  return 'live';
}

export function closesAt(room: Pick<RoomClockInput, 'scheduledAt' | 'openMinutes'>): Date {
  return new Date(room.scheduledAt.getTime() + room.openMinutes * 60_000);
}

/** Whole minutes, never negative: a locked room counts down, a live one counts what is left. */
export function minutesRemaining(room: RoomClockInput, now: Date): number {
  const target = roomPhase(room, now) === 'locked' ? room.scheduledAt : closesAt(room);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 60_000));
}

export function isOpeningLate(room: RoomClockInput, now: Date): boolean {
  return roomPhase(room, now) === 'live' && (!room.openedAt || room.openedAt.getTime() > room.scheduledAt.getTime());
}
