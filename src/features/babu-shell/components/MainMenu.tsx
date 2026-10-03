import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { MOOD_LABELS } from '../constants';
import { MENU_LINKS } from '../menuLinks';
import { useBabooMood } from '../useBabu';
import { BabuHeart } from './BabuHeart';

/**
 * Main menu: the landing screen of the Home tab. Big game-style buttons to
 * every part of the app, with Baboo in the middle showing the same live mood
 * as the Baboo screen.
 */

const focusRing =
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-rose-900';
const press = 'transition-transform motion-reduce:transition-none active:translate-y-[3px]';

/**
 * Exactly fill the area between the app header and bottom nav, so the page
 * never scrolls. The shell (owned by Jolo) gives `main` 16px padding,
 * cancelled with `-m-4`, a 52px header and a 55px bottom nav plus the safe
 * area: 52 + 55 = 107. Update this if the shell changes.
 *
 * Everything inside scales with the screen height (dvh): buttons and gaps
 * shrink on shorter phones, and Baboo takes whatever height is left.
 * Only on very short screens (for example a phone in landscape) does the
 * menu scroll inside itself as a last resort.
 */
const FILL_SCREEN = 'h-[calc(100dvh_-_107px_-_env(safe-area-inset-bottom))] overflow-y-auto';

/** Height-responsive sizes (min, preferred in dvh, max). Touch targets never go under 44px. */
const SIZES = {
  play: 'h-[clamp(4rem,12dvh,8rem)] w-64',
  regular: 'h-[clamp(2.75rem,7dvh,4rem)] w-44',
  round: 'h-[clamp(3.5rem,8dvh,4.25rem)] w-[clamp(3.5rem,8dvh,4.25rem)]',
  gap: 'gap-[clamp(0.5rem,1.6dvh,1.25rem)]',
  playText: 'text-[clamp(2.5rem,7dvh,3.75rem)]',
  regularText: 'text-[clamp(1rem,2.6dvh,1.25rem)]',
} as const;

/** Dotted pink backdrop, like the mock-up. */
const BACKDROP: CSSProperties = {
  backgroundImage:
    'radial-gradient(rgba(255,255,255,0.5) 1.5px, transparent 1.7px), linear-gradient(180deg, #ffdbe1 0%, #ffb3c1 100%)',
  backgroundSize: '18px 18px, 100% 100%',
};

/** Solid outline so white lettering stays readable on pink. */
const OUTLINED_WHITE: CSSProperties = {
  textShadow:
    '1px 1px 0 #be123c, -1px 1px 0 #be123c, 1px -1px 0 #be123c, -1px -1px 0 #be123c, 0 2px 3px rgba(136,19,55,0.35)',
};

const TITLE: CSSProperties = {
  textShadow: '0 3px 0 #ffffff, 0 6px 0 rgba(190,18,60,0.22)',
};

type Variant = 'pink' | 'teal';

/**
 * Solid fills with a raised "game button" shadow underneath.
 * - Dark pink #f0556a (Play), white lettering.
 * - Teal #3cc4b4, plain white lettering (as designed).
 */
const VARIANT: Record<Variant, { className: string; shadow: string }> = {
  pink: {
    className: 'bg-[#f0556a] text-white hover:brightness-95',
    shadow: '0 6px 0 #c23a4f, 0 10px 18px rgba(194, 58, 79, 0.28)',
  },
  teal: {
    className: 'bg-[#3cc4b4] text-white hover:brightness-95',
    shadow: '0 6px 0 #2a8f83, 0 10px 18px rgba(42, 143, 131, 0.28)',
  },
};

/** Get screened: white with a pink border and a pink raised shadow. */
const SCREENED_SHADOW = '0 6px 0 #f0556a, 0 10px 18px rgba(194, 58, 79, 0.22)';

/**
 * One size for every regular menu button (Blood Bank, Library, Baboo and
 * Get screened): 176px wide, 44 to 64px tall depending on the screen. The
 * width fits the widest label, "Top up your lives!", and lets Get screened
 * sit between the two round buttons on a 360px phone.
 */
const REGULAR_SIZE = SIZES.regular;
/** Play is the biggest button: 256px wide, 64 to 128px tall. */
const PLAY_SIZE = SIZES.play;

/** A text-only menu button. `big` is the Play button. */
function MenuButton({
  to,
  title,
  subtitle,
  variant,
  big = false,
}: {
  to: string;
  title: string;
  subtitle?: string;
  variant: Variant;
  big?: boolean;
}) {
  const v = VARIANT[variant];
  return (
    <Link
      to={to}
      data-size={big ? 'big' : 'regular'}
      className={`flex shrink-0 flex-col items-center justify-center rounded-2xl text-center ${
        big ? PLAY_SIZE : REGULAR_SIZE
      } ${v.className} ${press} ${focusRing}`}
      style={{ boxShadow: v.shadow }}
    >
      <span
        className={`leading-tight font-black tracking-wide uppercase ${big ? SIZES.playText : SIZES.regularText}`}
      >
        {title}
      </span>
      {subtitle && <span className="text-sm leading-tight font-bold">{subtitle}</span>}
    </Link>
  );
}

/** Round teal shortcut (Refer a Buddy, Settings). */
function RoundButton({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <Link
      to={to}
      className={`flex shrink-0 flex-col items-center justify-center rounded-full text-center ${SIZES.round} ${VARIANT.teal.className} ${press} ${focusRing}`}
      style={{ boxShadow: VARIANT.teal.shadow }}
    >
      <span aria-hidden="true" className="text-2xl leading-none">
        {icon}
      </span>
      <span className="mt-1 px-1 text-[11px] leading-tight font-extrabold">{label}</span>
    </Link>
  );
}

/** Decorative ECG ribbon. Hidden from screen readers. */
function EcgRibbon({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute flex h-11 w-40 items-center justify-center border-2 border-white bg-teal-300/90 shadow-sm ${className}`}
    >
      <svg viewBox="0 0 120 30" className="h-7 w-28" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,16 34,16 42,6 50,26 58,10 64,16 118,16" />
      </svg>
    </div>
  );
}

function Sparkle({ className, char = '✦' }: { className: string; char?: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute text-white select-none ${className}`}>
      {char}
    </span>
  );
}

export function MainMenu() {
  const { mood } = useBabooMood();

  return (
    <section
      aria-labelledby="menu-title"
      data-testid="main-menu"
      className={`relative -m-4 flex flex-col overflow-x-hidden px-4 pt-[clamp(0.75rem,3dvh,2.5rem)] pb-[clamp(0.75rem,2dvh,1.5rem)] ${FILL_SCREEN}`}
      style={BACKDROP}
    >
      <EcgRibbon className="top-0 -left-12 -rotate-[18deg]" />
      <EcgRibbon className="top-9 -right-20 rotate-[14deg]" />
      <Sparkle className="top-[28%] left-3 text-xl" />
      <Sparkle className="top-[34%] right-4 text-lg text-teal-200" />
      <Sparkle className="top-[55%] left-2 text-sm text-rose-300" />
      <Sparkle className="top-[70%] right-2 text-xl" />

      <header className="relative z-10 shrink-0 text-center">
        <h2
          id="menu-title"
          className="text-[clamp(1.9rem,9.5vw,2.75rem)] leading-none font-black tracking-wide text-rose-500"
          style={TITLE}
        >
          INLABABOO.
        </h2>
        <p className="mt-2 text-xs font-extrabold tracking-[0.2em] text-white uppercase" style={OUTLINED_WHITE}>
          Merge habits. Save hearts.
        </p>
      </header>

      {/* Baboo takes the height that is left, between 64px and 176px. */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center py-1">
        <div className="flex min-h-16 w-full flex-1 items-center justify-center">
          <BabuHeart mood={mood} className="h-full max-h-44 w-auto max-w-44 drop-shadow-md" />
        </div>
        <p
          className="mt-1 shrink-0 rounded-full bg-white/80 px-3 py-0.5 text-sm font-bold text-rose-800"
          data-testid="menu-mood"
        >
          Baboo is feeling: {MOOD_LABELS[mood]}
        </p>
      </div>

      <nav
        aria-label="Main menu"
        className={`relative mt-[clamp(0.5rem,1.6dvh,1.25rem)] flex shrink-0 flex-col items-center pb-1.5 ${SIZES.gap}`}
      >
        <MenuButton to={MENU_LINKS.play} title="Play!" variant="pink" big />
        <MenuButton to={MENU_LINKS.bloodBank} title="Blood Bank" subtitle="Top up your lives!" variant="teal" />
        <MenuButton to={MENU_LINKS.library} title="Library" subtitle="Play to learn!" variant="teal" />
        <MenuButton to={MENU_LINKS.baboo} title="Baboo" subtitle="Your heart buddy!" variant="teal" />

        <div className="flex max-w-full items-center justify-center gap-2">
          <RoundButton to={MENU_LINKS.refer} label="Refer a Buddy" icon="💞" />

          <Link
            to={MENU_LINKS.screened}
            data-size="regular"
            className={`flex shrink-0 items-center justify-center rounded-2xl border-4 border-[#f0556a] bg-white text-center text-lg leading-tight font-black tracking-wide whitespace-nowrap text-rose-700 uppercase hover:bg-rose-50 ${REGULAR_SIZE} ${press} ${focusRing}`}
            style={{ boxShadow: SCREENED_SHADOW }}
          >
            Get screened!
          </Link>

          <RoundButton to={MENU_LINKS.settings} label="Settings" icon="⚙️" />
        </div>
      </nav>
    </section>
  );
}
