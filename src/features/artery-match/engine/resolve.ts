import { mulberry32 } from './rng';
import { NORMAL_TILE_TYPES } from './types';
import type { Cell, FallMove, Tile, TileType } from './types';

/** Supplies refill tiles. The engine uses rngRefill; tests inject scripted sources. */
export interface RefillSource {
  /** Next tile type, given the cholesterol spawn chance for this refill. */
  next(chance: number): TileType;
  /** RNG state to store back into GameState.rngState. */
  state(): number;
}

/** Seeded refill: one draw for cholesterol vs normal, a second draw for the normal kind. */
export function rngRefill(rngState: number): RefillSource {
  let s = rngState >>> 0;
  const draw = () => {
    const step = mulberry32(s);
    s = step.state;
    return step.value;
  };
  return {
    next(chance) {
      if (draw() < chance) return 'cholesterol';
      return NORMAL_TILE_TYPES[Math.floor(draw() * NORMAL_TILE_TYPES.length)];
    },
    state: () => s,
  };
}

/** Compacts every column downward (cholesterol falls too). Holes end up at the top. */
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
    let target = rows - 1;
    for (let row = rows - 1; row >= 0; row--) {
      const tile = board[row][col];
      if (!tile) continue;
      next[target][col] = tile;
      if (target !== row) {
        const from: Cell = { row, col };
        const to: Cell = { row: target, col };
        moves.push({ id: tile.id, from, to });
      }
      target--;
    }
  }
  return { board: next, moves };
}
