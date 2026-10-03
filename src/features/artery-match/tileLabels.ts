import type { Cell, TileType } from './engine';

/** Accessible names for each tile kind (screen readers never rely on colour or shape). */
export const TILE_LABELS: Record<TileType, string> = {
  rbc: 'Red blood cell',
  wbc: 'White blood cell',
  platelet: 'Platelet',
  plasma: 'Plasma',
  cholesterol: 'Cholesterol block (cannot be moved)',
};

/** Stable string key for a board cell, used for the clearing set. */
export function cellKey(cell: Cell): string {
  return `${cell.row}:${cell.col}`;
}
