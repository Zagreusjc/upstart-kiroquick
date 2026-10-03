// Seedable mulberry32 PRNG. The whole engine draws randomness from here only.

export interface Rng {
  /** Next value in [0, 1). */
  next(): number;
  /** Current internal state (store it in GameState.rngState to resume). */
  state(): number;
}

/** One mulberry32 step: returns a value in [0, 1) and the next state. */
export function mulberry32(state: number): { value: number; state: number } {
  const next = (state + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, state: next };
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  return {
    next() {
      const step = mulberry32(s);
      s = step.state;
      return step.value;
    },
    state: () => s,
  };
}
