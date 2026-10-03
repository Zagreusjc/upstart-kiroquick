import { describe, expect, it } from 'vitest';
import { applyCheckin, currentStreak, milestoneBonus, nextMilestone } from './streak';

const TODAY = '2026-10-04';

describe('applyCheckin', () => {
  // Scenario: First ever check-in
  it('starts a streak of 1 for a first check-in', () => {
    const result = applyCheckin({ lastCheckin: null, streak: 0 }, TODAY);
    expect(result).toEqual({
      checkedIn: true,
      state: { lastCheckin: TODAY, streak: 1 },
      bonus: 0,
    });
  });

  // Scenario: Second tap the same day
  it('changes nothing on a second check-in the same day', () => {
    const state = { lastCheckin: TODAY, streak: 4 };
    const result = applyCheckin(state, TODAY);
    expect(result.checkedIn).toBe(false);
    expect(result.state).toBe(state);
    expect(result.bonus).toBe(0);
  });

  // Scenario: Consecutive days
  it('grows the streak on consecutive days', () => {
    const result = applyCheckin({ lastCheckin: '2026-10-03', streak: 2 }, TODAY);
    expect(result.state.streak).toBe(3);
  });

  // Scenario: Missed day
  it('resets the streak to 1 after a missed day', () => {
    expect(applyCheckin({ lastCheckin: '2026-10-02', streak: 9 }, TODAY).state.streak).toBe(1);
    expect(applyCheckin({ lastCheckin: '2026-08-01', streak: 9 }, TODAY).state.streak).toBe(1);
  });

  // Scenario: Month boundary
  it('counts consecutive days across a month boundary', () => {
    expect(applyCheckin({ lastCheckin: '2026-10-31', streak: 4 }, '2026-11-01').state.streak).toBe(5);
  });

  it('restarts at 1 if the clock moved back before the last check-in', () => {
    const result = applyCheckin({ lastCheckin: '2026-10-09', streak: 6 }, TODAY);
    expect(result).toMatchObject({ checkedIn: true, state: { lastCheckin: TODAY, streak: 1 } });
  });

  // Scenario: Milestone bonus
  it('pays the milestone bonus when the streak reaches 3', () => {
    const result = applyCheckin({ lastCheckin: '2026-10-03', streak: 2 }, TODAY);
    expect(result.bonus).toBe(20);
  });

  it('pays no bonus between milestones', () => {
    expect(applyCheckin({ lastCheckin: '2026-10-03', streak: 3 }, TODAY).bonus).toBe(0);
  });
});

describe('milestoneBonus', () => {
  it('matches the milestone table', () => {
    expect([1, 2, 3, 4, 7, 14, 30, 31].map(milestoneBonus)).toEqual([0, 0, 20, 0, 50, 80, 150, 0]);
  });
});

describe('nextMilestone', () => {
  it('returns the next milestone above the streak', () => {
    expect(nextMilestone(0)).toEqual({ days: 3, bonus: 20 });
    expect(nextMilestone(3)).toEqual({ days: 7, bonus: 50 });
    expect(nextMilestone(29)).toEqual({ days: 30, bonus: 150 });
  });

  it('returns null after the last milestone', () => {
    expect(nextMilestone(30)).toBeNull();
  });
});

describe('currentStreak', () => {
  it('shows the stored streak after a check-in today or yesterday', () => {
    expect(currentStreak({ lastCheckin: TODAY, streak: 5 }, TODAY)).toBe(5);
    expect(currentStreak({ lastCheckin: '2026-10-03', streak: 5 }, TODAY)).toBe(5);
  });

  // Scenario: Displayed streak after a gap
  it('shows 0 after a missed day', () => {
    expect(currentStreak({ lastCheckin: '2026-10-02', streak: 5 }, TODAY)).toBe(0);
  });

  it('shows 0 for a new player', () => {
    expect(currentStreak({ lastCheckin: null, streak: 0 }, TODAY)).toBe(0);
  });
});
