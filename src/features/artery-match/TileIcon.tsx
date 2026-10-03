import { useId } from 'react';
import type { TileType } from './engine';

// Simple high-contrast silhouettes on a 100x100 viewBox. Each kind has a different
// outline so colour is never the only signal.

function starPoints(points: number, outer: number, inner: number): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    coords.push(`${(50 + radius * Math.cos(angle)).toFixed(1)},${(50 + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return coords.join(' ');
}

const WBC_SPIKES = starPoints(10, 46, 36);
const PLATELET_STAR = starPoints(8, 46, 22);

export function TileIcon({ type }: { type: TileType }) {
  // useId output can contain characters that are awkward inside url(#...), so keep it alphanumeric.
  const gradientId = `am-plasma-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className="h-full w-full">
      {type === 'rbc' && (
        <>
          <circle cx="50" cy="50" r="42" fill="#dc2626" stroke="#450a0a" strokeWidth="5" />
          <ellipse cx="50" cy="50" rx="22" ry="17" fill="#991b1b" stroke="#450a0a" strokeWidth="2" />
        </>
      )}
      {type === 'wbc' && (
        <>
          <polygon points={WBC_SPIKES} fill="#bfdbfe" stroke="#1e3a8a" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="22" fill="#93c5fd" stroke="#1e3a8a" strokeWidth="3" />
          <circle cx="44" cy="46" r="7" fill="#1e3a8a" />
        </>
      )}
      {type === 'platelet' && (
        <polygon points={PLATELET_STAR} fill="#7c3aed" stroke="#2e1065" strokeWidth="4" strokeLinejoin="round" />
      )}
      {type === 'plasma' && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path
            d="M50 6 C62 26 84 44 84 64 A34 34 0 0 1 16 64 C16 44 38 26 50 6 Z"
            fill={`url(#${gradientId})`}
            stroke="#134e4a"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <ellipse cx="38" cy="62" rx="6" ry="10" fill="#ffffff" opacity="0.6" />
        </>
      )}
      {type === 'cholesterol' && (
        <>
          <rect x="10" y="14" width="80" height="72" rx="20" fill="#fde68a" stroke="#a16207" strokeWidth="5" />
          <circle cx="34" cy="38" r="9" fill="#fcd34d" stroke="#a16207" strokeWidth="2" />
          <circle cx="64" cy="60" r="11" fill="#fcd34d" stroke="#a16207" strokeWidth="2" />
          <circle cx="40" cy="66" r="6" fill="#fcd34d" stroke="#a16207" strokeWidth="2" />
          <ellipse cx="62" cy="32" rx="10" ry="5" fill="#ffffff" opacity="0.7" />
        </>
      )}
    </svg>
  );
}
