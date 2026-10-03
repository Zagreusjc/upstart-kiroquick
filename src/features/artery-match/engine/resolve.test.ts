import { describe, it, expect } from 'vitest';
import { trySwapWith } from './game';
import { hasLegalMove } from './legal';
import { countCholesterol } from './plaque';
import { applyGravity } from './resolve';
import { gridOf, scriptedRefill, stateFromGrid } from './test-helpers';
import type { GameEvent, NormalTileType, SwapResult, Tile } from './types';

function expectOk(result: SwapResult) {
  if (!result.ok) throw new Error(`expected ok, got ${result.reason}`);
  return result;
}

const types = (letters: string): NormalTileType[] =>
  [...letters].map(
    (l) => ({ R: 'rbc', W: 'wbc', P: 'platelet', A: 'plasma' })[l] as NormalTileType,
  );

const ofType = <T extends GameEvent['type']>(events: GameEvent[], type: T) =>
  events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === type);

describe('resolve: basic match', () => {
  it('scores exactly 30 for a 3-tile match with no cascade', () => {
    const state = stateFromGrid(['RRWR', 'WPAP', 'PAWA', 'AWPW']);
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 0, col: 2 }, { row: 0, col: 3 }, scriptedRefill(types('PWP'))),
    );
    expect(next.score - state.score).toBe(30);
    const matches = ofType(events, 'match');
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ wave: 1, multiplier: 1, points: 30 });
    expect(gridOf(next)).toEqual(['PWPW', 'WPAP', 'PAWA', 'AWPW']);
    expect(next.maxCascade).toBe(1);
    expect(events.map((e) => e.type).filter((t) => t !== 'gameOver')).toEqual([
      'swap',
      'match',
      'fall',
      'refill',
    ]);
  });
});

describe('resolve: cholesterol', () => {
  it('destroys an orthogonally adjacent block (530 total) and keeps a diagonal-only block', () => {
    const state = stateFromGrid(['RRWR', 'CPAC', 'PAWA', 'AWPW']);
    const diagonalId = state.board[1][3].id;
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 0, col: 2 }, { row: 0, col: 3 }, scriptedRefill(types('WRPR'))),
    );
    expect(next.score - state.score).toBe(530);
    expect(next.cholesterolCleared).toBe(1);
    const cleared = ofType(events, 'cholesterolCleared');
    expect(cleared).toHaveLength(1);
    expect(cleared[0]).toMatchObject({
      wave: 1,
      multiplier: 1,
      cells: [{ row: 1, col: 0 }],
      points: 500,
    });
    // Diagonal-only block survives in place.
    expect(next.board[1][3]).toEqual({ id: diagonalId, type: 'cholesterol' });
    expect(gridOf(next)).toEqual(['WRPW', 'RPAC', 'PAWA', 'AWPW']);
  });

  it('scores 1000 for a block destroyed in wave 2', () => {
    const state = stateFromGrid(['PWA', 'WRP', 'RAC', 'RPP']);
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 1, col: 0 }, { row: 1, col: 1 }, scriptedRefill(types('RARPARP'))),
    );
    const cleared = ofType(events, 'cholesterolCleared');
    expect(cleared).toHaveLength(1);
    expect(cleared[0]).toMatchObject({
      wave: 2,
      multiplier: 2,
      cells: [{ row: 2, col: 2 }],
      points: 1000,
    });
    expect(next.score).toBe(30 + 60 + 1000);
    expect(next.cholesterolCleared).toBe(1);
    expect(events.map((e) => e.type).filter((t) => t !== 'gameOver')).toEqual([
      'swap',
      'match',
      'fall',
      'refill',
      'match',
      'cholesterolCleared',
      'fall',
      'refill',
    ]);
  });
});

// Column 0 has a block on top; the swap clears the R run below the A, which falls past nothing.
const GRAVITY_GRID = ['CWP', 'APW', 'RWA', 'RAP', 'WRW'];
const gravitySwap = (extra: Parameters<typeof stateFromGrid>[1] = {}) => {
  const state = stateFromGrid(GRAVITY_GRID, extra);
  return {
    state,
    result: expectOk(
      trySwapWith(state, { row: 4, col: 0 }, { row: 4, col: 1 }, scriptedRefill(types('RAP'))),
    ),
  };
};

describe('resolve: gravity and refill', () => {
  it('tiles pass over a fixed block; the block never moves and refill fills the cells below it', () => {
    const { state, result } = gravitySwap();
    const { state: next, events } = result;
    const cholesterolId = state.board[0][0].id;
    const plasmaId = state.board[1][0].id;
    const [fall] = ofType(events, 'fall');
    expect(fall.moves.some((m) => m.id === cholesterolId)).toBe(false);
    expect(fall.moves).toContainEqual({
      id: plasmaId,
      from: { row: 1, col: 0 },
      to: { row: 4, col: 0 },
    });
    const [refill] = ofType(events, 'refill');
    expect(refill.spawned.map((s) => s.cell)).toEqual([
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 3, col: 0 },
    ]);
    expect(gridOf(next)).toEqual(['CWP', 'RPW', 'AWA', 'PAP', 'AWW']);
    expect(next.board[0][0]).toEqual({ id: cholesterolId, type: 'cholesterol' });
    // Fresh ids start at nextId.
    expect(refill.spawned.map((s) => s.id)).toEqual([16, 17, 18]);
    expect(next.nextId).toBe(19);
    expect(refill.board).toBe(next.board);
    // First clean move: below the spread interval, nothing spreads.
    expect(ofType(events, 'plaqueSpread')).toHaveLength(0);
    expect(next.cleanMoves).toBe(1);
  });

  it('applyGravity keeps cholesterol fixed and drops tiles over it into holes below', () => {
    const t = (id: number): Tile => ({ id, type: 'rbc' });
    const c = (id: number): Tile => ({ id, type: 'cholesterol' });
    const { board, moves } = applyGravity([
      [t(1), t(5)],
      [c(2), null],
      [null, t(6)],
      [t(3), c(7)],
      [null, null],
    ]);
    expect(board.map((row) => row.map((cell) => cell?.id ?? null))).toEqual([
      [null, null],
      [2, null],
      [null, 5],
      [1, 7],
      [3, 6],
    ]);
    expect(moves).toEqual(
      expect.arrayContaining([
        { id: 3, from: { row: 3, col: 0 }, to: { row: 4, col: 0 } },
        { id: 1, from: { row: 0, col: 0 }, to: { row: 3, col: 0 } },
        { id: 6, from: { row: 2, col: 1 }, to: { row: 4, col: 1 } },
        { id: 5, from: { row: 0, col: 1 }, to: { row: 2, col: 1 } },
      ]),
    );
    expect(moves).toHaveLength(4);
  });

  it('applyGravity compacts each column downward and lists the moves', () => {
    const t = (id: number): Tile => ({ id, type: 'rbc' });
    const { board, moves } = applyGravity([
      [t(1), t(2)],
      [null, t(3)],
      [t(4), null],
      [null, null],
    ]);
    expect(board.map((row) => row.map((c) => c?.id ?? null))).toEqual([
      [null, null],
      [null, null],
      [1, 2],
      [4, 3],
    ]);
    expect(moves).toEqual(
      expect.arrayContaining([
        { id: 4, from: { row: 2, col: 0 }, to: { row: 3, col: 0 } },
        { id: 1, from: { row: 0, col: 0 }, to: { row: 2, col: 0 } },
        { id: 3, from: { row: 1, col: 1 }, to: { row: 3, col: 1 } },
        { id: 2, from: { row: 0, col: 1 }, to: { row: 2, col: 1 } },
      ]),
    );
    expect(moves).toHaveLength(4);
  });
});

describe('resolve: cascades', () => {
  it('scores a gravity-only cascade at 2x', () => {
    const state = stateFromGrid(['PWA', 'WRP', 'RAW', 'RPP']);
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 1, col: 0 }, { row: 1, col: 1 }, scriptedRefill(types('RARPAR'))),
    );
    const matches = ofType(events, 'match');
    expect(matches).toHaveLength(2);
    expect(matches[0]).toMatchObject({ wave: 1, multiplier: 1, points: 30 });
    expect(matches[1]).toMatchObject({
      wave: 2,
      multiplier: 2,
      points: 3 * 20,
      cells: [
        { row: 3, col: 0 },
        { row: 3, col: 1 },
        { row: 3, col: 2 },
      ],
    });
    expect(next.score).toBe(90);
    expect(next.maxCascade).toBe(2);
  });

  it('caps the multiplier at 4x over a 6-wave chain', () => {
    const state = stateFromGrid(['RRW', 'PAR', 'APW']);
    const script = types('PPP' + 'AAA' + 'RRR' + 'PPP' + 'AAA' + 'RWR');
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 0, col: 2 }, { row: 1, col: 2 }, scriptedRefill(script)),
    );
    const matches = ofType(events, 'match');
    expect(matches.map((m) => m.multiplier)).toEqual([1, 2, 3, 4, 4, 4]);
    expect(matches.map((m) => m.points)).toEqual([30, 60, 90, 120, 120, 120]);
    expect(next.score).toBe(540);
    expect(next.maxCascade).toBe(6);
  });

  it('keeps the largest cascade across moves', () => {
    const state = stateFromGrid(['RRWR', 'WPAP', 'PAWA', 'AWPW'], { maxCascade: 5 });
    const { state: next } = expectOk(
      trySwapWith(state, { row: 0, col: 2 }, { row: 0, col: 3 }, scriptedRefill(types('PWP'))),
    );
    expect(next.maxCascade).toBe(5);
  });
});

describe('resolve: plaque after the move', () => {
  it('spreads once after 2 clean moves below 2000 points, after the last refill', () => {
    const { result } = gravitySwap({ moves: 10, cleanMoves: 1 });
    const { state: next, events } = result;
    const spreads = ofType(events, 'plaqueSpread');
    expect(spreads).toHaveLength(1);
    expect(spreads[0].from).toEqual({ row: 0, col: 0 });
    expect([
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ]).toContainEqual(spreads[0].to);
    const order = events.map((e) => e.type).filter((t) => t !== 'gameOver');
    expect(order.lastIndexOf('refill')).toBe(order.indexOf('plaqueSpread') - 1);
    expect(order[order.length - 1]).toBe('plaqueSpread');
    expect(countCholesterol(next.board)).toBe(2);
    expect(spreads[0].board).toBe(next.board);
    expect(next.cleanMoves).toBe(0);
  });

  it('does not spread after a single clean move below 2000 points', () => {
    const { result } = gravitySwap({ moves: 10, cleanMoves: 0 });
    expect(ofType(result.events, 'plaqueSpread')).toHaveLength(0);
    expect(result.state.cleanMoves).toBe(1);
    expect(countCholesterol(result.state.board)).toBe(1);
  });

  it('spreads after every clean move from 2000 points, 2 tiles at that score', () => {
    const { result } = gravitySwap({ moves: 10, cleanMoves: 0, score: 2000 });
    const spreads = ofType(result.events, 'plaqueSpread');
    // The block at (0,0) has exactly 2 normal neighbours, so both convert.
    expect(spreads).toHaveLength(2);
    expect(spreads.map((s) => s.from)).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 0 },
    ]);
    expect(spreads.map((s) => `${s.to.row},${s.to.col}`).sort()).toEqual(['0,1', '1,0']);
    expect(countCholesterol(result.state.board)).toBe(3);
  });

  it('a late-game spread emits one event per converted tile after the last refill', () => {
    const state = stateFromGrid(
      ['RRWRA', 'WPAPW', 'PACWP', 'AWPWA', 'WRWPR'],
      { moves: 10, cleanMoves: 0, score: 2500 },
    );
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 0, col: 2 }, { row: 0, col: 3 }, scriptedRefill(types('PWP'), 4)),
    );
    const spreads = ofType(events, 'plaqueSpread');
    expect(spreads).toHaveLength(3);
    const order = events.map((e) => e.type).filter((t) => t !== 'gameOver');
    expect(order.slice(-3)).toEqual(['plaqueSpread', 'plaqueSpread', 'plaqueSpread']);
    expect(order[order.length - 4]).toBe('refill');
    expect(spreads[2].board).toBe(next.board);
    expect(countCholesterol(next.board)).toBe(4);
    expect(next.cleanMoves).toBe(0);
    // Every converted tile touches the pre-existing block at (2,2).
    for (const s of spreads) {
      expect(s.from).toEqual({ row: 2, col: 2 });
      expect(Math.abs(s.to.row - 2) + Math.abs(s.to.col - 2)).toBe(1);
    }
  });

  it('a burst that removes the last legal swap ends the game with a gameOver event', () => {
    // Row 2 is plaque. The swap makes PPP in row 0; the refill 'RAP' leaves 'RAPA' / 'AWAR',
    // whose only legal swap (0,1)-(1,1) needs a tile of row 1 that the burst turns into a block.
    const state = stateFromGrid(['APPA', 'PWAR', 'CCCC'], { moves: 10, cleanMoves: 1, score: 5000 });
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 0, col: 0 }, { row: 1, col: 0 }, scriptedRefill(types('RAP'), 5)),
    );
    // Before the burst the refilled board still had a legal move.
    const refill = ofType(events, 'refill').pop();
    expect(refill).toBeDefined();
    expect(hasLegalMove({ ...state, board: refill!.board })).toBe(true);
    expect(ofType(events, 'plaqueSpread')).toHaveLength(3);
    expect(hasLegalMove(next)).toBe(false);
    expect(next.over).toBe(true);
    const over = ofType(events, 'gameOver');
    expect(over).toHaveLength(1);
    expect(over[0].score).toBe(next.score);
    expect(events[events.length - 1]).toBe(over[0]);
  });

  it('a move that destroys a block resets cleanMoves and prevents spread', () => {
    const state = stateFromGrid(['RRWR', 'CPAC', 'PAWA', 'AWPW'], { moves: 10, cleanMoves: 1 });
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 0, col: 2 }, { row: 0, col: 3 }, scriptedRefill(types('WRPR'))),
    );
    expect(ofType(events, 'plaqueSpread')).toHaveLength(0);
    expect(next.cleanMoves).toBe(0);
    expect(countCholesterol(next.board)).toBe(1);
    expect(next.board[1][3].type).toBe('cholesterol');
  });

  it('re-seeds at the end of the 2nd plaque-free move after the last block is cleared', () => {
    const clearing = stateFromGrid(['PWA', 'WRP', 'RAC', 'RPP'], { moves: 10 });
    const first = expectOk(
      trySwapWith(clearing, { row: 1, col: 0 }, { row: 1, col: 1 }, scriptedRefill(types('RARPARP'))),
    );
    expect(countCholesterol(first.state.board)).toBe(0);
    expect(ofType(first.events, 'plaqueSeeded')).toHaveLength(0);
    expect(first.state.movesWithoutPlaque).toBe(1);

    const state = stateFromGrid(['RRWR', 'WPAP', 'PAWA', 'AWPW'], {
      moves: 10,
      movesWithoutPlaque: 1,
    });
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 0, col: 2 }, { row: 0, col: 3 }, scriptedRefill(types('PWP'))),
    );
    const seeds = ofType(events, 'plaqueSeeded');
    expect(seeds).toHaveLength(1);
    expect(countCholesterol(next.board)).toBe(1);
    const { cell } = seeds[0];
    expect(next.board[cell.row][cell.col].type).toBe('cholesterol');
    expect(next.movesWithoutPlaque).toBe(0);
  });

  it('never seeds during the grace period', () => {
    const state = stateFromGrid(['RRWR', 'WPAP', 'PAWA', 'AWPW'], {
      moves: 2,
      movesWithoutPlaque: 5,
    });
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 0, col: 2 }, { row: 0, col: 3 }, scriptedRefill(types('PWP'))),
    );
    expect(ofType(events, 'plaqueSeeded')).toHaveLength(0);
    expect(countCholesterol(next.board)).toBe(0);
    expect(next.moves).toBe(3);
  });
});
