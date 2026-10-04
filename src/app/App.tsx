import { Navigate, Route, Routes } from 'react-router-dom';
import { getFeatureModules } from '../core/registry';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { NotFound } from './NotFound';

/**
 * App shell. Routes and tabs come from the feature registry, so this file
 * never changes when a feature is added or merged.
 * The shell is exactly one screen tall (100dvh): the header and bottom nav
 * stay put edge to edge and only <main> scrolls between them.
 */
export function App() {
  const modules = getFeatureModules();
  const home = modules[0]?.navItem.path ?? '/';

  return (
    <div className="flex h-dvh flex-col overflow-x-clip text-baboo-900">
      <Header />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-md py-4 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] md:max-w-2xl">
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
