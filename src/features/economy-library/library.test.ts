import { describe, expect, it, vi } from 'vitest';
import { CARDS, CARD_COUNT } from './cards';
import { createCoinsProvider } from './coins';
import { createLivesProvider } from './lives';
import { createLibraryStore, FIRST_READ_COINS } from './library';

function makeStore(storageKey: string) {
  const coins = createCoinsProvider(`${storageKey}.coins`);
  const lives = createLivesProvider(`${storageKey}.lives`);
  const emitted: string[] = [];
  const store = createLibraryStore(
    { coins, lives, emitRead: (id) => emitted.push(id) },
    `${storageKey}.lib`,
  );
  return { coins, lives, store, emitted };
}

describe('library content', () => {
  it('provides 8 to 10 cards, each with a source and a reviewed date', () => {
    expect(CARD_COUNT).toBeGreaterThanOrEqual(8);
    expect(CARD_COUNT).toBeLessThanOrEqual(10);
    for (const card of CARDS) {
      expect(card.sources.length).toBeGreaterThanOrEqual(1);
      for (const source of card.sources) {
        expect(source.url).toMatch(/^https?:\/\//);
        expect(source.label.length).toBeGreaterThan(0);
      }
      expect(card.reviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(card.body.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('has unique card ids', () => {
    const ids = CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('library read rewards', () => {
  // Scenario: First read
  it('awards coins and one life once and emits library.read on first read', () => {
    const { coins, lives, store, emitted } = makeStore('t.lib.first');
    lives.spend(); // 2 lives
    const first = store.markRead('cholesterol');
    expect(first).toBe(true);
    expect(store.isRead('cholesterol')).toBe(true);
    expect(coins.balance()).toBe(FIRST_READ_COINS);
    expect(lives.lives()).toBe(3);
    expect(emitted).toEqual(['cholesterol']);
  });

  // Scenario: Re-read
  it('awards nothing on re-read', () => {
    const { coins, lives, store, emitted } = makeStore('t.lib.reread');
    lives.spend();
    store.markRead('cholesterol');
    const second = store.markRead('cholesterol');
    expect(second).toBe(false);
    expect(coins.balance()).toBe(FIRST_READ_COINS);
    // Life was already refilled to 3; no double award.
    expect(lives.lives()).toBe(3);
    expect(emitted).toEqual(['cholesterol']);
  });

  it('ignores unknown card ids', () => {
    const { coins, store, emitted } = makeStore('t.lib.unknown');
    expect(store.markRead('does-not-exist')).toBe(false);
    expect(coins.balance()).toBe(0);
    expect(emitted).toEqual([]);
  });

  it('persists read state across reloads and does not re-award', () => {
    const coins = createCoinsProvider('t.lib.persist.coins');
    const lives = createLivesProvider('t.lib.persist.lives');
    const store1 = createLibraryStore(
      { coins, lives, emitRead: () => {} },
      't.lib.persist.lib',
    );
    store1.markRead('what-is-cvd');
    expect(coins.balance()).toBe(FIRST_READ_COINS);

    // Reload the library store with a fresh coins provider to prove the read
    // map (not the coins keys) blocks the re-award.
    const coins2 = createCoinsProvider('t.lib.persist.coins2');
    const store2 = createLibraryStore(
      { coins: coins2, lives, emitRead: () => {} },
      't.lib.persist.lib',
    );
    expect(store2.isRead('what-is-cvd')).toBe(true);
    expect(store2.markRead('what-is-cvd')).toBe(false);
    expect(coins2.balance()).toBe(0);
  });

  it('counts reads and notifies subscribers', () => {
    const { store } = makeStore('t.lib.count');
    const listener = vi.fn();
    store.subscribe(listener);
    store.markRead('what-is-cvd');
    store.markRead('cholesterol');
    expect(store.readCount()).toBe(2);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
