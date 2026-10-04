import type { CoinsProvider } from '../contracts';
import { loadJSON, saveJSON } from '../storage';

interface CoinState {
  balance: number;
  keys: string[];
}

const STORAGE_KEY = 'inlababoo.stub.coins.v1';
const MAX_KEYS = 500;

/**
 * Stand-in coins provider so every feature runs on its own.
 * Prime's `economy-library` feature registers the real one.
 */
export function createCoinsStub(storageKey: string = STORAGE_KEY): CoinsProvider {
  let state = loadJSON<CoinState>(storageKey, { balance: 0, keys: [] });
  const listeners = new Set<() => void>();

  const commit = (next: CoinState) => {
    state = next;
    saveJSON(storageKey, state);
    listeners.forEach((listener) => listener());
  };

  return {
    balance: () => state.balance,

    award: (_source, amount, idempotencyKey) => {
      if (!Number.isInteger(amount) || amount <= 0) return false;
      if (idempotencyKey !== undefined && state.keys.includes(idempotencyKey)) {
        return false;
      }
      const keys =
        idempotencyKey === undefined
          ? state.keys
          : [...state.keys, idempotencyKey].slice(-MAX_KEYS);
      commit({ balance: state.balance + amount, keys });
      return true;
    },

    spend: (amount, _reason) => {
      if (!Number.isInteger(amount) || amount <= 0) return false;
      if (state.balance < amount) return false;
      commit({ balance: state.balance - amount, keys: state.keys });
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
