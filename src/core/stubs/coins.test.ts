import { describe, expect, it, vi } from 'vitest';
import { createCoinsStub } from './coins';

describe('coins stub', () => {
  it('awards coins and rejects invalid amounts', () => {
    const coins = createCoinsStub('t.coins');
    expect(coins.award('checkin', 10)).toBe(true);
    expect(coins.balance()).toBe(10);
    expect(coins.award('checkin', 0)).toBe(false);
    expect(coins.award('checkin', -5)).toBe(false);
    expect(coins.award('checkin', 1.5)).toBe(false);
    expect(coins.balance()).toBe(10);
  });

  it('is idempotent for a repeated idempotency key', () => {
    const coins = createCoinsStub('t.coins');
    expect(coins.award('library_read', 5, 'library_read:card-1:2026-10-03')).toBe(true);
    expect(coins.award('library_read', 5, 'library_read:card-1:2026-10-03')).toBe(false);
    expect(coins.award('library_read', 5, 'library_read:card-2:2026-10-03')).toBe(true);
    expect(coins.balance()).toBe(10);
  });

  it('fails to spend more than the balance and never goes negative', () => {
    const coins = createCoinsStub('t.coins');
    coins.award('streak', 20);
    expect(coins.spend(50, 'voucher')).toBe(false);
    expect(coins.balance()).toBe(20);
    expect(coins.spend(20, 'voucher')).toBe(true);
    expect(coins.balance()).toBe(0);
  });

  it('notifies subscribers and persists the balance', () => {
    const coins = createCoinsStub('t.coins');
    const listener = vi.fn();
    const unsubscribe = coins.subscribe(listener);
    coins.award('share', 3);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    coins.award('share', 3);
    expect(listener).toHaveBeenCalledTimes(1);

    const reloaded = createCoinsStub('t.coins');
    expect(reloaded.balance()).toBe(6);
  });
});
