import { describe, expect, it } from 'vitest';
import { daysBetween, shiftDate } from './dates';

describe('daysBetween', () => {
  it('is 0 for the same day', () => {
    expect(daysBetween('2026-10-04', '2026-10-04')).toBe(0);
  });

  it('counts calendar days forward', () => {
    expect(daysBetween('2026-10-03', '2026-10-04')).toBe(1);
    expect(daysBetween('2026-10-02', '2026-10-04')).toBe(2);
  });

  it('crosses month and year boundaries', () => {
    expect(daysBetween('2026-10-31', '2026-11-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2); // leap year
  });

  it('is negative when the first date is later', () => {
    expect(daysBetween('2026-10-05', '2026-10-04')).toBe(-1);
  });
});

describe('shiftDate', () => {
  it('moves a date by whole local days without mutating it', () => {
    const base = new Date(2026, 9, 31, 12, 0, 0);
    const next = shiftDate(base, 1);
    expect(next.getMonth()).toBe(10);
    expect(next.getDate()).toBe(1);
    expect(base.getDate()).toBe(31);
  });

  it('returns an equal date for an offset of 0', () => {
    const base = new Date(2026, 9, 4, 8, 30);
    expect(shiftDate(base, 0).getTime()).toBe(base.getTime());
  });
});
