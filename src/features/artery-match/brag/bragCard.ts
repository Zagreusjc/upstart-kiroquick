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

  // Main menu look: soft pink backdrop with white dots, a raised pink frame and a frosted panel.
  const background = ctx.createLinearGradient(0, 0, 0, size);
  background.addColorStop(0, '#ffdde3');
  background.addColorStop(0.6, '#ffbcc8');
  background.addColorStop(1, '#ffa9b9');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let y = 18; y < size; y += 54) {
    for (let x = 18; x < size; x += 54) ctx.fillRect(x, y, 4, 4);
  }

  // Raised frame (lip underneath), then a light panel so the text stays high-contrast.
  ctx.fillStyle = '#c23a4f';
  ctx.fillRect(60, 72, size - 120, size - 120);
  ctx.fillStyle = '#f0556a';
  ctx.fillRect(60, 60, size - 120, size - 120);
  ctx.fillStyle = '#fff1f3';
  ctx.fillRect(96, 96, size - 192, size - 192);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rounded = 'ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif';

  // Chunky title: pink extrusion under white-rimmed lettering, like the menu logo.
  ctx.font = `900 84px ${rounded}`;
  ctx.fillStyle = '#ffd0d8';
  ctx.fillText('Arteria Match', centre, 232);
  ctx.fillStyle = '#f0556a';
  ctx.fillText('Arteria Match', centre, 220);

  ctx.font = `900 200px ${rounded}`;
  ctx.fillStyle = '#f49aaa';
  ctx.fillText(formatScore(score), centre, 484);
  ctx.fillStyle = '#881337';
  ctx.fillText(formatScore(score), centre, 470);

  ctx.fillStyle = '#881337';
  ctx.font = `800 56px ${rounded}`;
  ctx.fillText('Vascular Flow Score', centre, 630);

  // The challenge line is split after the first sentence so it fits the card.
  const [first, second] = challengeText(score).split('! ');
  ctx.fillStyle = '#881337';
  ctx.font = `600 44px ${rounded}`;
  ctx.fillText(`${first}!`, centre, 760);
  ctx.fillText(second, centre, 820);

  // Teal badge for the brand line.
  ctx.fillStyle = '#2a8f83';
  ctx.fillRect(centre - 190, 892, 380, 84);
  ctx.fillStyle = '#3cc4b4';
  ctx.fillRect(centre - 190, 886, 380, 84);
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 52px ${rounded}`;
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
