import { Fragment, Suspense, lazy, useState } from 'react';
import { CITIES, CLINICS } from '../data';
import { clinicContact } from '../logic/contact';
import {
  formatDistance,
  nearestClinics,
  type ClinicFilter,
  type ClinicWithDistance,
  type LatLng,
} from '../logic/geo';
import { Card, IllustrativeNotice, Page, buttonSecondary, focusRing, inputClass } from '../ui';

const ClinicMap = lazy(() => import('./ClinicMap'));

interface Origin extends LatLng {
  label: string;
}

type LocationState = 'idle' | 'locating' | 'granted' | 'unavailable';

const TYPE_LABEL = { public: 'Public', private: 'Private' } as const;

export function ClinicsScreen() {
  const [cityId, setCityId] = useState(CITIES[0].id);
  const [gps, setGps] = useState<LatLng | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [filter, setFilter] = useState<ClinicFilter>('all');
  const [showMap, setShowMap] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const city = CITIES.find((c) => c.id === cityId) ?? CITIES[0];
  const origin: Origin = gps ? { ...gps, label: 'your location' } : { ...city, label: city.name };
  // 16 clinics: sorting on every render is cheap. Only the 5 nearest are shown.
  const clinics = nearestClinics(CLINICS, origin, filter);

  function locateMe() {
    if (!('geolocation' in navigator)) {
      setLocationState('unavailable');
      return;
    }
    setLocationState('locating');
    navigator.geolocation.getCurrentPosition(
      // Kept in memory only. Never stored or exported.
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationState('granted');
      },
      () => {
        setGps(null);
        setLocationState('unavailable');
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  function pickCity(id: string) {
    setCityId(id);
    setGps(null);
    if (locationState === 'granted') setLocationState('idle');
  }

  return (
    <Page title="Nearby clinics" intro="The 5 public and private clinics nearest to you, with the services they usually offer.">
      <IllustrativeNotice what="Clinic names, locations, services and voucher partners" />

      <Card className="space-y-3">
        <button
          type="button"
          onClick={locateMe}
          className={`${buttonSecondary} w-full`}
          disabled={locationState === 'locating'}
        >
          <span aria-hidden="true">📍&nbsp;</span>
          {locationState === 'locating' ? 'Finding you…' : 'Use my location'}
        </button>
        <div role="status" aria-live="polite" className="text-sm">
          {locationState === 'unavailable' && (
            <p className="text-red-800">
              Location is not available (permission denied or no secure connection). Pick your
              city below instead.
            </p>
          )}
          {locationState === 'granted' && <p>Sorted from your location. It is not saved.</p>}
        </div>
        <div>
          <label htmlFor="clinic-city" className="block font-semibold">
            Or pick your city
          </label>
          <select
            id="clinic-city"
            className={`${inputClass} mt-1`}
            value={gps ? '' : cityId}
            onChange={(e) => pickCity(e.target.value)}
          >
            {gps && <option value="">Using my location</option>}
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="font-semibold">Clinic type</legend>
          <div className="mt-1 flex gap-2">
            {(
              [
                ['all', 'All'],
                ['public', 'Public'],
                ['private', 'Private'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-400 bg-white px-2 has-[:checked]:border-rose-700 has-[:checked]:bg-rose-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-rose-700"
              >
                <input
                  type="radio"
                  name="clinic-type"
                  value={value}
                  checked={filter === value}
                  onChange={() => setFilter(value)}
                  className="h-5 w-5 accent-rose-700"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          aria-expanded={showMap}
          className={`${buttonSecondary} w-full`}
        >
          <span aria-hidden="true">🗺️&nbsp;</span>
          {showMap ? 'Hide map' : 'Show map'}
        </button>
      </Card>

      {showMap && (
        <Suspense fallback={<p className="text-sm">Loading map…</p>}>
          <ClinicMap clinics={clinics} center={origin} />
        </Suspense>
      )}

      <h3 className="font-bold">
        {clinics.length === 1 ? 'Nearest clinic' : `${clinics.length} nearest clinics`}, sorted from{' '}
        {origin.label}
      </h3>
      <p className="-mt-2 text-sm text-slate-700">Tap a clinic to book or call for an appointment.</p>
      <ol className="space-y-3" aria-label="Clinics, nearest first">
        {clinics.map((clinic) => (
          <li key={clinic.id}>
            <ClinicCard
              clinic={clinic}
              open={openId === clinic.id}
              onToggle={() => setOpenId((id) => (id === clinic.id ? null : clinic.id))}
            />
          </li>
        ))}
      </ol>
    </Page>
  );
}

const linkAction = `inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold ${focusRing}`;

function ClinicCard({
  clinic,
  open,
  onToggle,
}: {
  clinic: ClinicWithDistance;
  open: boolean;
  onToggle: () => void;
}) {
  const contact = clinicContact(clinic);
  const panelId = `clinic-panel-${clinic.id}`;

  return (
    <Card className={open ? 'ring-2 ring-rose-700' : ''}>
      <h4>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className={`block min-h-11 w-full rounded-lg text-left ${focusRing}`}
        >
          <span className="flex items-start justify-between gap-2">
            <span className="font-bold">{clinic.name}</span>
            <span className="shrink-0 font-semibold text-slate-800">{formatDistance(clinic.distanceKm)}</span>
          </span>
          <span className="block text-sm text-slate-700">
            <span
              className={`mr-1 inline-block rounded px-1.5 py-0.5 text-xs font-bold ${
                clinic.type === 'public' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
              }`}
            >
              {TYPE_LABEL[clinic.type]}
            </span>
            {clinic.area}, {clinic.city} · {clinic.hours}
          </span>
          <span className="mt-1 flex items-center justify-between text-sm font-semibold text-rose-800">
            <span>{open ? 'Hide booking options' : 'Book or call'}</span>
            <span aria-hidden="true">{open ? '▲' : '▼'}</span>
          </span>
        </button>
      </h4>

      {/* Spans, not a nested list, so the clinic list keeps one item per clinic. */}
      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs" data-testid={`services-${clinic.id}`}>
        <span className="font-semibold text-slate-700">Usually offers:</span>
        {clinic.services.map((service, i) => (
          <Fragment key={service}>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-800">{service}</span>
            {i < clinic.services.length - 1 && <span className="sr-only">, </span>}
          </Fragment>
        ))}
      </p>

      <div id={panelId} hidden={!open} className="mt-3 space-y-2 border-t border-slate-200 pt-3">
        {clinic.partner && (
          <p className="text-sm font-semibold text-rose-800">
            <span aria-hidden="true">🎟️ </span>Accepts INLABABU vouchers
          </p>
        )}

        {contact.bookingHref && (
          <a
            href={contact.bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkAction} bg-rose-700 text-white hover:bg-rose-800`}
          >
            <span aria-hidden="true">🗓️</span>
            Book an appointment online<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}

        {contact.telHref && (
          <a href={contact.telHref} className={`${linkAction} border border-rose-700 bg-white text-rose-800 hover:bg-rose-50`}>
            <span aria-hidden="true">📞</span>
            Call {contact.phoneDisplay}
          </a>
        )}
        {contact.phoneDisplay && !contact.telHref && (
          <p className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm">
            <span aria-hidden="true">📞 </span>
            Appointments: <strong>{contact.phoneDisplay}</strong>
            <span className="block text-xs text-slate-700">
              Sample number for this demo. Calling is turned off until the clinic confirms its
              details.
            </span>
          </p>
        )}
        {!contact.bookingHref && !contact.phoneDisplay && (
          <p className="text-sm">Walk in during opening hours: {clinic.hours}.</p>
        )}
        {!contact.bookingHref && contact.phoneDisplay && (
          <p className="text-xs text-slate-700">No online booking. Call ahead or walk in during opening hours.</p>
        )}

        <a
          className={`inline-flex min-h-11 items-center text-sm font-semibold text-rose-800 underline ${focusRing}`}
          href={`https://www.openstreetmap.org/?mlat=${clinic.lat}&mlon=${clinic.lng}#map=16/${clinic.lat}/${clinic.lng}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Directions in OpenStreetMap<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </Card>
  );
}
