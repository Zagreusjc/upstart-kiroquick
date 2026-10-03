import { describe, expect, it, vi } from 'vitest';
import {
  createLivesProvider,
  healthRefillKeys,
  MAX_LIVES,
  SLEEP_TARGET_HOURS,
  STEPS_TARGET,
} from './lives';

describe('lives provider', () => {
  // Scenario: New player
  it('starts full at 3 lives', () => {
    const lives = createLivesProvider('t.lives.start');
    expect(lives.max).toBe(3);
    expect(lives.lives()).toBe(MAX_LIVES);
  });

  // Scenario: No lives left
  it('cannot go below zero', () => {
    const lives = createLivesProvider('t.lives.floor');
    expect(lives.spend()).toBe(true);
    expect(lives.spend()).toBe(true);
    expect(lives.spend()).toBe(true);
    expect(lives.lives()).toBe(0);
    expect(lives.spend()).toBe(false);
    expect(lives.lives()).toBe(0);
  });

  // Scenario: Refill cap
  it('cannot go above the maximum', () => {
    const lives = createLivesProvider('t.lives.cap');
    lives.award(5, 'share');
    expect(lives.lives()).toBe(3);
    lives.spend();
    lives.award(10, 'library_read');
    expect(lives.lives()).toBe(3);
  });

  it('ignores invalid awards', () => {
    const lives = createLivesProvider('t.lives.invalid');
    lives.spend();
    lives.award(0, 'other');
    lives.award(-2, 'other');
    expect(lives.lives()).toBe(2);
  });

  // Scenario: Read a card -> lives increase by 1 exactly once for that card
  it('awards a life once per keyed subject', () => {
    const lives = createLivesProvider('t.lives.once');
    lives.spend();
    lives.spend();
    expect(lives.lives()).toBe(1);
    expect(lives.awardOnce('library_read:card-hpn:2026-10-04', 'library_read')).toBe(true);
    expect(lives.lives()).toBe(2);
    // Same key again: no change.
    expect(lives.awardOnce('library_read:card-hpn:2026-10-04', 'library_read')).toBe(false);
    expect(lives.lives()).toBe(2);
  });

  // Scenario: Steps target reached (and not again until next day)
  it('refills once per day from the steps target', () => {
    const lives = createLivesProvider('t.lives.steps');
    lives.spend();
    expect(lives.lives()).toBe(2);
    const day = new Date('2026-10-04T10:00:00');
    lives.applyHealth({ steps: STEPS_TARGET, sleepHours: 0 }, day);
    expect(lives.lives()).toBe(3);
    // Spend then re-apply same day: no second steps refill.
    lives.spend();
    lives.applyHealth({ steps: STEPS_TARGET + 500, sleepHours: 0 }, day);
    expect(lives.lives()).toBe(2);
    // Next day: refill again.
    lives.applyHealth({ steps: STEPS_TARGET, sleepHours: 0 }, new Date('2026-10-05T10:00:00'));
    expect(lives.lives()).toBe(3);
  });

  // Scenario: Enough sleep
  it('refills once per day from the sleep target', () => {
    const lives = createLivesProvider('t.lives.sleep');
    lives.spend();
    lives.spend();
    expect(lives.lives()).toBe(1);
    const day = new Date('2026-10-04T22:00:00');
    lives.applyHealth({ steps: 0, sleepHours: SLEEP_TARGET_HOURS }, day);
    expect(lives.lives()).toBe(2);
    lives.spend();
    lives.applyHealth({ steps: 0, sleepHours: SLEEP_TARGET_HOURS + 1 }, day);
    expect(lives.lives()).toBe(1);
  });

  it('below-target health does not refill', () => {
    const lives = createLivesProvider('t.lives.below');
    lives.spend();
    lives.applyHealth(
      { steps: STEPS_TARGET - 1, sleepHours: SLEEP_TARGET_HOURS - 0.5 },
      new Date('2026-10-04T10:00:00'),
    );
    expect(lives.lives()).toBe(2);
  });

  it('persists lives and consumed refill keys across reloads', () => {
    const lives = createLivesProvider('t.lives.persist');
    lives.spend();
    lives.awardOnce('share::abc', 'share');
    expect(lives.lives()).toBe(3);

    const reloaded = createLivesProvider('t.lives.persist');
    expect(reloaded.lives()).toBe(3);
    // The share key is already consumed, so no further award.
    reloaded.spend();
    expect(reloaded.awardOnce('share::abc', 'share')).toBe(false);
    expect(reloaded.lives()).toBe(2);
  });

  it('notifies subscribers on change', () => {
    const lives = createLivesProvider('t.lives.subs');
    const listener = vi.fn();
    lives.subscribe(listener);
    lives.spend();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('healthRefillKeys', () => {
  it('returns the keys whose targets are met', () => {
    const day = new Date('2026-10-04T10:00:00');
    expect(healthRefillKeys({ steps: STEPS_TARGET, sleepHours: SLEEP_TARGET_HOURS }, day)).toEqual([
      'steps::2026-10-04',
      'sleep::2026-10-04',
    ]);
    expect(healthRefillKeys({ steps: 0, sleepHours: 0 }, day)).toEqual([]);
  });
});
