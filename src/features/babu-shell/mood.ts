import type { HealthSnapshot } from '../../core';
import { MOOD_RULES, REST_AFTER_DAYS, TARGETS, type Mood } from './constants';
import { daysBetween } from './dates';

export type HealthValues = Pick<HealthSnapshot, 'steps' | 'sleepHours' | 'activityMinutes'>;

export interface GoalsMet {
  steps: boolean;
  sleep: boolean;
  activity: boolean;
  count: number;
}

/**
 * Which daily goals are met. Steps and activity are met at or above the
 * target. Sleep is a healthy range: at least the target and at most
 * `MOOD_RULES.sleep.healthyMaxHours`.
 */
export function goalsMet(values: HealthValues): GoalsMet {
  const steps = values.steps >= TARGETS.steps;
  const sleep =
    values.sleepHours >= TARGETS.sleepHours && values.sleepHours <= MOOD_RULES.sleep.healthyMaxHours;
  const activity = values.activityMinutes >= TARGETS.activityMinutes;
  return { steps, sleep, activity, count: Number(steps) + Number(sleep) + Number(activity) };
}

/** True when the player has been away long enough for Baboo to rest. */
export function isResting(lastCheckin: string | null, today: string): boolean {
  if (lastCheckin === null) return false;
  return daysBetween(lastCheckin, today) >= REST_AFTER_DAYS;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Sleep score: rises to 1 at the goal, stays 1 in the healthy range, then eases down. */
export function sleepScore(hours: number): number {
  const { healthyMaxHours, longSleepPenaltyPerHour, longSleepFloor } = MOOD_RULES.sleep;
  if (hours <= TARGETS.sleepHours) return clamp01(hours / TARGETS.sleepHours);
  if (hours <= healthyMaxHours) return 1;
  return Math.max(longSleepFloor, 1 - (hours - healthyMaxHours) * longSleepPenaltyPerHour);
}

/** Why Baboo is not Happy yet (the main thing to work on), or null when Happy. */
export type MoodReason =
  | 'exhausted'
  | 'short_sleep'
  | 'long_sleep'
  | 'no_movement'
  | 'steps'
  | 'sleep'
  | 'activity';

export interface DayAssessment {
  /** Mood from today's numbers alone (Rest Mode is decided by `computeMood`). */
  mood: Exclude<Mood, 'rest'>;
  /** Baboo's energy, 0 to 100. */
  energy: number;
  scores: { steps: number; sleep: number; activity: number };
  goals: GoalsMet;
  reason: MoodReason | null;
}

/**
 * Pure, deterministic read of today's snapshot. Rules, in order:
 * 1. Under 4 h sleep, or almost no movement (steps and activity both under
 *    25% of goal): Tired, whatever else happened. Weakest link wins.
 * 2. All three goals met (sleep within 7 to 10 h): Happy.
 * 3. Otherwise OK when energy is at least 50%, else Tired.
 * Energy = 40% sleep + 30% steps + 30% activity, each scored against its goal.
 */
export function assessDay(values: HealthValues): DayAssessment {
  const scores = {
    steps: clamp01(values.steps / TARGETS.steps),
    sleep: sleepScore(values.sleepHours),
    activity: clamp01(values.activityMinutes / TARGETS.activityMinutes),
  };
  const { weights, sleep, movementTiredBelow, okMinEnergy } = MOOD_RULES;
  const energyShare =
    scores.sleep * weights.sleep + scores.steps * weights.steps + scores.activity * weights.activity;
  const energy = Math.round(energyShare * 100);
  const goals = goalsMet(values);
  const movement = Math.max(scores.steps, scores.activity);
  const base = { energy, scores, goals };

  if (values.sleepHours < sleep.exhaustedBelowHours) return { ...base, mood: 'tired', reason: 'exhausted' };
  if (movement < movementTiredBelow) return { ...base, mood: 'tired', reason: 'no_movement' };
  if (goals.count === 3) return { ...base, mood: 'happy', reason: null };

  // Short sleep (under 6 h) can never be Happy because the sleep goal is unmet;
  // it also costs energy, and the hint points at it first.
  return { ...base, mood: energyShare >= okMinEnergy ? 'ok' : 'tired', reason: mainReason(values, scores) };
}

/** The most useful thing to improve, weakest factor first. */
function mainReason(values: HealthValues, scores: DayAssessment['scores']): MoodReason {
  if (values.sleepHours < MOOD_RULES.sleep.shortBelowHours) return 'short_sleep';
  if (values.sleepHours > MOOD_RULES.sleep.healthyMaxHours) return 'long_sleep';
  const unmet = (
    [
      ['sleep', scores.sleep],
      ['steps', scores.steps],
      ['activity', scores.activity],
    ] as const
  ).filter(([, score]) => score < 1);
  // Lowest score first; ties keep the order above (sleep, steps, activity).
  unmet.sort((a, b) => a[1] - b[1]);
  return unmet[0]?.[0] ?? 'steps';
}

/**
 * Baboo's mood. Pure and deterministic: no randomness, no AI, no clock.
 * Rest Mode wins; otherwise the mood comes from `assessDay`.
 */
export function computeMood(
  values: HealthValues,
  checkin: { lastCheckin: string | null },
  today: string,
): Mood {
  if (isResting(checkin.lastCheckin, today)) return 'rest';
  return assessDay(values).mood;
}
