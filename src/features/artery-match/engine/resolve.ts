import { mulberry32 } from './rng';
import { NORMAL_TILE_TYPES } from './types';
import type { Cell, FallMove, NormalTileType, Tile } from './types';

/** Supplies refill tiles. The engine uses rngRefill; tests inject scripted sources. */
export interface RefillSource {
  /** Next refill tile type. Refill never creates cholesterol. */
  next(): NormalTileType;
  /** RNG state to store back into GameState.rngState. */
  state(): number;
}

/** Seeded refill: one draw per tile for the normal kind. */
export function rngRefill(rngState: number): RefillSource {
  let s = rngState >>> 0;
  return {
    next() {
      const step = mulberry32(s);
      s = step.state;
      return NORMAL_TILE_TYPES[Math.floor(step.value * NORMAL_TILE_TYPES.length)];
    },
    state: () => s,
  };
}

/**
 * Gravity with fixed plaque: cholesterol never moves. In each column the normal tiles
 * fall, in order, into the lowest non-cholesterol cells (tiles pass over plaque).
 * Remaining non-cholesterol cells are left empty (null) for refill.
 */
export function applyGravity(board: (Tile | null)[][]): {
  board: (Tile | null)[][];
  moves: FallMove[];
} {
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;
  const next: (Tile | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null),
  );
  const moves: FallMove[] = [];
  for (let col = 0; col < cols; col++) {
    const falling: { tile: Tile; row: number }[] = [];
    const open: number[] = [];
    for (let row = rows - 1; row >= 0; row--) {
      const tile = board[row][col];
      if (tile?.type === 'cholesterol') {
        next[row][col] = tile;
        continue;
      }
      open.push(row);
      if (tile) falling.push({ tile, row });
    }
    falling.forEach(({ tile, row }, i) => {
      const target = open[i];
      next[target][col] = tile;
      if (target !== row) {
        const from: Cell = { row, col };
        const to: Cell = { row: target, col };
        moves.push({ id: tile.id, from, to });
      }
    });
  }
  return { board: next, moves };
}
