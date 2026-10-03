import type { CoinsProvider } from '../../core';
import { loadJSON, saveJSON } from '../../core';

/**
 * Transparent milestone tiers. No randomness, no lootboxes: every tier shows
 * its requirement and the player's progress. Reaching a tier awards `milestone`
 * coins exactly once; the unlock is permanent.
 */

export const MILESTONES_STORAGE_KEY = 'inlababu.milestones.v1';

export interface MilestoneTier {
  id: string;
  /** Cards that must be read to unlock. */
  cardsRequired: number;
  title: string;
  /** What unlocking gives the player, in plain language. */
  reward: string;
  /** Coins granted once on unlock. */
  coins: number;
}

export const TIERS: MilestoneTier[] = [
  {
    id: 'curious',
    cardsRequired: 1,
    title: 'Curious',
    reward: 'You started learning about your heart',
    coins: 10,
  },
  {
    id: 'screening-discount',
    cardsRequired: 3,
    title: 'Screening discount',
    reward: 'Unlock a discounted screening voucher',
    coins: 25,
  },
  {
    id: 'heart-scholar',
    cardsRequired: 6,
    title: 'Heart Scholar',
    reward: 'Earn the Heart Scholar badge',
    coins: 50,
  },
];

export interface TierProgress extends MilestoneTier {
  /** Cards read so far, capped at the requirement for display. */
  progress: number;
  reached: boolean;
}

/**
 * Pure evaluation: given how many cards are read, return each tier with its
 * visible progress and whether it is reached. No side effects.
 */
export function evaluateMilestones(readCount: number): TierProgress[] {
  const count = Math.max(0, Math.floor(readCount));
  return TIERS.map((tier) => ({
    ...tier,
    progress: Math.min(count, tier.cardsRequired),
    reached: count >= tier.cardsRequired,
  }));
}

interface MilestoneState {
  unlocked: Record<string, true>;
}

export interface MilestoneStore {
  tiers(readCount: number): TierProgress[];
  isUnlocked(tierId: string): boolean;
  /**
   * Award coins for every newly reached tier, once each. Returns the ids of
   * tiers unlocked by this call (empty if none). Idempotent and persistent.
   */
  sync(readCount: number): string[];
  subscribe(listener: () => void): () => void;
}

export function createMilestoneStore(
  coins: Pick<CoinsProvider, 'award'>,
  storageKey: string = MILESTONES_STORAGE_KEY,
): MilestoneStore {
  const saved = loadJSON<MilestoneState>(storageKey, { unlocked: {} });
  const unlocked: Record<string, true> =
    saved.unlocked && typeof saved.unlocked === 'object' ? { ...saved.unlocked } : {};
  const listeners = new Set<() => void>();

  const persist = () => saveJSON(storageKey, { unlocked });

  return {
    tiers: (readCount) => evaluateMilestones(readCount),

    isUnlocked: (tierId) =>
      Object.prototype.hasOwnProperty.call(unlocked, tierId),

    sync: (readCount) => {
      const newlyUnlocked: string[] = [];
      for (const tier of evaluateMilestones(readCount)) {
        if (tier.reached && !unlocked[tier.id]) {
          unlocked[tier.id] = true;
          // Stable key so a tier awards coins exactly once, ever.
          coins.award('milestone', tier.coins, `milestone:${tier.id}`);
          newlyUnlocked.push(tier.id);
        }
      }
      if (newlyUnlocked.length > 0) {
        persist();
        listeners.forEach((listener) => listener());
      }
      return newlyUnlocked;
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
