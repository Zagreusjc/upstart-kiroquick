import type { HealthProvider, HealthSnapshot } from '../contracts';
import { loadJSON, saveJSON } from '../storage';

const STORAGE_KEY = 'inlababoo.stub.health.v1';

const EMPTY: HealthSnapshot = {
  steps: 0,
  sleepHours: 0,
  activityMinutes: 0,
  updatedAt: 0,
};

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Stand-in health provider (manual demo input).
 * CJ's `babu-shell` feature registers the real one.
 */
export function createHealthStub(storageKey: string = STORAGE_KEY): HealthProvider {
  let state: HealthSnapshot = { ...EMPTY, ...loadJSON(storageKey, EMPTY) };
  const listeners = new Set<() => void>();

  return {
    snapshot: () => state,

    update: (patch) => {
      state = {
        steps: Math.round(clampNumber(patch.steps ?? state.steps, 0, 100000)),
        sleepHours: clampNumber(patch.sleepHours ?? state.sleepHours, 0, 24),
        activityMinutes: Math.round(
          clampNumber(patch.activityMinutes ?? state.activityMinutes, 0, 1440),
        ),
        updatedAt: Date.now(),
      };
      saveJSON(storageKey, state);
      listeners.forEach((listener) => listener());
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
