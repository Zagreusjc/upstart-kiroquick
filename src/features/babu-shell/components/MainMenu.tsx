import { useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { MOOD_LABELS, type Mood } from '../constants';
import '../menu.css';
import { MENU_LINKS } from '../menuLinks';
import { BABOO_GLOW, MENU_BACKDROP } from '../menuStyle';
import { useHideShellChrome } from '../shellChrome';
import { useBabooMood } from '../useBabu';
import { BabuHeart } from './BabuHeart';

/**
 * Main menu: the landing screen of the Home tab. Big game-style buttons to
 * every part of the app, with Baboo in the middle showing the same live mood
 * as the Baboo screen. Finishing touches (gloss, press, shine, 3D title,
 * floating Baboo, twinkles) live in `menu.css`.
 */

const focusRing =
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-rose-900';

/**
 * Full screen: the menu is a fixed layer over the whole viewport, covering
 * the app shell's header and bottom nav (see `useHideShellChrome`). They
 * come back on every other screen. Safe-area padding keeps content clear of
 * the iPhone notch and home indicator.
 *
 * Everything inside scales with the screen height (dvh): buttons and gaps
 * shrink on shorter phones, and Baboo takes whatever height is left.
 * Only on very short screens (for example a phone in landscape) does the
 * menu scroll inside itself as a last resort.
 */
const FILL_SCREEN = 'fixed inset-0 z-30 h-dvh overflow-y-auto';
const SAFE_AREA: CSSProperties = {
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'env(safe-area-inset-bottom)',
};

/** Height-responsive sizes (min, preferred in dvh, max). Touch targets never go under 44px. */
const SIZES = {
  play: 'h-[clamp(4rem,12dvh,8rem)] w-64',
  /** Height shared by Baboo, Blood Bank, Library and Get screened (44 to 64px). */
  regular: 'h-[clamp(2.75rem,7dvh,4rem)]',
  /**
   * Teal button widths step down from Play (256px) like a pyramid:
   * Baboo 192px, Blood Bank 176px, Library 160px.
   */
  width: { wide: 'w-48', medium: 'w-44', narrow: 'w-40' },
  /** Get screened: same height as the teal buttons, 224px wide (Play is 256px). */
  screened: 'h-[clamp(2.75rem,7dvh,4rem)] w-56',
  /**
   * Round buttons also shrink with the screen width (15vw), so the wide Get
   * screened button still fits between them on a 360px phone: 54 + 224 + 54
   * plus two 6px gaps = 344px, the space inside 8px side padding.
   */
  round:
    'h-[min(clamp(3.5rem,8dvh,4.25rem),15vw)] w-[min(clamp(3.5rem,8dvh,4.25rem),15vw)]',
  gap: 'gap-[clamp(0.5rem,1.6dvh,1.25rem)]',
  playText: 'text-[clamp(2.5rem,7dvh,3.75rem)]',
  regularText: 'text-[clamp(1rem,2.6dvh,1.25rem)]',
} as const;

/** Solid outline so white lettering stays readable on pink. */
const OUTLINED_WHITE: CSSProperties = {
  textShadow:
    '1px 1px 0 #be123c, -1px 1px 0 #be123c, 1px -1px 0 #be123c, -1px -1px 0 #be123c, 0 2px 3px rgba(136,19,55,0.35)',
};

type Variant = 'pink' | 'teal';

/**
 * Solid fills; the raised lip, drop shadow and gloss come from `.mm-btn`.
 * - Dark pink #f0556a (Play), white lettering.
 * - Teal #3cc4b4, plain white lettering (as designed).
 */
const VARIANT: Record<Variant, string> = {
  pink: 'mm-btn mm-btn--pink bg-[#f0556a] text-white',
  teal: 'mm-btn mm-btn--teal bg-[#3cc4b4] text-white',
};

/** A text-only menu button. `big` is the Play button. */
function MenuButton({
  to,
  title,
  subtitle,
  variant,
  big = false,
  width = 'medium',
}: {
  to: string;
  title: string;
  subtitle?: string;
  variant: Variant;
  big?: boolean;
  width?: keyof typeof SIZES.width;
}) {
  return (
    <Link
      to={to}
      data-size={big ? 'big' : 'regular'}
      data-variant={variant}
      className={`flex shrink-0 flex-col items-center justify-center text-center ${
        big ? `${SIZES.play} mm-play rounded-[1.75rem]` : `${SIZES.regular} ${SIZES.width[width]} rounded-2xl`
      } ${VARIANT[variant]} ${focusRing}`}
    >
      <span
        className={`leading-tight font-black tracking-wide uppercase ${
          big ? `${SIZES.playText} tracking-[0.06em]` : SIZES.regularText
        }`}
      >
        {title}
      </span>
      {subtitle && <span className="text-sm leading-tight font-bold opacity-95">{subtitle}</span>}
    </Link>
  );
}

/** Round teal shortcut (Refer a Buddy, Settings). */
function RoundButton({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <Link
      to={to}
      data-variant="teal"
      className={`flex shrink-0 flex-col items-center justify-center rounded-full text-center ${SIZES.round} ${VARIANT.teal} ${focusRing}`}
    >
      <span aria-hidden="true" className="mm-icon text-xl leading-none">
        {icon}
      </span>
      <span className="mt-0.5 px-0.5 text-[10px] leading-[1.05] font-extrabold">{label}</span>
    </Link>
  );
}

/** Decorative ECG ribbon. Hidden from screen readers. */
function EcgRibbon({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute flex h-11 w-40 items-center justify-center rounded-md border-2 border-white bg-[#5fd6c6] shadow-[0_6px_14px_-6px_rgba(42,143,131,0.6)] ${className}`}
    >
      <svg viewBox="0 0 120 30" className="h-7 w-28" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,16 34,16 42,6 50,26 58,10 64,16 118,16" />
      </svg>
    </div>
  );
}

function Sparkle({ className, delay }: { className: string; delay: string }) {
  return (
    <span
      aria-hidden="true"
      className={`mm-sparkle pointer-events-none absolute text-white select-none ${className}`}
      style={{ animationDelay: delay }}
    >
      ✦
    </span>
  );
}

/** Mood dot color. The label text carries the meaning; the dot is decoration. */
const MOOD_DOT: Record<Mood, string> = {
  happy: 'bg-emerald-500',
  ok: 'bg-amber-400',
  tired: 'bg-rose-400',
  rest: 'bg-violet-400',
};

export function MainMenu() {
  const { mood } = useBabooMood();
  const layer = useRef<HTMLElement>(null);
  useHideShellChrome(layer);

  return (
    <section
      ref={layer}
      aria-labelledby="menu-title"
      data-testid="main-menu"
      className={`mm-root overflow-x-hidden ${FILL_SCREEN}`}
      style={{ ...MENU_BACKDROP, ...SAFE_AREA }}
    >
      {/* Content column: phone width, centered on bigger screens. */}
      <div className="relative mx-auto flex h-full max-w-md flex-col px-2 pt-[clamp(0.75rem,3dvh,2.5rem)] pb-[clamp(0.75rem,2dvh,1.5rem)]">
      {/* Soft colored light for depth. Decorative. */}
      <span aria-hidden="true" className="mm-glow top-[18%] -right-16 h-48 w-48 bg-teal-200/50" />
      <span aria-hidden="true" className="mm-glow bottom-[12%] -left-16 h-52 w-52 bg-violet-200/50" />
      <span aria-hidden="true" className="mm-glow top-[42%] left-1/2 h-56 w-56 -translate-x-1/2 bg-white/40" />

      <EcgRibbon className="top-0 -left-12 -rotate-[18deg]" />
      <EcgRibbon className="top-9 -right-20 rotate-[14deg]" />
      <Sparkle className="top-[28%] left-3 text-xl" delay="0s" />
      <Sparkle className="top-[34%] right-4 text-lg" delay="0.9s" />
      <Sparkle className="top-[55%] left-2 text-sm" delay="1.6s" />
      <Sparkle className="top-[70%] right-2 text-xl" delay="0.4s" />

      <header className="relative z-10 shrink-0 text-center">
        <h2
          id="menu-title"
          className="mm-title text-[clamp(1.9rem,9.5vw,2.75rem)] leading-none font-black tracking-wide"
        >
          INLABABOO!
        </h2>
        <p className="mt-2.5 text-xs font-extrabold tracking-[0.22em] text-white uppercase" style={OUTLINED_WHITE}>
          Love hearts. Save lives.
        </p>
      </header>

      {/* Baboo takes the height that is left, between 64px and 176px, floating on a soft glow. */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center py-1">
        <div className="relative flex min-h-16 w-full flex-1 items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute aspect-square h-[90%] max-h-52 rounded-full"
            style={BABOO_GLOW}
          />
          <div className="mm-float relative flex h-full items-center justify-center">
            <BabuHeart mood={mood} className="h-full max-h-44 w-auto max-w-44 drop-shadow-lg" />
          </div>
        </div>
        <p
          className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/90 px-3 py-0.5 text-sm font-bold text-rose-800 shadow-[0_4px_12px_-4px_rgba(190,18,60,0.35)] ring-1 ring-white"
          data-testid="menu-mood"
        >
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${MOOD_DOT[mood]}`} />
          Baboo is feeling: {MOOD_LABELS[mood]}
        </p>
      </div>

      <nav
        aria-label="Main menu"
        className={`relative mt-[clamp(0.5rem,1.6dvh,1.25rem)] flex shrink-0 flex-col items-center pb-1.5 ${SIZES.gap}`}
      >
        <MenuButton to={MENU_LINKS.play} title="Play!" variant="pink" big />
        <MenuButton to={MENU_LINKS.baboo} title="Baboo" subtitle="Your heart buddy!" variant="teal" width="wide" />
        <MenuButton
          to={MENU_LINKS.bloodBank}
          title="Blood Bank"
          subtitle="Top up your lives!"
          variant="teal"
          width="medium"
        />
        <MenuButton to={MENU_LINKS.library} title="Library" subtitle="Play to learn!" variant="teal" width="narrow" />

        <div className="flex max-w-full items-center justify-center gap-1.5">
          <RoundButton to={MENU_LINKS.refer} label="Refer a Buddy" icon="💞" />

          <Link
            to={MENU_LINKS.screened}
            data-size="regular"
            data-variant="white"
            className={`mm-btn mm-btn--white flex shrink-0 items-center justify-center rounded-2xl border-4 border-[#f0556a] bg-white text-center text-lg leading-tight font-black tracking-wide whitespace-nowrap text-rose-600 uppercase ${SIZES.screened} ${focusRing}`}
          >
            Get screened!
          </Link>

          <RoundButton to={MENU_LINKS.settings} label="Settings" icon="⚙️" />
        </div>
      </nav>
      </div>
    </section>
  );
}
