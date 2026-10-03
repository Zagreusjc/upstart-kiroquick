/**
 * Every Baboo rule number lives here (see openspec/changes/add-babu-shell/design.md).
 * Change a value here and the tests and UI follow.
 */
import type { MoodReason } from './mood';

/** Daily goals. Steps and activity: at or above. Sleep: 7 h up to `MOOD_RULES.sleep.healthyMaxHours`. */
export const TARGETS = {
  steps: 6000,
  sleepHours: 7,
  activityMinutes: 30,
} as const;

/** Provider clamp ranges (what the health provider accepts). */
export const HEALTH_LIMITS = {
  steps: { min: 0, max: 100000 },
  sleepHours: { min: 0, max: 24 },
  activityMinutes: { min: 0, max: 1440 },
} as const;

/** Slider ranges (what the Home screen offers). */
export const SLIDERS = {
  steps: { min: 0, max: 20000, step: 250 },
  sleepHours: { min: 0, max: 12, step: 0.5 },
  activityMinutes: { min: 0, max: 120, step: 5 },
} as const;

/**
 * How the snapshot turns into Baboo's energy and mood (see `mood.ts` and
 * design.md). Each factor scores 0 to 1 against its goal; energy is the
 * weighted average. Sleep weighs most because it is the hardest to make up.
 */
export const MOOD_RULES = {
  weights: { sleep: 0.4, steps: 0.3, activity: 0.3 },
  sleep: {
    /** Sleep goal is a healthy range: from `TARGETS.sleepHours` up to this. */
    healthyMaxHours: 10,
    /** Below this Baboo is Tired, no matter what else happened. */
    exhaustedBelowHours: 4,
    /** Below this, the hint points at sleep first. */
    shortBelowHours: 6,
    /** Energy lost per hour above the healthy range, down to `longSleepFloor`. */
    longSleepPenaltyPerHour: 0.125,
    longSleepFloor: 0.5,
  },
  /** Movement is the better of steps and activity. Below this, Baboo is Tired. */
  movementTiredBelow: 0.25,
  /** Energy needed for OK (as a share of 1). Below it Baboo is Tired. */
  okMinEnergy: 0.5,
} as const;

/** Rest Mode starts when the last check-in is this many local days ago or more. */
export const REST_AFTER_DAYS = 2;

/** Coins for each daily check-in (source `checkin`). */
export const CHECKIN_COINS = 10;

/** Streak milestones and their one-time bonus (source `streak`). */
export const STREAK_MILESTONES: readonly { days: number; bonus: number }[] = [
  { days: 3, bonus: 20 },
  { days: 7, bonus: 50 },
  { days: 14, bonus: 80 },
  { days: 30, bonus: 150 },
];

export const STORAGE_KEYS = {
  babu: 'inlababu.babu.v1',
  health: 'inlababu.babu.health.v1',
} as const;

export type Mood = 'happy' | 'ok' | 'tired' | 'rest';

export const MOOD_LABELS: Record<Mood, string> = {
  happy: 'Happy',
  ok: 'OK',
  tired: 'Tired',
  rest: 'Rest Mode',
};

/** Positive framing only. `{n}` is replaced with the number of goals met. */
export const MOOD_MESSAGES: Record<Mood, string> = {
  happy: 'Baboo is happy! You reached all 3 goals today.',
  ok: 'Baboo is doing OK. {n} of 3 goals reached, nice progress.',
  tired: 'Baboo is a little tired. A short walk or an early night will perk Baboo up.',
  rest: 'Baboo is resting and saved a spot for you. Welcome back! Check in to wake Baboo up.',
};

/** What would help Baboo most right now (positive framing, keyed by `MoodReason`). */
export const MOOD_HINTS = {
  exhausted: 'Baboo barely slept. Sleep is what recharges Baboo, so aim for 7 hours tonight.',
  short_sleep: 'Baboo is running on short sleep. An earlier night will help a lot.',
  long_sleep: 'Baboo slept a bit too long. 7 to 10 hours is the sweet spot.',
  no_movement: 'Baboo wants to move! A short walk gets Baboo going.',
  steps: 'A few more steps will cheer Baboo up.',
  sleep: 'A little more sleep tonight will cheer Baboo up.',
  activity: 'A few more active minutes will cheer Baboo up.',
} as const satisfies Record<MoodReason, string>;

export const DISCLAIMER = 'Screening awareness, not a diagnosis';
