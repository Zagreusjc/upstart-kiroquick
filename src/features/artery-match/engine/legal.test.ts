import { describe, it, expect } from 'vitest';
import { createGame, trySwap, trySwapWith } from './game';
import { findLegalMove, hasLegalMove, validateSwap } from './legal';
import { scriptedRefill, stateFromGrid } from './test-helpers';

// Every row holds 4 distinct kinds and every column alternates 2 kinds that
// differ from its neighbours, so no swap can make a run of 3.
const DEAD = ['RWPA', 'PARW', 'RWPA', 'PARW'];

describe('legal moves', () => {
  it('finds a legal move on a playable board', () => {
    expect(hasLegalMove(stateFromGrid(['RRWR', 'WPAP', 'PAWA', 'AWPW']))).toBe(true);
  });

  it('reports no legal move on a dead board', () => {
    const state = stateFromGrid(DEAD);
    expect(hasLegalMove(state)).toBe(false);
    expect(findLegalMove(state)).toBeNull();
  });

  it('does not count a match that needs a cholesterol swap', () => {
    const state = stateFromGrid(['RRCR', 'PAWP', 'WPAW']);
    expect(validateSwap(state, { row: 0, col: 2 }, { row: 0, col: 3 })).toBe('cholesterol');
    expect(hasLegalMove(state)).toBe(false);
  });

  it('findLegalMove returns a pair that trySwap accepts', () => {
    const fixed = stateFromGrid(['RRWR', 'WPAP', 'PAWA', 'AWPW']);
    expect(findLegalMove(fixed)).toEqual([
      { row: 0, col: 2 },
      { row: 0, col: 3 },
    ]);
    for (const seed of [1, 7, 99]) {
      const game = createGame(seed);
      const move = findLegalMove(game);
      expect(move).not.toBeNull();
      if (!move) return;
      expect(trySwap(game, move[0], move[1]).ok).toBe(true);
    }
  });
});

describe('game over', () => {
  it('ends the game with a final gameOver event when no legal move is left', () => {
    const state = stateFromGrid(['RRWR']);
    const result = trySwapWith(
      state,
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      scriptedRefill(['platelet', 'plasma', 'wbc']),
    );
    if (!result.ok) throw new Error(result.reason);
    expect(result.state.over).toBe(true);
    expect(result.events[result.events.length - 1]).toEqual({ type: 'gameOver', score: 30 });
    expect(trySwap(result.state, { row: 0, col: 0 }, { row: 0, col: 1 })).toEqual({
      ok: false,
      reason: 'game-over',
    });
  });

  it('keeps playing while a legal move exists', () => {
    const state = stateFromGrid(['RRWR']);
    const result = trySwapWith(
      state,
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      scriptedRefill(['wbc', 'platelet', 'wbc']),
    );
    if (!result.ok) throw new Error(result.reason);
    expect(result.state.over).toBe(false);
    expect(result.events.some((e) => e.type === 'gameOver')).toBe(false);
  });
});
