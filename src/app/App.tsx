import { Navigate, Route, Routes } from 'react-router-dom';
import { getFeatureModules } from '../core/registry';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { NotFound } from './NotFound';

/**
 * App shell. Routes and tabs come from the feature registry, so this file
 * never changes when a feature is added or merged.
 * OWNER: Jolo (edited on `base/scaffold` only).
 */
export function App() {
  const modules = getFeatureModules();
  const home = modules[0]?.navItem.path ?? '/';

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-rose-50 text-slate-900">
      <Header />
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Navigate to={home} replace />} />
          {modules.map(({ id, navItem, Component }) => (
            <Route key={id} path={`${navItem.path}/*`} element={<Component />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav modules={modules} />
    </div>
  );
}
