import { useState } from 'react';
import { DISCLAIMER } from '../constants';
import { babuStore } from '../store';
import { BabuHeart } from './BabuHeart';

/** First-run screen: what INLABABOO is, the disclaimer and on-device consent. */
export function Onboarding() {
  const [consent, setConsent] = useState(false);

  return (
    <section aria-labelledby="onboarding-title" className="ui-card p-4">
      <div className="flex justify-center">
        <BabuHeart mood="happy" className="h-[clamp(4rem,13dvh,7rem)] w-[clamp(4rem,13dvh,7rem)]" />
      </div>
      <h2 id="onboarding-title" className="mt-2 text-center text-2xl font-bold">
        Meet Baboo
      </h2>
      <p className="mt-2 text-slate-700">
        Take care of your Baboos, by taking care of yourself! Baboo is a heart that reflects your
        steps, sleep and activity.
      </p>
      <ul className="mt-3 space-y-1 text-sm text-slate-700 [@media(max-height:700px)]:hidden">
        <li>
          <strong>Track:</strong> log your day and check in to keep Baboo happy.
        </li>
        <li>
          <strong>Play:</strong> clear your arteries in Arteria Match.
        </li>
        <li>
          <strong>Redeem:</strong> turn coins into discounted health screenings.
        </li>
      </ul>
      <p className="mt-3 text-sm text-slate-700 [@media(max-height:700px)]:hidden">
        If you take a break, Baboo simply rests and waits for you.
      </p>

      <div role="note" className="mt-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-sm">
        <p className="font-bold text-amber-950">{DISCLAIMER}.</p>
        <p className="mt-1 text-amber-950">
          INLABABOO helps you learn about heart health. It does not diagnose or treat any condition.
          Health numbers are demo input that you enter yourself.
        </p>
      </div>

      <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-6 w-6 shrink-0 accent-rose-600"
        />
        <span>
          I agree that INLABABOO stores my data on this device only. Nothing is sent to a server.
        </span>
      </label>

      <button
        type="button"
        disabled={!consent}
        onClick={() => babuStore.acceptOnboarding()}
        className="mt-3 min-h-11 w-full rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-700"
      >
        Start caring for Baboo
      </button>
    </section>
  );
}
