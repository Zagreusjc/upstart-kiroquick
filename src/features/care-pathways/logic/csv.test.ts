import { describe, expect, it } from 'vitest';
import { CLINICS, clinicById } from '../data';
import { CSV_COLUMNS, CSV_FILENAME, csvCell, eventsToCsv, syntheticEvents, type ExportEvent } from './csv';
import { seededRng } from './rng';

const AT = new Date(2026, 9, 4, 10, 30).getTime();
const header = CSV_COLUMNS.join(',');

const events: ExportEvent[] = [
  { id: 'e1', type: 'risk.assessed', at: AT, payload: { band: 'moderate' } },
  { id: 'e2', type: 'voucher.issued', at: AT, payload: { voucherId: 'v1', partnerId: 'qc-tibok-heart', cost: 50 } },
  { id: 'e3', type: 'voucher.redeemed', at: AT, payload: { voucherId: 'v1', partnerId: 'qc-tibok-heart' } },
];

const parse = (csv: string) => csv.trimEnd().split('\r\n').map((line) => line.split(','));

describe('eventsToCsv', () => {
  it('produces a header and one row per event', () => {
    const rows = parse(eventsToCsv(events, 'app', clinicById));
    expect(rows[0].join(',')).toBe(header);
    expect(rows).toHaveLength(4);
    const col = (row: string[], name: string) => row[CSV_COLUMNS.indexOf(name as never)];
    expect(col(rows[1], 'risk_band')).toBe('moderate');
    expect(col(rows[1], 'date')).toBe('2026-10-04');
    expect(col(rows[2], 'coins')).toBe('50');
    expect(col(rows[2], 'partner_name')).toBe('Tibok Heart and Wellness Clinic');
    expect(col(rows[3], 'event_type')).toBe('voucher.redeemed');
    expect(col(rows[3], 'dataset')).toBe('app');
  });

  it('produces only the header for an empty log', () => {
    expect(eventsToCsv([], 'app', clinicById)).toBe(`${header}\r\n`);
  });

  it('never exports personal data, even if a payload carries extra fields', () => {
    const leaky: ExportEvent = {
      id: 'e9',
      type: 'risk.assessed',
      at: AT,
      payload: { band: 'low', name: 'Juan Dela Cruz', phone: '09170000000', lat: 14.6, lng: 121.0 } as never,
    };
    const csv = eventsToCsv([leaky], 'app', clinicById);
    expect(csv).not.toMatch(/Juan|0917|14\.6|121/);
    for (const column of CSV_COLUMNS) {
      expect(column).not.toMatch(/user|phone|email|lat|lng|address|birth/i);
    }
  });

  it('quotes commas and neutralises formulas', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('plain')).toBe('plain');
  });
});

describe('syntheticEvents', () => {
  const partners = CLINICS.filter((c) => c.partner);
  const make = () => syntheticEvents({ rng: seededRng(42), end: AT, partners });

  it('is deterministic for a seed', () => {
    expect(make()).toEqual(make());
  });

  it('contains risk, issued and redeemed events, never redeeming more than issued', () => {
    const list = make();
    const count = (type: string) => list.filter((e) => e.type === type).length;
    expect(count('risk.assessed')).toBeGreaterThan(50);
    expect(count('voucher.issued')).toBeGreaterThan(0);
    expect(count('voucher.redeemed')).toBeGreaterThan(0);
    expect(count('voucher.redeemed')).toBeLessThanOrEqual(count('voucher.issued'));
    expect(list.every((e) => e.at <= AT)).toBe(true);
  });

  it('is labeled synthetic in a column and in the filename', () => {
    const rows = parse(eventsToCsv(make(), 'synthetic', clinicById)).slice(1);
    expect(rows.every((row) => row[0] === 'synthetic')).toBe(true);
    expect(CSV_FILENAME.synthetic).toMatch(/synthetic/);
  });
});
