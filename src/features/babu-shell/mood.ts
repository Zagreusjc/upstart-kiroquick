import type { HealthSnapshot } from '../../core';
import { REST_AFTER_DAYS, TARGETS, type Mood } from './constants';
import { daysBetween } from './dates';

export type HealthValues = Pick<HealthSnapshot, 'steps' | 'sleepHours' | 'activityMinutes'>;

export interface GoalsMet {
  steps: boolean;
  sleep: boolean;
  activity: boolean;
  count: number;
}

/** Which daily goals are met. A goal is met at or above its target. */
export function goalsMet(values: HealthValues): GoalsMet {
  const steps = values.steps >= TARGETS.steps;
  const sleep = values.sleepHours >= TARGETS.sleepHours;
  const activity = values.activityMinutes >= TARGETS.activityMinutes;
  return { steps, sleep, activity, count: Number(steps) + Number(sleep) + Number(activity) };
}

/** True when the player has been away long enough for Baboo to rest. */
export function isResting(lastCheckin: string | null, today: string): boolean {
  if (lastCheckin === null) return false;
  return daysBetween(lastCheckin, today) >= REST_AFTER_DAYS;
}

/**
 * Baboo's mood. Pure and deterministic: no randomness, no AI, no clock.
 * Rules (first match wins): Rest Mode, then 3 goals Happy, 1-2 OK, 0 Tired.
 */
export function computeMood(
  values: HealthValues,
  checkin: { lastCheckin: string | null },
  today: string,
): Mood {
  if (isResting(checkin.lastCheckin, today)) return 'rest';
  const { count } = goalsMet(values);
  if (count === 3) return 'happy';
  if (count > 0) return 'ok';
  return 'tired';
}
