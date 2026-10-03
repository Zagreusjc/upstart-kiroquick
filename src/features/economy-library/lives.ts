import type { HealthSnapshot, LifeSource, LivesProvider } from '../../core';
import { getProvider, loadJSON, saveJSON, todayISO } from '../../core';

/**
 * Real lives system for Inlababoo. Prime registers this as the `lives` provider.
 *
 * - Starts at 3, clamped to [0, 3].
 * - Refills from: first read of a library card, a completed share, reaching the
 *   daily steps target, and logging the daily sleep target. Steps and sleep are
 *   once per local day; the card and share refills are keyed per subject.
 * - The health refills are driven by subscribing to the `health` provider so a
 *   snapshot change (manual demo input) can top up lives automatically.
 */

export const MAX_LIVES = 3;
export const LIVES_STORAGE_KEY = 'inlababu.lives.v1';

/** Daily targets that each grant one life, once per local day. */
export const STEPS_TARGET = 8000;
export const SLEEP_TARGET_HOURS = 7;

interface LivesState {
  lives: number;
  /** Consumed once-per-period refill keys (steps/sleep per day, card/share ids). */
  refills: Record<string, true>;
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return MAX_LIVES;
  return Math.min(MAX_LIVES, Math.max(0, Math.floor(value)));
}

/**
 * Pure helper: given a health snapshot and the day, which once-per-day refill
 * keys does it satisfy? Returned regardless of whether they were already
 * consumed, so the caller decides. Exported for direct unit testing.
 */
export function healthRefillKeys(
  snapshot: Pick<HealthSnapshot, 'steps' | 'sleepHours'>,
  now: Date = new Date(),
): string[] {
  const day = todayISO(now);
  const keys: string[] = [];
  if (snapshot.steps >= STEPS_TARGET) keys.push(`steps::${day}`);
  if (snapshot.sleepHours >= SLEEP_TARGET_HOURS) keys.push(`sleep::${day}`);
  return keys;
}

export interface LivesController extends LivesProvider {
  /** Award a life once for a keyed subject (card read or share). No-op if used. */
  awardOnce(key: string, source: LifeSource): boolean;
  /** Evaluate a health snapshot and refill once-per-day targets. */
  applyHealth(snapshot: Pick<HealthSnapshot, 'steps' | 'sleepHours'>, now?: Date): void;
  /** Subscribe to the registered health provider and refill on changes. */
  bindHealth(): () => void;
}

export function createLivesProvider(
  storageKey: string = LIVES_STORAGE_KEY,
): LivesController {
  const saved = loadJSON<LivesState>(storageKey, { lives: MAX_LIVES, refills: {} });
  let lives = clamp(saved.lives);
  let refills: Record<string, true> =
    saved.refills && typeof saved.refills === 'object' ? { ...saved.refills } : {};
  const listeners = new Set<() => void>();

  const persist = () => saveJSON(storageKey, { lives, refills });

  const notify = () => listeners.forEach((listener) => listener());

  const setLives = (next: number) => {
    const clamped = clamp(next);
    if (clamped === lives) {
      // Still persist refill-key changes made by the caller.
      persist();
      return;
    }
    lives = clamped;
    persist();
    notify();
  };

  const addLives = (count: number) => {
    if (!Number.isInteger(count) || count <= 0) return;
    setLives(lives + count);
  };

  const awardOnce: LivesController['awardOnce'] = (key, _source) => {
    if (refills[key]) return false;
    refills = { ...refills, [key]: true };
    // Mark the key consumed even at full lives (matches the refill-cap rule).
    if (lives >= MAX_LIVES) {
      persist();
      return true;
    }
    addLives(1);
    return true;
  };

  const applyHealth: LivesController['applyHealth'] = (snapshot, now = new Date()) => {
    for (const key of healthRefillKeys(snapshot, now)) {
      awardOnce(key, key.startsWith('steps') ? 'steps' : 'sleep');
    }
  };

  return {
    max: MAX_LIVES,
    lives: () => lives,

    spend: () => {
      if (lives <= 0) return false;
      setLives(lives - 1);
      return true;
    },

    award: (count, _source) => {
      addLives(count);
    },

    awardOnce,
    applyHealth,

    bindHealth: () => {
      const health = getProvider('health');
      // Evaluate the current snapshot immediately, then on every change.
      const run = () => applyHealth(health.snapshot());
      run();
      return health.subscribe(run);
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
