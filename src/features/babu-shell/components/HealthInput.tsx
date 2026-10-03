import { useHealth } from '../../../core';
import { SLIDERS, TARGETS } from '../constants';

type Field = 'steps' | 'sleepHours' | 'activityMinutes';

const FIELDS: { key: Field; label: string; unit: string }[] = [
  { key: 'steps', label: 'Steps', unit: 'steps' },
  { key: 'sleepHours', label: 'Sleep', unit: 'hours' },
  { key: 'activityMinutes', label: 'Activity', unit: 'minutes' },
];

const fmt = (n: number) => n.toLocaleString('en-US');

/** Today's snapshot with manual demo sliders. Writes to the `health` provider. */
export function HealthInput() {
  const { snapshot, update } = useHealth();

  return (
    <section aria-labelledby="snapshot-title" className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 id="snapshot-title" className="text-lg font-bold">
          Today's snapshot
        </h2>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
          Demo input
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Demo input: move the sliders to enter today's numbers by hand. INLABABU does not read your
        phone's sensors.
      </p>

      <div className="mt-3 space-y-3">
        {FIELDS.map(({ key, label, unit }) => {
          const value = snapshot[key];
          const target = TARGETS[key];
          const met = value >= target;
          const id = `babu-${key}`;
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <label htmlFor={id} className="font-semibold">
                  {label}
                </label>
                <span className="text-slate-700">
                  <span className="font-semibold">{fmt(value)}</span> / {fmt(target)} {unit}{' '}
                  {met ? (
                    <span className="font-semibold text-emerald-700">✓ Goal met</span>
                  ) : (
                    <span className="text-slate-600">Not yet</span>
                  )}
                </span>
              </div>
              <input
                id={id}
                type="range"
                min={SLIDERS[key].min}
                max={SLIDERS[key].max}
                step={SLIDERS[key].step}
                value={Math.min(value, SLIDERS[key].max)}
                aria-valuetext={`${fmt(value)} ${unit}, goal ${fmt(target)}`}
                onChange={(event) => update({ [key]: Number(event.target.value) })}
                className="h-11 w-full cursor-pointer accent-rose-600"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
