import { describe, expect, it } from 'vitest';
import { computeMood, goalsMet } from './mood';

const TODAY = '2026-10-04';
const YESTERDAY = '2026-10-03';
const TWO_DAYS_AGO = '2026-10-02';
const THREE_DAYS_AGO = '2026-10-01';

const allMet = { steps: 6000, sleepHours: 7, activityMinutes: 30 };
const noneMet = { steps: 5999, sleepHours: 6.5, activityMinutes: 29 };
const checkedInToday = { lastCheckin: TODAY };

describe('goalsMet', () => {
  it('meets a goal at exactly the target', () => {
    expect(goalsMet(allMet)).toEqual({ steps: true, sleep: true, activity: true, count: 3 });
  });

  it('does not meet a goal just below the target', () => {
    expect(goalsMet(noneMet)).toEqual({ steps: false, sleep: false, activity: false, count: 0 });
  });
});

describe('computeMood', () => {
  // Scenario: Good day
  it('is happy when all three goals are met', () => {
    expect(computeMood(allMet, checkedInToday, TODAY)).toBe('happy');
  });

  // Scenario: Partial day
  it('is ok when 1 or 2 goals are met', () => {
    expect(computeMood({ steps: 8000, sleepHours: 5, activityMinutes: 0 }, checkedInToday, TODAY)).toBe('ok');
    expect(computeMood({ steps: 8000, sleepHours: 8, activityMinutes: 0 }, checkedInToday, TODAY)).toBe('ok');
  });

  // Scenarios: Low day, Just below every target
  it('is tired when no goal is met but the player checked in today', () => {
    expect(computeMood(noneMet, checkedInToday, TODAY)).toBe('tired');
    expect(computeMood({ steps: 0, sleepHours: 0, activityMinutes: 0 }, checkedInToday, TODAY)).toBe('tired');
  });

  // Scenario: New player
  it('never puts a player who has not checked in yet into Rest Mode', () => {
    expect(computeMood(allMet, { lastCheckin: null }, TODAY)).toBe('happy');
    expect(computeMood(noneMet, { lastCheckin: null }, TODAY)).toBe('tired');
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
    const results = Array.from({ length: 20 }, () => computeMood(snapshot, checkedInToday, TODAY));
    expect(new Set(results)).toEqual(new Set(['ok']));
  });
});
