import type { Mood } from '../constants';

const HEART =
  'M100 178 C 42 136 10 102 10 62 C 10 30 34 8 62 8 C 80 8 93 18 100 32 C 107 18 120 8 138 8 C 166 8 190 30 190 62 C 190 102 158 136 100 178 Z';

const FILL: Record<Mood, string> = {
  happy: '#e11d48',
  ok: '#f43f5e',
  tired: '#fb7185',
  rest: '#a78bfa',
};

const ACCESSIBLE_NAME: Record<Mood, string> = {
  happy: 'Babu is happy',
  ok: 'Babu is doing OK',
  tired: 'Babu is a little tired',
  rest: 'Babu is in Rest Mode, sleeping',
};

const INK = '#4c0519';
const stroke = { stroke: INK, strokeWidth: 6, strokeLinecap: 'round', fill: 'none' } as const;

function Face({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'happy':
      return (
        <>
          <path d="M60 86 Q72 70 84 86" {...stroke} />
          <path d="M116 86 Q128 70 140 86" {...stroke} />
          <circle cx="56" cy="108" r="10" fill="#fecdd3" opacity="0.8" />
          <circle cx="144" cy="108" r="10" fill="#fecdd3" opacity="0.8" />
          <path d="M74 106 Q100 138 126 106" {...stroke} />
        </>
      );
    case 'ok':
      return (
        <>
          <circle cx="72" cy="82" r="9" fill={INK} />
          <circle cx="128" cy="82" r="9" fill={INK} />
          <circle cx="75" cy="79" r="3" fill="#fff" />
          <circle cx="131" cy="79" r="3" fill="#fff" />
          <path d="M82 110 Q100 124 118 110" {...stroke} />
        </>
      );
    case 'tired':
      return (
        <>
          <path d="M60 78 L84 84" {...stroke} />
          <path d="M140 78 L116 84" {...stroke} />
          <ellipse cx="72" cy="90" rx="8" ry="4" fill={INK} />
          <ellipse cx="128" cy="90" rx="8" ry="4" fill={INK} />
          <path d="M84 118 Q92 112 100 118 Q108 124 116 118" {...stroke} />
        </>
      );
    case 'rest':
      return (
        <>
          <path d="M60 82 Q72 94 84 82" {...stroke} />
          <path d="M116 82 Q128 94 140 82" {...stroke} />
          <circle cx="100" cy="116" r="6" {...stroke} strokeWidth={5} />
          <text x="150" y="44" fontSize="26" fontWeight="700" fill={INK}>
            z
          </text>
          <text x="168" y="24" fontSize="18" fontWeight="700" fill={INK}>
            z
          </text>
        </>
      );
  }
}

/** Babu, an inline SVG heart. Each state has its own face, not just a color. */
export function BabuHeart({ mood, className = 'h-36 w-36' }: { mood: Mood; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 190"
      role="img"
      aria-label={ACCESSIBLE_NAME[mood]}
      data-mood={mood}
      className={`${className} ${mood === 'rest' ? 'motion-safe:animate-pulse' : ''}`}
    >
      <path d={HEART} fill={FILL[mood]} stroke={INK} strokeWidth="4" />
      <path d="M44 44 Q56 30 72 32" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5" />
      <Face mood={mood} />
    </svg>
  );
}
