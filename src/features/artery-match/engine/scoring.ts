// Scoring and cholesterol spawn constants (see design.md).

export const POINTS_PER_TILE = 10;
export const CHOLESTEROL_POINTS = 500;
export const MAX_MULTIPLIER = 4;

export const SPAWN_MIN = 0.03;
export const SPAWN_MAX = 0.1;
export const SPAWN_CAP_SCORE = 6000;

/** Wave 1 is the player's own match (1x); cascades are 2x, 3x, then capped at 4x. */
export function waveMultiplier(wave: number): number {
  return Math.min(Math.max(wave, 1), MAX_MULTIPLIER);
}

/** Cholesterol spawn chance per refilled cell, linear from 3% at 0 to 10% at the cap score. */
export function spawnChance(score: number): number {
  const clamped = Math.min(Math.max(score, 0), SPAWN_CAP_SCORE);
  return SPAWN_MIN + ((SPAWN_MAX - SPAWN_MIN) * clamped) / SPAWN_CAP_SCORE;
}
