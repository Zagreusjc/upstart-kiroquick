// Spreading cholesterol plaque: seeding and spreading rules (see design.md, "Cholesterol (spreading plaque)").
// Runs once per resolved player move, after all cascades. Pure: every choice draws from the given rngState.
import { hasLegalMove } from './legal';
import { drawIndex } from './rng';
import type { Board, Cell, GameState, PlaqueEvent, Tile } from './types';

/** No plaque is seeded during the first 3 player moves. */
export const GRACE_MOVES = 3;
/** A plaque-free board gets a new seed at the end of the 2nd consecutive plaque-free move. */
export const SEED_DELAY_MOVES = 2;
export const SPREAD_INTERVAL_SLOW = 2;
export const SPREAD_INTERVAL_FAST = 1;
export const FAST_SPREAD_SCORE = 2000;

type BoardState = Pick<GameState, 'board' | 'rows' | 'cols'>;

/** Clean moves (no block destroyed) needed before plaque spreads: 2 below 2000 points, then 1. */
export function spreadInterval(score: number): number {
  return score >= FAST_SPREAD_SCORE ? SPREAD_INTERVAL_FAST : SPREAD_INTERVAL_SLOW;
}

export function countCholesterol(board: Board): number {
  let count = 0;
  for (const row of board) for (const tile of row) if (tile.type === 'cholesterol') count++;
  return count;
}

function withCholesterol(board: Board, cell: Cell, id: number): Board {
  const next: Tile[][] = board.map((row) => [...row]);
  next[cell.row][cell.col] = { id, type: 'cholesterol' };
  return next;
}

/** Normal orthogonal neighbours in the order up, right, down, left. */
function normalNeighbours(board: Board, cell: Cell): Cell[] {
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;
  const around: Cell[] = [
    { row: cell.row - 1, col: cell.col },
    { row: cell.row, col: cell.col + 1 },
    { row: cell.row + 1, col: cell.col },
    { row: cell.row, col: cell.col - 1 },
  ];
  return around.filter(
    (c) =>
      c.row >= 0 &&
      c.row < rows &&
      c.col >= 0 &&
      c.col < cols &&
      board[c.row][c.col].type !== 'cholesterol',
  );
}

/**
 * Turns one random normal tile into a seed block. Candidates are tried from a drawn
 * start index (wrapping) and the first that keeps a legal move wins; if none does,
 * the drawn cell is used anyway. Returns null only when there is no normal tile.
 */
export function seedPlaque(
  state: BoardState,
  rngState: number,
  nextId: number,
): { board: Board; cell: Cell; rngState: number; nextId: number } | null {
  const candidates: Cell[] = [];
  state.board.forEach((row, r) =>
    row.forEach((tile, c) => {
      if (tile.type !== 'cholesterol') candidates.push({ row: r, col: c });
    }),
  );
  if (candidates.length === 0) return null;
  const draw = drawIndex(rngState, candidates.length);
  for (let k = 0; k < candidates.length; k++) {
    const cell = candidates[(draw.index + k) % candidates.length];
    const board = withCholesterol(state.board, cell, nextId);
    if (hasLegalMove({ board, rows: state.rows, cols: state.cols })) {
      return { board, cell, rngState: draw.state, nextId: nextId + 1 };
    }
  }
  const cell = candidates[draw.index];
  return { board: withCholesterol(state.board, cell, nextId), cell, rngState: draw.state, nextId: nextId + 1 };
}

/**
 * One block (drawn among blocks with a normal orthogonal neighbour, row-major) converts
 * one of its normal neighbours (second draw). Returns null, without drawing, when no
 * block has a normal neighbour.
 */
export function spreadPlaque(
  board: Board,
  rngState: number,
  nextId: number,
): { board: Board; from: Cell; to: Cell; rngState: number; nextId: number } | null {
  const sources: { from: Cell; targets: Cell[] }[] = [];
  board.forEach((row, r) =>
    row.forEach((tile, c) => {
      if (tile.type !== 'cholesterol') return;
      const from = { row: r, col: c };
      const targets = normalNeighbours(board, from);
      if (targets.length > 0) sources.push({ from, targets });
    }),
  );
  if (sources.length === 0) return null;
  const pickSource = drawIndex(rngState, sources.length);
  const { from, targets } = sources[pickSource.index];
  const pickTarget = drawIndex(pickSource.state, targets.length);
  const to = targets[pickTarget.index];
  return {
    board: withCholesterol(board, to, nextId),
    from,
    to,
    rngState: pickTarget.state,
    nextId: nextId + 1,
  };
}

export interface PlaqueInput extends BoardState {
  /** Player moves resolved so far, including this one. */
  moves: number;
  /** Score after this move. */
  score: number;
  /** Blocks destroyed during this move. */
  destroyed: number;
  cleanMoves: number;
  movesWithoutPlaque: number;
  rngState: number;
  nextId: number;
}

export interface PlaqueOutput {
  board: Board;
  cleanMoves: number;
  movesWithoutPlaque: number;
  rngState: number;
  nextId: number;
  event: PlaqueEvent | null;
}

/**
 * End-of-move plaque step: at most one seed or one spread. Never triggers matches
 * (converted cells are cholesterol, which cannot match), so nothing is re-resolved.
 */
export function resolvePlaque(input: PlaqueInput): PlaqueOutput {
  const { board, rows, cols, moves, score, destroyed, rngState, nextId } = input;
  const cleanMoves = destroyed > 0 ? 0 : input.cleanMoves + 1;
  const unchanged = { board, rngState, nextId, event: null };

  if (countCholesterol(board) === 0) {
    const movesWithoutPlaque = input.movesWithoutPlaque + 1;
    if (moves > GRACE_MOVES && movesWithoutPlaque >= SEED_DELAY_MOVES) {
      const seeded = seedPlaque({ board, rows, cols }, rngState, nextId);
      if (seeded) {
        return {
          board: seeded.board,
          cleanMoves: 0,
          movesWithoutPlaque: 0,
          rngState: seeded.rngState,
          nextId: seeded.nextId,
          event: { type: 'plaqueSeeded', cell: seeded.cell, board: seeded.board },
        };
      }
    }
    return { ...unchanged, cleanMoves: 0, movesWithoutPlaque };
  }

  if (cleanMoves < spreadInterval(score)) return { ...unchanged, cleanMoves, movesWithoutPlaque: 0 };
  const spread = spreadPlaque(board, rngState, nextId);
  if (!spread) return { ...unchanged, cleanMoves: 0, movesWithoutPlaque: 0 };
  return {
    board: spread.board,
    cleanMoves: 0,
    movesWithoutPlaque: 0,
    rngState: spread.rngState,
    nextId: spread.nextId,
    event: { type: 'plaqueSpread', from: spread.from, to: spread.to, board: spread.board },
  };
}
