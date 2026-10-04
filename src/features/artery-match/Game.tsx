import './artery-match.css';
import { MovesIcon, PlaqueIcon, ScoreIcon, useCoins } from '../../core';
import { Board } from './Board';
import { countCholesterol } from './engine';
import { GameOver } from './GameOver';
import { PreGameMenu } from './PreGameMenu';
import { FREE_PLAY } from './sessionStore';
import { useGameSession, type GameDeps, type MoveHint } from './useGameSession';

// Read out to screen readers only. A swap that makes no match shows no text on screen
// (the board shakes instead).
const HINT_TEXT: Record<Exclude<MoveHint, null>, string> = {
  'no-match': 'No match there. Try another swap.',
  cholesterol: 'Cholesterol blocks cannot be moved.',
};

const PLAQUE_NOTICE = 'Plaque is spreading! Match next to it to clear it.';

export function ArteriaMatchGame(props: GameDeps) {
  const session = useGameSession(props);
  const { balance } = useCoins();
  const { phase, board } = session;
  const inMenu = phase === 'idle' || phase === 'blocked';
  const canPlay = (props.freePlay ?? FREE_PLAY) || session.lives > 0;
  const showBoard = (phase === 'playing' || phase === 'over') && board !== null;
  const message = session.callout ?? (session.hint ? HINT_TEXT[session.hint] : '');
  const cells = board ? board.length * (board[0]?.length ?? 0) : 0;
  const plaquePct = board && cells > 0 ? Math.round((countCholesterol(board) * 100) / cells) : 0;

  return (
    <section aria-labelledby="am-title" className="flex h-full min-h-0 min-w-0 flex-col gap-3">
      {inMenu && (
        <PreGameMenu
          lives={session.lives}
          maxLives={session.maxLives}
          coins={balance}
          canPlay={canPlay}
          onPlay={session.start}
        />
      )}

      {!inMenu && (
        <div className="ui-card flex-none p-3">
          <h2 id="am-title" className="sr-only">
            Arteria Match
          </h2>
          {showBoard && (
            <div className="am-hud">
              <p className="ui-pill">
                <ScoreIcon className="h-4 w-4" />
                Score: {session.score.toLocaleString('en-US')}
              </p>
              <p className="ui-pill">
                <PlaqueIcon className="h-4 w-4" />
                Plaque: {plaquePct}%
              </p>
              <p className="ui-pill">
                <MovesIcon className="h-4 w-4" />
                Moves: {session.moves}
              </p>
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
      )}

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
          {/* Visible only for match callouts; hints stay screen-reader only. */}
          <div className="min-h-7 flex-none">
            <p role="status" className={session.callout ? 'text-center text-lg font-black text-baboo-600' : 'sr-only'}>
              {message}
            </p>
          </div>
          {/* The board is a square sized to the space left: the smaller of the free width and free height. */}
          <div className="am-board-area">
            <div className="am-board-fit">
              <Board
                board={board}
                selected={session.selected}
                clearing={session.clearing}
                locked={session.locked}
                invalid={session.invalid}
                bounce={session.bounce}
                onCellTap={session.tapCell}
                onDragSwap={session.dragSwap}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
