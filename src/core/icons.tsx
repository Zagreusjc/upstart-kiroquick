/**
 * Small glossy HUD icons in the main menu's art style: a soft fill, a darker
 * "lip" outline and a white gloss. Each has its own silhouette (drop, round
 * coin, star, swap arrows, block), so meaning never depends on color alone.
 * All are decorative (aria-hidden); the surrounding text carries the label.
 */
interface IconProps {
  className?: string;
}

const base = 'inline-block shrink-0';

/** Lives: a blood drop. */
export function LifeIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`${base} ${className}`}>
      <path
        d="M12 2.5C14.5 7 19 10.5 19 15a7 7 0 0 1-14 0c0-4.500 4.500-8 7-12.500Z"
        fill="#f0556a"
        stroke="#c23a4f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="9.200" cy="14.500" rx="1.600" ry="2.800" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

/** Coins: a round gold coin with a raised ring. */
export function CoinIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`${base} ${className}`}>
      <circle cx="12" cy="12" r="9.500" fill="#ffd45c" stroke="#a9680f" strokeWidth="2" />
      <circle cx="12" cy="12" r="5.800" fill="#ffb347" stroke="#a9680f" strokeWidth="1.200" />
      <path d="M12 8.800v6.400M9.800 12h4.400" stroke="#a9680f" strokeWidth="1.600" strokeLinecap="round" />
      <path d="M6.500 8.500A6.500 6.500 0 0 1 10 5.700" stroke="#ffffff" strokeWidth="1.600" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  );
}

/** Score: a five point star. */
export function ScoreIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`${base} ${className}`}>
      <path
        d="m12 2.800 2.800 5.900 6.400.9-4.700 4.400 1.200 6.400L12 17.300l-5.700 3.100 1.200-6.400-4.700-4.400 6.400-.9L12 2.800Z"
        fill="#ffd45c"
        stroke="#a9680f"
        strokeWidth="1.800"
        strokeLinejoin="round"
      />
      <path d="M9.800 9.200 12 5.600" stroke="#ffffff" strokeWidth="1.400" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

/** Moves: two swap arrows. */
export function MovesIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`${base} ${className}`}>
      <rect x="1.500" y="1.500" width="21" height="21" rx="6" fill="#3cc4b4" stroke="#2a8f83" strokeWidth="2" />
      <path
        d="M6 9h11m0 0-3-3m3 3-3 3M18 15H7m0 0 3-3m-3 3 3 3"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Plaque: a chunky block with bumps, like the cholesterol tile. */
export function PlaqueIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`${base} ${className}`}>
      <rect x="2" y="3.500" width="20" height="17" rx="5" fill="#fff0c2" stroke="#b7791f" strokeWidth="2" />
      <circle cx="8.500" cy="9.500" r="2" fill="#ffd98a" stroke="#b7791f" strokeWidth="1" />
      <circle cx="15.500" cy="14" r="2.600" fill="#ffd98a" stroke="#b7791f" strokeWidth="1" />
      <circle cx="9" cy="15.500" r="1.400" fill="#ffd98a" stroke="#b7791f" strokeWidth="1" />
    </svg>
  );
}
