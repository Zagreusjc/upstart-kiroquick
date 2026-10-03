import type { FeatureModule } from '../../core';
import { createHealthProvider } from './healthProvider';
import { BabuShellScreen } from './Screen';

const babuShell: FeatureModule = {
  id: 'babu-shell',
  title: 'Home',
  order: 1,
  navItem: { label: 'Home', icon: '🏠', path: '/home' },
  Component: BabuShellScreen,
  register(api) {
    api.registerProvider('health', createHealthProvider());
  },
};

export default babuShell;
