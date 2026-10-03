import { removeKey } from '../../core';

/** Every INLABABU key uses this prefix (see `src/core/storage.ts`). */
export const APP_KEY_PREFIX = 'inlababu.';

type KeyList = Pick<Storage, 'length' | 'key'>;

/** All INLABABU keys in a storage area. Other sites' or apps' keys are never touched. */
export function appStorageKeys(storage: KeyList): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key !== null && key.startsWith(APP_KEY_PREFIX)) keys.push(key);
  }
  return keys;
}

/** Erase all INLABABU data on this device. Returns how many keys were removed. */
export function eraseAppData(storage: KeyList = localStorage): number {
  const keys = appStorageKeys(storage);
  keys.forEach((key) => removeKey(key));
  return keys.length;
}
