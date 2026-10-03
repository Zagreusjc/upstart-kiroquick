import { emit } from '../../core';
import { createCoinsProvider, type LedgerEntry } from './coins';
import { createLivesProvider, type LivesController } from './lives';
import { createLibraryStore, type LibraryStore } from './library';
import { createMilestoneStore, type MilestoneStore } from './milestones';
import { browserShareEnv, createSharer, type Sharer } from './sharing';

/**
 * Assembles the feature's singletons and wires them together with the real
 * coins/lives providers and the core event bus. The same coins and lives
 * instances are registered as providers from `index.ts`, so the header and
 * every other feature see the exact state this feature mutates.
 */

export interface EconomyStore {
  coins: ReturnType<typeof createCoinsProvider>;
  lives: LivesController;
  library: LibraryStore;
  milestones: MilestoneStore;
  sharer: Sharer;
  /** Keep milestones in sync with the current read count, then return it. */
  syncMilestones(): string[];
}

let singleton: EconomyStore | null = null;

export function createEconomyStore(): EconomyStore {
  const coins = createCoinsProvider();
  const lives = createLivesProvider();

  const library = createLibraryStore({
    coins,
    lives,
    emitRead: (cardId) => emit('library.read', { cardId }),
  });

  const milestones = createMilestoneStore(coins);

  const sharer = createSharer({
    lives,
    emitShare: (channel, context) => emit('share.completed', { channel, context }),
    env: browserShareEnv(),
  });

  const syncMilestones = () => milestones.sync(library.readCount());

  // Reflect any previously read cards into milestone unlocks on startup.
  syncMilestones();

  return { coins, lives, library, milestones, sharer, syncMilestones };
}

/** Lazily create and reuse the feature store (one per app session). */
export function getEconomyStore(): EconomyStore {
  if (!singleton) singleton = createEconomyStore();
  return singleton;
}

export type { LedgerEntry };
