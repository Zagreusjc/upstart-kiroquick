import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Board as BoardGrid, Cell } from './engine';
import { dragTarget } from './swapInput';
import { TileIcon } from './TileIcon';
import { cellKey, TILE_LABELS } from './tileLabels';

interface BoardProps {
  board: BoardGrid;
  selected: Cell | null;
  clearing: ReadonlySet<string>;
  locked: boolean;
  invalid?: boolean;
  onCellTap(cell: Cell): void;
  onDragSwap(a: Cell, b: Cell): void;
}

interface DragState {
  pointerId: number;
  start: Cell;
  x: number;
  y: number;
  /** Width of the pressed tile in px (0 when layout is unavailable). */
  tileSize: number;
  done: boolean;
}

function cellFromTarget(target: EventTarget | null): { cell: Cell; el: HTMLElement } | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest<HTMLElement>('[data-row][data-col]');
  if (!el) return null;
  return { cell: { row: Number(el.dataset.row), col: Number(el.dataset.col) }, el };
}

const ARROW_STEPS: Record<string, Cell> = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },
};

/**
 * The Arteria Match board. Taps (and keyboard Enter/Space) go through onClick; drags are
 * detected on the container with pointer events. Input is ignored while locked.
 * Keyboard: one tab stop (roving tabindex); arrow keys move focus between cells.
 */
export function Board({ board, selected, clearing, locked, invalid, onCellTap, onDragSwap }: BoardProps) {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const [focusCell, setFocusCell] = useState<Cell>({ row: 0, col: 0 });
  const active = {
    row: Math.min(focusCell.row, Math.max(rows - 1, 0)),
    col: Math.min(focusCell.col, Math.max(cols - 1, 0)),
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, cell: Cell) => {
    // A keyboard activation is never the click left over from a drag.
    suppressClickRef.current = false;
    const step = ARROW_STEPS[event.key];
    if (!step) return;
    event.preventDefault();
    const row = Math.min(Math.max(cell.row + step.row, 0), rows - 1);
    const col = Math.min(Math.max(cell.col + step.col, 0), cols - 1);
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-row="${row}"][data-col="${col}"]`)?.focus();
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    suppressClickRef.current = false;
    if (locked) return;
    const hit = cellFromTarget(event.target);
    if (!hit) return;
    dragRef.current = {
      pointerId: event.pointerId,
      start: hit.cell,
      x: event.clientX,
      y: event.clientY,
      tileSize: hit.el.getBoundingClientRect().width,
      done: false,
    };
    // Capture on the pressed button so mouse drags keep reporting and the click stays on it.
    try {
      hit.el.setPointerCapture?.(event.pointerId);
    } catch {
      // Not supported or pointer already released; dragging still works inside the board.
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.done || drag.pointerId !== event.pointerId || locked) return;
    if (cols === 0) return;
    // Real tile size from the pressed tile; fall back to board width / columns.
    const tileSize = drag.tileSize > 0 ? drag.tileSize : (gridRef.current?.getBoundingClientRect().width ?? 0) / cols;
    if (tileSize <= 0) return;
    const target = dragTarget(drag.start, event.clientX - drag.x, event.clientY - drag.y, tileSize, rows, cols);
    if (!target) return;
    drag.done = true;
    suppressClickRef.current = true;
    onDragSwap(drag.start, target);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const handleClick = (cell: Cell) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (locked) return;
    onCellTap(cell);
  };

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Arteria Match board"
      aria-rowcount={rows}
      aria-colcount={cols}
      className={`flex w-full select-none flex-col gap-1 rounded-xl bg-rose-900 p-1 ${invalid ? 'am-shake' : ''}`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {board.map((line, row) => (
        <div
          key={row}
          role="row"
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {line.map((tile, col) => {
            const isSelected = selected?.row === row && selected.col === col;
            const isClearing = clearing.has(cellKey({ row, col }));
            return (
              <div key={col} role="gridcell" className="aspect-square">
                <button
                  type="button"
                  data-row={row}
                  data-col={col}
                  aria-label={`${TILE_LABELS[tile.type]}, row ${row + 1}, column ${col + 1}`}
                  aria-pressed={isSelected ? true : undefined}
                  aria-disabled={locked || undefined}
                  tabIndex={active.row === row && active.col === col ? 0 : -1}
                  onFocus={() => setFocusCell({ row, col })}
                  onKeyDown={(event) => handleKeyDown(event, { row, col })}
                  onClick={() => handleClick({ row, col })}
                  className={`block h-full w-full rounded-lg p-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700 focus-visible:ring-inset ${
                    isSelected ? 'scale-95 bg-amber-200 ring-4 ring-amber-700 ring-inset' : 'bg-rose-50'
                  }`}
                >
                  <span key={tile.id} className={`am-tile am-drop ${isClearing ? 'am-clearing' : ''}`}>
                    <TileIcon type={tile.type} />
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
