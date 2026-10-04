import { useEffect, useRef, useState } from 'react';
import { CoinIcon, ScoreIcon } from '../../core';
import type { ShareStatus } from './useGameSession';

interface GameOverProps {
  score: number;
  coinsEarned: number;
  makeCard: (score: number) => Promise<Blob>;
  shareStatus: ShareStatus;
  onShare(blob: Blob | null): void;
  onPlayAgain(): void;
}

const SHARE_STATUS_TEXT: Record<ShareStatus, string> = {
  idle: '',
  sharing: 'Opening share…',
  'shared-life': 'Shared! +1 life',
  shared: 'Shared!',
  cancelled: 'Share cancelled',
  downloaded: 'Image downloaded',
  unavailable: 'Brag card image unavailable. Nothing was shared.',
};

export function GameOver({ score, coinsEarned, makeCard, shareStatus, onShare, onPlayAgain }: GameOverProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The PNG is generated up front so the share tap can call navigator.share inside the
  // user activation. Running twice under StrictMode is harmless.
  const [card, setCard] = useState<{ score: number; blob: Blob | null } | null>(null);

  useEffect(() => {
    let active = true;
    makeCard(score).then(
      (blob) => {
        if (active) setCard({ score, blob });
      },
      () => {
        if (active) setCard({ score, blob: null });
      },
    );
    return () => {
      active = false;
    };
  }, [makeCard, score]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const ready = card !== null && card.score === score;

  return (
    <div className="ui-card p-4">
      <h3 ref={headingRef} tabIndex={-1} className="text-xl font-black text-baboo-600 focus:outline-none">
        Complete Arterial Occlusion
      </h3>
      <p className="mt-1 text-sm text-baboo-900/85">No swaps can restore flow. Game over.</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-baboo-50 p-2 shadow-[inset_0_-3px_0_rgba(194,58,79,0.14)]">
          <dt className="flex items-center justify-center gap-1 text-xs font-bold text-baboo-900/80">
            <ScoreIcon className="h-4 w-4" />
            Vascular Flow Score
          </dt>
          <dd className="text-2xl font-black">{score.toLocaleString('en-US')}</dd>
        </div>
        <div className="rounded-2xl bg-baboo-50 p-2 shadow-[inset_0_-3px_0_rgba(194,58,79,0.14)]">
          <dt className="flex items-center justify-center gap-1 text-xs font-bold text-baboo-900/80">
            <CoinIcon className="h-4 w-4" />
            Coins earned
          </dt>
          <dd className="text-2xl font-black">{coinsEarned}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={!ready || shareStatus === 'sharing'}
          onClick={() => onShare(card?.blob ?? null)}
          className="ui-btn"
        >
          Share brag card
        </button>
        <button
          type="button"
          onClick={onPlayAgain}
          className="ui-btn ui-btn--white"
        >
          Play again
        </button>
      </div>
      <p role="status" className="mt-2 min-h-6 text-sm font-bold text-baboo-900">
        {SHARE_STATUS_TEXT[shareStatus]}
      </p>
      <p className="text-xs text-baboo-900/80">Sharing your brag card earns 1 life (once per game).</p>
    </div>
  );
}
