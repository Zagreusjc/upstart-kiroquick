import { afterEach, describe, expect, it } from 'vitest';
import type { CoinsProvider } from './contracts';
import { getProvider, registerProvider, resetProviders } from './providers';

describe('provider registry', () => {
  afterEach(() => {
    resetProviders();
  });

  it('falls back to a stub when nothing is registered', () => {
    const coins = getProvider('coins');
    expect(coins.balance()).toBe(0);
    expect(getProvider('coins')).toBe(coins);
  });

  it('prefers a registered provider over the stub', () => {
    const fake: CoinsProvider = {
      balance: () => 999,
      award: () => true,
      spend: () => true,
      subscribe: () => () => {},
    };
    registerProvider('coins', fake);
    expect(getProvider('coins').balance()).toBe(999);
  });
});
