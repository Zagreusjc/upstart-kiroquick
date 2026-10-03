import { describe, expect, it } from 'vitest';
import { assessDay, computeMood, goalsMet, sleepScore } from './mood';

const TODAY = '2026-10-04';
const YESTERDAY = '2026-10-03';
const TWO_DAYS_AGO = '2026-10-02';
const THREE_DAYS_AGO = '2026-10-01';

const allMet = { steps: 6000, sleepHours: 7, activityMinutes: 30 };
const noneMet = { steps: 5999, sleepHours: 6.5, activityMinutes: 29 };
const maxed = { steps: 20000, activityMinutes: 120 };
const checkedInToday = { lastCheckin: TODAY };
const mood = (values: typeof allMet) => computeMood(values, checkedInToday, TODAY);

describe('goalsMet', () => {
  it('meets a goal at exactly the target', () => {
    expect(goalsMet(allMet)).toEqual({ steps: true, sleep: true, activity: true, count: 3 });
  });

  it('does not meet a goal just below the target', () => {
    expect(goalsMet(noneMet)).toEqual({ steps: false, sleep: false, activity: false, count: 0 });
  });

  it('treats sleep as a healthy range of 7 to 10 hours', () => {
    expect(goalsMet({ ...allMet, sleepHours: 10 }).sleep).toBe(true);
    expect(goalsMet({ ...allMet, sleepHours: 10.5 }).sleep).toBe(false);
  });
});

describe('sleepScore', () => {
  it('rises to the goal, stays full in the healthy range, then eases down to a floor', () => {
    expect(sleepScore(0)).toBe(0);
    expect(sleepScore(3.5)).toBe(0.5);
    expect(sleepScore(7)).toBe(1);
    expect(sleepScore(10)).toBe(1);
    expect(sleepScore(12)).toBe(0.75);
    expect(sleepScore(24)).toBe(0.5);
  });
});

describe('computeMood', () => {
  // Scenario: Good day
  it('is happy when all three goals are met', () => {
    expect(mood(allMet)).toBe('happy');
  });

  // Scenario: No sleep (the reported bug)
  it('is tired with no sleep, even when steps and activity are maxed out', () => {
    expect(mood({ ...maxed, sleepHours: 0 })).toBe('tired');
    expect(mood({ ...maxed, sleepHours: 3.5 })).toBe('tired');
    expect(assessDay({ ...maxed, sleepHours: 0 }).reason).toBe('exhausted');
  });

  // Scenario: Short sleep
  it('is never happy on short sleep, however active', () => {
    expect(mood({ ...maxed, sleepHours: 4 })).toBe('ok');
    expect(mood({ ...maxed, sleepHours: 5.5 })).toBe('ok');
    expect(assessDay({ ...maxed, sleepHours: 5.5 }).reason).toBe('short_sleep');
  });

  // Scenario: Too much sleep
  it('is not happy after sleeping far more than 10 hours', () => {
    expect(mood({ ...maxed, sleepHours: 12 })).toBe('ok');
    expect(assessDay({ ...maxed, sleepHours: 12 }).reason).toBe('long_sleep');
  });

  // Scenario: No movement
  it('is tired after great sleep but almost no movement', () => {
    expect(mood({ steps: 0, sleepHours: 8, activityMinutes: 0 })).toBe('tired');
    expect(mood({ steps: 1000, sleepHours: 8, activityMinutes: 5 })).toBe('tired');
    expect(assessDay({ steps: 0, sleepHours: 8, activityMinutes: 0 }).reason).toBe('no_movement');
  });

  // Scenario: Partial day
  it('is ok on a partial day with enough energy', () => {
    expect(mood({ steps: 8000, sleepHours: 5, activityMinutes: 0 })).toBe('ok');
    expect(mood({ steps: 8000, sleepHours: 8, activityMinutes: 0 })).toBe('ok');
  });

  // Scenario: Just below every target
  it('is ok, not tired, when just below every target', () => {
    expect(mood(noneMet)).toBe('ok');
    expect(assessDay(noneMet).energy).toBe(96);
  });

  // Scenario: Low day
  it('is tired when energy is under 50%', () => {
    expect(mood({ steps: 0, sleepHours: 0, activityMinutes: 0 })).toBe('tired');
    expect(mood({ steps: 2000, sleepHours: 4.5, activityMinutes: 5 })).toBe('tired');
  });

  it('every slider moves the energy, with sleep weighing most', () => {
    const base = { steps: 3000, sleepHours: 3.5, activityMinutes: 15 };
    const energy = (v: typeof base) => assessDay(v).energy;
    expect(energy(base)).toBe(50);
    expect(energy({ ...base, sleepHours: 7 })).toBe(70); // +20
    expect(energy({ ...base, steps: 6000 })).toBe(65); // +15
    expect(energy({ ...base, activityMinutes: 30 })).toBe(65); // +15
  });

  it('points the hint at the weakest unmet goal', () => {
    expect(assessDay({ steps: 3000, sleepHours: 8, activityMinutes: 25 }).reason).toBe('steps');
    expect(assessDay({ steps: 7000, sleepHours: 8, activityMinutes: 10 }).reason).toBe('activity');
    expect(assessDay({ steps: 7000, sleepHours: 6.5, activityMinutes: 40 }).reason).toBe('sleep');
    expect(assessDay(allMet).reason).toBeNull();
  });

  // Scenario: New player
  it('never puts a player who has not checked in yet into Rest Mode', () => {
    expect(computeMood(allMet, { lastCheckin: null }, TODAY)).toBe('happy');
    expect(computeMood({ steps: 0, sleepHours: 0, activityMinutes: 0 }, { lastCheckin: null }, TODAY)).toBe('tired');
  });

  // Scenario: Player away
  it('is in Rest Mode when the last check-in was 2 or more days ago', () => {
    expect(computeMood(noneMet, { lastCheckin: TWO_DAYS_AGO }, TODAY)).toBe('rest');
    expect(computeMood(noneMet, { lastCheckin: '2026-09-01' }, TODAY)).toBe('rest');
  });

  // Scenario: Rest Mode wins over goals
  it('prefers Rest Mode over the goal rules', () => {
    expect(computeMood(allMet, { lastCheckin: THREE_DAYS_AGO }, TODAY)).toBe('rest');
  });

  // Scenario: Checked in yesterday
  it('is not in Rest Mode after a check-in yesterday', () => {
    expect(computeMood(allMet, { lastCheckin: YESTERDAY }, TODAY)).toBe('happy');
  });

  // Scenario: Return from Rest Mode
  it('leaves Rest Mode as soon as the player checks in today', () => {
    expect(computeMood(allMet, { lastCheckin: THREE_DAYS_AGO }, TODAY)).toBe('rest');
    expect(computeMood(allMet, { lastCheckin: TODAY }, TODAY)).toBe('happy');
  });

  it('treats a last check-in after today (clock moved back) as not away', () => {
    expect(computeMood(allMet, { lastCheckin: '2026-10-09' }, TODAY)).toBe('happy');
  });

  // Scenario: Same input, same mood
  it('is deterministic', () => {
    const snapshot = { steps: 7000, sleepHours: 6, activityMinutes: 40 };
    const results = Array.from({ length: 20 }, () => mood(snapshot));
    expect(new Set(results)).toEqual(new Set(['ok']));
  });
});
