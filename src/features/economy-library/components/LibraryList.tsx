import { Link } from 'react-router-dom';
import { CARDS } from '../cards';
import { useLibrary } from '../useEconomy';
import { CardArt } from './CardArt';

/** The Library tab landing: a scannable list of cards with read status. */
export function LibraryList() {
  const { isRead, readCount } = useLibrary();

  // Show the cards that still refill a life first (unread), keeping their
  // original order within each group (stable sort).
  const sorted = [...CARDS].sort((a, b) => Number(isRead(a.id)) - Number(isRead(b.id)));

  return (
    <section aria-labelledby="library-title" className="space-y-4">
      <header className="space-y-1">
        <h2 id="library-title" className="text-lg font-bold">
          Heart Library
        </h2>
        <p className="text-sm text-slate-600">
          Read a card to earn coins and refill a life. {readCount} of {CARDS.length} read.
        </p>
        <Link
          to="milestones"
          className="inline-block text-sm font-semibold text-rose-700 underline"
        >
          View milestones
        </Link>
      </header>

      <ul className="space-y-2">
        {sorted.map((card) => {
          const read = isRead(card.id);
          return (
            <li key={card.id}>
              <Link
                to={`card/${card.id}`}
                className="flex min-h-[44px] items-center gap-3 rounded-xl bg-white p-3 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <CardArt cardId={card.id} size="thumb" />
                <span className="flex-1">
                  <span className="block font-semibold">{card.title}</span>
                  <span className="block text-sm text-slate-600">{card.summary}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                    read ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {read ? '✓ Read' : '❤️ +Life'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
