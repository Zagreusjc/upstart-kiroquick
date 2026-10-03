import { useState } from 'react';
import { getEventLog } from '../../../core';
import { CLINICS, OFFERS, clinicById } from '../data';
import { CSV_FILENAME, eventsToCsv, syntheticEvents } from '../logic/csv';
import { seededRng } from '../logic/rng';
import { Card, Page, buttonPrimary, buttonSecondary } from '../ui';

const SYNTHETIC_SEED = 2026;

function download(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildSyntheticCsv(end: number = Date.now()): string {
  const partners = CLINICS.filter((c) => c.partner);
  const costFor = (partnerId: string) => OFFERS.find((o) => o.partnerId === partnerId)?.cost ?? 50;
  const events = syntheticEvents({ rng: seededRng(SYNTHETIC_SEED), end, partners, offerCost: costFor });
  return eventsToCsv(events, 'synthetic', clinicById);
}

/** Partner export for the Quick Sight dashboard. */
export function ExportScreen() {
  const [count] = useState(() => getEventLog().length);
  const [done, setDone] = useState<string | null>(null);

  return (
    <Page
      title="Partner data export"
      intro="CSV for the partner dashboard in Amazon Quick Sight. One row per event, no personal data."
    >
      <Card className="space-y-3">
        <p className="text-sm">
          This device has <strong>{count}</strong> logged events (risk checks, vouchers, games,
          reads, shares, check-ins).
        </p>
        <button
          type="button"
          className={`${buttonPrimary} w-full`}
          onClick={() => {
            download(CSV_FILENAME.app, eventsToCsv(getEventLog(), 'app', clinicById));
            setDone(CSV_FILENAME.app);
          }}
        >
          Download app events CSV
        </button>
        <button
          type="button"
          className={`${buttonSecondary} w-full`}
          onClick={() => {
            download(CSV_FILENAME.synthetic, buildSyntheticCsv());
            setDone(CSV_FILENAME.synthetic);
          }}
        >
          Download synthetic demo CSV
        </button>
        <p className="text-xs text-slate-700">
          The synthetic file is generated demo data, labeled <code>synthetic</code> in the
          dataset column and the filename. Partner names are illustrative.
        </p>
        <p role="status" aria-live="polite" className="text-sm font-semibold">
          {done ? `Saved ${done}.` : ''}
        </p>
      </Card>
      <Card>
        <h3 className="font-bold">Columns</h3>
        <p className="mt-1 font-mono text-xs break-words">
          dataset, event_id, date, hour, event_type, risk_band, partner_id, partner_name,
          partner_city, voucher_id, coins, value, detail
        </p>
      </Card>
    </Page>
  );
}
