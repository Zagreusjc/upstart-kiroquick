import { describe, expect, it } from 'vitest';
import type { Mood } from './constants';
import { babuSprite, SPRITE_HEADROOM, SPRITE_HEIGHT, SPRITE_WIDTH, type PixelRun } from './sprite';

const MOODS: Mood[] = ['happy', 'ok', 'tired', 'rest'];

function pixelSet(runs: PixelRun[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const { x, y, w, color } of runs) {
    for (let i = 0; i < w; i++) map.set(`${x + i},${y}`, color);
  }
  return map;
}

describe('babuSprite', () => {
  it('keeps the heart inside the grid and the z inside the headroom', () => {
    for (const mood of MOODS) {
      const { heart, shadow, z } = babuSprite(mood);
      for (const { x, y, w } of [...heart, ...shadow]) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x + w).toBeLessThanOrEqual(SPRITE_WIDTH);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThan(SPRITE_HEIGHT);
      }
      for (const { x, y, w } of z) {
        expect(x + w).toBeLessThanOrEqual(SPRITE_WIDTH);
        expect(y).toBeGreaterThanOrEqual(-SPRITE_HEADROOM);
        expect(y).toBeLessThan(0);
      }
    }
  });

  it('draws a different face for every mood (color is not the only signal)', () => {
    const faces = MOODS.map((mood) => {
      const pixels = pixelSet(babuSprite(mood).heart);
      // Face area only, ink pixels only, so body color differences do not count.
      return [...pixels]
        .filter(([key, color]) => {
          const [x, y] = key.split(',').map(Number);
          return color === '#4c0519' && x >= 5 && x <= 18 && y >= 12 && y <= 18;
        })
        .map(([key]) => key)
        .sort()
        .join(' ');
    });
    expect(new Set(faces).size).toBe(MOODS.length);
  });

  it('is deterministic and cached', () => {
    expect(babuSprite('happy')).toBe(babuSprite('happy'));
  });

  it('only shows the sleeping z in Rest Mode', () => {
    expect(babuSprite('rest').z.length).toBeGreaterThan(0);
    expect(babuSprite('happy').z).toEqual([]);
  });

  it('has the vessels on top: veins in blue and the aorta in red', () => {
    const colors = new Set(babuSprite('ok').heart.filter((r) => r.y <= 4).map((r) => r.color));
    expect(colors).toContain('#3b82f6');
    expect(colors).toContain('#ef4444');
  });
});
