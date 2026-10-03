export type Callout = 'Good Flow' | 'Optimal Flow!';

/** Callout for the number of waves resolved in one move (1 = plain match, no callout). */
export function calloutForWaves(waves: number): Callout | null {
  if (waves >= 3) return 'Optimal Flow!';
  if (waves === 2) return 'Good Flow';
  return null;
}
