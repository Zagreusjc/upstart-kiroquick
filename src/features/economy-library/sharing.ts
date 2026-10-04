import { loadJSON, saveJSON } from '../../core';
import type { LivesController } from './lives';

/**
 * Share-for-life. The player shares the app through the Web Share API (with a
 * clipboard fallback for browsers without it). A completed share awards 1 life
 * once per share event and emits `share.completed`. Cancelling awards nothing.
 *
 * The browser plumbing is injected so the flow is unit-testable without a DOM.
 */

export const SHARE_STORAGE_KEY = 'inlababoo.share.v1';

export type ShareChannel = 'web_share' | 'clipboard';

export interface ShareResult {
  completed: boolean;
  channel: ShareChannel | null;
  /** True when the clipboard fallback was used. */
  usedFallback: boolean;
}

export interface ShareEnv {
  /**
   * Attempt the native share. Resolve true if the share completed, false if it
   * is unavailable (so we fall back), and reject/throw if the user cancelled.
   */
  nativeShare?: (data: { title: string; text: string; url: string }) => Promise<boolean>;
  /** Copy text to the clipboard. Resolve true on success. */
  copyToClipboard?: (text: string) => Promise<boolean>;
}

export interface ShareDeps {
  lives: Pick<LivesController, 'awardOnce'>;
  emitShare: (channel: string, context: string) => void;
  env: ShareEnv;
  /** Supplies a unique id per share attempt (so each completed share is keyed). */
  newShareId?: () => string;
  now?: () => number;
}

export interface SharePayload {
  title: string;
  text: string;
  url: string;
  /** Context label for analytics, for example 'library' or 'game'. */
  context?: string;
}

interface ShareState {
  shares: string[];
}

/** Build the browser-backed environment. Safe to call where globals are absent. */
export function browserShareEnv(): ShareEnv {
  return {
    nativeShare:
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'
        ? async (data) => {
            await navigator.share(data);
            return true;
          }
        : undefined,
    copyToClipboard:
      typeof navigator !== 'undefined' && navigator.clipboard?.writeText
        ? async (text) => {
            await navigator.clipboard.writeText(text);
            return true;
          }
        : undefined,
  };
}

export function createSharer(deps: ShareDeps, storageKey: string = SHARE_STORAGE_KEY) {
  const saved = loadJSON<ShareState>(storageKey, { shares: [] });
  const shares: string[] = Array.isArray(saved.shares) ? [...saved.shares] : [];
  const newShareId =
    deps.newShareId ?? (() => `share-${Date.now().toString(36)}-${shares.length}`);

  const recordAndReward = (channel: ShareChannel): ShareResult => {
    const id = newShareId();
    shares.push(id);
    saveJSON(storageKey, { shares });
    // Award 1 life once per completed share.
    deps.lives.awardOnce(`share::${id}`, 'share');
    deps.emitShare(channel, 'share');
    return { completed: true, channel, usedFallback: channel === 'clipboard' };
  };

  return {
    completedCount: () => shares.length,

    /**
     * Run the share flow. Never throws: a cancelled native share resolves to a
     * non-completed result, and a missing Web Share API falls back to clipboard.
     */
    share: async (payload: SharePayload): Promise<ShareResult> => {
      const { title, text, url } = payload;

      if (deps.env.nativeShare) {
        try {
          const ok = await deps.env.nativeShare({ title, text, url });
          if (ok) return recordAndReward('web_share');
          // Not completed but not an error: fall through to clipboard.
        } catch {
          // User cancelled (AbortError) or the share failed: award nothing.
          return { completed: false, channel: null, usedFallback: false };
        }
      }

      if (deps.env.copyToClipboard) {
        try {
          const ok = await deps.env.copyToClipboard(url);
          if (ok) return recordAndReward('clipboard');
        } catch {
          // Clipboard denied: do not crash, just report no completion.
        }
      }

      return { completed: false, channel: null, usedFallback: true };
    },
  };
}

export type Sharer = ReturnType<typeof createSharer>;
