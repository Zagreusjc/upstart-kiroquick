// Coins awarded at game over, by score band (highest band first).
// TODO(integration): confirm bands with Prime (economy-library)
export const COIN_BANDS: ReadonlyArray<{ readonly minScore: number; readonly coins: number }> = [
  { minScore: 5000, coins: 30 },
  { minScore: 2500, coins: 20 },
  { minScore: 1000, coins: 10 },
  { minScore: 300, coins: 5 },
];

export function coinsForScore(score: number): number {
  return COIN_BANDS.find((band) => score >= band.minScore)?.coins ?? 0;
}
