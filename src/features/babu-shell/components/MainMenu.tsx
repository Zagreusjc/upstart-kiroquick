import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { MOOD_LABELS } from '../constants';
import { MENU_LINKS, PULSE_STATE } from '../menuLinks';
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

type Variant = 'play' | 'teal';

/** Flat, solid fills (no gradients, no drop shadows). White text passes contrast on both. */
const VARIANT: Record<Variant, string> = {
  play: 'bg-rose-600 text-white hover:bg-rose-700',
  teal: 'bg-teal-700 text-white hover:bg-teal-800',
};

/**
 * A text-only menu button that hugs its text: the padding is just a little
 * wider than the words. `big` is the Play button, with larger lettering.
 */
function MenuButton({
  to,
  title,
  subtitle,
  variant,
  big = false,
  state,
}: {
  to: string;
  title: string;
  subtitle?: string;
  variant: Variant;
  big?: boolean;
  state?: unknown;
}) {
  return (
    <Link
      to={to}
      state={state}
      data-size={big ? 'big' : 'regular'}
      className={`inline-flex min-h-11 flex-col items-center justify-center rounded-2xl text-center ${
        big ? 'px-8 py-3' : 'px-5 py-2'
      } ${VARIANT[variant]} ${press} ${focusRing}`}
    >
      <span className={`leading-tight font-black tracking-wide uppercase ${big ? 'text-5xl' : 'text-lg'}`}>
        {title}
      </span>
      {subtitle && <span className="text-sm leading-tight font-bold">{subtitle}</span>}
    </Link>
  );
}

function RoundButton({
  to,
  label,
  icon,
  tone,
}: {
  to: string;
  label: string;
  icon: string;
  tone: 'teal' | 'rose';
}) {
  const fill = tone === 'teal' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-rose-600 hover:bg-rose-700';
  return (
    <Link
      to={to}
      className={`flex h-[4.25rem] w-[4.25rem] shrink-0 flex-col items-center justify-center rounded-full text-center text-white ${fill} ${press} ${focusRing}`}
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
      className="relative overflow-hidden rounded-[2rem] px-3 pt-10 pb-6 shadow-sm"
      style={BACKDROP}
    >
      <EcgRibbon className="top-0 -left-12 -rotate-[18deg]" />
      <EcgRibbon className="top-9 -right-20 rotate-[14deg]" />
      <Sparkle className="top-52 left-3 text-xl" />
      <Sparkle className="top-64 right-4 text-lg text-teal-200" />
      <Sparkle className="top-[26rem] left-2 text-sm text-rose-300" />
      <Sparkle className="top-[34rem] right-2 text-xl" />

      <header className="relative z-10 text-center">
        <h2
          id="menu-title"
          className="text-[clamp(1.9rem,9.5vw,2.75rem)] leading-none font-black tracking-wide text-rose-500"
          style={TITLE}
        >
          INLABABOO.
        </h2>
        <p className="mt-3 text-xs font-extrabold tracking-[0.2em] text-white uppercase" style={OUTLINED_WHITE}>
          Merge habits. Save hearts.
        </p>
      </header>

      <div className="relative mt-2 flex flex-col items-center">
        <BabuHeart mood={mood} className="h-44 w-44 drop-shadow-md" />
        <p
          className="mt-1 rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-rose-800"
          data-testid="menu-mood"
        >
          Baboo is feeling: {MOOD_LABELS[mood]}
        </p>
      </div>

      <nav aria-label="Main menu" className="relative mt-6 flex flex-col items-center gap-4">
        <MenuButton to={MENU_LINKS.play} title="Play!" variant="play" big />
        <MenuButton
          to={MENU_LINKS.baboo}
          state={PULSE_STATE}
          title="Pulse"
          subtitle="Do tasks, gain beats!"
          variant="teal"
        />
        <MenuButton to={MENU_LINKS.milestones} title="Milestones" subtitle="Build a habit!" variant="teal" />
        <MenuButton to={MENU_LINKS.baboo} title="Baboo" subtitle="Your heart buddy!" variant="teal" />

        <div className="flex max-w-full items-center justify-center gap-2 pt-2">
          <RoundButton to={MENU_LINKS.refer} label="Refer a Buddy" icon="💞" tone="teal" />

          <Link
            to={MENU_LINKS.screened}
            className={`inline-flex min-h-11 items-center justify-center rounded-2xl border-4 border-rose-500 bg-white px-3 py-2 text-center text-sm leading-tight font-black tracking-wide whitespace-nowrap text-rose-700 uppercase hover:bg-rose-50 ${press} ${focusRing}`}
          >
            Get screened!
          </Link>

          <RoundButton to={MENU_LINKS.library} label="Library" icon="📖" tone="rose" />
        </div>
      </nav>
    </section>
  );
}
