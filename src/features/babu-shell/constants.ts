/**
 * Every Baboo rule number lives here (see openspec/changes/add-babu-shell/design.md).
 * Change a value here and the tests and UI follow.
 */

/** Daily goals. A goal is met when the value is at or above the target. */
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

export const DISCLAIMER = 'Screening awareness, not a diagnosis';
