/** Local calendar date as `yyyy-mm-dd` (what players call "today"). */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Idempotency key helper: one award per source, subject and local day.
 * Example: `dayKey('library_read', 'card-hypertension')`.
 */
export function dayKey(
  source: string,
  subject = '',
  now: Date = new Date(),
): string {
  return `${source}:${subject}:${todayISO(now)}`;
}
