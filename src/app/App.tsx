import { useLayoutEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { getFeatureModules } from '../core/registry';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { NotFound } from './NotFound';

/** Tabs with long content keep a normally scrolling page. Every other tab is sized to fit one screen. */
const SCROLLING_TABS = ['/library', '/care'];

/**
 * App shell. Routes and tabs come from the feature registry, so this file
 * never changes when a feature is added or merged.
 * The shell is exactly one screen tall (100dvh): the header and bottom nav
 * stay put edge to edge and only <main> scrolls between them.
 *
 * `--shell-main-h` holds the live pixel height of <main> (between header and
 * nav). Fit-to-screen pages size themselves from it, so they fill the space
 * on any phone without hard-coded header or nav heights.
 */
export function App() {
  const modules = getFeatureModules();
  const home = modules[0]?.navItem.path ?? '/';
  const { pathname } = useLocation();
  const scrolls = SCROLLING_TABS.some((tab) => pathname === tab || pathname.startsWith(`${tab}/`));
  const main = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = main.current;
    if (!el) return;
    const sync = () => el.style.setProperty('--shell-main-h', `${el.clientHeight}px`);
    sync();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-x-clip text-baboo-900">
      <Header />
      <main ref={main} className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          data-fit={scrolls ? undefined : 'true'}
          className={`mx-auto w-full max-w-md pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] md:max-w-2xl ${
            scrolls ? 'py-4' : 'app-fit py-3'
          }`}
        >
          <Routes>
            <Route path="/" element={<Navigate to={home} replace />} />
            {modules.map(({ id, navItem, Component }) => (
              <Route key={id} path={`${navItem.path}/*`} element={<Component />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <BottomNav modules={modules} />
    </div>
  );
}
