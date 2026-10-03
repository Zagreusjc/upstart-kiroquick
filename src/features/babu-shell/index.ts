import type { FeatureModule } from '../../core/contracts';
import { BabuShellScreen } from './Screen';

const babuShell: FeatureModule = {
  id: 'babu-shell',
  title: 'Home',
  order: 1,
  navItem: { label: 'Home', icon: '🏠', path: '/home' },
  Component: BabuShellScreen,
  // CJ: register the real HealthProvider here when it is ready:
  // register(api) { api.registerProvider('health', createHealthProvider()); },
};

export default babuShell;
