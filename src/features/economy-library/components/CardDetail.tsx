import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCard } from '../cards';
import { useLibrary } from '../useEconomy';

/**
 * Card detail. Opening a card marks it read on mount, which (on the first read)
 * awards coins and a life once and emits `library.read`. Always shows the
 * cited source(s) and the disclaimer.
 */
export function CardDetail() {
  const { cardId = '' } = useParams();
  const navigate = useNavigate();
  const { markRead, isRead } = useLibrary();
  const card = getCard(cardId);
  const awarded = useRef(false);

  useEffect(() => {
    if (!card) return;
    // Mark read once per mount; the store guards against double rewards.
    if (!awarded.current) {
      awarded.current = true;
      markRead(card.id);
    }
  }, [card, markRead]);

  if (!card) {
    return (
      <section className="space-y-3">
        <p className="text-sm text-slate-600">That card was not found.</p>
        <Link to=".." className="text-sm font-semibold text-rose-700 underline">
          Back to the library
        </Link>
      </section>
    );
  }

  return (
    <article aria-labelledby="card-title" className="space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="min-h-[44px] text-sm font-semibold text-rose-700 underline"
      >
        ← Back
      </button>

      <header className="space-y-1">
        <h2 id="card-title" className="text-xl font-bold">
          {card.title}
        </h2>
        <p className="text-sm text-slate-600">
          {isRead(card.id) ? 'Read' : 'New'} · Reviewed {card.reviewed}
        </p>
      </header>

      <div className="space-y-3 rounded-xl bg-white p-4 shadow">
        {card.body.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-800">
            {paragraph}
          </p>
        ))}
        <p className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-900">
          💡 {card.takeaway}
        </p>
      </div>

      <section aria-labelledby="sources-title" className="space-y-2">
        <h3 id="sources-title" className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Sources
        </h3>
        <ul className="space-y-1">
          {card.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-semibold text-rose-700 underline"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs italic text-slate-500">Screening awareness, not a diagnosis.</p>
    </article>
  );
}
