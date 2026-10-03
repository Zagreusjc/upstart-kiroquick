import { useState } from 'react';
import { getProvider } from '../../../core';
import { CHECKIN_COINS, type Mood } from '../constants';
import { babuStore } from '../store';
import { currentStreak, nextMilestone } from '../streak';
import { useBabuState } from '../useBabu';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Daily check-in button, streak and the next milestone. */
export function CheckinCard({ mood }: { mood: Mood }) {
  const state = useBabuState();
  // The confirmation belongs to the day it was earned, so it clears on a new day.
  const [last, setLast] = useState<{ date: string; text: string } | null>(null);

  const today = babuStore.today();
  const checkedInToday = state.lastCheckin === today;
  const streak = currentStreak(state, today);
  const next = nextMilestone(streak);
  const message = last?.date === today ? last.text : '';

  const handleCheckin = () => {
    const outcome = babuStore.checkIn(getProvider('coins'));
    if (!outcome.checkedIn) return;
    const parts = [`Checked in! Day ${outcome.streak} of your streak.`];
    if (outcome.coins > 0) parts.push(`+${outcome.coins} coins.`);
    if (outcome.bonus > 0) parts.push(`Includes a ${outcome.streak}-day streak bonus of ${outcome.bonus}.`);
    setLast({ date: outcome.date, text: parts.join(' ') });
  };

  let streakHint: string;
  if (streak > 0) streakHint = 'Keep it going tomorrow.';
  else if (state.lastCheckin === null) streakHint = 'Check in to start your streak.';
  else streakHint = 'Start a fresh streak today.';

  return (
    <section aria-labelledby="checkin-title" className="lg-card rounded-3xl p-4">
      <h2 id="checkin-title" className="text-lg font-bold">
        Daily check-in
      </h2>

      <p className="mt-2 text-2xl font-bold" data-testid="streak">
        <span aria-hidden="true">🔥 </span>
        {plural(streak, 'day')} streak
      </p>
      <p className="text-sm text-slate-600">{streakHint}</p>
      {next && (
        <p className="mt-1 text-sm text-slate-700">
          {plural(next.days - streak, 'more day')} to the {next.days}-day bonus (+{next.bonus} coins).
        </p>
      )}

      <button
        type="button"
        onClick={handleCheckin}
        disabled={checkedInToday}
        className="lg-glass lg-glass--pink mt-3 min-h-12 w-full rounded-full px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-800 disabled:cursor-not-allowed"
      >
        {checkedInToday
          ? '✓ Checked in today'
          : mood === 'rest'
            ? `Wake Baboo up and check in (+${CHECKIN_COINS} coins)`
            : `Check in for today (+${CHECKIN_COINS} coins)`}
      </button>

      <p role="status" className="mt-2 min-h-5 text-sm font-semibold text-emerald-800">
        {message}
      </p>
    </section>
  );
}
