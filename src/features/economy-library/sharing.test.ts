import { describe, expect, it, vi } from 'vitest';
import { createLivesProvider } from './lives';
import { createSharer, type ShareEnv } from './sharing';

const PAYLOAD = {
  title: 'Inlababoo',
  text: 'Take care of your Baboos!',
  url: 'https://inlababu.example',
};

function setup(env: ShareEnv, storageKey: string) {
  const lives = createLivesProvider(`${storageKey}.lives`);
  const emitted: Array<{ channel: string; context: string }> = [];
  let n = 0;
  const sharer = createSharer(
    {
      lives,
      emitShare: (channel, context) => emitted.push({ channel, context }),
      env,
      newShareId: () => `id-${n++}`,
    },
    `${storageKey}.share`,
  );
  return { lives, sharer, emitted };
}

describe('share for a life', () => {
  // Scenario: Successful share (native)
  it('awards 1 life and emits share.completed on a completed native share', async () => {
    const nativeShare = vi.fn().mockResolvedValue(true);
    const { lives, sharer, emitted } = setup({ nativeShare }, 't.share.native');
    lives.spend(); // 2 lives

    const result = await sharer.share(PAYLOAD);
    expect(result).toMatchObject({ completed: true, channel: 'web_share' });
    expect(lives.lives()).toBe(3);
    expect(emitted).toEqual([{ channel: 'web_share', context: 'share' }]);
    expect(sharer.completedCount()).toBe(1);
  });

  // Scenario: Share cancelled
  it('awards nothing when the native share is cancelled', async () => {
    const nativeShare = vi.fn().mockRejectedValue(new Error('AbortError'));
    const copyToClipboard = vi.fn().mockResolvedValue(true);
    const { lives, sharer, emitted } = setup(
      { nativeShare, copyToClipboard },
      't.share.cancel',
    );
    lives.spend();

    const result = await sharer.share(PAYLOAD);
    expect(result.completed).toBe(false);
    expect(lives.lives()).toBe(2);
    expect(emitted).toEqual([]);
    // Cancel must not silently fall back to clipboard.
    expect(copyToClipboard).not.toHaveBeenCalled();
  });

  // Scenario: Web Share unavailable -> clipboard fallback
  it('falls back to the clipboard and still awards a life', async () => {
    const copyToClipboard = vi.fn().mockResolvedValue(true);
    const { lives, sharer, emitted } = setup({ copyToClipboard }, 't.share.clip');
    lives.spend();

    const result = await sharer.share(PAYLOAD);
    expect(copyToClipboard).toHaveBeenCalledWith(PAYLOAD.url);
    expect(result).toMatchObject({ completed: true, channel: 'clipboard', usedFallback: true });
    expect(lives.lives()).toBe(3);
    expect(emitted).toEqual([{ channel: 'clipboard', context: 'share' }]);
  });

  it('does not crash when neither Web Share nor clipboard is available', async () => {
    const { lives, sharer } = setup({}, 't.share.none');
    lives.spend();
    const result = await sharer.share(PAYLOAD);
    expect(result.completed).toBe(false);
    expect(lives.lives()).toBe(2);
  });

  it('awards a life for each distinct completed share', async () => {
    const copyToClipboard = vi.fn().mockResolvedValue(true);
    const { lives, sharer } = setup({ copyToClipboard }, 't.share.multi');
    lives.spend();
    lives.spend();
    lives.spend();
    expect(lives.lives()).toBe(0);

    await sharer.share(PAYLOAD);
    expect(lives.lives()).toBe(1);
    await sharer.share(PAYLOAD);
    expect(lives.lives()).toBe(2);
    expect(sharer.completedCount()).toBe(2);
  });

  it('persists completed share ids across reloads', async () => {
    const copyToClipboard = vi.fn().mockResolvedValue(true);
    const { sharer } = setup({ copyToClipboard }, 't.share.persist');
    await sharer.share(PAYLOAD);

    // Reload with the same storage key.
    const lives2 = createLivesProvider('t.share.persist2.lives');
    const sharer2 = createSharer(
      { lives: lives2, emitShare: () => {}, env: { copyToClipboard } },
      't.share.persist.share',
    );
    expect(sharer2.completedCount()).toBe(1);
  });
});
