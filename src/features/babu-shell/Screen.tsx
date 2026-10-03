import { Home } from './components/Home';
import { Onboarding } from './components/Onboarding';
import { useBabuState } from './useBabu';

/** Home tab entry: onboarding on first run, then the Babu home screen. */
export function BabuShellScreen() {
  const { onboardedAt } = useBabuState();
  return onboardedAt === null ? <Onboarding /> : <Home />;
}
