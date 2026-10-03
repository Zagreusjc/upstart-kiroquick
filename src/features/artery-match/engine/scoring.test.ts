import { describe, it, expect } from 'vitest';
import { spawnChance, waveMultiplier } from './scoring';

describe('spawnChance', () => {
  it('is 3 percent at the start of a session (score 0)', () => {
    expect(spawnChance(0)).toBeCloseTo(0.03, 10);
  });

  it('is 10 percent at and beyond the cap score', () => {
    expect(spawnChance(6000)).toBeCloseTo(0.1, 10);
    expect(spawnChance(10000)).toBeCloseTo(0.1, 10);
  });

  it('clamps negative scores to the minimum', () => {
    expect(spawnChance(-50)).toBeCloseTo(0.03, 10);
  });

  it('scales linearly (6.5 percent at half the cap)', () => {
    expect(spawnChance(3000)).toBeCloseTo(0.065, 10);
  });

  it('never decreases as the score rises', () => {
    let prev = spawnChance(0);
    for (let score = 50; score <= 8000; score += 50) {
      const next = spawnChance(score);
      expect(next).toBeGreaterThanOrEqual(prev);
      prev = next;
    }
  });
});

describe('waveMultiplier', () => {
  it('is 1x, 2x, 3x, 4x and capped at 4x', () => {
    expect([1, 2, 3, 4, 5, 6].map(waveMultiplier)).toEqual([1, 2, 3, 4, 4, 4]);
  });
});
