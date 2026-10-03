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

type Variant = 'play' | 'teal' | 'soft';

const VARIANT: Record<Variant, { className: string; shadow: string }> = {
  play: {
    className: 'bg-linear-to-b from-rose-400 to-rose-600 text-white',
    shadow: '0 6px 0 #9f1239, 0 10px 18px rgba(159,18,57,0.25)',
  },
  teal: {
    className: 'bg-linear-to-b from-teal-500 to-teal-700 text-white',
    shadow: '0 6px 0 #115e59, 0 10px 18px rgba(17,94,89,0.22)',
  },
  soft: {
    className: 'border-2 border-white bg-linear-to-b from-rose-50 to-rose-200 text-rose-800',
    shadow: '0 6px 0 #fda4af, 0 10px 18px rgba(190,18,60,0.15)',
  },
};

/** A text-only menu button. `big` is the Play button: much taller, with larger lettering. */
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
  const v = VARIANT[variant];
  return (
    <Link
      to={to}
      state={state}
      data-size={big ? 'big' : 'regular'}
      className={`flex w-full flex-col items-center justify-center rounded-3xl px-4 text-center ${
        big ? 'min-h-32' : 'min-h-16'
      } ${v.className} ${press} ${focusRing}`}
      style={{ boxShadow: v.shadow }}
    >
      <span className={`font-black tracking-wide uppercase ${big ? 'text-5xl' : 'text-lg'}`}>{title}</span>
      {subtitle && <span className="text-sm font-bold">{subtitle}</span>}
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
  const style =
    tone === 'teal'
      ? { className: 'from-teal-500 to-teal-700', shadow: '0 5px 0 #115e59' }
      : { className: 'from-rose-400 to-rose-600', shadow: '0 5px 0 #9f1239' };
  return (
    <Link
      to={to}
      className={`flex h-[4.75rem] w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-full bg-linear-to-b text-center text-white ${style.className} ${press} ${focusRing}`}
      style={{ boxShadow: style.shadow }}
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

      <nav aria-label="Main menu" className="relative mt-6 space-y-4">
        <MenuButton to={MENU_LINKS.play} title="Play!" variant="play" big />
        <MenuButton
          to={MENU_LINKS.baboo}
          state={PULSE_STATE}
          title="Pulse"
          subtitle="Do tasks, gain beats!"
          variant="teal"
        />
        <MenuButton to={MENU_LINKS.milestones} title="Milestones" subtitle="Build a habit!" variant="teal" />
        <MenuButton to={MENU_LINKS.baboo} title="Baboo" subtitle="Your heart buddy!" variant="soft" />

        <div className="flex items-center gap-2 pt-2">
          <RoundButton to={MENU_LINKS.refer} label="Refer a Buddy" icon="💞" tone="teal" />

          <Link
            to={MENU_LINKS.screened}
            className={`flex h-[4.75rem] min-w-0 flex-1 items-center justify-center rounded-3xl border-4 border-rose-400 bg-white px-2 text-center text-lg leading-tight font-black tracking-wide text-rose-600 uppercase ${press} ${focusRing}`}
            style={{ boxShadow: '0 5px 0 #fb7185' }}
          >
            Get screened!
          </Link>

          <RoundButton to={MENU_LINKS.library} label="Library" icon="📖" tone="rose" />
        </div>
      </nav>
    </section>
  );
}
