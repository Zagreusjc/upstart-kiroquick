import { describe, it, expect } from 'vitest';
import { findMatches, matchedCells } from './match';
import { gridOf, stateFromGrid } from './test-helpers';

const board = (rows: string[]) => stateFromGrid(rows).board;

describe('findMatches', () => {
  it('finds a horizontal run of 3', () => {
    const runs = findMatches(board(['RRRW', 'WPAP', 'PAWA']));
    expect(runs).toEqual([
      {
        type: 'rbc',
        direction: 'row',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      },
    ]);
  });

  it('finds a vertical run of 3', () => {
    const runs = findMatches(board(['RWP', 'RPA', 'RAW']));
    expect(runs).toHaveLength(1);
    expect(runs[0].direction).toBe('col');
    expect(runs[0].cells).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
    ]);
  });

  it('counts a run of 4 and of 5 as a single run', () => {
    const four = findMatches(board(['RRRRW', 'WPAWP']));
    expect(four).toHaveLength(1);
    expect(four[0].cells).toHaveLength(4);

    const five = findMatches(board(['RRRRR', 'WPAWP']));
    expect(five).toHaveLength(1);
    expect(five[0].cells).toHaveLength(5);
  });

  it('never matches cholesterol blocks', () => {
    expect(findMatches(board(['CCCW', 'CRWP', 'CWPA']))).toEqual([]);
  });

  it('finds two separate runs', () => {
    const runs = findMatches(board(['RRRW', 'WPAP', 'AWWW']));
    expect(runs).toHaveLength(2);
    expect(runs.map((r) => r.type).sort()).toEqual(['rbc', 'wbc']);
  });
});

describe('matchedCells', () => {
  it('counts the shared cell of an L shape once', () => {
    const cells = matchedCells(board(['RWP', 'RPA', 'RRR']));
    expect(cells).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ]);
  });

  it('counts the shared cell of a T shape once', () => {
    const cells = matchedCells(board(['RRR', 'WRP', 'ARW']));
    expect(cells).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
    ]);
  });

  it('is empty when nothing matches', () => {
    expect(matchedCells(board(['RWP', 'WPA', 'PAR']))).toEqual([]);
  });
});

describe('test helpers', () => {
  it('round-trips a grid through stateFromGrid and gridOf', () => {
    const grid = ['RWPA', 'CAWR', 'PRCW'];
    const state = stateFromGrid(grid);
    expect(gridOf(state)).toEqual(grid);
    expect(gridOf(state.board)).toEqual(grid);
    expect(state.rows).toBe(3);
    expect(state.cols).toBe(4);
    expect(state.board[0][0].id).toBe(1);
    expect(state.board[2][3].id).toBe(12);
    expect(state.nextId).toBe(13);
  });
});
