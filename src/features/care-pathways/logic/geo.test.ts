import { describe, expect, it } from 'vitest';
import { CITIES, CLINICS } from '../data';
import { formatDistance, haversineKm, sortClinicsByDistance } from './geo';

const manila = { lat: 14.5995, lng: 120.9842 };
const cebu = { lat: 10.3157, lng: 123.8854 };

describe('haversineKm', () => {
  it('is zero for the same point and symmetric', () => {
    expect(haversineKm(manila, manila)).toBe(0);
    expect(haversineKm(manila, cebu)).toBeCloseTo(haversineKm(cebu, manila), 9);
  });

  it('matches the known Manila to Cebu great-circle distance (about 570 km)', () => {
    expect(haversineKm(manila, cebu)).toBeGreaterThan(560);
    expect(haversineKm(manila, cebu)).toBeLessThan(580);
  });

  it('one degree of latitude is about 111 km', () => {
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 1);
  });
});

describe('sortClinicsByDistance', () => {
  it('sorts nearest first (location granted)', () => {
    const sorted = sortClinicsByDistance(CLINICS, cebu);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].distanceKm).toBeGreaterThanOrEqual(sorted[i - 1].distanceKm);
    }
    expect(sorted[0].city).toBe('Cebu City');
  });

  it('sorts from a manually picked city (location denied)', () => {
    const baguio = CITIES.find((c) => c.name === 'Baguio')!;
    expect(sortClinicsByDistance(CLINICS, baguio)[0].city).toBe('Baguio');
  });

  it('filters by public and by private', () => {
    for (const type of ['public', 'private'] as const) {
      const sorted = sortClinicsByDistance(CLINICS, manila, type);
      expect(sorted.length).toBeGreaterThan(0);
      expect(sorted.every((c) => c.type === type)).toBe(true);
    }
  });

  it('does not mutate the input list', () => {
    const before = CLINICS.map((c) => c.id);
    sortClinicsByDistance(CLINICS, cebu);
    expect(CLINICS.map((c) => c.id)).toEqual(before);
  });
});

describe('formatDistance', () => {
  it('uses metres under 1 km and km otherwise', () => {
    expect(formatDistance(0.42)).toBe('420 m');
    expect(formatDistance(3.456)).toBe('3.5 km');
    expect(formatDistance(571.2)).toBe('571 km');
  });
});
