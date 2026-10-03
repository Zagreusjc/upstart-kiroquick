import { useHealth } from '../../../core';
import { DISCLAIMER, MOOD_LABELS, MOOD_RULES, SLIDERS, TARGETS, type Mood } from '../constants';
import type { DayAssessment } from '../mood';

type Field = 'steps' | 'sleepHours' | 'activityMinutes';

const FIELDS: { key: Field; label: string; unit: string; goal: string }[] = [
  { key: 'steps', label: 'Steps', unit: 'steps', goal: `${TARGETS.steps.toLocaleString('en-US')} steps` },
  {
    key: 'sleepHours',
    label: 'Sleep',
    unit: 'hours',
    goal: `${TARGETS.sleepHours} to ${MOOD_RULES.sleep.healthyMaxHours} hours`,
  },
  { key: 'activityMinutes', label: 'Activity', unit: 'minutes', goal: `${TARGETS.activityMinutes} minutes` },
];

const fmt = (n: number) => n.toLocaleString('en-US');

const ENERGY_BAR: Record<Mood, string> = {
  happy: 'bg-emerald-600',
  ok: 'bg-amber-500',
  tired: 'bg-rose-500',
  rest: 'bg-violet-400',
};

/** Goal status text for one slider. Sleep is a range, so too much sleep is called out too. */
function status(key: Field, value: number): { text: string; met: boolean } {
  if (key === 'sleepHours') {
    if (value > MOOD_RULES.sleep.healthyMaxHours) return { text: 'A bit too much', met: false };
    if (value < MOOD_RULES.sleep.exhaustedBelowHours) return { text: 'Very short', met: false };
  }
  const met = key === 'sleepHours' ? value >= TARGETS.sleepHours : value >= TARGETS[key];
  return { text: met ? '✓ Goal met' : 'Not yet', met };
}

/** Today's snapshot with manual demo sliders. Writes to the `health` provider. */
export function HealthInput({ mood, day, hint }: { mood: Mood; day: DayAssessment; hint: string | null }) {
  const { snapshot, update } = useHealth();

  return (
    <section aria-labelledby="snapshot-title" className="lg-card rounded-3xl p-4">
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

      {/* Live link between the sliders and Baboo, visible while sliding. */}
      <div className="mt-3 rounded-xl bg-rose-50 p-3" data-testid="babu-now">
        <p className="flex items-baseline justify-between gap-2 text-sm" aria-live="polite">
          <span>
            Baboo right now: <strong>{MOOD_LABELS[mood]}</strong>
          </span>
          <span className="text-slate-700">
            Energy <strong>{day.energy}%</strong>
          </span>
        </p>
        <div
          role="meter"
          aria-label="Baboo's energy"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={day.energy}
          aria-valuetext={`${day.energy}%, ${MOOD_LABELS[mood]}`}
          className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white ring-1 ring-rose-200"
        >
          <div className={`h-full rounded-full ${ENERGY_BAR[mood]} transition-[width]`} style={{ width: `${day.energy}%` }} />
        </div>
        {hint && <p className="mt-2 text-sm text-slate-700">{hint}</p>}
        <p className="mt-1 text-xs text-slate-600">
          Sleep counts most. Under {MOOD_RULES.sleep.exhaustedBelowHours} hours of sleep, or barely
          moving, keeps Baboo tired however good the rest is.
        </p>
      </div>

      <div className="mt-3 space-y-3">
        {FIELDS.map(({ key, label, unit, goal }) => {
          const value = snapshot[key];
          const { text, met } = status(key, value);
          const id = `babu-${key}`;
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <label htmlFor={id} className="font-semibold">
                  {label}
                </label>
                <span className="text-slate-700">
                  <span className="font-semibold">{fmt(value)}</span> {unit} · goal {goal}{' '}
                  <span className={met ? 'font-semibold text-emerald-700' : 'text-slate-600'}>{text}</span>
                </span>
              </div>
              <input
                id={id}
                type="range"
                min={SLIDERS[key].min}
                max={SLIDERS[key].max}
                step={SLIDERS[key].step}
                value={Math.min(value, SLIDERS[key].max)}
                aria-valuetext={`${fmt(value)} ${unit}, goal ${goal}, ${text.replace('✓ ', '')}`}
                onChange={(event) => update({ [key]: Number(event.target.value) })}
                className="h-11 w-full cursor-pointer accent-rose-600"
              />
            </div>
          );
        })}
      </div>

      <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-600" data-testid="snapshot-disclaimer">
        {DISCLAIMER}.
      </p>
    </section>
  );
}
