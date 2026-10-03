import { describe, it, expect } from 'vitest';
import { waveMultiplier } from './scoring';

// Plaque timing (spreadInterval) is tested in plaque.test.ts.

describe('waveMultiplier', () => {
  it('is 1x, 2x, 3x, 4x and capped at 4x', () => {
    expect([1, 2, 3, 4, 5, 6].map(waveMultiplier)).toEqual([1, 2, 3, 4, 4, 4]);
  });
});
