import { inBounds, isAdjacent, swapCells } from './board';
import { findMatches } from './match';
import type { Cell, GameState, SwapRejection } from './types';

type BoardState = Pick<GameState, 'board' | 'rows' | 'cols'>;

/** Board-only check (ignores `over`): adjacent, in bounds, no cholesterol, creates a match. */
function boardSwapRejection(state: BoardState, a: Cell, b: Cell): Exclude<SwapRejection, 'game-over'> | null {
  if (!inBounds(state, a) || !inBounds(state, b) || !isAdjacent(a, b)) return 'not-adjacent';
  const ta = state.board[a.row][a.col];
  const tb = state.board[b.row][b.col];
  if (ta.type === 'cholesterol' || tb.type === 'cholesterol') return 'cholesterol';
  if (ta.type === tb.type) return 'no-match';
  if (findMatches(swapCells(state.board, a, b)).length === 0) return 'no-match';
  return null;
}

/**
 * Rejection order: game-over, not-adjacent (incl. out of bounds and same cell),
 * cholesterol, no-match. Returns null when the swap is legal.
 */
export function validateSwap(state: GameState, a: Cell, b: Cell): SwapRejection | null {
  if (state.over) return 'game-over';
  return boardSwapRejection(state, a, b);
}

/** First legal swap scanning row-major, trying right then down. Ignores `over`. */
export function findLegalMove(state: BoardState): [Cell, Cell] | null {
  for (let row = 0; row < state.rows; row++) {
    for (let col = 0; col < state.cols; col++) {
      const a = { row, col };
      const right = { row, col: col + 1 };
      if (col + 1 < state.cols && boardSwapRejection(state, a, right) === null) return [a, right];
      const down = { row: row + 1, col };
      if (row + 1 < state.rows && boardSwapRejection(state, a, down) === null) return [a, down];
    }
  }
  return null;
}

export function hasLegalMove(state: BoardState): boolean {
  return findLegalMove(state) !== null;
}
