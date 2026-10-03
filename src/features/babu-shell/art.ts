import type { Mood } from './constants';

/**
 * Baboo's cartoon art direction: a chunky, outlined anatomical heart with
 * blue veins, a red aortic arch, lavender atria, big sparkly eyes and rosy
 * cheeks. Original artwork drawn in SVG by `components/BabuHeart.tsx`.
 *
 * This module is pure: it only decides *what* each mood shows, so the rules
 * are testable without rendering. Every mood has its own face, so color is
 * never the only signal.
 */

export type Eyes = 'sparkle' | 'soft' | 'droopy' | 'closed';
export type Mouth = 'open-smile' | 'smile' | 'wavy' | 'sleepy';

export interface BodyPalette {
  base: string;
  light: string;
  shade: string;
  cheek: string;
}

export interface BabuArt {
  body: BodyPalette;
  eyes: Eyes;
  mouth: Mouth;
  /** Little excitement strokes around Baboo. */
  shakeLines: boolean;
  /** A small sweat drop when tired. */
  sweat: boolean;
  /** Floating "Z z" in Rest Mode. */
  sleepingZ: boolean;
}

/** Shared ink and vessel colors (the same in every mood). */
export const INK = '#7a2430';
export const VEIN = { base: '#5aa7e0', shade: '#3b7fc0', light: '#9fd0f2', opening: '#2d5f94' } as const;
export const ARTERY = { base: '#e9564c', shade: '#c63d3b', light: '#f7907f' } as const;
export const ATRIUM = { base: '#a993d8', shade: '#8a72c2', light: '#cbbdf0' } as const;
export const MOUTH_FILL = '#7a2430';
export const TONGUE = '#f48c93';
export const SHADOW = 'rgba(122, 36, 48, 0.16)';

const BODY: Record<Mood, BodyPalette> = {
  happy: { base: '#e9564c', light: '#f4846f', shade: '#c63d3b', cheek: '#f8a1a6' },
  ok: { base: '#e9564c', light: '#f4846f', shade: '#c63d3b', cheek: '#f8b4b7' },
  tired: { base: '#e07a70', light: '#eea293', shade: '#c05e57', cheek: '#f6c2c2' },
  rest: { base: '#d9909b', light: '#ebb5bd', shade: '#b56c79', cheek: '#f3cdd3' },
};

const ART: Record<Mood, Omit<BabuArt, 'body'>> = {
  happy: { eyes: 'sparkle', mouth: 'open-smile', shakeLines: true, sweat: false, sleepingZ: false },
  ok: { eyes: 'soft', mouth: 'smile', shakeLines: false, sweat: false, sleepingZ: false },
  tired: { eyes: 'droopy', mouth: 'wavy', shakeLines: false, sweat: true, sleepingZ: false },
  rest: { eyes: 'closed', mouth: 'sleepy', shakeLines: false, sweat: false, sleepingZ: true },
};

const cache = new Map<Mood, BabuArt>();

/** The art for a mood (computed once, then cached). */
export function babuArt(mood: Mood): BabuArt {
  let art = cache.get(mood);
  if (!art) {
    art = { body: BODY[mood], ...ART[mood] };
    cache.set(mood, art);
  }
  return art;
}
