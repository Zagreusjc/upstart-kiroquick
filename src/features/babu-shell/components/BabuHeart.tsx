import { useId } from 'react';
import { babuArt, ARTERY, ATRIUM, INK, MOUTH_FILL, SHADOW, TONGUE, VEIN, type Eyes, type Mouth } from '../art';
import type { Mood } from '../constants';

const ACCESSIBLE_NAME: Record<Mood, string> = {
  happy: 'Baboo is happy',
  ok: 'Baboo is doing OK',
  tired: 'Baboo is a little tired',
  rest: 'Baboo is in Rest Mode, sleeping',
};

/** Heartbeat speed per mood: a lively beat when happy, slow breathing in Rest Mode. */
const BEAT: Record<Mood, { name: string; duration: string }> = {
  happy: { name: 'babu-lubdub', duration: '0.8s' },
  ok: { name: 'babu-lubdub', duration: '1s' },
  tired: { name: 'babu-lubdub', duration: '1.6s' },
  rest: { name: 'babu-snooze', duration: '3s' },
};

/* Lub-dub: a big "lub", a smaller "dub", then a pause. Smooth, cartoon-style squash. */
const CSS = `
@keyframes babu-lubdub {
  0% { transform: scale(1, 1); }
  12% { transform: scale(1.08, 1.06); }
  24% { transform: scale(0.98, 1); }
  34% { transform: scale(1.05, 1.03); }
  46%, 100% { transform: scale(1, 1); }
}
@keyframes babu-snooze {
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.03, 0.98); }
}
@keyframes babu-z {
  0%, 100% { transform: translate(0, 0); opacity: 1; }
  50% { transform: translate(3px, -6px); opacity: 0.55; }
}
@keyframes babu-shadow {
  0% { transform: scaleX(1); }
  12% { transform: scaleX(1.12); }
  24%, 100% { transform: scaleX(1); }
}
@keyframes babu-shake {
  0%, 100% { opacity: 1; }
  12% { opacity: 0.35; }
  34% { opacity: 0.7; }
}
.babu-beat, .babu-shadow, .babu-shake {
  transform-box: fill-box;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
.babu-beat { transform-origin: 50% 60%; }
.babu-shadow { transform-origin: 50% 50%; animation-name: babu-shadow; }
.babu-shake { animation-name: babu-shake; }
.babu-z {
  transform-box: fill-box;
  animation: babu-z 2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .babu-beat, .babu-shadow, .babu-shake, .babu-z { animation: none; }
}
`;

const BODY_PATH =
  'M 58 112 C 32 136, 34 182, 66 210 C 90 232, 114 250, 130 250 C 146 250, 174 226, 194 196 ' +
  'C 218 160, 214 118, 186 100 C 164 86, 140 90, 122 98 C 104 88, 78 92, 58 112 Z';
/* Atria sit on the upper "shoulders" like little lobes, tilted outward. */
const LEFT_ATRIUM =
  'M 32 122 C 26 104, 42 90, 62 94 C 80 98, 86 112, 78 122 C 68 132, 38 136, 32 122 Z';
const RIGHT_ATRIUM =
  'M 170 108 C 172 92, 196 86, 210 98 C 222 110, 216 126, 200 127 C 184 128, 168 120, 170 108 Z';

const EYE_L = { x: 102, y: 168 };
const EYE_R = { x: 148, y: 168 };
const EYE_DARK = '#2a1216';

/** A vessel drawn as a thick outlined tube, with an optional open end. */
function Tube({
  d,
  width,
  color,
  cap = 'butt',
}: {
  d: string;
  width: number;
  color: string;
  cap?: 'butt' | 'round';
}) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={width + 10} strokeLinecap={cap} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap={cap} strokeLinejoin="round" />
    </>
  );
}

function Opening({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={VEIN.opening} stroke={INK} strokeWidth={4} />;
}

function Vessels() {
  return (
    <g>
      {/* Pulmonary vein to the left */}
      <Tube d="M 96 110 L 16 100" width={22} color={VEIN.base} />
      <Opening cx={16} cy={100} rx={6} ry={11} />
      {/* Superior vena cava */}
      <Tube d="M 86 118 L 86 40" width={28} color={VEIN.base} />
      <path d="M 78 110 L 78 48" stroke={VEIN.light} strokeWidth={5} strokeLinecap="round" />
      <Opening cx={86} cy={40} rx={14} ry={6} />
      {/* Pulmonary trunk: rises under the arch and branches out to the right */}
      <Tube d="M 154 116 L 154 78 C 154 70, 160 68, 168 68 L 224 66" width={22} color={VEIN.base} />
      <path d="M 148 108 L 148 80" stroke={VEIN.light} strokeWidth={4} strokeLinecap="round" />
      <Opening cx={224} cy={66} rx={6} ry={11} />
      {/* Aortic arch with three little branches */}
      <Tube d="M 132 36 L 128 10" width={14} color={ARTERY.base} cap="round" />
      <Tube d="M 154 26 L 156 2" width={14} color={ARTERY.base} cap="round" />
      <Tube d="M 176 36 L 188 14" width={14} color={ARTERY.base} cap="round" />
      <Tube d="M 124 118 L 124 56 C 124 18, 184 18, 184 56 L 184 98" width={30} color={ARTERY.base} />
      <path
        d="M 116 108 L 116 58 C 116 38, 134 26, 152 25"
        fill="none"
        stroke={ARTERY.light}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </g>
  );
}

function Eye({ cx, cy, kind, side }: { cx: number; cy: number; kind: Eyes; side: 'l' | 'r' }) {
  switch (kind) {
    case 'sparkle':
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={16} ry={18} fill={EYE_DARK} />
          <circle cx={cx - 5} cy={cy - 6} r={6.5} fill="#ffffff" />
          <circle cx={cx + 6} cy={cy + 6} r={3} fill="#ffffff" />
          <circle cx={cx - 6} cy={cy + 8} r={1.6} fill="#ffffff" />
        </g>
      );
    case 'soft':
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={12} ry={14} fill={EYE_DARK} />
          <circle cx={cx - 3} cy={cy - 5} r={4.5} fill="#ffffff" />
          <circle cx={cx + 4} cy={cy + 5} r={2.2} fill="#ffffff" />
        </g>
      );
    case 'droopy': {
      // Heavy lids that slope down toward the outside of the face.
      const outer = side === 'l' ? -1 : 1;
      return (
        <g>
          <path d={`M ${cx - 13} ${cy - 2} A 13 12 0 0 0 ${cx + 13} ${cy - 2} Z`} fill={EYE_DARK} />
          <circle cx={cx - 3} cy={cy + 3} r={2.5} fill="#ffffff" />
          <path
            d={`M ${cx - 15} ${cy - 3 + (outer < 0 ? 3 : 0)} L ${cx + 15} ${cy - 3 + (outer > 0 ? 3 : 0)}`}
            stroke={INK}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      );
    }
    case 'closed':
      return (
        <path
          d={`M ${cx - 13} ${cy} Q ${cx} ${cy + 11} ${cx + 13} ${cy}`}
          fill="none"
          stroke={EYE_DARK}
          strokeWidth={5}
          strokeLinecap="round"
        />
      );
  }
}

function MouthShape({ kind, clipId }: { kind: Mouth; clipId: string }) {
  switch (kind) {
    case 'open-smile': {
      const d = 'M 109 194 Q 125 222 141 194 Z';
      return (
        <g>
          <clipPath id={clipId}>
            <path d={d} />
          </clipPath>
          <path d={d} fill={MOUTH_FILL} />
          <ellipse cx={125} cy={209} rx={10} ry={6} fill={TONGUE} clipPath={`url(#${clipId})`} />
          <path d={d} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      );
    }
    case 'smile':
      return <path d="M 112 196 Q 125 209 138 196" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
    case 'wavy':
      return (
        <path
          d="M 112 200 Q 118 195 125 200 Q 132 205 138 200"
          fill="none"
          stroke={INK}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
      );
    case 'sleepy':
      return <ellipse cx={125} cy={200} rx={5} ry={4} fill={MOUTH_FILL} />;
  }
}

const SHAKE_LINES = [
  'M 10 136 L 22 142',
  'M 6 166 L 22 167',
  'M 14 198 L 26 191',
  'M 34 230 L 44 220 L 46 234 L 56 224',
  'M 222 142 L 234 134',
  'M 218 168 L 234 169',
  'M 210 198 L 224 206',
  'M 194 232 L 204 242',
];

/**
 * Baboo, a cartoon anatomical heart that beats. Each mood has its own face
 * (eyes, mouth and extras), not just a color. Original SVG artwork.
 */
export function BabuHeart({ mood, className = 'h-36 w-36' }: { mood: Mood; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const art = babuArt(mood);
  const beat = BEAT[mood];
  const timing = { animationName: beat.name, animationDuration: beat.duration };
  const bodyClip = `babu-body-${uid}`;

  return (
    <svg
      viewBox="0 -8 240 280"
      role="img"
      aria-label={ACCESSIBLE_NAME[mood]}
      data-mood={mood}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <style>{CSS}</style>
      <defs>
        <clipPath id={bodyClip}>
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      <g
        className="babu-shadow"
        style={{ animationDuration: beat.duration, animationName: mood === 'rest' ? 'none' : undefined }}
      >
        <ellipse cx={128} cy={262} rx={46} ry={7} fill={SHADOW} />
      </g>

      {art.shakeLines && (
        <g className="babu-shake" style={{ animationDuration: beat.duration }} data-part="shake-lines">
          {SHAKE_LINES.map((d) => (
            <path key={d} d={d} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </g>
      )}

      <g className="babu-beat" style={timing}>
        <Vessels />

        {/* Body: shade underneath, base on top, a soft highlight and two shine marks. */}
        <path d={BODY_PATH} fill={art.body.shade} />
        <g clipPath={`url(#${bodyClip})`}>
          <ellipse cx={112} cy={156} rx={88} ry={88} fill={art.body.base} />
          <ellipse cx={66} cy={162} rx={12} ry={32} fill={art.body.light} transform="rotate(-12 66 162)" />
        </g>
        <path d={BODY_PATH} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 66 132 Q 72 122 84 118" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
        <circle cx={62} cy={146} r={3} fill="#ffffff" opacity={0.85} />

        {/* Atria */}
        <path d={LEFT_ATRIUM} fill={ATRIUM.base} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 40 116 Q 44 104 60 101" fill="none" stroke={ATRIUM.light} strokeWidth={4} strokeLinecap="round" />
        <path d={RIGHT_ATRIUM} fill={ATRIUM.base} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 180 106 Q 186 96 200 96" fill="none" stroke={ATRIUM.light} strokeWidth={4} strokeLinecap="round" />

        {/* Face */}
        <g data-part="face" data-eyes={art.eyes} data-mouth={art.mouth}>
          <ellipse cx={78} cy={194} rx={13} ry={8} fill={art.body.cheek} opacity={0.9} />
          <ellipse cx={172} cy={194} rx={13} ry={8} fill={art.body.cheek} opacity={0.9} />
          <Eye cx={EYE_L.x} cy={EYE_L.y} kind={art.eyes} side="l" />
          <Eye cx={EYE_R.x} cy={EYE_R.y} kind={art.eyes} side="r" />
          <MouthShape kind={art.mouth} clipId={`babu-mouth-${uid}`} />
        </g>

        {art.sweat && (
          <path
            data-part="sweat"
            d="M 202 138 C 210 150, 212 158, 204 162 C 196 164, 192 156, 202 138 Z"
            fill={VEIN.light}
            stroke={INK}
            strokeWidth={3}
          />
        )}
      </g>

      {art.sleepingZ && (
        <g className="babu-z" data-part="sleeping-z" fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 196 18 L 216 18 L 196 40 L 216 40" strokeWidth={5} />
          <path d="M 222 -2 L 232 -2 L 222 10 L 232 10" strokeWidth={4} />
        </g>
      )}
    </svg>
  );
}
