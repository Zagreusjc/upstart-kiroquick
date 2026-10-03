import { useEffect, type RefObject } from 'react';

/**
 * Hide the app shell's header and bottom nav while a full-screen screen
 * (the main menu) is shown, and bring them back when it closes.
 *
 * The shell lives in `src/app` (owned by Jolo), so this feature does not
 * edit it. The menu is drawn as a full-screen layer on top of the shell, and
 * this hook makes the covered header and nav `inert` and `aria-hidden`, so
 * keyboard and screen-reader users cannot reach controls they cannot see.
 * Both attributes are removed again on unmount (any other screen).
 */
export function useHideShellChrome(layer: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const own = layer.current;
    if (typeof document === 'undefined') return;

    const chrome = [...document.querySelectorAll<HTMLElement>('header, nav[aria-label="Main"]')].filter(
      (el) => !own?.contains(el),
    );
    const changed = chrome.filter((el) => !el.hasAttribute('inert'));
    changed.forEach((el) => {
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
      el.dataset.hiddenByMenu = 'true';
    });

    return () => {
      changed.forEach((el) => {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
        delete el.dataset.hiddenByMenu;
      });
    };
  }, [layer]);
}
