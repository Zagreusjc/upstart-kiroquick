import { useState } from 'react';
import { todayISO } from '../../../core';
import { CITIES, MISSIONS } from '../data';
import {
  ORGANIZER_LABEL,
  ORGANIZER_TYPES,
  filterMissions,
  formatMissionDate,
  type MissionWindow,
} from '../logic/missions';
import type { OrganizerType } from '../types';
import { Card, IllustrativeNotice, Page, buttonSecondary, inputClass } from '../ui';

type OrganizerFilter = OrganizerType | 'all';

const ORGANIZER_OPTIONS: [OrganizerFilter, string][] = [
  ['all', 'All'],
  ...ORGANIZER_TYPES.map((type): [OrganizerFilter, string] => [type, ORGANIZER_LABEL[type]]),
];

/** Medical initiatives: missions, caravans and screening drives. */
export function InitiativesScreen({ today = todayISO() }: { today?: string }) {
  const [city, setCity] = useState('all');
  const [range, setRange] = useState<MissionWindow>('all');
  const [organizer, setOrganizer] = useState<OrganizerFilter>('all');
  const initiatives = filterMissions(MISSIONS, { city, window: range, organizer, today });

  function resetFilters() {
    setCity('all');
    setRange('all');
    setOrganizer('all');
  }

  return (
    <Page
      title="Medical initiatives"
      intro="Upcoming heart screening missions, caravans and drives. Past dates are hidden."
    >
      <IllustrativeNotice what="Initiatives, organizers and dates" />

      <Card className="space-y-3">
        <fieldset>
          <legend className="font-semibold">Organizer</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {ORGANIZER_OPTIONS.map(([value, label]) => (
              <label
                key={value}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-400 bg-white px-3 has-[:checked]:border-rose-700 has-[:checked]:bg-rose-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-rose-700"
              >
                <input
                  type="radio"
                  name="initiative-organizer"
                  value={value}
                  checked={organizer === value}
                  onChange={() => setOrganizer(value)}
                  className="h-5 w-5 accent-rose-700"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="initiative-city" className="block font-semibold">
              City
            </label>
            <select
              id="initiative-city"
              className={`${inputClass} mt-1`}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="all">All cities</option>
              {CITIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="initiative-window" className="block font-semibold">
              When
            </label>
            <select
              id="initiative-window"
              className={`${inputClass} mt-1`}
              value={range}
              onChange={(e) => setRange(e.target.value as MissionWindow)}
            >
              <option value="all">All upcoming</option>
              <option value="30">Next 30 days</option>
              <option value="90">Next 90 days</option>
            </select>
          </div>
        </div>
      </Card>

      <p role="status" aria-live="polite" className="font-bold">
        {initiatives.length === 1 ? '1 initiative' : `${initiatives.length} initiatives`}
      </p>

      {initiatives.length === 0 ? (
        <Card className="space-y-3 text-center">
          <p className="font-semibold">No initiatives match these filters yet.</p>
          <p className="text-sm text-slate-700">
            Try another organizer, city or a longer time range. Barangay health centers also
            offer free blood pressure checks.
          </p>
          <button type="button" className={buttonSecondary} onClick={resetFilters}>
            Show all upcoming initiatives
          </button>
        </Card>
      ) : (
        <ul className="space-y-3" aria-label="Upcoming initiatives">
          {initiatives.map((m) => (
            <li key={m.id}>
              <Card>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-rose-800">
                    <time dateTime={m.date}>{formatMissionDate(m.date)}</time>
                  </p>
                  <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-900">
                    {ORGANIZER_LABEL[m.organizerType]}
                  </span>
                </div>
                <h3 className="font-bold">{m.title}</h3>
                <p className="text-sm text-slate-700">{m.organizer}</p>
                <p className="text-sm">
                  {m.venue}, {m.city}
                </p>
                <p className="mt-1 text-sm">{m.services.join(' · ')}</p>
                <p className="mt-1 text-sm font-semibold">
                  {m.free ? (
                    <span className="text-emerald-800">
                      <span aria-hidden="true">✔ </span>Free
                    </span>
                  ) : (
                    <span className="text-slate-800">Fees may apply</span>
                  )}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
