/**
 * Original, hand-drawn SVG illustrations for each library card. One simple
 * concept icon per topic, drawn from scratch with basic shapes so it supports
 * the card content without using any external or copyrighted imagery.
 *
 * `size="thumb"` renders a compact square for the list; `size="hero"` renders a
 * wider banner for the card detail view.
 */

import type { ReactNode } from 'react';

type ArtProps = { size?: 'thumb' | 'hero' };

function Frame({ size = 'thumb', children }: ArtProps & { children: ReactNode }) {
  const cls =
    size === 'hero'
      ? 'h-32 w-full rounded-xl'
      : 'h-12 w-12 shrink-0 rounded-lg';
  return (
    <svg viewBox="0 0 120 120" className={cls} role="img" aria-hidden="true">
      <rect x="0" y="0" width="120" height="120" rx="12" fill="#fff1f2" />
      {children}
    </svg>
  );
}

/** A heart used as a motif across several pieces of art. */
function Heart(props: { x: number; y: number; s: number; fill: string }) {
  const { x, y, s, fill } = props;
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M12 21 C12 21 2 14 2 7 C2 3 5 1 8 1 C10 1 11.5 2.2 12 3.3 C12.5 2.2 14 1 16 1 C19 1 22 3 22 7 C22 14 12 21 12 21 Z"
      fill={fill}
    />
  );
}

function WhatIsCvd({ size }: ArtProps) {
  return (
    <Frame size={size}>
      <Heart x={38} y={34} s={2} fill="#e11d48" />
      <path d="M26 70 L46 70 L54 56 L64 86 L72 70 L94 70" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

function BloodPressure({ size }: ArtProps) {
  return (
    <Frame size={size}>
      <circle cx="60" cy="58" r="30" fill="#fff" stroke="#e11d48" strokeWidth="5" />
      <line x1="60" y1="58" x2="60" y2="36" stroke="#e11d48" strokeWidth="5" strokeLinecap="round" />
      <line x1="60" y1="58" x2="76" y2="64" stroke="#be123c" strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="58" r="4" fill="#be123c" />
    </Frame>
  );
}

function Cholesterol({ size }: ArtProps) {
  return (
    <Frame size={size}>
      {/* artery cross-section with plaque narrowing */}
      <circle cx="60" cy="60" r="34" fill="#fecdd3" />
      <circle cx="60" cy="60" r="20" fill="#fff1f2" />
      <path d="M60 40 a20 20 0 0 1 14 6 a30 30 0 0 0 -14 -2 Z" fill="#f59e0b" />
      <path d="M46 72 a20 20 0 0 0 20 8 a30 30 0 0 1 -24 -4 Z" fill="#f59e0b" />
    </Frame>
  );
}

function Activity({ size }: ArtProps) {
  return (
    <Frame size={size}>
      {/* a shoe / stride mark */}
      <path d="M34 74 q0 -16 16 -16 l20 0 q22 0 22 14 l0 6 q0 6 -8 6 l-42 0 q-8 0 -8 -8 Z" fill="#e11d48" />
      <line x1="44" y1="64" x2="44" y2="74" stroke="#fff" strokeWidth="3" />
      <line x1="54" y1="62" x2="54" y2="74" stroke="#fff" strokeWidth="3" />
      <line x1="64" y1="62" x2="64" y2="74" stroke="#fff" strokeWidth="3" />
    </Frame>
  );
}

function Diet({ size }: ArtProps) {
  return (
    <Frame size={size}>
      {/* plate with a leaf */}
      <circle cx="60" cy="62" r="30" fill="#fff" stroke="#e11d48" strokeWidth="4" />
      <circle cx="60" cy="62" r="18" fill="#fecdd3" />
      <path d="M60 50 q14 2 14 16 q-14 0 -14 -16 Z" fill="#16a34a" />
      <line x1="60" y1="62" x2="66" y2="56" stroke="#166534" strokeWidth="2" />
    </Frame>
  );
}

function Tobacco({ size }: ArtProps) {
  return (
    <Frame size={size}>
      {/* a cigarette crossed out */}
      <rect x="30" y="56" width="52" height="12" rx="2" fill="#fff" stroke="#9ca3af" strokeWidth="3" />
      <rect x="74" y="56" width="12" height="12" rx="2" fill="#f59e0b" />
      <line x1="30" y1="44" x2="90" y2="80" stroke="#e11d48" strokeWidth="6" strokeLinecap="round" />
    </Frame>
  );
}

function Sleep({ size }: ArtProps) {
  return (
    <Frame size={size}>
      {/* crescent moon with Z's */}
      <path d="M70 34 a28 28 0 1 0 16 50 a22 22 0 0 1 -16 -50 Z" fill="#e11d48" />
      <text x="78" y="52" fontSize="18" fontWeight="700" fill="#be123c" fontFamily="ui-sans-serif, system-ui, sans-serif">z</text>
      <text x="88" y="42" fontSize="12" fontWeight="700" fill="#be123c" fontFamily="ui-sans-serif, system-ui, sans-serif">z</text>
    </Frame>
  );
}

function WarningSigns({ size }: ArtProps) {
  return (
    <Frame size={size}>
      <path d="M60 32 L92 86 L28 86 Z" fill="#e11d48" />
      <rect x="56" y="52" width="8" height="20" rx="4" fill="#fff" />
      <circle cx="60" cy="78" r="4" fill="#fff" />
    </Frame>
  );
}

function Screening({ size }: ArtProps) {
  return (
    <Frame size={size}>
      {/* magnifier over a heart */}
      <Heart x={34} y={32} s={1.6} fill="#fecdd3" />
      <circle cx="66" cy="60" r="20" fill="none" stroke="#e11d48" strokeWidth="5" />
      <line x1="80" y1="74" x2="94" y2="88" stroke="#e11d48" strokeWidth="6" strokeLinecap="round" />
    </Frame>
  );
}

const ART: Record<string, (p: ArtProps) => ReactNode> = {
  'what-is-cvd': WhatIsCvd,
  'blood-pressure': BloodPressure,
  cholesterol: Cholesterol,
  'move-more': Activity,
  'eat-for-heart': Diet,
  tobacco: Tobacco,
  sleep: Sleep,
  'warning-signs': WarningSigns,
  screening: Screening,
};

/** Render the illustration for a card id. Falls back to a heart motif. */
export function CardArt({ cardId, size = 'thumb' }: { cardId: string; size?: 'thumb' | 'hero' }) {
  const Art = ART[cardId];
  if (Art) return <>{Art({ size })}</>;
  return (
    <Frame size={size}>
      <Heart x={38} y={34} s={2} fill="#e11d48" />
    </Frame>
  );
}
