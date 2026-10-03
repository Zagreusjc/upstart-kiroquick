import { describe, expect, it } from 'vitest';
import { clinicContact, safeHttpsUrl, telHref } from './contact';

describe('safeHttpsUrl', () => {
  it('allows https links only', () => {
    expect(safeHttpsUrl('https://example.com/book')).toBe('https://example.com/book');
    expect(safeHttpsUrl('http://example.com/book')).toBeUndefined();
    expect(safeHttpsUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeHttpsUrl('not a url')).toBeUndefined();
    expect(safeHttpsUrl(undefined)).toBeUndefined();
  });
});

describe('telHref', () => {
  it('turns Philippine landline and mobile numbers into international tel links', () => {
    expect(telHref('(02) 8123 4567')).toBe('tel:+63281234567');
    expect(telHref('0917 123 4567')).toBe('tel:+639171234567');
    expect(telHref('+63 32 412 3456')).toBe('tel:+63324123456');
  });

  it('rejects numbers it cannot read', () => {
    expect(telHref('123')).toBeUndefined();
    expect(telHref('call us')).toBeUndefined();
  });
});

describe('clinicContact', () => {
  it('only makes verified numbers dialable', () => {
    const phone = '(02) 8123 4567';
    expect(clinicContact({ phone, contactVerified: true }).telHref).toBe('tel:+63281234567');
    const sample = clinicContact({ phone, contactVerified: false });
    expect(sample.phoneDisplay).toBe(phone);
    expect(sample.telHref).toBeUndefined();
  });

  it('drops unsafe booking links', () => {
    expect(clinicContact({ bookingUrl: 'javascript:alert(1)', contactVerified: true }).bookingHref).toBeUndefined();
    expect(clinicContact({ bookingUrl: 'https://example.com/b', contactVerified: false }).bookingHref).toBe(
      'https://example.com/b',
    );
  });

  it('returns nothing when the clinic has no contact details', () => {
    expect(clinicContact({ contactVerified: false })).toEqual({});
  });
});
