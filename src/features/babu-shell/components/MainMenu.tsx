import { Link } from 'react-router-dom';
import { MOOD_LABELS } from '../constants';
import { MENU_LINKS } from '../menuLinks';
import { useBabooMood } from '../useBabu';
import { BabuHeart } from './BabuHeart';

/**
 * Main menu: the landing screen of the Home tab, in a Liquid Glass style
 * (see `glass.css`). Translucent tinted-glass capsules float over a soft,
 * slowly drifting aurora, with Baboo in the middle showing the same live
 * mood as the Baboo screen.
 */

const focusRing =
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-rose-900';

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

type Variant = 'pink' | 'teal';

/**
 * Tinted Liquid Glass: dark pink #f0556a for Play, teal #3cc4b4 for the rest,
 * both translucent with specular rims (`glass.css`). White lettering.
 */
const VARIANT: Record<Variant, string> = {
  pink: 'lg-glass lg-glass--pink',
  teal: 'lg-glass lg-glass--teal',
};

/** A text-only glass capsule. `big` is the Play button. */
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
  return (
    <Link
      to={to}
      data-size={big ? 'big' : 'regular'}
      data-variant={variant}
      className={`flex shrink-0 flex-col items-center justify-center text-center ${
        big ? `${SIZES.play} rounded-[2.25rem]` : `${SIZES.regular} rounded-full`
      } ${VARIANT[variant]} ${focusRing}`}
    >
      <span
        className={`leading-tight font-black tracking-wide uppercase ${big ? SIZES.playText : SIZES.regularText}`}
      >
        {title}
      </span>
      {subtitle && <span className="text-sm leading-tight font-semibold opacity-95">{subtitle}</span>}
    </Link>
  );
}

/** Round teal glass shortcut (Refer a Buddy, Settings). */
function RoundButton({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <Link
      to={to}
      data-variant="teal"
      className={`flex shrink-0 flex-col items-center justify-center rounded-full text-center ${SIZES.round} ${VARIANT.teal} ${focusRing}`}
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {icon}
      </span>
      <span className="mt-0.5 px-0.5 text-[10px] leading-[1.05] font-extrabold">{label}</span>
    </Link>
  );
}

/** Decorative ECG strip made of teal glass. Hidden from screen readers. */
function EcgStrip({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`lg-pill pointer-events-none absolute flex h-10 w-40 items-center justify-center rounded-full ${className}`}
      style={{ background: 'rgba(60, 196, 180, 0.72)' }}
    >
      <svg viewBox="0 0 120 30" className="h-6 w-28" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,16 34,16 42,6 50,26 58,10 64,16 118,16" />
      </svg>
    </div>
  );
}

function Sparkle({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute text-white select-none ${className}`}
      style={{ textShadow: '0 0 10px rgba(255,255,255,0.9)' }}
    >
      ✦
    </span>
  );
}

export function MainMenu() {
  const { mood } = useBabooMood();

  return (
    <section
      aria-labelledby="menu-title"
      data-testid="main-menu"
      className={`relative -m-4 flex flex-col overflow-x-hidden px-2 pt-[clamp(0.75rem,3dvh,2.5rem)] pb-[clamp(0.75rem,2dvh,1.5rem)] ${FILL_SCREEN}`}
    >
      <EcgStrip className="top-1 -left-14 -rotate-[16deg]" />
      <EcgStrip className="top-3 -right-24 rotate-[12deg]" />
      <Sparkle className="top-[28%] left-4 text-xl" />
      <Sparkle className="top-[34%] right-5 text-lg" />
      <Sparkle className="top-[55%] left-3 text-sm" />
      <Sparkle className="top-[70%] right-3 text-xl" />

      <header className="relative z-10 flex shrink-0 flex-col items-center text-center">
        <h2
          id="menu-title"
          className="lg-title text-[clamp(1.9rem,9.5vw,2.75rem)] leading-none font-black tracking-wide"
        >
          INLABABOO.
        </h2>
        <p className="lg-pill mt-2 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-[0.2em] text-rose-800 uppercase">
          Merge habits. Save hearts.
        </p>
      </header>

      {/* Baboo takes the height that is left, between 64px and 176px, on a soft glow. */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center py-1">
        <div className="relative flex min-h-16 w-full flex-1 items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute aspect-square h-[85%] max-h-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 65%)' }}
          />
          <BabuHeart mood={mood} className="relative h-full max-h-44 w-auto max-w-44 drop-shadow-lg" />
        </div>
        <p
          className="lg-pill mt-1 shrink-0 rounded-full px-3 py-0.5 text-sm font-bold text-rose-800"
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
        <MenuButton to={MENU_LINKS.baboo} title="Baboo" subtitle="Your heart buddy!" variant="teal" />
        <MenuButton to={MENU_LINKS.library} title="Library" subtitle="Play to learn!" variant="teal" />
        <MenuButton to={MENU_LINKS.bloodBank} title="Blood Bank" subtitle="Top up your lives!" variant="teal" />

        <div className="flex max-w-full items-center justify-center gap-1.5">
          <RoundButton to={MENU_LINKS.refer} label="Refer a Buddy" icon="💞" />

          <Link
            to={MENU_LINKS.screened}
            data-size="regular"
            data-variant="clear"
            className={`lg-glass lg-glass--clear flex shrink-0 items-center justify-center rounded-full text-center text-lg leading-tight font-black tracking-wide whitespace-nowrap uppercase ${SIZES.screened} ${focusRing}`}
          >
            Get screened!
          </Link>

          <RoundButton to={MENU_LINKS.settings} label="Settings" icon="⚙️" />
        </div>
      </nav>
    </section>
  );
}
