import { describe, it, expect } from 'vitest';
import { hasLegalMove } from './legal';
import {
  MAX_SPREAD_COUNT,
  SPREAD_COUNT_THREE_SCORE,
  SPREAD_COUNT_TWO_SCORE,
  countCholesterol,
  resolvePlaque,
  seedPlaque,
  seedPlaques,
  spreadCount,
  spreadInterval,
  spreadPlaque,
} from './plaque';
import { drawIndex } from './rng';
import { gridOf, stateFromGrid } from './test-helpers';
import type { Board, Cell } from './types';

type ResolveInput = Parameters<typeof resolvePlaque>[0];

function input(grid: string[], extra: Partial<ResolveInput> = {}): ResolveInput {
  const state = stateFromGrid(grid);
  return {
    board: state.board,
    rows: state.rows,
    cols: state.cols,
    moves: 10,
    score: 0,
    destroyed: 0,
    cleanMoves: 0,
    movesWithoutPlaque: 0,
    rngState: 7,
    nextId: state.nextId,
    ...extra,
  };
}

/** Cells whose letter differs between two boards. */
function changedCells(before: Board, after: Board): Cell[] {
  const a = gridOf(before);
  const b = gridOf(after);
  const cells: Cell[] = [];
  for (let row = 0; row < a.length; row++) {
    for (let col = 0; col < a[row].length; col++) {
      if (a[row][col] !== b[row][col]) cells.push({ row, col });
    }
  }
  return cells;
}

const PLAYABLE = ['RRWR', 'WPAP', 'PAWA', 'AWPW'];
const ONE_BLOCK = ['RRWR', 'WPAP', 'PCWA', 'AWPW'];

describe('spreadInterval', () => {
  it('is 2 below 800 points and 1 from 800 points', () => {
    expect(spreadInterval(0)).toBe(2);
    expect(spreadInterval(799)).toBe(2);
    expect(spreadInterval(800)).toBe(1);
    expect(spreadInterval(10000)).toBe(1);
  });

  it('never increases as the score rises', () => {
    let prev = spreadInterval(0);
    for (let score = 50; score <= 8000; score += 50) {
      const next = spreadInterval(score);
      expect(next).toBeLessThanOrEqual(prev);
      prev = next;
    }
  });
});

describe('spreadCount', () => {
  it('ramps 1, 2, 3 at the named thresholds', () => {
    expect(SPREAD_COUNT_TWO_SCORE).toBe(500);
    expect(SPREAD_COUNT_THREE_SCORE).toBe(1200);
    expect(MAX_SPREAD_COUNT).toBe(3);
    expect(spreadCount(0)).toBe(1);
    expect(spreadCount(499)).toBe(1);
    expect(spreadCount(500)).toBe(2);
    expect(spreadCount(1199)).toBe(2);
    expect(spreadCount(1200)).toBe(3);
    expect(spreadCount(10000)).toBe(3);
  });

  it('never decreases as the score rises and never exceeds 3', () => {
    let prev = spreadCount(0);
    for (let score = 0; score <= 20000; score += 25) {
      const next = spreadCount(score);
      expect(next).toBeGreaterThanOrEqual(prev);
      expect(next).toBeLessThanOrEqual(3);
      expect(next).toBeGreaterThanOrEqual(1);
      prev = next;
    }
    expect(spreadCount(1_000_000)).toBe(3);
  });
});

describe('countCholesterol', () => {
  it('counts the cholesterol cells', () => {
    expect(countCholesterol(stateFromGrid(['CRC', 'WCA']).board)).toBe(3);
    expect(countCholesterol(stateFromGrid(PLAYABLE).board)).toBe(0);
  });
});

describe('seedPlaque', () => {
  it('prefers a cell that keeps a legal move', () => {
    const state = stateFromGrid(['RRWRA']);
    for (let rngState = 1; rngState <= 30; rngState++) {
      const seeded = seedPlaque(state, rngState, 100);
      expect(seeded).not.toBeNull();
      if (!seeded) continue;
      expect(seeded.cell).toEqual({ row: 0, col: 4 });
      expect(gridOf(seeded.board)).toEqual(['RRWRC']);
      expect(seeded.board[0][4]).toEqual({ id: 100, type: 'cholesterol' });
      expect(seeded.nextId).toBe(101);
      expect(seeded.rngState).not.toBe(rngState);
      expect(hasLegalMove({ ...state, board: seeded.board })).toBe(true);
    }
  });

  it('still places a block when every cell would remove the last legal move', () => {
    const state = stateFromGrid(['RRWR']);
    const seeded = seedPlaque(state, 3, 50);
    expect(seeded).not.toBeNull();
    if (!seeded) return;
    expect(countCholesterol(seeded.board)).toBe(1);
    expect(hasLegalMove({ ...state, board: seeded.board })).toBe(false);
  });
});

const OPEN_BOARD = ['RWPAR', 'PARWP', 'WRCAW', 'APWRA', 'RWAPR'];
const OPEN_NEIGHBOURS: Cell[] = [
  { row: 1, col: 2 },
  { row: 2, col: 3 },
  { row: 3, col: 2 },
  { row: 2, col: 1 },
];
const key = (c: Cell) => `${c.row},${c.col}`;

describe('spreadPlaque', () => {
  it('converts the only normal orthogonal neighbour', () => {
    const { board } = stateFromGrid(['CCW', 'CCC', 'CCC']);
    for (let rngState = 1; rngState <= 20; rngState++) {
      const spread = spreadPlaque(board, rngState, 200);
      expect(spread).not.toBeNull();
      if (!spread) continue;
      expect(spread.spreads).toHaveLength(1);
      expect(spread.spreads[0].to).toEqual({ row: 0, col: 2 });
      // (0,1) is the first pre-existing block, in row-major order, next to (0,2).
      expect(spread.spreads[0].from).toEqual({ row: 0, col: 1 });
      expect(countCholesterol(spread.board)).toBe(9);
      expect(spread.board[0][2]).toEqual({ id: 200, type: 'cholesterol' });
      expect(spread.nextId).toBe(201);
    }
  });

  it('only spreads to orthogonal neighbours, never diagonals', () => {
    const { board } = stateFromGrid(OPEN_BOARD);
    const seen = new Set<string>();
    for (let rngState = 1; rngState <= 50; rngState++) {
      const spread = spreadPlaque(board, rngState, 100);
      expect(spread).not.toBeNull();
      if (!spread) continue;
      const changed = changedCells(board, spread.board);
      expect(changed).toHaveLength(1);
      expect(OPEN_NEIGHBOURS).toContainEqual(changed[0]);
      expect(changed[0]).toEqual(spread.spreads[0].to);
      expect(spread.spreads[0].from).toEqual({ row: 2, col: 2 });
      expect(board[changed[0].row][changed[0].col].type).not.toBe('cholesterol');
      seen.add(key(changed[0]));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('does nothing when no block has a normal neighbour', () => {
    const { board } = stateFromGrid(['CCC', 'CCC', 'CCC']);
    expect(spreadPlaque(board, 9, 100)).toBeNull();
    const out = resolvePlaque(input(['CCC', 'CCC', 'CCC'], { cleanMoves: 1, rngState: 9 }));
    expect(out.events).toEqual([]);
    expect(gridOf(out.board)).toEqual(['CCC', 'CCC', 'CCC']);
    // Documented behaviour: the clean-move count resets even though nothing converted.
    expect(out.cleanMoves).toBe(0);
    expect(out.rngState).toBe(9);
  });
});

describe('spreadPlaque: burst of several tiles', () => {
  it('converts exactly 3 distinct normal neighbours of the pre-existing block', () => {
    const { board, nextId } = stateFromGrid(OPEN_BOARD);
    for (let rngState = 1; rngState <= 50; rngState++) {
      const spread = spreadPlaque(board, rngState, nextId, 3);
      expect(spread).not.toBeNull();
      if (!spread) continue;
      const changed = changedCells(board, spread.board);
      expect(changed).toHaveLength(3);
      expect(new Set(changed.map(key)).size).toBe(3);
      for (const cell of changed) expect(OPEN_NEIGHBOURS).toContainEqual(cell);
      expect(spread.spreads).toHaveLength(3);
      expect(spread.spreads.map((s) => key(s.to)).sort()).toEqual(changed.map(key).sort());
      for (const step of spread.spreads) expect(step.from).toEqual({ row: 2, col: 2 });
      expect(spread.spreads.map((s) => countCholesterol(s.board))).toEqual([2, 3, 4]);
      expect(spread.spreads[2].board).toBe(spread.board);
      expect(spread.spreads[0].board).not.toBe(spread.spreads[1].board);
    }
  });

  it('uses fresh consecutive ids in pick order', () => {
    const { board } = stateFromGrid(OPEN_BOARD);
    const spread = spreadPlaque(board, 5, 500, 3);
    expect(spread).not.toBeNull();
    if (!spread) return;
    spread.spreads.forEach((step, i) => {
      expect(step.board[step.to.row][step.to.col]).toEqual({ id: 500 + i, type: 'cholesterol' });
    });
    expect(spread.nextId).toBe(503);
  });

  it('can pick every neighbour across seeds', () => {
    const { board } = stateFromGrid(OPEN_BOARD);
    const seen = new Set<string>();
    for (let rngState = 1; rngState <= 50; rngState++) {
      const spread = spreadPlaque(board, rngState, 100, 3);
      if (!spread) continue;
      for (const step of spread.spreads) seen.add(key(step.to));
    }
    expect(seen.size).toBe(4);
  });

  it('converts only the available candidates when there are fewer than the count', () => {
    const { board } = stateFromGrid(['CRW', 'PAR', 'WPA']);
    for (let rngState = 1; rngState <= 20; rngState++) {
      const spread = spreadPlaque(board, rngState, 50, 3);
      expect(spread).not.toBeNull();
      if (!spread) continue;
      expect(spread.spreads).toHaveLength(2);
      expect(changedCells(board, spread.board).map(key).sort()).toEqual(['0,1', '1,0']);
      expect(spread.nextId).toBe(52);
    }
    const one = spreadPlaque(stateFromGrid(['CCC', 'CCW', 'CCC']).board, 4, 50, 3);
    expect(one?.spreads).toHaveLength(1);
    expect(one?.spreads[0].to).toEqual({ row: 1, col: 2 });
  });

  it('returns null when there is no block or no candidate', () => {
    expect(spreadPlaque(stateFromGrid(['CCC', 'CCC']).board, 3, 10, 3)).toBeNull();
    expect(spreadPlaque(stateFromGrid(OPEN_BOARD.map((r) => r.replace(/./g, 'R'))).board, 3, 10, 3)).toBeNull();
  });

  it('never chains: a tile next to a freshly converted tile is not converted', () => {
    const { board } = stateFromGrid(['CRRR', 'WPAR', 'PAWP', 'RWPA']);
    for (let rngState = 1; rngState <= 50; rngState++) {
      const spread = spreadPlaque(board, rngState, 100, 3);
      expect(spread).not.toBeNull();
      if (!spread) continue;
      // Only (0,1) and (1,0) touch the block; (0,2), (1,1) and (2,0) must stay as they were.
      expect(changedCells(board, spread.board).map(key).sort()).toEqual(['0,1', '1,0']);
      expect(spread.spreads).toHaveLength(2);
    }
  });

  it('reports the first pre-existing block, in row-major order, as from', () => {
    const { board } = stateFromGrid(['CRC', 'WPA', 'PAW']);
    const spread = spreadPlaque(board, 3, 100, 3);
    expect(spread).not.toBeNull();
    if (!spread) return;
    const byTarget = new Map(spread.spreads.map((s) => [key(s.to), s.from]));
    expect(byTarget.get('0,1')).toEqual({ row: 0, col: 0 });
    expect(byTarget.get('1,0')).toEqual({ row: 0, col: 0 });
    expect(byTarget.get('1,2')).toEqual({ row: 0, col: 2 });
  });

  it('only changes the converted cells and keeps every other tile object', () => {
    const { board } = stateFromGrid(OPEN_BOARD);
    const spread = spreadPlaque(board, 11, 100, 3);
    expect(spread).not.toBeNull();
    if (!spread) return;
    const converted = new Set(spread.spreads.map((s) => key(s.to)));
    board.forEach((row, r) =>
      row.forEach((tile, c) => {
        if (converted.has(`${r},${c}`)) expect(spread.board[r][c].type).toBe('cholesterol');
        else expect(spread.board[r][c]).toBe(tile);
      }),
    );
    // The input board is never mutated.
    expect(gridOf(board)).toEqual(OPEN_BOARD);
  });

  it('is deterministic and draws once per converted tile', () => {
    const { board } = stateFromGrid(OPEN_BOARD);
    const a = spreadPlaque(board, 77, 100, 3);
    const b = spreadPlaque(board, 77, 100, 3);
    expect(a).toEqual(b);
    let state = 77;
    for (let k = 0; k < 3; k++) state = drawIndex(state, 4 - k).state;
    expect(a?.rngState).toBe(state);
  });
});
describe('resolvePlaque: seeding', () => {
  it('does not seed during the 3-move grace period', () => {
    const out = resolvePlaque(input(PLAYABLE, { moves: 3, movesWithoutPlaque: 2 }));
    expect(out.events).toEqual([]);
    expect(countCholesterol(out.board)).toBe(0);
    expect(out.movesWithoutPlaque).toBe(3);
  });

  it('seeds the first block at the end of move 4 on a plaque-free board', () => {
    const out = resolvePlaque(input(PLAYABLE, { moves: 4, movesWithoutPlaque: 3 }));
    expect(out.events.map((e) => e.type)).toEqual(['plaqueSeeded']);
    expect(countCholesterol(out.board)).toBe(1);
    expect(out.movesWithoutPlaque).toBe(0);
    expect(out.cleanMoves).toBe(0);
    const seed = out.events[0];
    if (seed?.type !== 'plaqueSeeded') return;
    expect(out.board[seed.cell.row][seed.cell.col].type).toBe('cholesterol');
    expect(seed.board).toBe(out.board);
  });

  it('re-seeds on the 2nd plaque-free move after the last block is cleared', () => {
    const clearingMove = resolvePlaque(input(PLAYABLE, { movesWithoutPlaque: 0, destroyed: 1 }));
    expect(clearingMove.events).toEqual([]);
    expect(clearingMove.movesWithoutPlaque).toBe(1);

    const next = resolvePlaque(input(PLAYABLE, { moves: 11, movesWithoutPlaque: 1 }));
    expect(next.events.map((e) => e.type)).toEqual(['plaqueSeeded']);
    expect(countCholesterol(next.board)).toBe(1);
    expect(next.movesWithoutPlaque).toBe(0);
  });
});

describe('resolvePlaque: spreading', () => {
  it('spreads after 2 clean moves while the score is below 800', () => {
    const first = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 0 }));
    expect(first.events).toEqual([]);
    expect(first.cleanMoves).toBe(1);
    expect(first.movesWithoutPlaque).toBe(0);

    const second = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 1 }));
    expect(second.events.map((e) => e.type)).toEqual(['plaqueSpread']);
    expect(countCholesterol(second.board)).toBe(2);
    expect(second.cleanMoves).toBe(0);
  });

  it('spreads after every clean move from 800 points (2 tiles at that score)', () => {
    const out = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 0, score: 800 }));
    expect(out.events.map((e) => e.type)).toEqual(['plaqueSpread', 'plaqueSpread']);
    expect(out.cleanMoves).toBe(0);
  });

  it('a move that destroys a block resets cleanMoves and prevents spread', () => {
    const out = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 1, destroyed: 1 }));
    expect(out.events).toEqual([]);
    expect(out.cleanMoves).toBe(0);
    expect(countCholesterol(out.board)).toBe(1);
  });

  it('is deterministic for the same input', () => {
    const a = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 1, rngState: 123 }));
    const b = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 1, rngState: 123 }));
    expect(a).toEqual(b);
    const s1 = resolvePlaque(input(PLAYABLE, { moves: 4, movesWithoutPlaque: 1, rngState: 55 }));
    const s2 = resolvePlaque(input(PLAYABLE, { moves: 4, movesWithoutPlaque: 1, rngState: 55 }));
    expect(s1).toEqual(s2);
  });
});

describe('resolvePlaque: ramped spread', () => {
  const spreadEvents = (out: ReturnType<typeof resolvePlaque>) =>
    out.events.flatMap((e) => (e.type === 'plaqueSpread' ? [e] : []));

  it.each([
    [0, 1],
    [499, 1],
    [500, 2],
    [1199, 2],
    [1200, 3],
    [9000, 3],
  ])('at score %i a spread emits %i plaqueSpread events', (score, expected) => {
    // Interval is 2 below 800 and 1 above; cleanMoves 1 is enough in both cases.
    const out = resolvePlaque(input(OPEN_BOARD, { cleanMoves: 1, score }));
    const spreads = spreadEvents(out);
    expect(spreads).toHaveLength(expected);
    expect(out.events).toHaveLength(expected);
    expect(countCholesterol(out.board)).toBe(1 + expected);
    expect(out.cleanMoves).toBe(0);
    expect(out.movesWithoutPlaque).toBe(0);
  });

  it('emits events in pick order with cumulative boards, the last being the output board', () => {
    const before = stateFromGrid(OPEN_BOARD);
    const out = resolvePlaque(input(OPEN_BOARD, { cleanMoves: 0, score: 3000 }));
    const spreads = spreadEvents(out);
    expect(spreads).toHaveLength(3);
    expect(spreads.map((e) => countCholesterol(e.board))).toEqual([2, 3, 4]);
    expect(spreads[2].board).toBe(out.board);
    spreads.forEach((e, i) => {
      expect(e.from).toEqual({ row: 2, col: 2 });
      expect(OPEN_NEIGHBOURS).toContainEqual(e.to);
      expect(e.board[e.to.row][e.to.col].type).toBe('cholesterol');
      // Each event's board holds every earlier conversion but none of the later ones.
      spreads.forEach((other, k) =>
        expect(e.board[other.to.row][other.to.col].type === 'cholesterol').toBe(k <= i),
      );
    });
    expect(new Set(spreads.map((e) => key(e.to))).size).toBe(3);
    expect(changedCells(before.board, out.board)).toHaveLength(3);
    expect(out.nextId).toBe(before.nextId + 3);
  });

  it('converts fewer tiles when fewer neighbours are available', () => {
    const out = resolvePlaque(input(['CRW', 'PAR', 'WPA'], { cleanMoves: 0, score: 5000 }));
    expect(spreadEvents(out)).toHaveLength(2);
    expect(countCholesterol(out.board)).toBe(3);
    const one = resolvePlaque(input(['CCC', 'CCW', 'CCC'], { cleanMoves: 0, score: 5000 }));
    expect(spreadEvents(one)).toHaveLength(1);
    expect(one.cleanMoves).toBe(0);
  });

  it('keeps the interval: no spread on the first clean move below 800', () => {
    const out = resolvePlaque(input(OPEN_BOARD, { cleanMoves: 0, score: 700 }));
    expect(out.events).toEqual([]);
    expect(out.cleanMoves).toBe(1);
  });

  it('a move that destroys a block still prevents the spread at any score', () => {
    const out = resolvePlaque(input(OPEN_BOARD, { cleanMoves: 5, destroyed: 1, score: 9000 }));
    expect(out.events).toEqual([]);
    expect(out.cleanMoves).toBe(0);
    expect(countCholesterol(out.board)).toBe(1);
  });

  it('a full board stays unchanged and still resets the clean-move count', () => {
    const out = resolvePlaque(input(['CCC', 'CCC', 'CCC'], { cleanMoves: 1, score: 9000, rngState: 9 }));
    expect(out.events).toEqual([]);
    expect(out.cleanMoves).toBe(0);
    expect(out.rngState).toBe(9);
  });

  it('is deterministic for the same input', () => {
    const a = resolvePlaque(input(OPEN_BOARD, { cleanMoves: 1, score: 4000, rngState: 321 }));
    const b = resolvePlaque(input(OPEN_BOARD, { cleanMoves: 1, score: 4000, rngState: 321 }));
    expect(a).toEqual(b);
  });

  it('a spread can leave the board without a legal move', () => {
    // Row 2 is plaque. The only legal swap is (0,1)-(1,1), which makes 'AAA' in row 1. The burst
    // turns 3 of the 4 tiles of row 1 into blocks, which removes it.
    const grid = ['RAPA', 'AWAR', 'CCCC'];
    const before = stateFromGrid(grid);
    expect(hasLegalMove(before)).toBe(true);
    const out = resolvePlaque(input(grid, { cleanMoves: 0, score: 5000, rngState: 5 }));
    expect(countCholesterol(out.board)).toBe(7);
    expect(hasLegalMove({ ...before, board: out.board })).toBe(false);
  });
});

describe('plaque returns at the current level', () => {
  const BIG = ['RWPAR', 'WPARW', 'PARWP', 'ARWPA', 'RWPAR'];
  const seedEvents = (out: ReturnType<typeof resolvePlaque>) =>
    out.events.flatMap((e) => (e.type === 'plaqueSeeded' ? [e] : []));

  it.each([
    [0, 1],
    [499, 1],
    [500, 2],
    [1199, 2],
    [1200, 3],
    [9000, 3],
  ])('at score %i a reseed places %i block(s), one plaqueSeeded event each', (score, expected) => {
    const out = resolvePlaque(
      input(BIG, { moves: 10, movesWithoutPlaque: 1, score, totalCleared: 3 }),
    );
    const seeds = seedEvents(out);
    expect(seeds).toHaveLength(expected);
    expect(out.events).toHaveLength(expected);
    expect(countCholesterol(out.board)).toBe(expected);
    expect(new Set(seeds.map((e) => `${e.cell.row},${e.cell.col}`)).size).toBe(expected);
    // Each event carries the cumulative board; the last one is the output board.
    expect(seeds.map((e) => countCholesterol(e.board))).toEqual(
      Array.from({ length: expected }, (_, i) => i + 1),
    );
    expect(seeds[expected - 1].board).toBe(out.board);
    expect(out.movesWithoutPlaque).toBe(0);
  });

  it('keeps the spread clock running after a clear: the next clean move spreads', () => {
    // Below 800 points the interval is 2; a reseed after a clear leaves 1 clean move banked.
    const reseed = resolvePlaque(
      input(BIG, { moves: 10, movesWithoutPlaque: 1, score: 300, totalCleared: 2 }),
    );
    expect(reseed.cleanMoves).toBe(spreadInterval(300) - 1);
    const next = resolvePlaque(
      input(gridOf({ ...stateFromGrid(BIG), board: reseed.board }), {
        moves: 11,
        score: 300,
        cleanMoves: reseed.cleanMoves,
        rngState: reseed.rngState,
        nextId: reseed.nextId,
      }),
    );
    expect(next.events.map((e) => e.type)).toEqual(['plaqueSpread']);
    expect(next.cleanMoves).toBe(0);
  });

  it('spreads on the very next clean move at the fast interval too', () => {
    const reseed = resolvePlaque(
      input(BIG, { moves: 10, movesWithoutPlaque: 1, score: 2000, totalCleared: 5 }),
    );
    expect(reseed.cleanMoves).toBe(spreadInterval(2000) - 1);
    expect(reseed.cleanMoves).toBe(0);
  });

  it('the very first seed of a game still gives the player a breather (clock starts at 0)', () => {
    const first = resolvePlaque(input(BIG, { moves: 4, movesWithoutPlaque: 3, score: 0 }));
    expect(seedEvents(first)).toHaveLength(1);
    expect(first.cleanMoves).toBe(0);
    const firstHighScore = resolvePlaque(
      input(BIG, { moves: 4, movesWithoutPlaque: 3, score: 2000, totalCleared: 0 }),
    );
    expect(firstHighScore.cleanMoves).toBe(0);
  });

  it('is deterministic and seedPlaques places distinct blocks', () => {
    const state = stateFromGrid(BIG);
    const a = seedPlaques(state, 11, state.nextId, 3);
    const b = seedPlaques(state, 11, state.nextId, 3);
    expect(a).toEqual(b);
    expect(a?.seeds).toHaveLength(3);
    expect(a && countCholesterol(a.board)).toBe(3);
  });

  it('places as many as it can when the board is nearly full of plaque', () => {
    const state = stateFromGrid(['CCC', 'CCC', 'CCR']);
    const out = seedPlaques(state, 3, state.nextId, 3);
    expect(out?.seeds).toHaveLength(1);
    expect(seedPlaques(stateFromGrid(['CCC', 'CCC', 'CCC']), 3, 1, 2)).toBeNull();
  });
});