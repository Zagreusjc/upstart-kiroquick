// Test-only helpers for building boards from letter grids. Not exported from the barrel.
import type { RefillSource } from './resolve';
import type { Board, GameState, Tile, TileType } from './types';

const LETTER_TO_TYPE: Record<string, TileType> = {
  R: 'rbc',
  W: 'wbc',
  P: 'platelet',
  A: 'plasma',
  C: 'cholesterol',
};

const TYPE_TO_LETTER: Record<TileType, string> = {
  rbc: 'R',
  wbc: 'W',
  platelet: 'P',
  plasma: 'A',
  cholesterol: 'C',
};

/**
 * Builds a GameState from rows of letters: R=rbc, W=wbc, P=platelet, A=plasma (aqua),
 * C=cholesterol. Tile ids are 1..n in row-major order.
 */
export function stateFromGrid(rows: string[], extra: Partial<GameState> = {}): GameState {
  let id = 1;
  const board: Tile[][] = rows.map((line) =>
    [...line].map((letter) => {
      const type = LETTER_TO_TYPE[letter];
      if (!type) throw new Error(`Unknown tile letter "${letter}"`);
      return { id: id++, type };
    }),
  );
  return {
    seed: 1,
    rows: rows.length,
    cols: rows[0]?.length ?? 0,
    board,
    score: 0,
    rngState: 1,
    nextId: id,
    moves: 0,
    cholesterolCleared: 0,
    maxCascade: 0,
    over: false,
    ...extra,
  };
}

/** Refill source that yields the given types in order; throws when the script runs out. */
export function scriptedRefill(types: TileType[]): RefillSource {
  let i = 0;
  return {
    next() {
      if (i >= types.length) throw new Error('script exhausted');
      return types[i++];
    },
    state: () => 0,
  };
}

/** Inverse of stateFromGrid: board (or state) back to letter rows. */
export function gridOf(stateOrBoard: GameState | Board): string[] {
  const board: Board = Array.isArray(stateOrBoard)
    ? (stateOrBoard as Board)
    : (stateOrBoard as GameState).board;
  return board.map((row) => row.map((tile) => TYPE_TO_LETTER[tile.type]).join(''));
}
