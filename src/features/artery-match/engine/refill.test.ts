import { describe, it, expect } from 'vitest';
import { createGame, trySwap } from './game';
import { findMatches } from './match';
import { matchingTypesAt, rngRefill } from './resolve';
import { stateFromGrid } from './test-helpers';
import type { Cell, GameState, NormalTileType, Tile } from './types';

const tileAtOf = (rows: (Tile | null)[][]) => (r: number, c: number) => rows[r]?.[c] ?? null;
const T = (id: number, type: Tile['type']): Tile => ({ id, type });

describe('matchingTypesAt', () => {
  it('flags the type that would complete a line of 3 in each of the six positions', () => {
    const board: (Tile | null)[][] = [
      [T(1, 'rbc'), T(2, 'rbc'), null, T(3, 'wbc'), T(4, 'wbc')], // left pair rbc, right pair wbc
      [null, null, null, null, null],
    ];
    // (0,2) sits between rbc,rbc on the left and wbc,wbc on the right.
    expect([...matchingTypesAt(tileAtOf(board), 0, 2)].sort()).toEqual(['rbc', 'wbc']);
  });

  it('flags the type when the new tile sits between two equal neighbours', () => {
    const board: (Tile | null)[][] = [[T(1, 'plasma'), null, T(2, 'plasma')]];
    expect([...matchingTypesAt(tileAtOf(board), 0, 1)]).toEqual(['plasma']);
  });

  it('checks vertical lines and ignores empty cells and cholesterol', () => {
    const board: (Tile | null)[][] = [
      [T(1, 'platelet')],
      [T(2, 'platelet')],
      [null],
      [T(3, 'cholesterol')],
      [T(4, 'cholesterol')],
    ];
    expect([...matchingTypesAt(tileAtOf(board), 2, 0)]).toEqual(['platelet']);
    expect(matchingTypesAt(tileAtOf([[T(1, 'rbc'), null, T(2, 'wbc')]]), 0, 1).size).toBe(0);
  });
});

describe('rngRefill with avoid', () => {
  it('never returns an avoided type and is deterministic', () => {
    const avoid = new Set<NormalTileType>(['rbc', 'wbc']);
    const a = rngRefill(99);
    const b = rngRefill(99);
    for (let i = 0; i < 200; i++) {
      const t = a.next(avoid);
      expect(['platelet', 'plasma']).toContain(t);
      expect(b.next(avoid)).toBe(t);
    }
    expect(a.state()).toBe(b.state());
  });

  it('allows every type again when all four are avoided, and draws once per tile either way', () => {
    const all = new Set<NormalTileType>(['rbc', 'wbc', 'platelet', 'plasma']);
    const a = rngRefill(5);
    const b = rngRefill(5);
    expect(['rbc', 'wbc', 'platelet', 'plasma']).toContain(a.next(all));
    b.next();
    expect(a.state()).toBe(b.state());
  });
});

function legalMoves(state: GameState): [Cell, Cell][] {
  const out: [Cell, Cell][] = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const a = { row: r, col: c };
        const b = { row: r + dr, col: c + dc };
        if (b.row < state.rows && b.col < state.cols && trySwap(state, a, b).ok) out.push([a, b]);
      }
    }
  }
  return out;
}

describe('refill does not chain by luck', () => {
  it('a refill into an otherwise stable board never adds a match (a single match clearing a full row)', () => {
    // Clearing the top row drops nothing, so every new tile is a pure refill. Across many
    // seeds none of them may complete a line, which means the move ends after wave 1.
    for (let seed = 1; seed <= 100; seed++) {
      const state = stateFromGrid(['RRWR', 'WPAP', 'PAWA', 'AWPW'], { rngState: seed });
      const res = trySwap(state, { row: 0, col: 2 }, { row: 0, col: 3 });
      if (!res.ok) throw new Error(res.reason);
      expect(res.events.filter((e) => e.type === 'match')).toHaveLength(1);
      expect(findMatches(res.state.board)).toEqual([]);
    }
  });

  it('plays whole games on the default 5x5 board and always leaves a stable board', () => {
    expect(createGame(1).rows).toBe(5);
    for (let seed = 1; seed <= 30; seed++) {
      let state = createGame(seed);
      for (let m = 0; m < 25 && !state.over; m++) {
        const moves = legalMoves(state);
        if (moves.length === 0) break;
        const [a, b] = moves[(seed * 31 + m * 17) % moves.length];
        const res = trySwap(state, a, b);
        if (!res.ok) throw new Error(res.reason);
        state = res.state;
        expect(findMatches(state.board)).toEqual([]);
      }
    }
  });
});
