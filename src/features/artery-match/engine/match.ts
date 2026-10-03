import type { Board, Cell, NormalTileType, TileType } from './types';

export interface MatchRun {
  cells: Cell[];
  type: NormalTileType;
  direction: 'row' | 'col';
}

function isNormal(type: TileType): type is NormalTileType {
  return type !== 'cholesterol';
}

/** Runs of 3 or more equal normal tiles, rows first, then columns. Cholesterol never matches. */
export function findMatches(board: Board): MatchRun[] {
  const runs: MatchRun[] = [];
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;

  for (let r = 0; r < rows; r++) {
    let start = 0;
    for (let c = 1; c <= cols; c++) {
      const startType = board[r][start].type;
      if (c < cols && board[r][c].type === startType) continue;
      if (c - start >= 3 && isNormal(startType)) {
        const cells: Cell[] = [];
        for (let k = start; k < c; k++) cells.push({ row: r, col: k });
        runs.push({ cells, type: startType, direction: 'row' });
      }
      start = c;
    }
  }

  for (let c = 0; c < cols; c++) {
    let start = 0;
    for (let r = 1; r <= rows; r++) {
      const startType = board[start][c].type;
      if (r < rows && board[r][c].type === startType) continue;
      if (r - start >= 3 && isNormal(startType)) {
        const cells: Cell[] = [];
        for (let k = start; k < r; k++) cells.push({ row: k, col: c });
        runs.push({ cells, type: startType, direction: 'col' });
      }
      start = r;
    }
  }

  return runs;
}

/** Union of all matched cells, each once, in row-major order. */
export function matchedCells(board: Board): Cell[] {
  const cols = board.length > 0 ? board[0].length : 0;
  const keys = new Set<number>();
  for (const run of findMatches(board)) {
    for (const cell of run.cells) keys.add(cell.row * cols + cell.col);
  }
  return [...keys]
    .sort((x, y) => x - y)
    .map((k) => ({ row: Math.floor(k / cols), col: k % cols }));
}
