import { Link } from 'react-router-dom';
import { useMilestones } from '../useEconomy';
import { ShareButton } from './ShareButton';

/** Transparent milestone tiers with visible progress, plus share-for-life. */
export function Milestones() {
  const { tiers } = useMilestones();

  return (
    <section aria-labelledby="milestones-title" className="space-y-4">
      <header className="space-y-1">
        <Link to=".." className="text-sm font-semibold text-rose-700 underline">
          ← Back to the library
        </Link>
        <h2 id="milestones-title" className="text-lg font-bold">
          Milestones
        </h2>
        <p className="text-sm text-slate-600">
          Clear goals, clear rewards. No surprises, no lootboxes.
        </p>
      </header>

      <ul className="space-y-3">
        {tiers.map((tier) => {
          const pct = Math.round((tier.progress / tier.cardsRequired) * 100);
          return (
            <li key={tier.id} className="rounded-xl bg-white p-4 shadow">
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

      <section aria-labelledby="share-title" className="rounded-xl bg-white p-4 shadow">
        <h3 id="share-title" className="font-semibold">
          Out of lives?
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Share INLABABU with a friend to earn a life.
        </p>
        <ShareButton className="mt-3" />
      </section>
    </section>
  );
}
