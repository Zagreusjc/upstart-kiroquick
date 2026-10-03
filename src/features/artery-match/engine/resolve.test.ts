import { describe, it, expect } from 'vitest';
import { trySwapWith } from './game';
import { applyGravity } from './resolve';
import { gridOf, scriptedRefill, stateFromGrid } from './test-helpers';
import type { GameEvent, SwapResult, Tile, TileType } from './types';

function expectOk(result: SwapResult) {
  if (!result.ok) throw new Error(`expected ok, got ${result.reason}`);
  return result;
}

const types = (letters: string): TileType[] =>
  [...letters].map(
    (l) =>
      ({ R: 'rbc', W: 'wbc', P: 'platelet', A: 'plasma', C: 'cholesterol' })[l] as TileType,
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

describe('resolve: gravity and refill', () => {
  it('drops tiles (including cholesterol) into holes and refills every hole', () => {
    const state = stateFromGrid(['CWP', 'APW', 'RWA', 'RAP', 'WRW']);
    const cholesterolId = state.board[0][0].id;
    const { state: next, events } = expectOk(
      trySwapWith(state, { row: 4, col: 0 }, { row: 4, col: 1 }, scriptedRefill(types('RAP'))),
    );
    const [fall] = ofType(events, 'fall');
    expect(fall.moves).toContainEqual({
      id: cholesterolId,
      from: { row: 0, col: 0 },
      to: { row: 3, col: 0 },
    });
    const [refill] = ofType(events, 'refill');
    expect(refill.spawned).toHaveLength(3);
    expect(refill.spawned.map((s) => s.cell)).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
    ]);
    expect(gridOf(next)).toEqual(['RWP', 'APW', 'PWA', 'CAP', 'AWW']);
    expect(next.board[3][0].id).toBe(cholesterolId);
    // Fresh ids start at nextId.
    expect(refill.spawned.map((s) => s.id)).toEqual([16, 17, 18]);
    expect(next.nextId).toBe(19);
    expect(refill.board).toBe(next.board);
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
