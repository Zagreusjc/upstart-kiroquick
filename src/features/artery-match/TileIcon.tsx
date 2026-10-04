import { useId } from 'react';
import type { TileType } from './engine';

// Glossy main-menu style tiles on a 100x100 viewBox: soft fill, darker "lip" outline, white gloss.
// Each kind keeps its own silhouette and inner pattern, so colour is never the only signal.

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
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className="am-art h-full w-full">
      {type === 'rbc' && (
        <>
          <circle cx="50" cy="50" r="42" fill="#f0556a" stroke="#c23a4f" strokeWidth="6" />
          <ellipse cx="50" cy="52" rx="22" ry="16" fill="#d9405a" stroke="#a12b40" strokeWidth="2.5" />
          <ellipse cx="34" cy="28" rx="13" ry="7" fill="#ffffff" opacity="0.55" transform="rotate(-30 34 28)" />
        </>
      )}
      {type === 'wbc' && (
        <>
          <polygon points={WBC_SPIKES} fill="#8fe3d6" stroke="#2a8f83" strokeWidth="4.5" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="22" fill="#5fd6c6" stroke="#2a8f83" strokeWidth="3" />
          <circle cx="44" cy="46" r="7" fill="#2a8f83" />
          <ellipse cx="36" cy="26" rx="10" ry="5" fill="#ffffff" opacity="0.6" transform="rotate(-30 36 26)" />
        </>
      )}
      {type === 'platelet' && (
        <>
          <polygon points={PLATELET_STAR} fill="#b79cf5" stroke="#6d4bc0" strokeWidth="4.5" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="7" fill="#6d4bc0" />
          <ellipse cx="40" cy="30" rx="8" ry="4" fill="#ffffff" opacity="0.55" transform="rotate(-35 40 30)" />
        </>
      )}
      {type === 'plasma' && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffe27a" />
              <stop offset="100%" stopColor="#ffb347" />
            </linearGradient>
          </defs>
          <path
            d="M50 6 C62 26 84 44 84 64 A34 34 0 0 1 16 64 C16 44 38 26 50 6 Z"
            fill={`url(#${gradientId})`}
            stroke="#a9680f"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <ellipse cx="38" cy="62" rx="6" ry="10" fill="#ffffff" opacity="0.65" />
        </>
      )}
      {type === 'cholesterol' && (
        <>
          <rect x="10" y="14" width="80" height="72" rx="20" fill="#fff0c2" stroke="#b7791f" strokeWidth="6" />
          <circle cx="34" cy="38" r="9" fill="#ffd98a" stroke="#b7791f" strokeWidth="2.5" />
          <circle cx="64" cy="60" r="11" fill="#ffd98a" stroke="#b7791f" strokeWidth="2.5" />
          <circle cx="40" cy="66" r="6" fill="#ffd98a" stroke="#b7791f" strokeWidth="2.5" />
          <ellipse cx="62" cy="30" rx="11" ry="4.5" fill="#ffffff" opacity="0.8" />
        </>
      )}
    </svg>
  );
}
