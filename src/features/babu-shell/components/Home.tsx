import { Link } from 'react-router-dom';
import { MOOD_HINTS, MOOD_LABELS, MOOD_MESSAGES } from '../constants';
import '../menu.css';
import { MENU_LINKS } from '../menuLinks';
import { BABOO_GLOW, SOFT_BACKDROP } from '../menuStyle';
import { useBabooMood } from '../useBabu';
import { BabuHeart } from './BabuHeart';
import { CheckinCard } from './CheckinCard';
import { DemoControls } from './DemoControls';
import { HealthInput } from './HealthInput';

/**
 * Fill the screen between the header and bottom nav. The shell publishes the
 * live height of <main> as `--shell-main-h` (see src/app/App.tsx), so no
 * header or nav heights are hard-coded here. The shell wrapper has 12px of
 * vertical padding, cancelled with `-my-3` and `-mx-4` so the backdrop
 * reaches the screen edges.
 */
const FILL_SCREEN = 'min-h-[var(--shell-main-h,calc(100dvh_-_7.5rem))]';

/**
 * Hero height so Baboo fills the first screen: the screen minus the 16px top
 * padding, the 44px "Main menu" button, its 16px gap and a 16px bottom gap.
 * 16 + 44 + 16 + 16 = 92.
 */
const HERO_HEIGHT = 'min-h-[max(20rem,calc(var(--shell-main-h,calc(100dvh_-_7.5rem))_-_92px))]';
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-800';

function scrollToDetails() {
  const target = document.getElementById('home-details');
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target?.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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

/**
 * Baboo screen: the main menu's look, toned down. A calmer dotted backdrop,
 * a frosted hero card with Baboo floating on a soft glow, then the snapshot,
 * check-in and demo controls below the fold.
 */
export function Home() {
  const { mood, day } = useBabooMood();
  const message = MOOD_MESSAGES[mood].replace('{n}', String(day.goals.count));
  const hint = mood !== 'rest' && day.reason ? MOOD_HINTS[day.reason] : null;

  return (
    <div
      data-testid="baboo-screen"
      className={`mm-root relative -mx-4 -my-3 space-y-4 overflow-x-hidden px-4 pt-4 pb-6 ${FILL_SCREEN}`}
      style={SOFT_BACKDROP}
    >
      <Sparkle className="top-20 right-4 text-base" delay="0s" />
      <Sparkle className="top-[45%] left-1 text-sm" delay="1.2s" />

      <Link
        to={MENU_LINKS.home}
        className={`mm-btn mm-btn--teal mm-btn--soft inline-flex min-h-11 items-center rounded-full bg-[#3cc4b4] px-4 text-sm font-bold text-white ${focusRing}`}
      >
        <span aria-hidden="true">←&nbsp;</span>Main menu
      </Link>

      <section
        aria-labelledby="babu-title"
        data-testid="babu-hero"
        className={`${HERO_HEIGHT} mm-card relative flex flex-col items-center justify-between rounded-[1.75rem] px-4 pt-5 pb-3 text-center`}
      >
        <h2
          id="babu-title"
          className="rounded-full bg-rose-50 px-3 py-1 text-xs font-extrabold tracking-[0.2em] text-rose-700 uppercase ring-1 ring-rose-100"
        >
          Your Baboo
        </h2>

        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute aspect-square w-[115%] rounded-full"
              style={BABOO_GLOW}
            />
            <div className="mm-float relative">
              <BabuHeart mood={mood} className="h-[min(72vw,42dvh)] w-[min(72vw,42dvh)] drop-shadow-md" />
            </div>
          </div>
          <p className="mm-title--soft mt-4 text-3xl font-black text-rose-600" data-testid="mood-label">
            {MOOD_LABELS[mood]}
          </p>
          <p className="mt-2 max-w-xs text-base text-slate-700" aria-live="polite">
            {message}
          </p>
          {hint && (
            <p
              className="mt-2 max-w-xs rounded-2xl bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-800 ring-1 ring-rose-100"
              data-testid="mood-hint"
            >
              {hint}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={scrollToDetails}
          className={`flex min-h-11 flex-col items-center rounded-full px-4 text-sm font-bold text-rose-700 hover:text-rose-800 ${focusRing}`}
        >
          Today's snapshot and check-in
          <span aria-hidden="true" className="text-lg leading-none motion-safe:animate-bounce">
            ⌄
          </span>
        </button>
      </section>

      <div id="home-details" className="scroll-mt-16 space-y-4">
        <HealthInput mood={mood} day={day} hint={hint} />
        <CheckinCard mood={mood} />
        <DemoControls />
      </div>
    </div>
  );
}
