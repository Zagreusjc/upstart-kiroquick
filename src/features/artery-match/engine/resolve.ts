import { mulberry32 } from './rng';
import { NORMAL_TILE_TYPES } from './types';
import type { Cell, FallMove, NormalTileType, Tile } from './types';

/** Supplies refill tiles. The engine uses rngRefill; tests inject scripted sources. */
export interface RefillSource {
  /**
   * Next refill tile type. Refill never creates cholesterol.
   * `avoid` lists the types that would complete a line of 3 at this cell; the seeded
   * source skips them (scripted test sources may ignore it).
   */
  next(avoid?: ReadonlySet<NormalTileType>): NormalTileType;
  /** RNG state to store back into GameState.rngState. */
  state(): number;
}

/**
 * Seeded refill: one draw per tile. Types in `avoid` are excluded, so a refilled tile never
 * completes a line of 3 by luck. If every type is excluded, all types are allowed again.
 */
export function rngRefill(rngState: number): RefillSource {
  let s = rngState >>> 0;
  return {
    next(avoid) {
      const step = mulberry32(s);
      s = step.state;
      const allowed = avoid ? NORMAL_TILE_TYPES.filter((t) => !avoid.has(t)) : NORMAL_TILE_TYPES;
      const pool = allowed.length > 0 ? allowed : NORMAL_TILE_TYPES;
      return pool[Math.floor(step.value * pool.length)];
    },
    state: () => s,
  };
}

/**
 * Normal types that would complete a line of 3 if placed at (row, col), given the tiles
 * currently filled around it (null = still empty). Checks all six triples through the cell.
 */
export function matchingTypesAt(
  tileAt: (row: number, col: number) => Tile | null,
  row: number,
  col: number,
): Set<NormalTileType> {
  const avoid = new Set<NormalTileType>();
  const lines: [number, number][][] = [
    [[0, -2], [0, -1]],
    [[0, -1], [0, 1]],
    [[0, 1], [0, 2]],
    [[-2, 0], [-1, 0]],
    [[-1, 0], [1, 0]],
    [[1, 0], [2, 0]],
  ];
  for (const [[ar, ac], [br, bc]] of lines) {
    const a = tileAt(row + ar, col + ac);
    const b = tileAt(row + br, col + bc);
    if (a && b && a.type !== 'cholesterol' && a.type === b.type) avoid.add(a.type);
  }
  return avoid;
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
