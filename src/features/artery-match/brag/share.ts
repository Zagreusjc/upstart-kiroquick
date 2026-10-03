// Web Share decision logic for the brag card. No core imports: rewards happen in onShared.
import { challengeText } from './bragCard';

export type ShareChannel = 'web_share_file' | 'web_share_text';
/** 'unavailable': no PNG was generated and nothing could be shared or downloaded. */
export type ShareOutcome = 'shared-file' | 'shared-text' | 'downloaded' | 'cancelled' | 'unavailable';

/** The parts of `navigator` used for sharing (injectable for tests). */
export interface ShareNavigator {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data?: ShareData) => boolean;
}

export const BRAG_FILENAME = 'arteria-match-score.png';

/** Saves a blob through a temporary object URL and anchor. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}

export interface ShareBragCardOptions {
  blob: Blob | null;
  score: number;
  url: string;
  nav: ShareNavigator;
  download: (blob: Blob, filename: string) => void;
  /** Called once, only after a share promise resolves. */
  onShared: (channel: ShareChannel) => void;
}

/**
 * Shares the PNG as a file when supported; otherwise downloads it and shares text and URL
 * if Web Share exists. A cancelled share (AbortError) or a download-only fallback never
 * calls onShared, so no reward can be farmed. Without a PNG and without a successful text
 * share the result is 'unavailable', never a claimed download.
 */
export async function shareBragCard({
  blob,
  score,
  url,
  nav,
  download,
  onShared,
}: ShareBragCardOptions): Promise<ShareOutcome> {
  const title = 'Arteria Match';
  const text = challengeText(score);
  let downloaded = false;
  const downloadOnce = () => {
    if (blob && !downloaded) {
      downloaded = true;
      download(blob, BRAG_FILENAME);
    }
  };

  try {
    if (blob && nav.share && nav.canShare) {
      const file = new File([blob], BRAG_FILENAME, { type: 'image/png' });
      if (nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title, text });
        onShared('web_share_file');
        return 'shared-file';
      }
    }
    downloadOnce();
    if (nav.share) {
      await nav.share({ title, text, url });
      onShared('web_share_text');
      return 'shared-text';
    }
    return blob ? 'downloaded' : 'unavailable';
  } catch (error) {
    if (isAbortError(error)) return 'cancelled';
    downloadOnce();
    return blob ? 'downloaded' : 'unavailable';
  }
}
