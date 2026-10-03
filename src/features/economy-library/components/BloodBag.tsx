/**
 * Original "Blood Bank" life meter: a stylized blood-donation bag that fills in
 * proportion to the player's current lives. The label reads "B+" as a pun on
 * "Baboo" ("Bee positive" / stay positive). All artwork is drawn from scratch
 * here; it is not traced from any external image.
 *
 * Layout inspiration: a vertical level meter where fill height maps to the
 * resource (lives), with the current level called out beneath it.
 */
export function BloodBag({
  lives,
  max,
  className = '',
}: {
  lives: number;
  max: number;
  className?: string;
}) {
  const safeMax = Math.max(1, max);
  const ratio = Math.min(1, Math.max(0, lives / safeMax));

  // Inner bag cavity in SVG user units.
  const bagTop = 46;
  const bagBottom = 196;
  const bagHeight = bagBottom - bagTop;
  const fillHeight = bagHeight * ratio;
  const fillY = bagBottom - fillHeight;

  return (
    <figure className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 160 260"
        className="h-72 w-auto max-w-full"
        role="img"
        aria-label={`Blood Bank: ${lives} of ${max} lives`}
      >
        <defs>
          <clipPath id="bagClip">
            <path d="M34 40 Q34 32 42 32 L118 32 Q126 32 126 40 L126 188 Q126 200 114 200 L46 200 Q34 200 34 188 Z" />
          </clipPath>
          <linearGradient id="bloodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f05567" />
            <stop offset="100%" stopColor="#c01027" />
          </linearGradient>
        </defs>

        {/* Hanger loop */}
        <path
          d="M72 20 Q80 8 88 20"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Bag outline */}
        <path
          d="M34 40 Q34 32 42 32 L118 32 Q126 32 126 40 L126 188 Q126 200 114 200 L46 200 Q34 200 34 188 Z"
          fill="#fff5f6"
          stroke="#9ca3af"
          strokeWidth="3"
        />

        {/* Blood fill, clipped to the bag shape. Height tracks lives/max and
            animates when the count changes. */}
        <g clipPath="url(#bagClip)">
          <rect
            x="30"
            width="100"
            y={fillY}
            height={fillHeight + 4}
            fill="url(#bloodGrad)"
            style={{ transition: 'y 400ms ease, height 400ms ease' }}
          />
          {/* a soft surface line on the blood */}
          {ratio > 0 && ratio < 1 && (
            <rect
              x="30"
              width="100"
              y={fillY}
              height="3"
              fill="#ffffff"
              opacity="0.35"
              style={{ transition: 'y 400ms ease' }}
            />
          )}
        </g>

        {/* Level tick marks so each of the 3 lives reads clearly. */}
        {Array.from({ length: safeMax - 1 }, (_, i) => {
          const y = bagBottom - (bagHeight * (i + 1)) / safeMax;
          return (
            <line
              key={i}
              x1="118"
              x2="126"
              y1={y}
              y2={y}
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Label plate with the B+ pun */}
        <rect x="48" y="58" width="64" height="56" rx="6" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" />
        <line x1="56" y1="68" x2="104" y2="68" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <line x1="56" y1="76" x2="96" y2="76" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <text
          x="80"
          y="104"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="#111827"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          B+
        </text>

        {/* Outlet tubes at the bottom */}
        <rect x="68" y="200" width="6" height="18" rx="3" fill="#c01027" />
        <rect x="78" y="200" width="6" height="18" rx="3" fill="#c01027" />
        <path
          d="M84 216 q40 10 20 34"
          fill="none"
          stroke="#c01027"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>

      <figcaption className="mt-2 text-center">
        <span className="block text-base font-bold text-rose-800">
          Blood Bank: {lives}/{max}
        </span>
        <span className="block text-xs text-slate-500">Your daily life meter</span>
      </figcaption>
    </figure>
  );
}
