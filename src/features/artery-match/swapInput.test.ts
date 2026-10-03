import { describe, it, expect } from 'vitest';
import { dragTarget } from './swapInput';

const TILE = 40;
const start = { row: 3, col: 3 };

describe('dragTarget', () => {
  it('ignores a drag below 0.4 of a tile', () => {
    expect(dragTarget(start, 0.39 * TILE, 0, TILE, 8, 8)).toBeNull();
    expect(dragTarget(start, 0, -0.39 * TILE, TILE, 8, 8)).toBeNull();
  });

  it('targets the right neighbour past the threshold', () => {
    expect(dragTarget(start, 0.41 * TILE, 0, TILE, 8, 8)).toEqual({ row: 3, col: 4 });
  });

  it('targets the cell above for an upward drag', () => {
    expect(dragTarget(start, 0, -0.41 * TILE, TILE, 8, 8)).toEqual({ row: 2, col: 3 });
  });

  it('targets left and down', () => {
    expect(dragTarget(start, -0.5 * TILE, 0, TILE, 8, 8)).toEqual({ row: 3, col: 2 });
    expect(dragTarget(start, 0, 0.5 * TILE, TILE, 8, 8)).toEqual({ row: 4, col: 3 });
  });

  it('uses the dominant axis', () => {
    expect(dragTarget(start, 0.45 * TILE, 0.6 * TILE, TILE, 8, 8)).toEqual({ row: 4, col: 3 });
  });

  it('returns null when the target is off the board', () => {
    expect(dragTarget({ row: 0, col: 0 }, -0.41 * TILE, 0, TILE, 8, 8)).toBeNull();
    expect(dragTarget({ row: 0, col: 0 }, 0, -0.41 * TILE, TILE, 8, 8)).toBeNull();
    expect(dragTarget({ row: 7, col: 7 }, 0.41 * TILE, 0, TILE, 8, 8)).toBeNull();
  });
});
