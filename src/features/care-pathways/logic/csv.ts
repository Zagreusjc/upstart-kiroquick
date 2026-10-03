import type { LoggedEvent } from '../../../core';
import type { Clinic, Rng } from '../types';
import { RISK_BANDS, type RiskBand } from './risk';
import { pick, randInt } from './rng';

/**
 * Events CSV for the Quick Sight partner dashboard. Flat, non-personal
 * columns only: no names, contact details or coordinates.
 */

export const CSV_COLUMNS = [
  'dataset',
  'event_id',
  'date',
  'hour',
  'event_type',
  'risk_band',
  'partner_id',
  'partner_name',
  'partner_city',
  'voucher_id',
  'coins',
  'value',
  'detail',
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];
export type CsvRow = Record<CsvColumn, string>;
export type Dataset = 'app' | 'synthetic';

/** Minimal event shape so synthetic events need no ids from the bus. */
export type ExportEvent = Pick<LoggedEvent, 'id' | 'type' | 'at' | 'payload'>;

type PartnerLookup = (id: string) => Pick<Clinic, 'name' | 'city'> | undefined;

function localDate(at: number): { date: string; hour: string } {
  const d = new Date(at);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { date, hour: String(d.getHours()) };
}

function str(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

export function eventToRow(event: ExportEvent, dataset: Dataset, partner: PartnerLookup): CsvRow {
  const { date, hour } = localDate(event.at);
  const row: CsvRow = {
    dataset,
    event_id: event.id,
    date,
    hour,
    event_type: event.type,
    risk_band: '',
    partner_id: '',
    partner_name: '',
    partner_city: '',
    voucher_id: '',
    coins: '',
    value: '',
    detail: '',
  };
  // Read only known, non-personal fields from each payload.
  const p = event.payload as Record<string, unknown>;
  switch (event.type) {
    case 'risk.assessed':
      row.risk_band = str(p.band);
      break;
    case 'voucher.issued':
    case 'voucher.redeemed': {
      row.partner_id = str(p.partnerId);
      row.voucher_id = str(p.voucherId);
      if (event.type === 'voucher.issued') row.coins = str(p.cost);
      const clinic = partner(row.partner_id);
      row.partner_name = clinic?.name ?? '';
      row.partner_city = clinic?.city ?? '';
      break;
    }
    case 'game.finished':
      row.value = str(p.score);
      break;
    case 'checkin.done':
      row.value = str(p.streak);
      break;
    case 'library.read':
      row.detail = str(p.cardId);
      break;
    case 'share.completed':
      row.detail = str(p.channel);
      break;
  }
  return row;
}

/** Quote when needed and neutralise spreadsheet formulas (CSV injection). */
export function csvCell(value: string): string {
  let safe = value;
  if (/^[=+\-@\t\r]/.test(safe)) safe = `'${safe}`;
  if (/[",\r\n]/.test(safe)) safe = `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

export function toCsv(rows: readonly CsvRow[]): string {
  const lines = [CSV_COLUMNS.join(',')];
  for (const row of rows) lines.push(CSV_COLUMNS.map((c) => csvCell(row[c])).join(','));
  return `${lines.join('\r\n')}\r\n`;
}

export function eventsToCsv(
  events: readonly ExportEvent[],
  dataset: Dataset,
  partner: PartnerLookup,
): string {
  return toCsv(events.map((e) => eventToRow(e, dataset, partner)));
}

export const CSV_FILENAME: Record<Dataset, string> = {
  app: 'inlababu-events.csv',
  synthetic: 'inlababu-events-synthetic.csv',
};

// ---------------------------------------------------------------------------
// Synthetic dataset (clearly labeled `synthetic`)
// ---------------------------------------------------------------------------

export interface SyntheticOptions {
  rng: Rng;
  /** Epoch ms of the last day in the dataset. */
  end: number;
  days?: number;
  partners: readonly Pick<Clinic, 'id'>[];
  offerCost?: (partnerId: string) => number;
}

/** Weighted toward lower bands, like a general adult population. */
const BAND_WEIGHTS: Record<RiskBand, number> = { low: 0.55, moderate: 0.3, high: 0.15 };

function weightedBand(rng: Rng): RiskBand {
  let r = rng();
  for (const band of RISK_BANDS) {
    r -= BAND_WEIGHTS[band];
    if (r < 0) return band;
  }
  return 'low';
}

export function syntheticEvents({
  rng,
  end,
  days = 30,
  partners,
  offerCost = () => 50,
}: SyntheticOptions): ExportEvent[] {
  const events: ExportEvent[] = [];
  let n = 0;
  const nextId = () => `syn-${(n += 1).toString().padStart(5, '0')}`;
  const dayStart = (offset: number) => {
    const d = new Date(end);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - offset);
    return d.getTime();
  };

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const base = dayStart(offset);
    const surveys = randInt(rng, 4, 14);
    for (let i = 0; i < surveys; i += 1) {
      const at = base + randInt(rng, 7, 21) * 3_600_000 + randInt(rng, 0, 59) * 60_000;
      const band = weightedBand(rng);
      // Nothing after `end` (the last day is only partly over).
      if (at > end) continue;
      events.push({ id: nextId(), type: 'risk.assessed', at, payload: { band } });

      // Higher bands are more likely to claim a screening voucher.
      const claimChance = band === 'high' ? 0.6 : band === 'moderate' ? 0.45 : 0.2;
      if (rng() < claimChance) {
        const partnerId = pick(rng, partners).id;
        const voucherId = `syn-v-${n}`;
        const issuedAt = at + randInt(rng, 1, 30) * 60_000;
        if (issuedAt > end) continue;
        events.push({
          id: nextId(),
          type: 'voucher.issued',
          at: issuedAt,
          payload: { voucherId, partnerId, cost: offerCost(partnerId) },
        });
        if (rng() < 0.65) {
          const redeemedAt = issuedAt + randInt(rng, 1, 10) * 86_400_000;
          if (redeemedAt <= end) {
            events.push({ id: nextId(), type: 'voucher.redeemed', at: redeemedAt, payload: { voucherId, partnerId } });
          }
        }
      }
    }
  }
  return events.sort((a, b) => a.at - b.at);
}
