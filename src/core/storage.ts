/**
 * Tiny localStorage wrapper. Falls back to an in-memory map when storage is
 * unavailable (private mode, quota errors), so the app never crashes.
 *
 * All INLABABOO keys use the `inlababoo.` prefix and a version suffix.
 */

const memory = new Map<string, string>();

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = hasLocalStorage() ? localStorage.getItem(key) : memory.get(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  const raw = JSON.stringify(value);
  try {
    if (hasLocalStorage()) {
      localStorage.setItem(key, raw);
      return;
    }
  } catch {
    // fall through to memory
  }
  memory.set(key, raw);
}

export function removeKey(key: string): void {
  memory.delete(key);
  try {
    if (hasLocalStorage()) localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
