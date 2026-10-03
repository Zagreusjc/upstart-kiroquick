import { describe, it, expect } from 'vitest';
import { calloutForWaves } from './callouts';

describe('calloutForWaves', () => {
  it('shows nothing for a plain match', () => {
    expect(calloutForWaves(1)).toBeNull();
  });

  it('shows "Good Flow" for one cascade', () => {
    expect(calloutForWaves(2)).toBe('Good Flow');
  });

  it('shows "Optimal Flow!" for a big combo', () => {
    expect(calloutForWaves(3)).toBe('Optimal Flow!');
    expect(calloutForWaves(5)).toBe('Optimal Flow!');
  });
});
