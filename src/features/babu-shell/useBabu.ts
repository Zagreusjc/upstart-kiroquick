import { useSyncExternalStore } from 'react';
import { babuStore } from './store';

/** Subscribe a component to the persisted Babu state. */
export function useBabuState() {
  return useSyncExternalStore(babuStore.subscribe, babuStore.getState);
}
