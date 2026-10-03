import { describe, expect, it } from 'vitest';
import { CITIES, CLINICS, MISSIONS, OFFERS, clinicById } from './index';

describe('seeded data', () => {
  it('has 12 to 20 clinics with unique ids, both types and valid coordinates', () => {
    expect(CLINICS.length).toBeGreaterThanOrEqual(12);
    expect(CLINICS.length).toBeLessThanOrEqual(20);
    expect(new Set(CLINICS.map((c) => c.id)).size).toBe(CLINICS.length);
    expect(new Set(CLINICS.map((c) => c.type))).toEqual(new Set(['public', 'private']));
    for (const c of CLINICS) {
      // Inside the Philippines bounding box.
      expect(c.lat).toBeGreaterThan(4);
      expect(c.lat).toBeLessThan(21.5);
      expect(c.lng).toBeGreaterThan(116);
      expect(c.lng).toBeLessThan(127);
    }
  });

  it('has 6 to 10 initiatives with ISO dates and every organizer level', () => {
    expect(MISSIONS.length).toBeGreaterThanOrEqual(6);
    expect(MISSIONS.length).toBeLessThanOrEqual(10);
    for (const m of MISSIONS) expect(m.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Set(MISSIONS.map((m) => m.organizerType))).toEqual(
      new Set(['national', 'municipal', 'barangay', 'organizational']),
    );
  });

  it('every clinic and mission city is in the city list', () => {
    const names = new Set(CITIES.map((c) => c.name));
    for (const c of CLINICS) expect(names).toContain(c.city);
    for (const m of MISSIONS) expect(names).toContain(m.city);
  });

  it('every clinic has a way to book, and illustrative booking links use the reserved example.com domain', () => {
    for (const c of CLINICS) {
      expect(Boolean(c.phone || c.bookingUrl)).toBe(true);
      if (!c.contactVerified && c.bookingUrl) {
        expect(new URL(c.bookingUrl).hostname).toBe('example.com');
      }
    }
  });

  it('every voucher offer points at a partner clinic', () => {
    for (const offer of OFFERS) {
      expect(clinicById(offer.partnerId)?.partner).toBe(true);
      expect(Number.isInteger(offer.cost) && offer.cost > 0).toBe(true);
    }
  });
});
