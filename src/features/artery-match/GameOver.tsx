import { useEffect, useRef, useState } from 'react';
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
    <div className="rounded-xl bg-white p-4 shadow">
      <h3 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-rose-800 focus:outline-none">
        Complete Arterial Occlusion
      </h3>
      <p className="mt-1 text-sm text-slate-700">No swaps can restore flow. Game over.</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-rose-50 p-2">
          <dt className="text-xs text-slate-600">Vascular Flow Score</dt>
          <dd className="text-2xl font-bold">{score.toLocaleString('en-US')}</dd>
        </div>
        <div className="rounded-lg bg-rose-50 p-2">
          <dt className="text-xs text-slate-600">Coins earned</dt>
          <dd className="text-2xl font-bold">{coinsEarned}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={!ready || shareStatus === 'sharing'}
          onClick={() => onShare(card?.blob ?? null)}
          className="min-h-11 rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          Share brag card
        </button>
        <button
          type="button"
          onClick={onPlayAgain}
          className="min-h-11 rounded-lg border-2 border-rose-700 px-4 py-2 font-semibold text-rose-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
        >
          Play again
        </button>
      </div>
      <p role="status" className="mt-2 min-h-6 text-sm font-medium text-slate-800">
        {SHARE_STATUS_TEXT[shareStatus]}
      </p>
      <p className="text-xs text-slate-600">Sharing your brag card earns 1 life (once per game).</p>
    </div>
  );
}
