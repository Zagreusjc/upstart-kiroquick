import { describe, expect, it, vi } from 'vitest';
import { CARDS, CARD_COUNT, getCard } from './cards';
import { createCoinsProvider } from './coins';
import { createLivesProvider } from './lives';
import { createLibraryStore } from './library';

const LIFE_CARD = 'cholesterol'; // reward: 'life'
const COINS_CARD = 'sleep'; // reward: 'coins'

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
      expect(['life', 'coins']).toContain(card.reward);
      // Exactly one reward kind: coins cards pay coins, life cards pay none.
      if (card.reward === 'coins') {
        expect(card.coins).toBeGreaterThan(0);
      } else {
        expect(card.coins).toBe(0);
      }
    }
  });

  it('has unique card ids', () => {
    const ids = CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('offers a mix of life-refill and coins-only cards', () => {
    const life = CARDS.filter((c) => c.reward === 'life');
    const coinsOnly = CARDS.filter((c) => c.reward === 'coins');
    expect(life.length).toBeGreaterThan(0);
    expect(coinsOnly.length).toBeGreaterThan(0);
  });
});

describe('library read rewards', () => {
  // Scenario: First read of a life card -> 1 life only, no coins
  it('awards one life only (no coins) and emits library.read on first read', () => {
    const { coins, lives, store, emitted } = makeStore('t.lib.first');
    lives.spend(); // 2 lives
    const first = store.markRead(LIFE_CARD);
    expect(first).toBe(true);
    expect(store.isRead(LIFE_CARD)).toBe(true);
    expect(lives.lives()).toBe(3);
    // A life card never also awards coins.
    expect(coins.balance()).toBe(0);
    expect(emitted).toEqual([LIFE_CARD]);
  });

  // Scenario: First read of a coins-only card -> coins, no life
  it('awards coins only (no life) for a coins-reward card', () => {
    const { coins, lives, store, emitted } = makeStore('t.lib.coinsonly');
    lives.spend(); // 2 lives
    const card = getCard(COINS_CARD)!;
    expect(card.reward).toBe('coins');
    const first = store.markRead(COINS_CARD);
    expect(first).toBe(true);
    expect(coins.balance()).toBe(card.coins);
    // No life refill for a coins-only card.
    expect(lives.lives()).toBe(2);
    expect(emitted).toEqual([COINS_CARD]);
  });

  // Scenario: Re-read
  it('awards nothing on re-read', () => {
    const { coins, lives, store, emitted } = makeStore('t.lib.reread');
    lives.spend();
    store.markRead(LIFE_CARD);
    const second = store.markRead(LIFE_CARD);
    expect(second).toBe(false);
    // Life was already refilled to 3; no double award, still no coins.
    expect(lives.lives()).toBe(3);
    expect(coins.balance()).toBe(0);
    expect(emitted).toEqual([LIFE_CARD]);
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
    store1.markRead(COINS_CARD);
    expect(coins.balance()).toBe(getCard(COINS_CARD)!.coins);

    // Reload the library store with a fresh coins provider to prove the read
    // map (not the coins keys) blocks the re-award.
    const coins2 = createCoinsProvider('t.lib.persist.coins2');
    const store2 = createLibraryStore(
      { coins: coins2, lives, emitRead: () => {} },
      't.lib.persist.lib',
    );
    expect(store2.isRead(COINS_CARD)).toBe(true);
    expect(store2.markRead(COINS_CARD)).toBe(false);
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
