// Brag card drawing. Pure canvas code: no core imports, the canvas factory is injectable for tests.

export const BRAG_SIZE = 1080;

export function formatScore(score: number): string {
  return score.toLocaleString('en-US');
}

export function challengeText(score: number): string {
  return `My Vascular Flow Score is ${formatScore(score)}! Can you clear your arteries faster?`;
}

/** The minimal canvas surface the brag card needs (HTMLCanvasElement satisfies it). */
export interface BragCanvas {
  width: number;
  height: number;
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
  toBlob(callback: (blob: Blob | null) => void, type?: string): void;
}

export function drawBragCard(ctx: CanvasRenderingContext2D, score: number): void {
  const size = BRAG_SIZE;
  const centre = size / 2;

  const background = ctx.createLinearGradient(0, 0, size, size);
  background.addColorStop(0, '#9f1239');
  background.addColorStop(1, '#e11d48');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  // Light inner panel so the text stays high-contrast.
  ctx.fillStyle = '#fff1f2';
  ctx.fillRect(80, 80, size - 160, size - 160);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#9f1239';
  ctx.font = 'bold 84px system-ui, sans-serif';
  ctx.fillText('Arteria Match', centre, 220);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 200px system-ui, sans-serif';
  ctx.fillText(formatScore(score), centre, 470);

  ctx.fillStyle = '#334155';
  ctx.font = '600 56px system-ui, sans-serif';
  ctx.fillText('Vascular Flow Score', centre, 630);

  // The challenge line is split after the first sentence so it fits the card.
  const [first, second] = challengeText(score).split('! ');
  ctx.fillStyle = '#0f172a';
  ctx.font = '44px system-ui, sans-serif';
  ctx.fillText(`${first}!`, centre, 760);
  ctx.fillText(second, centre, 820);

  ctx.fillStyle = '#e11d48';
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillText('INLABABU', centre, 930);
}

export function createBragCardBlob(
  score: number,
  createCanvas: () => BragCanvas = () => document.createElement('canvas'),
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas();
    canvas.width = BRAG_SIZE;
    canvas.height = BRAG_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas 2D is not available'));
      return;
    }
    drawBragCard(ctx, score);
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not export the brag card'));
    }, 'image/png');
  });
}
