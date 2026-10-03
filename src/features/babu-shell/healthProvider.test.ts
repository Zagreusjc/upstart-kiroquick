import { describe, expect, it, vi } from 'vitest';
import { createHealthProvider } from './healthProvider';

const KEY = 'test.babu.health';

describe('createHealthProvider', () => {
  it('starts empty', () => {
    expect(createHealthProvider(KEY).snapshot()).toEqual({
      steps: 0,
      sleepHours: 0,
      activityMinutes: 0,
      updatedAt: 0,
    });
  });

  // Scenario: Update values
  it('stores manual values and notifies subscribers', () => {
    const health = createHealthProvider(KEY);
    const listener = vi.fn();
    health.subscribe(listener);
    health.update({ steps: 8000, sleepHours: 7, activityMinutes: 30 });
    expect(health.snapshot()).toMatchObject({ steps: 8000, sleepHours: 7, activityMinutes: 30 });
    expect(health.snapshot().updatedAt).toBeGreaterThan(0);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  // Scenario: Out-of-range input
  it('clamps out-of-range values', () => {
    const health = createHealthProvider(KEY);
    health.update({ steps: -50, sleepHours: 30, activityMinutes: 5000 });
    expect(health.snapshot()).toMatchObject({ steps: 0, sleepHours: 24, activityMinutes: 1440 });
    health.update({ steps: 250000 });
    expect(health.snapshot().steps).toBe(100000);
  });

  it('rounds steps and minutes to integers and sleep to one decimal', () => {
    const health = createHealthProvider(KEY);
    health.update({ steps: 8000.6, sleepHours: 7.25, activityMinutes: 29.4 });
    expect(health.snapshot()).toMatchObject({ steps: 8001, sleepHours: 7.3, activityMinutes: 29 });
  });

  // Scenario: Invalid number
  it('keeps the previous value when a patch value is not a finite number', () => {
    const health = createHealthProvider(KEY);
    health.update({ steps: 5000, sleepHours: 6 });
    health.update({ steps: Number.NaN, sleepHours: Number.POSITIVE_INFINITY });
    expect(health.snapshot()).toMatchObject({ steps: 5000, sleepHours: 6 });
  });

  it('merges partial updates', () => {
    const health = createHealthProvider(KEY);
    health.update({ steps: 5000 });
    health.update({ sleepHours: 7 });
    expect(health.snapshot()).toMatchObject({ steps: 5000, sleepHours: 7, activityMinutes: 0 });
  });

  // Scenario: Persistence
  it('persists across provider instances (reload)', () => {
    createHealthProvider(KEY).update({ steps: 4321, sleepHours: 8, activityMinutes: 45 });
    expect(createHealthProvider(KEY).snapshot()).toMatchObject({
      steps: 4321,
      sleepHours: 8,
      activityMinutes: 45,
    });
  });

  it('recovers from corrupted stored values', () => {
    localStorage.setItem(KEY, JSON.stringify({ steps: 'lots', sleepHours: -3, activityMinutes: null }));
    expect(createHealthProvider(KEY).snapshot()).toMatchObject({
      steps: 0,
      sleepHours: 0,
      activityMinutes: 0,
    });
  });

  // Scenario: Stable snapshot
  it('returns the same snapshot object until data changes', () => {
    const health = createHealthProvider(KEY);
    const first = health.snapshot();
    expect(health.snapshot()).toBe(first);
    health.update({ steps: 1 });
    expect(health.snapshot()).not.toBe(first);
  });

  it('stops notifying after unsubscribe', () => {
    const health = createHealthProvider(KEY);
    const listener = vi.fn();
    const unsubscribe = health.subscribe(listener);
    unsubscribe();
    health.update({ steps: 10 });
    expect(listener).not.toHaveBeenCalled();
  });
});
