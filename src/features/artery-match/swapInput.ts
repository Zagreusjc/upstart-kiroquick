import type { Cell } from './engine';

/** Fraction of a tile the pointer must travel on the dominant axis before a drag swaps. */
export const DRAG_THRESHOLD = 0.4;

/**
 * Neighbour targeted by a drag from `start` by (dx, dy) pixels, or null when the drag
 * is too short or the target is off the board.
 */
export function dragTarget(
  start: Cell,
  dx: number,
  dy: number,
  tileSize: number,
  rows: number,
  cols: number,
): Cell | null {
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const distance = horizontal ? dx : dy;
  if (Math.abs(distance) <= DRAG_THRESHOLD * tileSize) return null;
  const step = Math.sign(distance);
  const target = horizontal
    ? { row: start.row, col: start.col + step }
    : { row: start.row + step, col: start.col };
  if (target.row < 0 || target.row >= rows || target.col < 0 || target.col >= cols) return null;
  return target;
}
