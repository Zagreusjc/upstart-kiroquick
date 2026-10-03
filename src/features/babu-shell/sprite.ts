import type { Mood } from './constants';

/**
 * Babu as an 8-bit sprite: a cute anatomical heart (body, aortic arch, veins)
 * built on a 24 x 26 pixel grid. Pure and deterministic, so the same mood
 * always draws the same pixels. Rendered by `components/BabuHeart.tsx`.
 */

export const SPRITE_WIDTH = 24;
export const SPRITE_HEIGHT = 26;
/**
 * Headroom above row 0 (negative y). It keeps the beat's scale-up from
 * clipping the arch, and gives the sleeping "z" a clear spot above it.
 */
export const SPRITE_HEADROOM = 4;

/** One horizontal run of same-colored pixels. */
export interface PixelRun {
  x: number;
  y: number;
  w: number;
  color: string;
}

export interface Sprite {
  /** Body, vessels, outline and face. This group beats. */
  heart: PixelRun[];
  /** Ground shadow under the apex. Stays still. */
  shadow: PixelRun[];
  /** Sleeping "z" (Rest Mode only). */
  z: PixelRun[];
}

const INK = '#4c0519';
const ARTERY = { base: '#ef4444', light: '#fca5a5' };
const VEIN = { base: '#3b82f6', light: '#93c5fd' };
const SHADOW = 'rgba(76, 5, 25, 0.18)';

const BODY: Record<Mood, { base: string; light: string; shade: string; cheek: string }> = {
  happy: { base: '#f43f5e', light: '#fda4af', shade: '#be123c', cheek: '#fecdd3' },
  ok: { base: '#fb7185', light: '#fecdd3', shade: '#e11d48', cheek: '#ffe4e6' },
  tired: { base: '#fda4af', light: '#ffe4e6', shade: '#f43f5e', cheek: '#fff1f2' },
  rest: { base: '#c4b5fd', light: '#ede9fe', shade: '#8b5cf6', cheek: '#f5f3ff' },
};

type Part = 'body' | 'artery' | 'vein' | 'ink';

/** Rounded body that tapers to an apex pointing slightly left, like a real heart. */
function isBody(x: number, y: number): boolean {
  const cx = x + 0.5;
  const cy = y + 0.5;
  if (((cx - 12) / 8.5) ** 2 + ((cy - 13) / 7) ** 2 <= 1) return true;
  if (cy < 13 || cy > 23.5) return false;
  const t = (cy - 13) / 10.5;
  const center = 12 - 2.5 * t;
  return Math.abs(cx - center) <= 8.5 * (1 - t) ** 0.85;
}

/** Vessels poking out of the top: a vein on the left, the aortic arch, a small vein on the right. */
function vesselAt(x: number, y: number): Part | null {
  if (x >= 4 && x <= 6 && y >= 2 && y <= 8) return 'vein';
  if (x >= 20 && x <= 21 && y >= 9 && y <= 10) return 'vein';
  const trunk = x >= 10 && x <= 12 && y >= 1 && y <= 7;
  const arch = x >= 10 && x <= 18 && y >= 1 && y <= 3;
  const descending = x >= 16 && x <= 18 && y >= 1 && y <= 6;
  const roundedCorner = (x === 10 || x === 18) && y === 1;
  return (trunk || arch || descending) && !roundedCorner ? 'artery' : null;
}

const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

function buildBaseGrid(): (Part | null)[][] {
  const fill: (Part | null)[][] = [];
  for (let y = 0; y < SPRITE_HEIGHT; y++) {
    const row: (Part | null)[] = [];
    for (let x = 0; x < SPRITE_WIDTH; x++) row.push(isBody(x, y) ? 'body' : vesselAt(x, y));
    fill.push(row);
  }

  const at = (x: number, y: number) => fill[y]?.[x] ?? null;
  const grid = fill.map((row) => [...row]);
  for (let y = 0; y < SPRITE_HEIGHT; y++) {
    for (let x = 0; x < SPRITE_WIDTH; x++) {
      const cell = fill[y][x];
      const touches = (pred: (p: Part | null) => boolean) =>
        NEIGHBOURS.some(([dx, dy]) => pred(at(x + dx, y + dy)));
      // A dark line where a vessel joins the body, and a 1px outline around everything.
      if ((cell === 'artery' || cell === 'vein') && touches((p) => p === 'body')) grid[y][x] = 'ink';
      if (cell === null && touches((p) => p !== null)) grid[y][x] = 'ink';
    }
  }
  return grid;
}

const BASE = buildBaseGrid();

/** Face pixels per mood: k = ink, w = white shine, c = cheek. Mirrored pairs use x and 23 - x. */
const FACES: Record<Mood, [x: number, y: number, kind: 'k' | 'w' | 'c'][]> = {
  happy: [
    [7, 14, 'k'], [8, 13, 'k'], [9, 14, 'k'],
    [14, 14, 'k'], [15, 13, 'k'], [16, 14, 'k'],
    [9, 16, 'k'], [10, 17, 'k'], [11, 17, 'k'], [12, 17, 'k'], [13, 17, 'k'], [14, 16, 'k'],
    [5, 16, 'c'], [6, 16, 'c'], [17, 16, 'c'], [18, 16, 'c'],
  ],
  ok: [
    [8, 13, 'w'], [9, 13, 'k'], [8, 14, 'k'], [9, 14, 'k'],
    [14, 13, 'w'], [15, 13, 'k'], [14, 14, 'k'], [15, 14, 'k'],
    [10, 16, 'k'], [11, 17, 'k'], [12, 17, 'k'], [13, 16, 'k'],
    [6, 16, 'c'], [17, 16, 'c'],
  ],
  tired: [
    [7, 13, 'k'], [8, 13, 'k'], [9, 13, 'k'], [8, 14, 'k'], [9, 14, 'k'],
    [14, 13, 'k'], [15, 13, 'k'], [16, 13, 'k'], [14, 14, 'k'], [15, 14, 'k'],
    [10, 17, 'k'], [11, 17, 'k'], [12, 17, 'k'], [13, 17, 'k'],
  ],
  rest: [
    [7, 13, 'k'], [8, 14, 'k'], [9, 14, 'k'], [10, 13, 'k'],
    [13, 13, 'k'], [14, 14, 'k'], [15, 14, 'k'], [16, 13, 'k'],
    [11, 17, 'k'], [12, 17, 'k'],
    [6, 16, 'c'], [17, 16, 'c'],
  ],
};

const Z_GLYPH = ['####', '..#.', '.#..', '####'];

/** Merge each row into runs of the same color. */
function toRuns(colors: (string | null)[][], offsetX = 0, offsetY = 0): PixelRun[] {
  const runs: PixelRun[] = [];
  colors.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const color = row[x];
      if (color === null) {
        x++;
        continue;
      }
      let w = 1;
      while (row[x + w] === color) w++;
      runs.push({ x: x + offsetX, y: y + offsetY, w, color });
      x += w;
    }
  });
  return runs;
}

function paint(mood: Mood): Sprite {
  const palette = BODY[mood];
  const part = (x: number, y: number) => BASE[y]?.[x] ?? null;

  const colors = BASE.map((row, y) =>
    row.map((cell, x): string | null => {
      switch (cell) {
        case null:
          return null;
        case 'ink':
          return INK;
        case 'artery':
        case 'vein': {
          const tone = cell === 'artery' ? ARTERY : VEIN;
          return part(x - 1, y) !== cell ? tone.light : tone.base;
        }
        case 'body': {
          const shine = ((x + 0.5 - 8) / 2.2) ** 2 + ((y + 0.5 - 9.8) / 1.4) ** 2 <= 1;
          if (shine) return palette.light;
          if (part(x + 1, y) !== 'body' || part(x, y + 1) !== 'body') return palette.shade;
          return palette.base;
        }
      }
    }),
  );

  for (const [x, y, kind] of FACES[mood]) {
    colors[y][x] = kind === 'k' ? INK : kind === 'w' ? '#ffffff' : palette.cheek;
  }

  const shadowRow: (string | null)[] = Array.from({ length: SPRITE_WIDTH }, (_, x) =>
    x >= 6 && x <= 15 ? SHADOW : null,
  );

  return {
    heart: toRuns(colors),
    shadow: toRuns([shadowRow], 0, SPRITE_HEIGHT - 1),
    z:
      mood === 'rest'
        ? toRuns(Z_GLYPH.map((r) => [...r].map((c) => (c === '#' ? INK : null))), 19, -SPRITE_HEADROOM)
        : [],
  };
}

const cache = new Map<Mood, Sprite>();

/** The sprite for a mood (computed once, then cached). */
export function babuSprite(mood: Mood): Sprite {
  let sprite = cache.get(mood);
  if (!sprite) {
    sprite = paint(mood);
    cache.set(mood, sprite);
  }
  return sprite;
}
