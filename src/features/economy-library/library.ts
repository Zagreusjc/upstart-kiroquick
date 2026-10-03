import type { CoinsProvider } from '../../core';
import { loadJSON, saveJSON, todayISO } from '../../core';
import type { LivesController } from './lives';
import { getCard } from './cards';

/**
 * Library read-state store and first-read reward logic.
 *
 * First read of a card awards coins and one life exactly once (ever), emits
 * `library.read`, and persists the read state. Re-reading awards nothing.
 *
 * Dependencies are injected so the logic is unit-testable without React or the
 * global provider registry.
 */

export const LIBRARY_STORAGE_KEY = 'inlababu.library.v1';

/** Coins awarded on the first read of a card. */
export const FIRST_READ_COINS = 5;

interface LibraryState {
  /** cardId -> epoch ms of first read. Presence means "read". */
  read: Record<string, number>;
}

export interface LibraryDeps {
  coins: Pick<CoinsProvider, 'award'>;
  lives: Pick<LivesController, 'awardOnce'>;
  emitRead: (cardId: string) => void;
  now?: () => Date;
}

export interface LibraryStore {
  isRead(cardId: string): boolean;
  readCount(): number;
  readIds(): string[];
  /**
   * Mark a card as read. On the first read of a known card, award coins and a
   * life once and emit `library.read`. Returns true when it was the first read.
   */
  markRead(cardId: string): boolean;
  subscribe(listener: () => void): () => void;
}

export function createLibraryStore(
  deps: LibraryDeps,
  storageKey: string = LIBRARY_STORAGE_KEY,
): LibraryStore {
  const saved = loadJSON<LibraryState>(storageKey, { read: {} });
  const read: Record<string, number> =
    saved.read && typeof saved.read === 'object' ? { ...saved.read } : {};
  const listeners = new Set<() => void>();
  const now = deps.now ?? (() => new Date());

  const persist = () => saveJSON(storageKey, { read });

  return {
    isRead: (cardId) => Object.prototype.hasOwnProperty.call(read, cardId),

    readCount: () => Object.keys(read).length,

    readIds: () => Object.keys(read),

    markRead: (cardId) => {
      // Unknown cards are never rewarded or recorded.
      if (!getCard(cardId)) return false;
      if (Object.prototype.hasOwnProperty.call(read, cardId)) return false;

      read[cardId] = Date.now();
      persist();

      // Reward once. The idempotency key is per card per day, but the read map
      // above already guarantees once-ever, so a repeat read never gets here.
      const key = `library_read:${cardId}:${todayISO(now())}`;
      deps.coins.award('library_read', FIRST_READ_COINS, key);
      deps.lives.awardOnce(key, 'library_read');
      deps.emitRead(cardId);

      listeners.forEach((listener) => listener());
      return true;
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
