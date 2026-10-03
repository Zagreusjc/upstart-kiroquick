import { describe, it, expect } from 'vitest';
import { coinsForScore } from './rewards';

describe('coinsForScore', () => {
  it.each([
    [0, 0],
    [299, 0],
    [300, 5],
    [999, 5],
    [1000, 10],
    [2499, 10],
    [2500, 20],
    [4999, 20],
    [5000, 30],
    [99999, 30],
  ])('score %i awards %i coins', (score, coins) => {
    expect(coinsForScore(score)).toBe(coins);
  });
});
