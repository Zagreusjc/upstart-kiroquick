import { useHealth } from '../../../core';
import { DISCLAIMER, MOOD_HINTS, MOOD_LABELS, MOOD_MESSAGES } from '../constants';
import { assessDay, computeMood } from '../mood';
import { babuStore } from '../store';
import { useBabuState } from '../useBabu';
import { BabuHeart } from './BabuHeart';
import { CheckinCard } from './CheckinCard';
import { DemoControls } from './DemoControls';
import { HealthInput } from './HealthInput';

/**
 * Hero height so Baboo fills the first screen. The app shell (owned by Jolo)
 * has a 52px header, 16px main top padding and a 55px bottom nav plus the
 * safe area. Another 16px matches the card gap, so the next card starts
 * exactly at the bottom nav and stays below the fold.
 * 52 + 16 + 55 + 16 = 139. Update this if the shell changes.
 */
const HERO_HEIGHT = 'min-h-[calc(100dvh_-_139px_-_env(safe-area-inset-bottom))]';

/** Home tab: a full-screen Baboo hero, then snapshot, check-in and demo controls below the fold. */
export function Home() {
  const { snapshot } = useHealth();
  const state = useBabuState();
  const mood = computeMood(snapshot, state, babuStore.today());
  const day = assessDay(snapshot);
  const message = MOOD_MESSAGES[mood].replace('{n}', String(day.goals.count));
  const hint = mood !== 'rest' && day.reason ? MOOD_HINTS[day.reason] : null;

  const scrollToDetails = () => {
    const target = document.getElementById('home-details');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4">
      <section
        aria-labelledby="babu-title"
        data-testid="babu-hero"
        className={`${HERO_HEIGHT} flex flex-col items-center justify-between rounded-3xl bg-linear-to-b from-white to-rose-100 px-4 pt-6 pb-3 text-center shadow-sm`}
      >
        <h2 id="babu-title" className="text-sm font-semibold tracking-wide text-rose-700 uppercase">
          Your Baboo
        </h2>

        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <BabuHeart mood={mood} className="h-[min(72vw,42dvh)] w-[min(72vw,42dvh)] drop-shadow-md" />
          <p className="mt-4 text-3xl font-bold" data-testid="mood-label">
            {MOOD_LABELS[mood]}
          </p>
          <p className="mt-2 max-w-xs text-base text-slate-700" aria-live="polite">
            {message}
          </p>
          {hint && (
            <p className="mt-1 max-w-xs text-sm font-semibold text-rose-800" data-testid="mood-hint">
              {hint}
            </p>
          )}
          <p className="mt-3 text-xs text-slate-600">{DISCLAIMER}.</p>
        </div>

        <button
          type="button"
          onClick={scrollToDetails}
          className="flex min-h-11 flex-col items-center rounded-xl px-4 text-sm font-semibold text-rose-700 hover:text-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-800"
        >
          Today's snapshot and check-in
          <span aria-hidden="true" className="text-lg leading-none motion-safe:animate-bounce">
            ⌄
          </span>
        </button>
      </section>

      <div id="home-details" className="scroll-mt-16 space-y-4">
        <HealthInput mood={mood} day={day} hint={hint} />
        <CheckinCard mood={mood} />
        <DemoControls />
      </div>
    </div>
  );
}
