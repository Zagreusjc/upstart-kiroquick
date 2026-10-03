import { describe, expect, it, vi } from 'vitest';
import { BRAG_FILENAME, shareBragCard, type ShareNavigator } from './share';

const blob = new Blob(['png'], { type: 'image/png' });
const url = 'https://example.test/play';

function setup(nav: ShareNavigator) {
  const download = vi.fn();
  const onShared = vi.fn();
  const run = () => shareBragCard({ blob, score: 24500, url, nav, download, onShared });
  return { download, onShared, run };
}

describe('shareBragCard', () => {
  it('shares the PNG as a file when file sharing is supported', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { download, onShared, run } = setup({ share, canShare: () => true });

    await expect(run()).resolves.toBe('shared-file');

    expect(share).toHaveBeenCalledTimes(1);
    const data = share.mock.calls[0][0] as ShareData;
    expect(data.files?.[0].name).toBe(BRAG_FILENAME);
    expect(data.files?.[0].type).toBe('image/png');
    expect(data.text).toContain('24,500');
    expect(download).not.toHaveBeenCalled();
    expect(onShared).toHaveBeenCalledTimes(1);
    expect(onShared).toHaveBeenCalledWith('web_share_file');
  });

  it('downloads the PNG and shares text when files cannot be shared', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { download, onShared, run } = setup({ share, canShare: () => false });

    await expect(run()).resolves.toBe('shared-text');

    expect(download).toHaveBeenCalledTimes(1);
    expect(download).toHaveBeenCalledWith(blob, BRAG_FILENAME);
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url }));
    expect(onShared).toHaveBeenCalledTimes(1);
    expect(onShared).toHaveBeenCalledWith('web_share_text');
  });

  it('awards nothing when the share is cancelled', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    const { download, onShared, run } = setup({ share, canShare: () => true });

    await expect(run()).resolves.toBe('cancelled');

    expect(onShared).not.toHaveBeenCalled();
    expect(download).not.toHaveBeenCalled();
  });

  it('falls back to a download on other share errors without awarding', async () => {
    const share = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    const { download, onShared, run } = setup({ share, canShare: () => true });

    await expect(run()).resolves.toBe('downloaded');

    expect(download).toHaveBeenCalledTimes(1);
    expect(onShared).not.toHaveBeenCalled();
  });

  it('downloads once when the text share fails after the download', async () => {
    const share = vi.fn().mockRejectedValue(new Error('boom'));
    const { download, onShared, run } = setup({ share });

    await expect(run()).resolves.toBe('downloaded');

    expect(download).toHaveBeenCalledTimes(1);
    expect(onShared).not.toHaveBeenCalled();
  });

  it('downloads without awarding when there is no Web Share API', async () => {
    const { download, onShared, run } = setup({});

    await expect(run()).resolves.toBe('downloaded');

    expect(download).toHaveBeenCalledTimes(1);
    expect(onShared).not.toHaveBeenCalled();
  });

  it('calls onShared only after the share promise resolves', async () => {
    let resolveShare: () => void = () => {};
    const share = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveShare = resolve;
        }),
    );
    const { onShared, run } = setup({ share, canShare: () => true });

    const pending = run();
    await Promise.resolve();
    expect(onShared).not.toHaveBeenCalled();

    resolveShare();
    await expect(pending).resolves.toBe('shared-file');
    expect(onShared).toHaveBeenCalledTimes(1);
  });
});
