import { useSyncExternalStore } from 'react';
import { useHealth } from '../../core';
import { assessDay, computeMood } from './mood';
import { babuStore } from './store';

/** Subscribe a component to the persisted Baboo state. */
export function useBabuState() {
  return useSyncExternalStore(babuStore.subscribe, babuStore.getState);
}

/**
 * Baboo's live mood from today's snapshot and the check-in state. The main
 * menu and the Baboo screen both use this, so Baboo always looks the same
 * everywhere.
 */
export function useBabooMood() {
  const { snapshot } = useHealth();
  const state = useBabuState();
  const mood = computeMood(snapshot, state, babuStore.today());
  const day = assessDay(snapshot);
  return { mood, day, state };
}
