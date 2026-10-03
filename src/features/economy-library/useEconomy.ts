import { useCallback, useSyncExternalStore } from 'react';
import { getEconomyStore } from './store';
import type { TierProgress } from './milestones';

/**
 * React bindings for the feature store. Coins and lives come from the shared
 * `useCoins()` / `useLives()` core hooks (the header uses the same instances),
 * so this file only exposes library and milestone state plus actions.
 *
 * Each hook derives a small string snapshot from the store so React's
 * `useSyncExternalStore` can detect changes cheaply.
 */

export function useLibrary() {
  const { library, syncMilestones } = getEconomyStore();
  const readSnapshot = useSyncExternalStore(library.subscribe, () =>
    library.readIds().join(','),
  );
  const readCount = readSnapshot ? readSnapshot.split(',').filter(Boolean).length : 0;
  const isRead = useCallback((id: string) => library.isRead(id), [library]);

  // Reading a card can cross a milestone tier; keep them in sync.
  const markRead = useCallback(
    (id: string) => {
      const first = library.markRead(id);
      if (first) syncMilestones();
      return first;
    },
    [library, syncMilestones],
  );

  return { readCount, isRead, markRead };
}

export function useMilestones(): { tiers: TierProgress[] } {
  const { milestones, library } = getEconomyStore();
  const readSnapshot = useSyncExternalStore(library.subscribe, () =>
    library.readIds().join(','),
  );
  // Also re-render when a tier unlocks (e.g. coins awarded).
  useSyncExternalStore(milestones.subscribe, () => milestones.tiers(0).length);
  const readCount = readSnapshot ? readSnapshot.split(',').filter(Boolean).length : 0;
  return { tiers: milestones.tiers(readCount) };
}
