import { babuStore } from '../store';
import { useBabuState } from '../useBabu';

const button =
  'min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700';

/** Demo-only controls that move Baboo's calendar forward. */
export function DemoControls() {
  const { dayOffset } = useBabuState();
  const today = babuStore.today();

  return (
    <details className="rounded-2xl bg-white p-4 shadow-sm">
      <summary className="min-h-11 cursor-pointer content-center font-semibold">
        Demo controls{dayOffset > 0 ? ` (Baboo's day: ${today}, +${dayOffset})` : ''}
      </summary>
      <p className="mt-2 text-sm text-slate-600">
        For demos only. Moves Baboo's calendar so you can show streaks, bonuses and Rest Mode in one
        sitting.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={button} onClick={() => babuStore.shiftDays(1)}>
          Next day
        </button>
        <button type="button" className={button} onClick={() => babuStore.shiftDays(2)}>
          Skip 2 days
        </button>
        <button type="button" className={button} onClick={() => babuStore.resetDemoDays()}>
          Reset demo days
        </button>
      </div>
    </details>
  );
}
