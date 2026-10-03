// Public API of the pure Arteria Match engine. test-helpers.ts is intentionally not exported.
export { NORMAL_TILE_TYPES } from './types';
export type {
  Board,
  Cell,
  FallMove,
  GameEvent,
  GameState,
  NormalTileType,
  SwapRejection,
  SwapResult,
  Tile,
  TileType,
} from './types';
export { createRng, mulberry32 } from './rng';
export type { Rng } from './rng';
export {
  CHOLESTEROL_POINTS,
  MAX_MULTIPLIER,
  POINTS_PER_TILE,
  SPAWN_CAP_SCORE,
  SPAWN_MAX,
  SPAWN_MIN,
  spawnChance,
  waveMultiplier,
} from './scoring';
export { findMatches, matchedCells } from './match';
export type { MatchRun } from './match';
export { generateBoard, inBounds, isAdjacent, swapCells } from './board';
export { findLegalMove, hasLegalMove, validateSwap } from './legal';
export { applyGravity, rngRefill } from './resolve';
export type { RefillSource } from './resolve';
export { createGame, trySwap, trySwapWith } from './game';
