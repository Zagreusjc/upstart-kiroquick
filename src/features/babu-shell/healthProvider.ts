import { loadJSON, saveJSON, type HealthProvider, type HealthSnapshot } from '../../core';
import { HEALTH_LIMITS, STORAGE_KEYS } from './constants';

type Field = keyof typeof HEALTH_LIMITS;

/** Clamp to the field's range and round (integers, sleep to one decimal). */
function normalize(field: Field, value: number): number {
  const { min, max } = HEALTH_LIMITS[field];
  const clamped = Math.min(max, Math.max(min, value));
  return field === 'sleepHours' ? Math.round(clamped * 10) / 10 : Math.round(clamped);
}

/** Use `next` if it is a finite number, otherwise keep `previous`. */
function pick(field: Field, next: unknown, previous: number): number {
  return typeof next === 'number' && Number.isFinite(next) ? normalize(field, next) : previous;
}

function fromStorage(raw: Partial<HealthSnapshot> | null): HealthSnapshot {
  const stored = raw ?? {};
  return {
    steps: pick('steps', stored.steps, 0),
    sleepHours: pick('sleepHours', stored.sleepHours, 0),
    activityMinutes: pick('activityMinutes', stored.activityMinutes, 0),
    updatedAt: typeof stored.updatedAt === 'number' ? stored.updatedAt : 0,
  };
}

/**
 * The real `health` provider: manual demo input that is clamped, persisted
 * on the device and subscribable. Registered from `index.ts`.
 */
export function createHealthProvider(
  storageKey: string = STORAGE_KEYS.health,
  now: () => number = Date.now,
): HealthProvider {
  let state = fromStorage(loadJSON<Partial<HealthSnapshot> | null>(storageKey, null));
  const listeners = new Set<() => void>();

  return {
    snapshot: () => state,

    update: (patch) => {
      state = {
        steps: pick('steps', patch.steps, state.steps),
        sleepHours: pick('sleepHours', patch.sleepHours, state.sleepHours),
        activityMinutes: pick('activityMinutes', patch.activityMinutes, state.activityMinutes),
        updatedAt: now(),
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
