import { useState } from 'react';
import { getEconomyStore } from '../store';

const SHARE_PAYLOAD = {
  title: 'Inlababoo',
  text: 'Take care of your Baboos, by taking care of yourself! Learn about your heart and earn screening vouchers.',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://inlababu.app',
  context: 'library',
};

type Status = 'idle' | 'sharing' | 'shared' | 'copied' | 'cancelled';

/** Share-for-life button. Uses the Web Share API with a clipboard fallback. */
export function ShareButton({ className = '' }: { className?: string }) {
  const { sharer } = getEconomyStore();
  const [status, setStatus] = useState<Status>('idle');

  const onShare = async () => {
    setStatus('sharing');
    const result = await sharer.share(SHARE_PAYLOAD);
    if (!result.completed) {
      setStatus('cancelled');
      return;
    }
    setStatus(result.channel === 'clipboard' ? 'copied' : 'shared');
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onShare}
        disabled={status === 'sharing'}
        className="min-h-[44px] w-full rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-60"
      >
        {status === 'sharing' ? 'Sharing…' : 'Share for a life ❤️'}
      </button>
      <p className="mt-2 min-h-[1.25rem] text-sm" role="status" aria-live="polite">
        {status === 'shared' && 'Thanks for sharing! A life was added.'}
        {status === 'copied' && 'Link copied to your clipboard. A life was added.'}
        {status === 'cancelled' && 'Share cancelled. No life added.'}
      </p>
    </div>
  );
}
