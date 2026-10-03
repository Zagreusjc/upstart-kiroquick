import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLives } from '../../../core';
import { BloodBag } from './BloodBag';
import { ShareButton } from './ShareButton';

/**
 * Milestones page, themed as a blood bank. A large "Blood Bank" life meter
 * (a B+ blood bag, a pun on "Baboo") shows the player's current lives, paired
 * with the refill missions that top it back up.
 */
export function Milestones() {
  const { lives, max } = useLives();

  return (
    <section aria-labelledby="milestones-title" className="space-y-5">
      <header className="space-y-1">
        <Link to=".." className="text-sm font-semibold text-rose-700 underline">
          ← Back to the library
        </Link>
        <h2 id="milestones-title" className="text-xl font-extrabold tracking-wide text-rose-800">
          Blood Bank
        </h2>
        <p className="text-sm text-slate-600">
          Keep your Blood Bank topped up. Clear goals, clear rewards, no lootboxes.
        </p>
      </header>

      {/* Large life meter filling most of its box, with the refill missions. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl bg-white p-4 shadow">
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
