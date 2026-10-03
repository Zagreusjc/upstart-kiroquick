import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLives } from '../../../core';
import { CARDS } from '../cards';
import { useLibrary, useMilestones } from '../useEconomy';
import { BloodBag } from './BloodBag';
import { ShareButton } from './ShareButton';

/**
 * Milestones page, themed as a blood bank with the "Baboo Bag" (a B+ blood bag,
 * a pun on "Baboo") as the life meter. Layout inspiration: a level-meter column
 * paired with refill-mission cards and a stepped progress track for the tiers.
 */
export function Milestones() {
  const { tiers } = useMilestones();
  const { lives, max } = useLives();
  const { readCount } = useLibrary();

  // Highest tier the player has reached, for the step track summary.
  const topReached = tiers.filter((t) => t.reached).length;

  return (
    <section aria-labelledby="milestones-title" className="space-y-5">
      <header className="space-y-1">
        <Link to=".." className="text-sm font-semibold text-rose-700 underline">
          ← Back to the library
        </Link>
        <h2 id="milestones-title" className="text-xl font-extrabold tracking-wide text-rose-800">
          B+ABOO BANK
        </h2>
        <p className="text-sm text-slate-600">
          Keep your Baboo Bag topped up. Clear goals, clear rewards, no lootboxes.
        </p>
      </header>

      {/* Meter + refill missions, echoing the PDF's level-meter-and-tasks row. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow">
          <BloodBag lives={lives} max={max} />
        </div>

        <div className="space-y-3">
          <RefillCard
            title="Learn More!"
            body="Read a CVD card in the library to top up a life and earn coins."
            cta={
              <Link
                to=".."
                className="inline-flex min-h-[44px] items-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                Go to Library
              </Link>
            }
          />
          <RefillCard
            title="Share the Game!"
            body="Share INLABABU with a friend to refill a life."
            cta={<ShareButton />}
          />
        </div>
      </div>

      {/* Stepped tier track, echoing the PDF's numbered progress row. */}
      <section aria-labelledby="track-title" className="rounded-2xl bg-white p-4 shadow">
        <h3 id="track-title" className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Donation drive
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          You have read {readCount} of {CARDS.length} cards and reached {topReached} of{' '}
          {tiers.length} tiers.
        </p>
        <ol className="mt-3 flex items-center gap-1" aria-label="Milestone tiers">
          {tiers.map((tier, i) => (
            <li key={tier.id} className="flex flex-1 items-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  tier.reached
                    ? 'bg-rose-600 text-white'
                    : 'border-2 border-rose-200 bg-white text-rose-400'
                }`}
                aria-label={`${tier.title}: ${tier.reached ? 'unlocked' : 'locked'}`}
              >
                {tier.reached ? '✓' : i + 1}
              </span>
              {i < tiers.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-1 h-1 flex-1 rounded-full ${
                    tiers[i + 1].reached ? 'bg-rose-600' : 'bg-rose-100'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Tier detail cards with transparent, visible progress. */}
      <ul className="space-y-3">
        {tiers.map((tier) => {
          const pct = Math.round((tier.progress / tier.cardsRequired) * 100);
          return (
            <li key={tier.id} className="rounded-2xl bg-white p-4 shadow">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{tier.title}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    tier.reached
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tier.reached ? `✓ Unlocked +${tier.coins}🪙` : `+${tier.coins}🪙`}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{tier.reward}</p>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={tier.cardsRequired}
                aria-valuenow={tier.progress}
                aria-label={`${tier.title}: ${tier.progress} of ${tier.cardsRequired} cards read`}
              >
                <div
                  className="h-full rounded-full bg-rose-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Read {tier.progress} of {tier.cardsRequired} cards
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** A single refill-mission card: title, blurb and a call to action. */
function RefillCard({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <h3 className="font-semibold text-rose-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
      <div className="mt-3">{cta}</div>
    </div>
  );
}
