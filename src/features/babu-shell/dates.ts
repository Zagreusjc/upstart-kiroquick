const DAY_MS = 86_400_000;

function toUtcDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/**
 * Whole calendar days from `from` to `to` (both `yyyy-mm-dd`).
 * Computed in UTC so time zones and DST never change the answer.
 */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcDay(to) - toUtcDay(from)) / DAY_MS);
}

/** A copy of `date` moved by `days` local calendar days. */
export function shiftDate(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  if (days !== 0) next.setDate(next.getDate() + days);
  return next;
}
