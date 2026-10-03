import { afterEach, describe, expect, it, vi } from 'vitest';
import { on, type CoinSource, type CoinsProvider } from '../../core';
import { createBabuStore } from './store';

const KEY = 'test.babu.store';
// Noon local time, so shifting days never crosses midnight by accident.
const OCT_4 = new Date(2026, 9, 4, 12, 0, 0);

/** Minimal in-memory coins provider that honors idempotency keys. */
function fakeCoins() {
  const keys = new Set<string>();
  const awards: { source: CoinSource; amount: number; key?: string }[] = [];
  const coins: CoinsProvider = {
    balance: () => awards.reduce((sum, a) => sum + a.amount, 0),
    award: (source, amount, key) => {
      if (amount <= 0 || (key !== undefined && keys.has(key))) return false;
      if (key !== undefined) keys.add(key);
      awards.push({ source, amount, key });
      return true;
    },
    spend: () => false,
    subscribe: () => () => {},
  };
  return { coins, awards };
}

const unsubscribers: (() => void)[] = [];
afterEach(() => {
  unsubscribers.splice(0).forEach((off) => off());
});

function listenCheckins() {
  const events: { date: string; streak: number }[] = [];
  unsubscribers.push(on('checkin.done', (event) => events.push(event.payload)));
  return events;
}

describe('onboarding flag', () => {
  it('is not set on a fresh install', () => {
    expect(createBabuStore(KEY).getState().onboardedAt).toBeNull();
  });

  // Scenario: Completed onboarding
  it('persists once accepted', () => {
    createBabuStore(KEY).acceptOnboarding(1234);
    expect(createBabuStore(KEY).getState().onboardedAt).toBe(1234);
  });
});

describe('checkIn', () => {
  // Scenario: First check-in today
  it('awards 10 checkin coins with a day key, starts the streak and emits checkin.done', () => {
    const store = createBabuStore(KEY);
    const { coins, awards } = fakeCoins();
    const events = listenCheckins();

    const outcome = store.checkIn(coins, OCT_4);

    expect(outcome).toEqual({ checkedIn: true, date: '2026-10-04', streak: 1, coins: 10, bonus: 0 });
    expect(awards).toEqual([{ source: 'checkin', amount: 10, key: 'checkin:daily:2026-10-04' }]);
    expect(events).toEqual([{ date: '2026-10-04', streak: 1 }]);
    expect(store.getState()).toMatchObject({ lastCheckin: '2026-10-04', streak: 1 });
  });

  // Scenario: Second tap the same day
  it('does nothing on a second check-in the same day', () => {
    const store = createBabuStore(KEY);
    const { coins, awards } = fakeCoins();
    store.checkIn(coins, OCT_4);
    const events = listenCheckins();

    const outcome = store.checkIn(coins, OCT_4);

    expect(outcome.checkedIn).toBe(false);
    expect(awards).toHaveLength(1);
    expect(events).toEqual([]);
    expect(store.getState().streak).toBe(1);
  });

  // Scenario: Milestone bonus
  it('pays the 3-day bonus with source streak on top of the daily coins', () => {
    const store = createBabuStore(KEY);
    const { coins, awards } = fakeCoins();
    store.checkIn(coins, new Date(2026, 9, 2, 12));
    store.checkIn(coins, new Date(2026, 9, 3, 12));
    const outcome = store.checkIn(coins, OCT_4);

    expect(outcome).toMatchObject({ streak: 3, coins: 30, bonus: 20 });
    expect(awards.at(-1)).toEqual({ source: 'streak', amount: 20, key: 'streak:day-3:2026-10-04' });
    expect(coins.balance()).toBe(50);
  });

  it('persists the streak across reloads', () => {
    const { coins } = fakeCoins();
    createBabuStore(KEY).checkIn(coins, OCT_4);
    expect(createBabuStore(KEY).getState()).toMatchObject({ lastCheckin: '2026-10-04', streak: 1 });
  });

  it('notifies subscribers', () => {
    const store = createBabuStore(KEY);
    const listener = vi.fn();
    store.subscribe(listener);
    store.checkIn(fakeCoins().coins, OCT_4);
    expect(listener).toHaveBeenCalled();
  });
});

describe('demo day controls', () => {
  // Scenario: Next day
  it('moves Baboo to the next day so the streak can grow', () => {
    const store = createBabuStore(KEY);
    const { coins } = fakeCoins();
    store.checkIn(coins, OCT_4);

    store.shiftDays(1);
    expect(store.today(OCT_4)).toBe('2026-10-05');
    const outcome = store.checkIn(coins, OCT_4);

    expect(outcome).toMatchObject({ checkedIn: true, date: '2026-10-05', streak: 2, coins: 10 });
  });

  it('can skip 2 days, which resets the streak on the next check-in', () => {
    const store = createBabuStore(KEY);
    const { coins } = fakeCoins();
    store.checkIn(coins, OCT_4);
    store.shiftDays(2);
    expect(store.checkIn(coins, OCT_4).streak).toBe(1);
  });

  it('resets the offset and the streak but keeps onboarding', () => {
    const store = createBabuStore(KEY);
    store.acceptOnboarding(99);
    store.checkIn(fakeCoins().coins, OCT_4);
    store.shiftDays(3);

    store.resetDemoDays();

    expect(store.getState()).toEqual({ onboardedAt: 99, lastCheckin: null, streak: 0, dayOffset: 0 });
  });
});

describe('stored state recovery', () => {
  it('falls back to defaults for corrupted data', () => {
    localStorage.setItem(KEY, JSON.stringify({ onboardedAt: 'yes', lastCheckin: 42, streak: -4, dayOffset: 1.5 }));
    expect(createBabuStore(KEY).getState()).toEqual({
      onboardedAt: null,
      lastCheckin: null,
      streak: 0,
      dayOffset: 0,
    });
  });

  it('reloads from storage on demand', () => {
    const store = createBabuStore(KEY);
    store.acceptOnboarding(5);
    localStorage.clear();
    store.reload();
    expect(store.getState().onboardedAt).toBeNull();
  });
});
