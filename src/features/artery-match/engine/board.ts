import type { Rng } from './rng';
import { NORMAL_TILE_TYPES } from './types';
import type { Board, Cell, GameState, NormalTileType, Tile } from './types';

export function inBounds(state: Pick<GameState, 'rows' | 'cols'>, c: Cell): boolean {
  return (
    Number.isInteger(c.row) &&
    Number.isInteger(c.col) &&
    c.row >= 0 &&
    c.row < state.rows &&
    c.col >= 0 &&
    c.col < state.cols
  );
}

/** Orthogonal neighbours only (distance exactly 1). */
export function isAdjacent(a: Cell, b: Cell): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

/** Returns a new board with the tiles at a and b exchanged. */
export function swapCells(board: Board, a: Cell, b: Cell): Board {
  const next = board.map((row) => [...row]);
  const tmp = next[a.row][a.col];
  next[a.row][a.col] = next[b.row][b.col];
  next[b.row][b.col] = tmp;
  return next;
}

/**
 * Fills a board row-major without any starting match: each tile is picked from
 * the normal kinds that would not complete a run with the two tiles to its left
 * or the two above. At most 2 of 4 kinds are forbidden, so this never loops.
 */
export function generateBoard(
  rows: number,
  cols: number,
  rng: Pick<Rng, 'next'>,
  nextId: number,
): { board: Board; nextId: number } {
  const board: Tile[][] = [];
  let id = nextId;
  for (let r = 0; r < rows; r++) {
    const row: Tile[] = [];
    for (let c = 0; c < cols; c++) {
      const forbidden = new Set<string>();
      if (c >= 2 && row[c - 1].type === row[c - 2].type) forbidden.add(row[c - 1].type);
      if (r >= 2 && board[r - 1][c].type === board[r - 2][c].type) {
        forbidden.add(board[r - 1][c].type);
      }
      const allowed: NormalTileType[] = NORMAL_TILE_TYPES.filter((t) => !forbidden.has(t));
      const type = allowed[Math.floor(rng.next() * allowed.length)];
      row.push({ id: id++, type });
    }
    board.push(row);
  }
  return { board, nextId: id };
}
