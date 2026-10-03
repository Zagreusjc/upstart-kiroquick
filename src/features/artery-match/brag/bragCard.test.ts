import { describe, expect, it, vi } from 'vitest';
import { BRAG_SIZE, challengeText, createBragCardBlob, type BragCanvas } from './bragCard';

function fakeContext() {
  return {
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
  };
}

function fakeCanvas(ctx: ReturnType<typeof fakeContext> | null, exportFails = false) {
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ctx as unknown as CanvasRenderingContext2D | null),
    toBlob: vi.fn((callback: (blob: Blob | null) => void, type?: string) => {
      callback(exportFails ? null : new Blob(['png'], { type: type ?? 'image/png' }));
    }),
  };
  return canvas satisfies BragCanvas;
}

describe('brag card', () => {
  it('matches the spec challenge text', () => {
    expect(challengeText(24500)).toBe(
      'My Vascular Flow Score is 24,500! Can you clear your arteries faster?',
    );
  });

  it('draws a 1080x1080 PNG with the score and game name', async () => {
    const ctx = fakeContext();
    const canvas = fakeCanvas(ctx);

    const blob = await createBragCardBlob(24500, () => canvas);

    expect(BRAG_SIZE).toBe(1080);
    expect(canvas.width).toBe(1080);
    expect(canvas.height).toBe(1080);
    const texts = ctx.fillText.mock.calls.map((call) => call[0]);
    expect(texts).toContain('24,500');
    expect(texts).toContain('Arteria Match');
    expect(texts).toContain('Vascular Flow Score');
    expect(texts).toContain('INLABABU');
    expect(canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png');
    expect(blob.type).toBe('image/png');
  });

  it('rejects when the canvas has no 2D context', async () => {
    await expect(createBragCardBlob(100, () => fakeCanvas(null))).rejects.toThrow();
  });

  it('rejects when the canvas cannot export a blob', async () => {
    await expect(createBragCardBlob(100, () => fakeCanvas(fakeContext(), true))).rejects.toThrow();
  });
});
