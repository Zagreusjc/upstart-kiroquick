import { describe, it, expect } from 'vitest';
import { createRng, drawIndex, mulberry32 } from './rng';

function take(seed: number, n: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length: n }, () => rng.next());
}

describe('mulberry32 rng', () => {
  it('produces the same 1000-value sequence for the same seed', () => {
    expect(take(12345, 1000)).toEqual(take(12345, 1000));
  });

  it('produces values in [0, 1)', () => {
    for (const v of take(7, 1000)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('produces different sequences for seeds 1 and 2', () => {
    expect(take(1, 20)).not.toEqual(take(2, 20));
  });

  it('chains mulberry32 state exactly like createRng', () => {
    const rng = createRng(99);
    let state = 99;
    for (let i = 0; i < 50; i++) {
      const step = mulberry32(state);
      expect(rng.next()).toBe(step.value);
      expect(rng.state()).toBe(step.state);
      state = step.state;
    }
  });

  it('drawIndex gives a repeatable index in [0, n) and advances the state', () => {
    let state = 5;
    for (let i = 0; i < 200; i++) {
      const draw = drawIndex(state, 7);
      expect(drawIndex(state, 7)).toEqual(draw);
      expect(Number.isInteger(draw.index)).toBe(true);
      expect(draw.index).toBeGreaterThanOrEqual(0);
      expect(draw.index).toBeLessThan(7);
      expect(draw.state).toBe(mulberry32(state).state);
      state = draw.state;
    }
  });
});
