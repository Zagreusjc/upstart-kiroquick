import { useHealth } from '../../../core';
import { DISCLAIMER, MOOD_LABELS, MOOD_MESSAGES } from '../constants';
import { computeMood, goalsMet } from '../mood';
import { babuStore } from '../store';
import { useBabuState } from '../useBabu';
import { BabuHeart } from './BabuHeart';
import { CheckinCard } from './CheckinCard';
import { DemoControls } from './DemoControls';
import { HealthInput } from './HealthInput';

/** Home tab: Babu, today's snapshot, check-in and streak. */
export function Home() {
  const { snapshot } = useHealth();
  const state = useBabuState();
  const mood = computeMood(snapshot, state, babuStore.today());
  const message = MOOD_MESSAGES[mood].replace('{n}', String(goalsMet(snapshot).count));

  return (
    <div className="space-y-4">
      <section aria-labelledby="babu-title" className="rounded-2xl bg-white p-4 text-center shadow-sm">
        <h2 id="babu-title" className="sr-only">
          Your Babu
        </h2>
        <div className="flex justify-center">
          <BabuHeart mood={mood} />
        </div>
        <p className="mt-1 text-xl font-bold" data-testid="mood-label">
          {MOOD_LABELS[mood]}
        </p>
        <p className="mt-1 text-slate-700" aria-live="polite">
          {message}
        </p>
        <p className="mt-2 text-xs text-slate-600">{DISCLAIMER}.</p>
      </section>

      <HealthInput />
      <CheckinCard mood={mood} />
      <DemoControls />
    </div>
  );
}
