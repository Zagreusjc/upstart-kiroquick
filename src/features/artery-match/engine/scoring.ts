// Scoring constants (see design.md). Plaque timing lives in plaque.ts.

export const POINTS_PER_TILE = 10;
export const CHOLESTEROL_POINTS = 500;
export const MAX_MULTIPLIER = 4;

/** Wave 1 is the player's own match (1x); cascades are 2x, 3x, then capped at 4x. */
export function waveMultiplier(wave: number): number {
  return Math.min(Math.max(wave, 1), MAX_MULTIPLIER);
}
