import { Route, Routes } from 'react-router-dom';
import { Home } from './components/Home';
import { MainMenu } from './components/MainMenu';
import { Onboarding } from './components/Onboarding';
import { Settings } from './components/Settings';
import { useBabuState } from './useBabu';

/**
 * Home tab entry (routed at `/home/*`): onboarding on first run, then the
 * main menu at `/home`, the Baboo screen at `/home/baboo` and settings at
 * `/home/settings`.
 */
export function BabuShellScreen() {
  const { onboardedAt } = useBabuState();
  if (onboardedAt === null) return <Onboarding />;
  return (
    <Routes>
      <Route index element={<MainMenu />} />
      <Route path="baboo" element={<Home />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<MainMenu />} />
    </Routes>
  );
}
