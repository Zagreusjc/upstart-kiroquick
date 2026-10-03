import type { Mission, OrganizerType } from '../types';

/**
 * Medical initiatives (missions, caravans, screening drives). The type is
 * still called `Mission` in code; the UI says "medical initiatives".
 */

export type MissionWindow = 'all' | '30' | '90';

export const ORGANIZER_TYPES: readonly OrganizerType[] = ['national', 'municipal', 'barangay', 'organizational'];

export const ORGANIZER_LABEL: Record<OrganizerType, string> = {
  national: 'National',
  municipal: 'Municipal',
  barangay: 'Barangay',
  organizational: 'Organizational',
};

export interface MissionFilter {
  /** City name, or 'all'. */
  city: string;
  window: MissionWindow;
  /** Organizer level, or 'all'. Defaults to 'all'. */
  organizer?: OrganizerType | 'all';
  /** Local date `yyyy-mm-dd`; missions before it are hidden. */
  today: string;
}

/** Days between two `yyyy-mm-dd` dates (b - a), ignoring time zones. */
export function daysBetween(a: string, b: string): number {
  const toUtc = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

/** Upcoming missions matching the filter, soonest first. */
export function filterMissions(missions: readonly Mission[], filter: MissionFilter): Mission[] {
  const limit = filter.window === 'all' ? Infinity : Number(filter.window);
  return missions
    .filter((m) => {
      const inDays = daysBetween(filter.today, m.date);
      if (inDays < 0) return false;
      if (inDays > limit) return false;
      const organizer = filter.organizer ?? 'all';
      if (organizer !== 'all' && m.organizerType !== organizer) return false;
      return filter.city === 'all' || m.city === filter.city;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function formatMissionDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
