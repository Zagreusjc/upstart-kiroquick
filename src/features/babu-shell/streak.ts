import { STREAK_MILESTONES } from './constants';
import { daysBetween } from './dates';

export interface CheckinState {
  /** Local date of the last check-in (`yyyy-mm-dd`), or null if never. */
  lastCheckin: string | null;
  streak: number;
}

export interface CheckinResult {
  /** False when the player already checked in today (nothing changed). */
  checkedIn: boolean;
  state: CheckinState;
  /** Milestone bonus coins earned by this check-in (0 if none). */
  bonus: number;
}

/** Bonus coins for reaching exactly `streak` days (0 if not a milestone). */
export function milestoneBonus(streak: number): number {
  return STREAK_MILESTONES.find((m) => m.days === streak)?.bonus ?? 0;
}

/** The next milestone above `streak`, or null after the last one. */
export function nextMilestone(streak: number): { days: number; bonus: number } | null {
  return STREAK_MILESTONES.find((m) => m.days > streak) ?? null;
}

/**
 * Apply a check-in on `today`. Pure.
 * Same day: no change. Next day: streak + 1. Anything else: streak 1.
 */
export function applyCheckin(state: CheckinState, today: string): CheckinResult {
  if (state.lastCheckin === today) return { checkedIn: false, state, bonus: 0 };

  const consecutive = state.lastCheckin !== null && daysBetween(state.lastCheckin, today) === 1;
  const streak = consecutive ? state.streak + 1 : 1;
  return {
    checkedIn: true,
    state: { lastCheckin: today, streak },
    bonus: milestoneBonus(streak),
  };
}

/** The streak to show: the stored one if still alive (today or yesterday), else 0. */
export function currentStreak(state: CheckinState, today: string): number {
  if (state.lastCheckin === null) return 0;
  const gap = daysBetween(state.lastCheckin, today);
  return gap === 0 || gap === 1 ? state.streak : 0;
}
