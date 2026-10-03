// Pure engine types for Arteria Match. No React, no DOM.

export type NormalTileType = 'rbc' | 'wbc' | 'platelet' | 'plasma';
export type TileType = NormalTileType | 'cholesterol';

export const NORMAL_TILE_TYPES: readonly NormalTileType[] = ['rbc', 'wbc', 'platelet', 'plasma'];

export interface Tile {
  readonly id: number;
  readonly type: TileType;
}

/** Board coordinate. Row 0 is the top row. */
export interface Cell {
  readonly row: number;
  readonly col: number;
}

/** Indexed as board[row][col]. A stable board has no holes. */
export type Board = ReadonlyArray<ReadonlyArray<Tile>>;

export interface GameState {
  readonly seed: number;
  readonly rows: number;
  readonly cols: number;
  readonly board: Board;
  readonly score: number;
  readonly rngState: number;
  readonly nextId: number;
  readonly moves: number;
  readonly cholesterolCleared: number;
  /** Largest number of waves resolved in a single move (1 = no cascade). */
  readonly maxCascade: number;
  /** Consecutive resolved moves that destroyed no cholesterol (drives plaque spread). */
  readonly cleanMoves: number;
  /** Consecutive resolved moves that ended with zero cholesterol on the board (drives seeding). */
  readonly movesWithoutPlaque: number;
  readonly over: boolean;
}

export type SwapRejection = 'not-adjacent' | 'cholesterol' | 'no-match' | 'game-over';

export interface FallMove {
  id: number;
  from: Cell;
  to: Cell;
}

export type GameEvent =
  | { type: 'swap'; a: Cell; b: Cell; board: Board }
  | { type: 'match'; wave: number; multiplier: number; cells: Cell[]; points: number }
  | { type: 'cholesterolCleared'; wave: number; multiplier: number; cells: Cell[]; points: number }
  | { type: 'fall'; wave: number; moves: FallMove[] }
  | { type: 'refill'; wave: number; spawned: { id: number; type: TileType; cell: Cell }[]; board: Board }
  | { type: 'plaqueSeeded'; cell: Cell; board: Board }
  | { type: 'plaqueSpread'; from: Cell; to: Cell; board: Board }
  | { type: 'gameOver'; score: number };

export type PlaqueEvent = Extract<GameEvent, { type: 'plaqueSeeded' | 'plaqueSpread' }>;

export type SwapResult =
  | { ok: false; reason: SwapRejection }
  | { ok: true; state: GameState; events: GameEvent[] };
