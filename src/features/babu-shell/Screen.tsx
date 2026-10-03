import { Route, Routes } from 'react-router-dom';
import { Home } from './components/Home';
import { MainMenu } from './components/MainMenu';
import { Onboarding } from './components/Onboarding';
import { useBabuState } from './useBabu';

/**
 * Home tab entry (routed at `/home/*`): onboarding on first run, then the
 * main menu at `/home` and the Baboo screen at `/home/baboo`.
 */
export function BabuShellScreen() {
  const { onboardedAt } = useBabuState();
  if (onboardedAt === null) return <Onboarding />;
  return (
    <Routes>
      <Route index element={<MainMenu />} />
      <Route path="baboo" element={<Home />} />
      <Route path="*" element={<MainMenu />} />
    </Routes>
  );
}
