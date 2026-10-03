import { describe, expect, it } from 'vitest';
import { ARTERY, VEIN, babuArt } from './art';
import type { Mood } from './constants';

const MOODS: Mood[] = ['happy', 'ok', 'tired', 'rest'];

describe('babuArt', () => {
  it('gives every mood its own face (color is not the only signal)', () => {
    const faces = MOODS.map((mood) => {
      const { eyes, mouth } = babuArt(mood);
      return `${eyes}/${mouth}`;
    });
    expect(new Set(faces).size).toBe(MOODS.length);
  });

  it('is deterministic and cached', () => {
    expect(babuArt('happy')).toBe(babuArt('happy'));
  });

  it('only shows the sleeping Z in Rest Mode', () => {
    for (const mood of MOODS) expect(babuArt(mood).sleepingZ).toBe(mood === 'rest');
  });

  it('only shakes with excitement when happy, and only sweats when tired', () => {
    for (const mood of MOODS) {
      expect(babuArt(mood).shakeLines).toBe(mood === 'happy');
      expect(babuArt(mood).sweat).toBe(mood === 'tired');
    }
  });

  it('keeps blue veins and a red aorta', () => {
    expect(VEIN.base).toBe('#5aa7e0');
    expect(ARTERY.base).toBe('#e9564c');
  });
});
