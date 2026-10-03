import { generateBoard, swapCells } from './board';
import { hasLegalMove, validateSwap } from './legal';
import { matchedCells } from './match';
import { resolvePlaque } from './plaque';
import { applyGravity, rngRefill } from './resolve';
import type { RefillSource } from './resolve';
import { createRng } from './rng';
import { CHOLESTEROL_POINTS, POINTS_PER_TILE, waveMultiplier } from './scoring';
import type { Board, Cell, GameEvent, GameState, SwapResult, Tile, TileType } from './types';

const MAX_BOARD_ATTEMPTS = 100;

/** New game: default 8x8, no matches, no cholesterol, at least one legal move. */
export function createGame(seed: number, opts: { rows?: number; cols?: number } = {}): GameState {
  const rows = opts.rows ?? 8;
  const cols = opts.cols ?? 8;
  const rng = createRng(seed);
  for (let attempt = 0; attempt < MAX_BOARD_ATTEMPTS; attempt++) {
    const { board, nextId } = generateBoard(rows, cols, rng, 1);
    const state: GameState = {
      seed,
      rows,
      cols,
      board,
      score: 0,
      rngState: rng.state(),
      nextId,
      moves: 0,
      cholesterolCleared: 0,
      maxCascade: 0,
      cleanMoves: 0,
      movesWithoutPlaque: 0,
      over: false,
    };
    if (hasLegalMove(state)) return state;
  }
  throw new Error(`Arteria Match: no playable ${rows}x${cols} board for seed ${seed}`);
}

/** Swap using the game's own seeded RNG for refills. */
export function trySwap(state: GameState, a: Cell, b: Cell): SwapResult {
  return trySwapWith(state, a, b, rngRefill(state.rngState));
}

/** Cholesterol cells orthogonally adjacent to any cleared cell, de-duplicated, row-major. */
function adjacentCholesterol(board: Board, cleared: Cell[]): Cell[] {
  const rows = board.length;
  const cols = board[0].length;
  const hit = new Set(cleared.map((c) => c.row * cols + c.col));
  const result: Cell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col].type !== 'cholesterol') continue;
      const touches =
        (row > 0 && hit.has((row - 1) * cols + col)) ||
        (row < rows - 1 && hit.has((row + 1) * cols + col)) ||
        (col > 0 && hit.has(row * cols + col - 1)) ||
        (col < cols - 1 && hit.has(row * cols + col + 1));
      if (touches) result.push({ row, col });
    }
  }
  return result;
}

/**
 * Validates and resolves a swap with an explicit refill source (the test seam).
 * Each wave: score matches and adjacent cholesterol, clear, gravity (plaque fixed), refill.
 * After the last wave, at most one plaque seed or spread (resolvePlaque).
 * A rejected swap returns { ok: false, reason } and never touches the input state.
 */
export function trySwapWith(state: GameState, a: Cell, b: Cell, refill: RefillSource): SwapResult {
  const reason = validateSwap(state, a, b);
  if (reason) return { ok: false, reason };

  const events: GameEvent[] = [];
  let board = swapCells(state.board, a, b);
  events.push({ type: 'swap', a, b, board });

  let score = state.score;
  let nextId = state.nextId;
  let cholesterolCleared = state.cholesterolCleared;
  let wave = 0;

  for (;;) {
    const cleared = matchedCells(board);
    if (cleared.length === 0) break;
    wave++;
    const multiplier = waveMultiplier(wave);

    const matchPoints = cleared.length * POINTS_PER_TILE * multiplier;
    events.push({ type: 'match', wave, multiplier, cells: cleared, points: matchPoints });
    score += matchPoints;

    const blocks = adjacentCholesterol(board, cleared);
    if (blocks.length > 0) {
      const blockPoints = blocks.length * CHOLESTEROL_POINTS * multiplier;
      events.push({ type: 'cholesterolCleared', wave, multiplier, cells: blocks, points: blockPoints });
      score += blockPoints;
      cholesterolCleared += blocks.length;
    }

    const holed: (Tile | null)[][] = board.map((row) => [...row]);
    for (const c of [...cleared, ...blocks]) holed[c.row][c.col] = null;

    const fallen = applyGravity(holed);
    events.push({ type: 'fall', wave, moves: fallen.moves });

    // Refill empty cells top to bottom, left to right (never cholesterol).
    const spawned: { id: number; type: TileType; cell: Cell }[] = [];
    const filled: Tile[][] = [];
    for (let r = 0; r < fallen.board.length; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < fallen.board[r].length; c++) {
        const existing = fallen.board[r][c];
        if (existing) {
          row.push(existing);
          continue;
        }
        const tile: Tile = { id: nextId++, type: refill.next() };
        row.push(tile);
        spawned.push({ id: tile.id, type: tile.type, cell: { row: r, col: c } });
      }
      filled.push(row);
    }
    board = filled;
    events.push({ type: 'refill', wave, spawned, board });
  }

  // Once per move, after every cascade: seed or spread plaque (never re-resolves matches).
  const moves = state.moves + 1;
  const plaque = resolvePlaque({
    board,
    rows: state.rows,
    cols: state.cols,
    moves,
    score,
    destroyed: cholesterolCleared - state.cholesterolCleared,
    cleanMoves: state.cleanMoves,
    movesWithoutPlaque: state.movesWithoutPlaque,
    rngState: refill.state(),
    nextId,
  });
  if (plaque.event) events.push(plaque.event);

  const nextState: GameState = {
    ...state,
    board: plaque.board,
    score,
    nextId: plaque.nextId,
    moves,
    cholesterolCleared,
    maxCascade: Math.max(state.maxCascade, wave),
    cleanMoves: plaque.cleanMoves,
    movesWithoutPlaque: plaque.movesWithoutPlaque,
    rngState: plaque.rngState,
    over: false,
  };
  const over = !hasLegalMove(nextState);
  if (over) events.push({ type: 'gameOver', score });
  return { ok: true, state: { ...nextState, over }, events };
}
