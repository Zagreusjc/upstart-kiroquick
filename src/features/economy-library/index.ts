import type { FeatureModule } from '../../core';
import { EconomyLibraryScreen } from './Screen';
import { getEconomyStore } from './store';

const economyLibrary: FeatureModule = {
  id: 'economy-library',
  title: 'Library',
  order: 3,
  navItem: { label: 'Library', icon: '📚', path: '/library' },
  Component: EconomyLibraryScreen,

  // Register the real shared economy. The same instances back the screen and
  // the app header, so coins and lives stay in sync everywhere.
  register(api) {
    const store = getEconomyStore();
    api.registerProvider('coins', store.coins);
    api.registerProvider('lives', store.lives);
    // Refill lives from health (steps/sleep targets, once per day).
    store.lives.bindHealth();
  },
};

export default economyLibrary;
