import './artery-match.css';
import { EARN_LIVES_HINT } from './adapters';
import { Board } from './Board';
import { countCholesterol } from './engine';
import { GameOver } from './GameOver';
import { useGameSession, type GameDeps, type MoveHint } from './useGameSession';

const HINT_TEXT: Record<Exclude<MoveHint, null>, string> = {
  'no-match': 'No match there. Try another swap.',
  cholesterol: 'Cholesterol blocks cannot be moved.',
};

const PLAQUE_NOTICE = 'Plaque is spreading! Match next to it to clear it.';

const primaryButton =
  'min-h-11 rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700 focus-visible:ring-offset-2';

export function ArteriaMatchGame(props: GameDeps) {
  const session = useGameSession(props);
  const { phase, board } = session;
  const showBoard = (phase === 'playing' || phase === 'over') && board !== null;
  const message = session.callout ?? (session.hint ? HINT_TEXT[session.hint] : '');
  const cells = board ? board.length * (board[0]?.length ?? 0) : 0;
  const plaquePct = board && cells > 0 ? Math.round((countCholesterol(board) * 100) / cells) : 0;

  return (
    <section aria-labelledby="am-title" className="flex flex-col gap-3">
      <div className="rounded-xl bg-white p-4 shadow">
        <h2 id="am-title" className="text-lg font-bold">
          Arteria Match
        </h2>
        {phase === 'idle' && (
          <>
            <p className="mt-1 text-sm text-slate-700">
              Match 3 or more blood cells to keep the artery flowing. Cholesterol plaque spreads if
              you leave it: match right next to a block to clear it.
            </p>
            <p className="mt-2 text-sm font-medium">Each game costs 1 life.</p>
            <button type="button" onClick={session.start} className={`mt-3 w-full ${primaryButton}`}>
              Play
            </button>
          </>
        )}
        {phase === 'blocked' && (
          <>
            <p role="alert" className="mt-2 font-semibold text-rose-800">
              You're out of lives.
            </p>
            <p className="mt-1 text-sm text-slate-700">{EARN_LIVES_HINT}</p>
            <button type="button" onClick={session.start} className={`mt-3 w-full ${primaryButton}`}>
              Try again
            </button>
          </>
        )}
        {showBoard && (
          <div className="mt-2 flex items-center justify-between text-sm font-semibold">
            <p>Score: {session.score.toLocaleString('en-US')}</p>
            <p>Plaque: {plaquePct}%</p>
            <p>Moves: {session.moves}</p>
          </div>
        )}
        {/* Kept mounted so screen readers announce the notice when its text appears. */}
        {showBoard && (
          <p role="status" className={`text-sm font-semibold text-amber-900 ${session.plaqueNotice ? 'mt-2' : ''}`}>
            {session.plaqueNotice ? PLAQUE_NOTICE : ''}
          </p>
        )}
        {/* Announced once per finished move; the visible score above updates every playback frame. */}
        <p aria-live="polite" aria-atomic="true" className="sr-only">
          {showBoard && session.settledScore !== null
            ? `Score after move ${session.moves}: ${session.settledScore.toLocaleString('en-US')}`
            : ''}
        </p>
      </div>

      {phase === 'over' && (
        <GameOver
          score={session.score}
          coinsEarned={session.coinsEarned}
          makeCard={session.makeCard}
          shareStatus={session.shareStatus}
          onShare={(blob) => void session.share(blob)}
          onPlayAgain={session.start}
        />
      )}

      {showBoard && (
        <>
          <p role="status" className="min-h-8 text-center text-xl font-extrabold text-rose-800">
            {message}
          </p>
          <Board
            board={board}
            selected={session.selected}
            clearing={session.clearing}
            locked={session.locked}
            invalid={session.invalid}
            onCellTap={session.tapCell}
            onDragSwap={session.dragSwap}
          />
        </>
      )}
    </section>
  );
}
