import type { Mood } from '../constants';
import { babuSprite, SPRITE_HEADROOM, SPRITE_HEIGHT, SPRITE_WIDTH, type PixelRun } from '../sprite';

const ACCESSIBLE_NAME: Record<Mood, string> = {
  happy: 'Babu is happy',
  ok: 'Babu is doing OK',
  tired: 'Babu is a little tired',
  rest: 'Babu is in Rest Mode, sleeping',
};

/** Heartbeat speed per mood: a lively beat when happy, slow breathing in Rest Mode. */
const BEAT: Record<Mood, { name: string; duration: string }> = {
  happy: { name: 'babu-lubdub', duration: '0.8s' },
  ok: { name: 'babu-lubdub', duration: '1s' },
  tired: { name: 'babu-lubdub', duration: '1.6s' },
  rest: { name: 'babu-snooze', duration: '3s' },
};

/*
 * steps(1, end) snaps between keyframes like sprite frames, which keeps the
 * 8-bit feel: rest, big "lub", rest, smaller "dub", long pause.
 * CSS px inside the SVG are sprite pixels, so translate(0, -1px) is one pixel.
 */
const CSS = `
@keyframes babu-lubdub {
  0% { transform: scale(1, 1); }
  12% { transform: scale(1.1, 1.08); }
  24% { transform: scale(0.98, 1); }
  34% { transform: scale(1.06, 1.04); }
  46%, 100% { transform: scale(1, 1); }
}
@keyframes babu-snooze {
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.03, 0.98); }
}
@keyframes babu-z {
  0%, 100% { transform: translate(0, 0); opacity: 1; }
  50% { transform: translate(0, -1px); opacity: 0.55; }
}
@keyframes babu-shadow {
  0% { transform: scaleX(1); }
  12% { transform: scaleX(1.12); }
  24%, 100% { transform: scaleX(1); }
}
.babu-beat, .babu-shadow {
  transform-box: fill-box;
  animation-iteration-count: infinite;
  animation-timing-function: steps(1, end);
}
.babu-beat { transform-origin: 50% 60%; }
.babu-shadow { transform-origin: 50% 50%; animation-name: babu-shadow; }
.babu-z {
  transform-box: fill-box;
  animation: babu-z 2s steps(1, end) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .babu-beat, .babu-shadow, .babu-z { animation: none; }
}
`;

function Pixels({ runs }: { runs: PixelRun[] }) {
  return runs.map(({ x, y, w, color }) => (
    <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} fill={color} />
  ));
}

/** Babu, an 8-bit anatomical heart that beats. Each state has its own face, not just a color. */
export function BabuHeart({ mood, className = 'h-36 w-36' }: { mood: Mood; className?: string }) {
  const sprite = babuSprite(mood);
  const beat = BEAT[mood];
  const timing = { animationName: beat.name, animationDuration: beat.duration };

  return (
    <svg
      viewBox={`0 ${-SPRITE_HEADROOM} ${SPRITE_WIDTH} ${SPRITE_HEIGHT + SPRITE_HEADROOM}`}
      role="img"
      aria-label={ACCESSIBLE_NAME[mood]}
      data-mood={mood}
      shapeRendering="crispEdges"
      className={className}
      style={{ imageRendering: 'pixelated', overflow: 'visible' }}
    >
      <style>{CSS}</style>
      <g className="babu-shadow" style={{ animationDuration: beat.duration, animationName: mood === 'rest' ? 'none' : undefined }}>
        <Pixels runs={sprite.shadow} />
      </g>
      <g className="babu-beat" style={timing}>
        <Pixels runs={sprite.heart} />
      </g>
      {sprite.z.length > 0 && (
        <g className="babu-z">
          <Pixels runs={sprite.z} />
        </g>
      )}
    </svg>
  );
}
