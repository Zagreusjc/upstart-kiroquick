import { describe, expect, it } from 'vitest';
import type { Mission } from '../types';
import type { OrganizerType } from '../types';
import { ORGANIZER_TYPES, daysBetween, filterMissions } from './missions';

const mission = (
  id: string,
  city: string,
  date: string,
  organizerType: OrganizerType = 'municipal',
): Mission => ({
  id,
  title: id,
  organizer: 'Sample organizer',
  organizerType,
  city,
  venue: 'Sample venue',
  date,
  free: true,
  services: [],
});

const missions = [
  mission('past', 'Manila', '2026-09-30'),
  mission('today', 'Manila', '2026-10-04'),
  mission('cebu-soon', 'Cebu City', '2026-10-20'),
  mission('manila-later', 'Manila', '2026-12-20'),
];

const today = '2026-10-04';

describe('filterMissions', () => {
  it('hides past missions by default and keeps today', () => {
    const ids = filterMissions(missions, { city: 'all', window: 'all', today }).map((m) => m.id);
    expect(ids).toEqual(['today', 'cebu-soon', 'manila-later']);
  });

  it('filters by city', () => {
    const result = filterMissions(missions, { city: 'Cebu City', window: 'all', today });
    expect(result.map((m) => m.id)).toEqual(['cebu-soon']);
  });

  it('filters by date window', () => {
    const result = filterMissions(missions, { city: 'Manila', window: '30', today });
    expect(result.map((m) => m.id)).toEqual(['today']);
  });

  it('filters by organizer level: national, municipal, barangay and organizational', () => {
    const mixed = [
      mission('nat', 'Manila', '2026-10-10', 'national'),
      mission('mun', 'Manila', '2026-10-11', 'municipal'),
      mission('brgy', 'Manila', '2026-10-12', 'barangay'),
      mission('org', 'Manila', '2026-10-13', 'organizational'),
    ];
    const ids = (organizer: OrganizerType | 'all') =>
      filterMissions(mixed, { city: 'all', window: 'all', today, organizer }).map((m) => m.id);

    expect(ids('national')).toEqual(['nat']);
    expect(ids('municipal')).toEqual(['mun']);
    expect(ids('barangay')).toEqual(['brgy']);
    expect(ids('organizational')).toEqual(['org']);
    expect(ids('all')).toHaveLength(4);
    expect(ORGANIZER_TYPES).toEqual(['national', 'municipal', 'barangay', 'organizational']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterMissions(missions, { city: 'Baguio', window: 'all', today })).toEqual([]);
  });

  it('daysBetween counts calendar days', () => {
    expect(daysBetween('2026-10-04', '2026-10-05')).toBe(1);
    expect(daysBetween('2026-10-04', '2026-09-30')).toBe(-4);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });
});
