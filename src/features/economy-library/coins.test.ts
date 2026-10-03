import { describe, expect, it, vi } from 'vitest';
import { createCoinsProvider } from './coins';

// Each test uses its own storage key so state does not leak between tests.
// setup.ts also clears localStorage afterEach.

describe('coins ledger', () => {
  it('awards coins and rejects non-positive or non-integer amounts', () => {
    const coins = createCoinsProvider('t.coins.award');
    expect(coins.award('checkin', 10)).toBe(true);
    expect(coins.balance()).toBe(10);
    expect(coins.award('checkin', 0)).toBe(false);
    expect(coins.award('checkin', -5)).toBe(false);
    expect(coins.award('checkin', 1.5)).toBe(false);
    expect(coins.balance()).toBe(10);
  });

  // Scenario: Repeated award with the same key
  it('is idempotent for a repeated idempotency key', () => {
    const coins = createCoinsProvider('t.coins.idem');
    const key = 'library_read:card-1:2026-10-03';
    expect(coins.award('library_read', 5, key)).toBe(true);
    expect(coins.award('library_read', 5, key)).toBe(false);
    expect(coins.balance()).toBe(5);
    // A different key still works.
    expect(coins.award('library_read', 5, 'library_read:card-2:2026-10-03')).toBe(true);
    expect(coins.balance()).toBe(10);
  });

  // Scenario: Insufficient balance
  it('rejects a spend larger than the balance', () => {
    const coins = createCoinsProvider('t.coins.insufficient');
    coins.award('streak', 20);
    expect(coins.spend(50, 'voucher')).toBe(false);
    expect(coins.balance()).toBe(20);
  });

  // Scenario: Exact spend
  it('allows an exact spend down to zero and never goes negative', () => {
    const coins = createCoinsProvider('t.coins.exact');
    coins.award('streak', 20);
    expect(coins.spend(20, 'voucher')).toBe(true);
    expect(coins.balance()).toBe(0);
    expect(coins.spend(1, 'voucher')).toBe(false);
    expect(coins.balance()).toBe(0);
  });

  it('rejects non-positive or non-integer spends', () => {
    const coins = createCoinsProvider('t.coins.badspend');
    coins.award('streak', 20);
    expect(coins.spend(0, 'x')).toBe(false);
    expect(coins.spend(-5, 'x')).toBe(false);
    expect(coins.spend(2.5, 'x')).toBe(false);
    expect(coins.balance()).toBe(20);
  });

  // Scenario: Reload keeps coins
  it('persists the balance, keys and entries across reloads', () => {
    const coins = createCoinsProvider('t.coins.persist');
    coins.award('streak', 30, 'streak:2026-10-04');
    coins.spend(5, 'voucher');

    const reloaded = createCoinsProvider('t.coins.persist');
    expect(reloaded.balance()).toBe(25);
    // Idempotency key survives a reload.
    expect(reloaded.award('streak', 30, 'streak:2026-10-04')).toBe(false);
    expect(reloaded.balance()).toBe(25);
    // Ledger history survives a reload.
    expect(reloaded.entries().length).toBe(2);
  });

  it('records a transparent ledger entry for awards and spends', () => {
    const coins = createCoinsProvider('t.coins.ledger');
    coins.award('library_read', 5);
    coins.spend(2, 'screening voucher');
    const entries = coins.entries();
    expect(entries[0]).toMatchObject({ source: 'library_read', amount: 5 });
    expect(entries[1]).toMatchObject({
      source: 'voucher_spend',
      amount: -2,
      reason: 'screening voucher',
    });
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const coins = createCoinsProvider('t.coins.subs');
    const listener = vi.fn();
    const unsubscribe = coins.subscribe(listener);
    coins.award('share', 3);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    coins.award('share', 3);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
