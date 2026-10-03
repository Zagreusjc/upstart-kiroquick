import { babuStore } from '../store';
import { useBabuState } from '../useBabu';

const button =
  'lg-glass lg-glass--clear min-h-11 rounded-full px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700';

/** Demo-only controls that move Baboo's calendar forward. */
export function DemoControls() {
  const { dayOffset } = useBabuState();
  const today = babuStore.today();

  return (
    <details className="lg-card rounded-3xl p-4">
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
