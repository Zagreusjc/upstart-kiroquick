import { describe, it, expect } from 'vitest';
import { hasLegalMove } from './legal';
import {
  countCholesterol,
  resolvePlaque,
  seedPlaque,
  spreadInterval,
  spreadPlaque,
} from './plaque';
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
  it('is 2 below 2000 points and 1 from 2000 points', () => {
    expect(spreadInterval(0)).toBe(2);
    expect(spreadInterval(1999)).toBe(2);
    expect(spreadInterval(2000)).toBe(1);
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

describe('spreadPlaque', () => {
  it('converts the only normal orthogonal neighbour', () => {
    const { board } = stateFromGrid(['CCW', 'CCC', 'CCC']);
    for (let rngState = 1; rngState <= 20; rngState++) {
      const spread = spreadPlaque(board, rngState, 200);
      expect(spread).not.toBeNull();
      if (!spread) continue;
      expect(spread.to).toEqual({ row: 0, col: 2 });
      expect([
        { row: 0, col: 1 },
        { row: 1, col: 2 },
      ]).toContainEqual(spread.from);
      expect(countCholesterol(spread.board)).toBe(9);
      expect(spread.board[0][2]).toEqual({ id: 200, type: 'cholesterol' });
      expect(spread.nextId).toBe(201);
    }
  });

  it('only spreads to orthogonal neighbours, never diagonals', () => {
    const { board } = stateFromGrid(['RWPAR', 'PARWP', 'WRCAW', 'APWRA', 'RWAPR']);
    const orthogonal = [
      { row: 1, col: 2 },
      { row: 2, col: 3 },
      { row: 3, col: 2 },
      { row: 2, col: 1 },
    ];
    const seen = new Set<string>();
    for (let rngState = 1; rngState <= 50; rngState++) {
      const spread = spreadPlaque(board, rngState, 100);
      expect(spread).not.toBeNull();
      if (!spread) continue;
      const changed = changedCells(board, spread.board);
      expect(changed).toHaveLength(1);
      expect(orthogonal).toContainEqual(changed[0]);
      expect(changed[0]).toEqual(spread.to);
      expect(spread.from).toEqual({ row: 2, col: 2 });
      expect(board[spread.to.row][spread.to.col].type).not.toBe('cholesterol');
      seen.add(`${spread.to.row},${spread.to.col}`);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('does nothing when no block has a normal neighbour', () => {
    const { board } = stateFromGrid(['CCC', 'CCC', 'CCC']);
    expect(spreadPlaque(board, 9, 100)).toBeNull();
    const out = resolvePlaque(input(['CCC', 'CCC', 'CCC'], { cleanMoves: 1, rngState: 9 }));
    expect(out.event).toBeNull();
    expect(gridOf(out.board)).toEqual(['CCC', 'CCC', 'CCC']);
    expect(out.cleanMoves).toBe(0);
    expect(out.rngState).toBe(9);
  });
});

describe('resolvePlaque: seeding', () => {
  it('does not seed during the 3-move grace period', () => {
    const out = resolvePlaque(input(PLAYABLE, { moves: 3, movesWithoutPlaque: 2 }));
    expect(out.event).toBeNull();
    expect(countCholesterol(out.board)).toBe(0);
    expect(out.movesWithoutPlaque).toBe(3);
  });

  it('seeds the first block at the end of move 4 on a plaque-free board', () => {
    const out = resolvePlaque(input(PLAYABLE, { moves: 4, movesWithoutPlaque: 3 }));
    expect(out.event?.type).toBe('plaqueSeeded');
    expect(countCholesterol(out.board)).toBe(1);
    expect(out.movesWithoutPlaque).toBe(0);
    expect(out.cleanMoves).toBe(0);
    if (out.event?.type !== 'plaqueSeeded') return;
    expect(out.board[out.event.cell.row][out.event.cell.col].type).toBe('cholesterol');
    expect(out.event.board).toBe(out.board);
  });

  it('re-seeds on the 2nd plaque-free move after the last block is cleared', () => {
    const clearingMove = resolvePlaque(input(PLAYABLE, { movesWithoutPlaque: 0, destroyed: 1 }));
    expect(clearingMove.event).toBeNull();
    expect(clearingMove.movesWithoutPlaque).toBe(1);

    const next = resolvePlaque(input(PLAYABLE, { moves: 11, movesWithoutPlaque: 1 }));
    expect(next.event?.type).toBe('plaqueSeeded');
    expect(countCholesterol(next.board)).toBe(1);
    expect(next.movesWithoutPlaque).toBe(0);
  });
});

describe('resolvePlaque: spreading', () => {
  it('spreads after 2 clean moves while the score is below 2000', () => {
    const first = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 0 }));
    expect(first.event).toBeNull();
    expect(first.cleanMoves).toBe(1);
    expect(first.movesWithoutPlaque).toBe(0);

    const second = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 1 }));
    expect(second.event?.type).toBe('plaqueSpread');
    expect(countCholesterol(second.board)).toBe(2);
    expect(second.cleanMoves).toBe(0);
  });

  it('spreads after every clean move from 2000 points', () => {
    const out = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 0, score: 2000 }));
    expect(out.event?.type).toBe('plaqueSpread');
    expect(out.cleanMoves).toBe(0);
  });

  it('a move that destroys a block resets cleanMoves and prevents spread', () => {
    const out = resolvePlaque(input(ONE_BLOCK, { cleanMoves: 1, destroyed: 1 }));
    expect(out.event).toBeNull();
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
