// Public API of the pure Arteria Match engine. test-helpers.ts is intentionally not exported.
export { NORMAL_TILE_TYPES } from './types';
export type {
  Board,
  Cell,
  FallMove,
  GameEvent,
  GameState,
  NormalTileType,
  PlaqueEvent,
  SwapRejection,
  SwapResult,
  Tile,
  TileType,
} from './types';
export { createRng, drawIndex, mulberry32 } from './rng';
export type { Rng } from './rng';
export {
  CHOLESTEROL_POINTS,
  MAX_MULTIPLIER,
  POINTS_PER_TILE,
  waveMultiplier,
} from './scoring';
export { findMatches, matchedCells } from './match';
export type { MatchRun } from './match';
export { generateBoard, inBounds, isAdjacent, swapCells } from './board';
export { findLegalMove, hasLegalMove, validateSwap } from './legal';
export { applyGravity, rngRefill } from './resolve';
export type { RefillSource } from './resolve';
export { DEFAULT_COLS, DEFAULT_ROWS, createGame, trySwap, trySwapWith } from './game';
export {
  FAST_SPREAD_SCORE,
  GRACE_MOVES,
  MAX_SPREAD_COUNT,
  SEED_DELAY_MOVES,
  SPREAD_COUNT_THREE_SCORE,
  SPREAD_COUNT_TWO_SCORE,
  SPREAD_INTERVAL_FAST,
  SPREAD_INTERVAL_SLOW,
  countCholesterol,
  resolvePlaque,
  seedPlaque,
  spreadCount,
  spreadInterval,
  spreadPlaque,
} from './plaque';
export type { PlaqueInput, PlaqueOutput, PlaqueSpreadStep } from './plaque';
