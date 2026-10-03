import { describe, it, expect } from 'vitest';
import { createGame } from './game';
import { hasLegalMove } from './legal';
import { findMatches } from './match';

describe('createGame (new game)', () => {
  it('builds a 6x6 start board with no matches, no cholesterol and a legal move (seeds 1..200)', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const game = createGame(seed);
      expect(game.rows).toBe(6);
      expect(game.cols).toBe(6);
      expect(game.board).toHaveLength(6);
      for (const row of game.board) {
        expect(row).toHaveLength(6);
        for (const tile of row) expect(tile.type).not.toBe('cholesterol');
      }
      expect(findMatches(game.board)).toEqual([]);
      expect(hasLegalMove(game)).toBe(true);
      expect(game.score).toBe(0);
      expect(game.moves).toBe(0);
      expect(game.cleanMoves).toBe(0);
      expect(game.movesWithoutPlaque).toBe(0);
      expect(game.over).toBe(false);
    }
  });

  it('gives deep-equal games for the same seed', () => {
    expect(createGame(42)).toEqual(createGame(42));
  });

  it('gives every tile a unique id', () => {
    const game = createGame(3);
    const ids = game.board.flat().map((t) => t.id);
    expect(new Set(ids).size).toBe(36);
    expect(game.nextId).toBeGreaterThan(Math.max(...ids));
  });

  it('honours custom dimensions', () => {
    const game = createGame(5, { rows: 5, cols: 6 });
    expect(game.rows).toBe(5);
    expect(game.cols).toBe(6);
    expect(game.board).toHaveLength(5);
    for (const row of game.board) expect(row).toHaveLength(6);
    expect(findMatches(game.board)).toEqual([]);

    const big = createGame(5, { rows: 8, cols: 8 });
    expect(big.board).toHaveLength(8);
    for (const row of big.board) expect(row).toHaveLength(8);
    expect(hasLegalMove(big)).toBe(true);
  });
});
