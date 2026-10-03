import type { CoinSource, CoinsProvider } from '../../core';
import { loadJSON, saveJSON } from '../../core';

/**
 * Real coins ledger for Inlababoo. Prime registers this as the `coins` provider.
 *
 * - Idempotent earning: an award with an already-used key changes nothing.
 * - Safe spending: never drops below zero.
 * - Transparent ledger: keeps a capped list of entries for an in-app history.
 * - Persistence: balance, used keys and entries are saved to localStorage.
 *
 * Pure object of closures (no `this`), matching the contract note: the hooks
 * pass `provider.subscribe` etc. around unbound.
 */

export const COINS_STORAGE_KEY = 'inlababu.coins.v1';

/** Most recent idempotency keys to remember (older keys are forgotten). */
const MAX_KEYS = 500;
/** Most recent ledger entries to keep for the in-app history. */
const MAX_ENTRIES = 200;

export interface LedgerEntry {
  source: CoinSource;
  /** Positive for an award, negative for a spend. */
  amount: number;
  /** Human-readable reason (spend) or the award source label. */
  reason: string;
  /** Epoch milliseconds. */
  at: number;
}

interface CoinState {
  balance: number;
  keys: string[];
  entries: LedgerEntry[];
}

const EMPTY: CoinState = { balance: 0, keys: [], entries: [] };

function normalize(raw: Partial<CoinState> | null | undefined): CoinState {
  const balance =
    typeof raw?.balance === 'number' && Number.isFinite(raw.balance)
      ? Math.max(0, Math.floor(raw.balance))
      : 0;
  const keys = Array.isArray(raw?.keys) ? raw.keys.filter((k) => typeof k === 'string') : [];
  const entries = Array.isArray(raw?.entries)
    ? raw.entries.filter(
        (e): e is LedgerEntry =>
          !!e && typeof e.amount === 'number' && typeof e.source === 'string',
      )
    : [];
  return { balance, keys, entries };
}

export function createCoinsProvider(
  storageKey: string = COINS_STORAGE_KEY,
): CoinsProvider & { entries(): LedgerEntry[] } {
  let state = normalize(loadJSON<CoinState>(storageKey, EMPTY));
  const listeners = new Set<() => void>();

  const commit = (next: CoinState) => {
    state = next;
    saveJSON(storageKey, state);
    listeners.forEach((listener) => listener());
  };

  const addEntry = (entries: LedgerEntry[], entry: LedgerEntry): LedgerEntry[] =>
    [...entries, entry].slice(-MAX_ENTRIES);

  return {
    balance: () => state.balance,

    entries: () => [...state.entries],

    award: (source, amount, idempotencyKey) => {
      if (!Number.isInteger(amount) || amount <= 0) return false;
      if (idempotencyKey !== undefined && state.keys.includes(idempotencyKey)) {
        return false;
      }
      const keys =
        idempotencyKey === undefined
          ? state.keys
          : [...state.keys, idempotencyKey].slice(-MAX_KEYS);
      commit({
        balance: state.balance + amount,
        keys,
        entries: addEntry(state.entries, {
          source,
          amount,
          reason: source,
          at: Date.now(),
        }),
      });
      return true;
    },

    spend: (amount, reason) => {
      if (!Number.isInteger(amount) || amount <= 0) return false;
      if (state.balance < amount) return false;
      commit({
        balance: state.balance - amount,
        keys: state.keys,
        entries: addEntry(state.entries, {
          source: 'voucher_spend',
          amount: -amount,
          reason,
          at: Date.now(),
        }),
      });
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
