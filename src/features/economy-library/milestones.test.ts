import { describe, expect, it } from 'vitest';
import { createCoinsProvider } from './coins';
import { createMilestoneStore, evaluateMilestones, TIERS } from './milestones';

describe('evaluateMilestones (pure)', () => {
  // Scenario: Progress is visible
  it('shows progress toward an unreached tier', () => {
    const tiers = evaluateMilestones(2);
    const screening = tiers.find((t) => t.id === 'screening-discount')!;
    expect(screening.cardsRequired).toBe(3);
    expect(screening.progress).toBe(2);
    expect(screening.reached).toBe(false);
  });

  it('caps progress at the requirement and marks reached tiers', () => {
    const tiers = evaluateMilestones(10);
    for (const tier of tiers) {
      expect(tier.progress).toBe(tier.cardsRequired);
      expect(tier.reached).toBe(true);
    }
  });

  it('handles zero and negative input', () => {
    expect(evaluateMilestones(0).every((t) => !t.reached && t.progress === 0)).toBe(true);
    expect(evaluateMilestones(-5).every((t) => t.progress === 0)).toBe(true);
  });
});

describe('milestone store', () => {
  // Scenario: Tier unlocks
  it('unlocks the screening tier at 3 cards and awards milestone coins once', () => {
    const coins = createCoinsProvider('t.ms.unlock.coins');
    const store = createMilestoneStore(coins, 't.ms.unlock');

    // 2 cards: only the "curious" (1-card) tier is reached.
    expect(store.sync(2)).toEqual(['curious']);
    expect(coins.balance()).toBe(10);

    // 3rd card unlocks screening-discount.
    expect(store.sync(3)).toEqual(['screening-discount']);
    expect(store.isUnlocked('screening-discount')).toBe(true);
    expect(coins.balance()).toBe(10 + 25);
  });

  // Scenario: Unlock is permanent (no re-award)
  it('does not re-award an already unlocked tier', () => {
    const coins = createCoinsProvider('t.ms.perm.coins');
    const store = createMilestoneStore(coins, 't.ms.perm');
    store.sync(3);
    const balanceAfter = coins.balance();
    // Re-sync at the same or higher count: no new coins for old tiers.
    expect(store.sync(3)).toEqual([]);
    expect(coins.balance()).toBe(balanceAfter);
  });

  it('persists unlocked tiers across reloads without re-awarding', () => {
    const coins1 = createCoinsProvider('t.ms.reload.coins1');
    const store1 = createMilestoneStore(coins1, 't.ms.reload');
    store1.sync(3);

    const coins2 = createCoinsProvider('t.ms.reload.coins2');
    const store2 = createMilestoneStore(coins2, 't.ms.reload');
    expect(store2.isUnlocked('curious')).toBe(true);
    expect(store2.isUnlocked('screening-discount')).toBe(true);
    expect(store2.sync(3)).toEqual([]);
    expect(coins2.balance()).toBe(0);
  });

  it('awards multiple tiers crossed in a single sync', () => {
    const coins = createCoinsProvider('t.ms.jump.coins');
    const store = createMilestoneStore(coins, 't.ms.jump');
    const unlocked = store.sync(6);
    expect(unlocked).toEqual(TIERS.map((t) => t.id));
    expect(coins.balance()).toBe(10 + 25 + 50);
  });
});
