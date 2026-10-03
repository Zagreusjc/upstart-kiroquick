import { describe, expect, it, vi } from 'vitest';
import { createLivesStub, MAX_LIVES } from './lives';

describe('lives stub', () => {
  it('starts full at 3 lives', () => {
    const lives = createLivesStub('t.lives');
    expect(lives.max).toBe(3);
    expect(lives.lives()).toBe(MAX_LIVES);
  });

  it('cannot go below zero', () => {
    const lives = createLivesStub('t.lives');
    expect(lives.spend()).toBe(true);
    expect(lives.spend()).toBe(true);
    expect(lives.spend()).toBe(true);
    expect(lives.lives()).toBe(0);
    expect(lives.spend()).toBe(false);
    expect(lives.lives()).toBe(0);
  });

  it('cannot go above the maximum', () => {
    const lives = createLivesStub('t.lives');
    lives.award(5, 'share');
    expect(lives.lives()).toBe(3);
    lives.spend();
    lives.award(10, 'library_read');
    expect(lives.lives()).toBe(3);
  });

  it('ignores invalid awards, notifies and persists', () => {
    const lives = createLivesStub('t.lives');
    lives.spend();
    lives.award(0, 'other');
    lives.award(-2, 'other');
    expect(lives.lives()).toBe(2);

    const listener = vi.fn();
    lives.subscribe(listener);
    lives.award(1, 'steps');
    expect(listener).toHaveBeenCalledTimes(1);

    expect(createLivesStub('t.lives').lives()).toBe(3);
  });
});
