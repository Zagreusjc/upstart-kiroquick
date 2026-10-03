import type { CSSProperties } from 'react';

/**
 * Shared look for the main menu and the Baboo screen. Classes live in
 * `menu.css`; these inline styles cover the layered backgrounds.
 */

/** Dotted pink backdrop, like the mock-up, with a soft light at the top. */
export const MENU_BACKDROP: CSSProperties = {
  backgroundImage:
    'radial-gradient(rgba(255,255,255,0.5) 1.5px, transparent 1.7px), radial-gradient(120% 55% at 50% 0%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #ffdde3 0%, #ffbcc8 60%, #ffa9b9 100%)',
  backgroundSize: '18px 18px, 100% 100%, 100% 100%',
};

/** The Baboo screen uses a calmer version: fainter dots, lighter pink. */
export const SOFT_BACKDROP: CSSProperties = {
  backgroundImage:
    'radial-gradient(rgba(255,255,255,0.45) 1.4px, transparent 1.6px), radial-gradient(120% 40% at 50% 0%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #ffe0e6 0%, #ffcad4 55%, #ffbac7 100%)',
  backgroundSize: '18px 18px, 100% 100%, 100% 100%',
  backgroundAttachment: 'scroll',
};

/** Soft white glow behind Baboo. */
export const BABOO_GLOW: CSSProperties = {
  background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 66%)',
};
