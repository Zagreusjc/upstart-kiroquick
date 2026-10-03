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
/** Score from which plaque spreads after every clean move instead of every 2nd. */
export const FAST_SPREAD_SCORE = 800;
/** Score from which one spread converts 2 tiles instead of 1. */
export const SPREAD_COUNT_TWO_SCORE = 500;
/** Score from which one spread converts the maximum of 3 tiles. */
export const SPREAD_COUNT_THREE_SCORE = 1200;
export const MAX_SPREAD_COUNT = 3;

type BoardState = Pick<GameState, 'board' | 'rows' | 'cols'>;

/** Clean moves (no block destroyed) needed before plaque spreads: 2 below 800 points, then 1. */
export function spreadInterval(score: number): number {
  return score >= FAST_SPREAD_SCORE ? SPREAD_INTERVAL_FAST : SPREAD_INTERVAL_SLOW;
}

/**
 * Tiles converted by one spread: 1 below SPREAD_COUNT_TWO_SCORE, 2 below SPREAD_COUNT_THREE_SCORE,
 * then the cap of 3. Non-decreasing in score.
 */
export function spreadCount(score: number): 1 | 2 | 3 {
  if (score >= SPREAD_COUNT_THREE_SCORE) return MAX_SPREAD_COUNT;
  return score >= SPREAD_COUNT_TWO_SCORE ? 2 : 1;
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

export interface PlaqueSpreadStep {
  from: Cell;
  to: Cell;
  /** Board after this conversion and every earlier one in the same spread. */
  board: Board;
}

/**
 * Converts up to `count` distinct normal tiles that touch a block which existed before the
 * spread. The candidate set is frozen up front (blocks row-major, neighbours up, right, down,
 * left, de-duplicated), so a converted tile never extends it: no chaining. Each pick draws
 * one index from the RNG and removes that candidate. `from` is the first pre-existing block,
 * in row-major order, next to the picked tile. Fewer candidates than `count` converts them
 * all. Returns null, without drawing, when there is no candidate.
 */
export function spreadPlaque(
  board: Board,
  rngState: number,
  nextId: number,
  count: number = 1,
): { board: Board; spreads: PlaqueSpreadStep[]; rngState: number; nextId: number } | null {
  const candidates: { from: Cell; to: Cell }[] = [];
  const seen = new Set<number>();
  const cols = board.length > 0 ? board[0].length : 0;
  board.forEach((row, r) =>
    row.forEach((tile, c) => {
      if (tile.type !== 'cholesterol') return;
      const from = { row: r, col: c };
      for (const to of normalNeighbours(board, from)) {
        const key = to.row * cols + to.col;
        if (seen.has(key)) continue;
        seen.add(key);
        candidates.push({ from, to });
      }
    }),
  );
  if (candidates.length === 0) return null;

  const picks = Math.min(Math.max(1, Math.floor(count)), candidates.length);
  const spreads: PlaqueSpreadStep[] = [];
  let current = board;
  let state = rngState;
  let id = nextId;
  for (let i = 0; i < picks; i++) {
    const draw = drawIndex(state, candidates.length);
    state = draw.state;
    const [{ from, to }] = candidates.splice(draw.index, 1);
    current = withCholesterol(current, to, id++);
    spreads.push({ from, to, board: current });
  }
  return { board: current, spreads, rngState: state, nextId: id };
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
  /** Empty, one plaqueSeeded, or one plaqueSpread per converted tile in pick order. */
  events: PlaqueEvent[];
}

/**
 * End-of-move plaque step: one seed, or one spread of up to spreadCount(score) tiles. Never triggers matches
 * (converted cells are cholesterol, which cannot match), so nothing is re-resolved.
 */
export function resolvePlaque(input: PlaqueInput): PlaqueOutput {
  const { board, rows, cols, moves, score, destroyed, rngState, nextId } = input;
  const cleanMoves = destroyed > 0 ? 0 : input.cleanMoves + 1;
  const unchanged = { board, rngState, nextId, events: [] as PlaqueEvent[] };

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
          events: [{ type: 'plaqueSeeded', cell: seeded.cell, board: seeded.board }],
        };
      }
    }
    return { ...unchanged, cleanMoves: 0, movesWithoutPlaque };
  }

  if (cleanMoves < spreadInterval(score)) return { ...unchanged, cleanMoves, movesWithoutPlaque: 0 };
  // Resets cleanMoves even when no tile could convert (no RNG is drawn in that case).
  const spread = spreadPlaque(board, rngState, nextId, spreadCount(score));
  if (!spread) return { ...unchanged, cleanMoves: 0, movesWithoutPlaque: 0 };
  return {
    board: spread.board,
    cleanMoves: 0,
    movesWithoutPlaque: 0,
    rngState: spread.rngState,
    nextId: spread.nextId,
    events: spread.spreads.map(
      (step): PlaqueEvent => ({ type: 'plaqueSpread', from: step.from, to: step.to, board: step.board }),
    ),
  };
}
