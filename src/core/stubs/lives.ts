import type { LivesProvider } from '../contracts';
import { loadJSON, saveJSON } from '../storage';

export const MAX_LIVES = 3;

const STORAGE_KEY = 'inlababu.stub.lives.v1';

interface LivesState {
  lives: number;
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return MAX_LIVES;
  return Math.min(MAX_LIVES, Math.max(0, Math.floor(value)));
}

/**
 * Stand-in lives provider so every feature runs on its own.
 * Prime's `economy-library` feature registers the real one.
 */
export function createLivesStub(storageKey: string = STORAGE_KEY): LivesProvider {
  const saved = loadJSON<LivesState>(storageKey, { lives: MAX_LIVES });
  let lives = clamp(saved.lives);
  const listeners = new Set<() => void>();

  const commit = (next: number) => {
    lives = clamp(next);
    saveJSON(storageKey, { lives });
    listeners.forEach((listener) => listener());
  };

  return {
    max: MAX_LIVES,
    lives: () => lives,

    spend: () => {
      if (lives <= 0) return false;
      commit(lives - 1);
      return true;
    },

    award: (count, _source) => {
      if (!Number.isInteger(count) || count <= 0) return;
      if (lives >= MAX_LIVES) return;
      commit(lives + count);
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
