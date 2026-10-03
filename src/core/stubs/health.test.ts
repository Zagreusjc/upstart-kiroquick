import { describe, expect, it, vi } from 'vitest';
import { createHealthStub } from './health';

describe('health stub', () => {
  it('starts empty and returns a stable snapshot until updated', () => {
    const health = createHealthStub('t.health');
    expect(health.snapshot()).toMatchObject({ steps: 0, sleepHours: 0, activityMinutes: 0 });
    expect(health.snapshot()).toBe(health.snapshot());
  });

  it('clamps manual input to sane ranges and notifies', () => {
    const health = createHealthStub('t.health');
    const listener = vi.fn();
    health.subscribe(listener);

    health.update({ steps: 8000.4, sleepHours: 30, activityMinutes: -5 });
    const snap = health.snapshot();
    expect(snap.steps).toBe(8000);
    expect(snap.sleepHours).toBe(24);
    expect(snap.activityMinutes).toBe(0);
    expect(snap.updatedAt).toBeGreaterThan(0);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('merges partial updates and persists', () => {
    const health = createHealthStub('t.health');
    health.update({ steps: 5000 });
    health.update({ sleepHours: 7 });
    expect(health.snapshot()).toMatchObject({ steps: 5000, sleepHours: 7 });
    expect(createHealthStub('t.health').snapshot().steps).toBe(5000);
  });
});
