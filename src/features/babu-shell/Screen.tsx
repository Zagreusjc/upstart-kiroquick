import { Route, Routes } from 'react-router-dom';
import { GlassScene } from './components/GlassScene';
import { Home } from './components/Home';
import { MainMenu } from './components/MainMenu';
import { Onboarding } from './components/Onboarding';
import { Settings } from './components/Settings';
import { useBabuState } from './useBabu';

/**
 * Home tab entry (routed at `/home/*`): onboarding on first run, then the
 * main menu at `/home`, the Baboo screen at `/home/baboo` and settings at
 * `/home/settings`. Every screen sits on the Liquid Glass scene.
 */
export function BabuShellScreen() {
  const { onboardedAt } = useBabuState();
  return (
    <GlassScene>
      {onboardedAt === null ? (
        <Onboarding />
      ) : (
        <Routes>
          <Route index element={<MainMenu />} />
          <Route path="baboo" element={<Home />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<MainMenu />} />
        </Routes>
      )}
    </GlassScene>
  );
}
