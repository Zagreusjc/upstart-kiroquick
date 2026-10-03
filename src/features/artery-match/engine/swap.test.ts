import { describe, it, expect } from 'vitest';
import { trySwap } from './game';
import { validateSwap } from './legal';
import { gridOf, stateFromGrid } from './test-helpers';

// No starting matches. Swapping (0,2) and (0,3) makes R R R on row 0.
const PLAYABLE = ['RRWR', 'WPAP', 'PAWA', 'AWPW'];

describe('swap validation', () => {
  it('rejects diagonal and two-apart swaps as not-adjacent', () => {
    const state = stateFromGrid(PLAYABLE);
    expect(trySwap(state, { row: 0, col: 0 }, { row: 1, col: 1 })).toEqual({
      ok: false,
      reason: 'not-adjacent',
    });
    expect(trySwap(state, { row: 0, col: 0 }, { row: 0, col: 2 })).toEqual({
      ok: false,
      reason: 'not-adjacent',
    });
  });

  it('rejects out-of-bounds and same-cell swaps as not-adjacent', () => {
    const state = stateFromGrid(PLAYABLE);
    expect(validateSwap(state, { row: 0, col: 3 }, { row: 0, col: 4 })).toBe('not-adjacent');
    expect(validateSwap(state, { row: -1, col: 0 }, { row: 0, col: 0 })).toBe('not-adjacent');
    expect(validateSwap(state, { row: 0, col: 0 }, { row: 0, col: 0 })).toBe('not-adjacent');
  });

  it('rejects a cholesterol block swapped with a normal tile', () => {
    const state = stateFromGrid(['RRWC', 'WPAP', 'PAWA', 'AWPW']);
    expect(trySwap(state, { row: 0, col: 2 }, { row: 0, col: 3 })).toEqual({
      ok: false,
      reason: 'cholesterol',
    });
  });

  it('rejects two cholesterol blocks swapped with each other', () => {
    const state = stateFromGrid(['RRWR', 'CCAP', 'PAWA', 'AWPW']);
    expect(trySwap(state, { row: 1, col: 0 }, { row: 1, col: 1 })).toEqual({
      ok: false,
      reason: 'cholesterol',
    });
  });

  it('rejects a swap that creates no match and leaves the state untouched', () => {
    const state = stateFromGrid(PLAYABLE);
    const boardBefore = state.board;
    const gridBefore = gridOf(state);
    const result = trySwap(state, { row: 1, col: 0 }, { row: 1, col: 1 });
    expect(result).toEqual({ ok: false, reason: 'no-match' });
    expect(state.board).toBe(boardBefore);
    expect(gridOf(state)).toEqual(gridBefore);
    expect(state.score).toBe(0);
    expect(state.moves).toBe(0);
  });

  it('rejects any swap once the game is over', () => {
    const state = stateFromGrid(PLAYABLE, { over: true });
    expect(trySwap(state, { row: 0, col: 2 }, { row: 0, col: 3 })).toEqual({
      ok: false,
      reason: 'game-over',
    });
  });
});

describe('valid swap', () => {
  it('clears the matched tiles, reports the match and counts the move', () => {
    const state = stateFromGrid(PLAYABLE);
    const matchedIds = [state.board[0][0].id, state.board[0][1].id, state.board[0][3].id];
    const result = trySwap(state, { row: 0, col: 2 }, { row: 0, col: 3 });
    if (!result.ok) throw new Error(`expected ok, got ${result.reason}`);

    const idsAfter = new Set(result.state.board.flat().map((t) => t.id));
    for (const id of matchedIds) expect(idsAfter.has(id)).toBe(false);

    expect(result.events[0]).toMatchObject({
      type: 'swap',
      a: { row: 0, col: 2 },
      b: { row: 0, col: 3 },
    });
    const firstMatch = result.events.find((e) => e.type === 'match');
    expect(firstMatch).toMatchObject({
      wave: 1,
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    });
    expect(result.state.moves).toBe(1);
    expect(result.state.score).toBeGreaterThanOrEqual(30);
    // The input state is never mutated.
    expect(gridOf(state)).toEqual(PLAYABLE);
  });
});
