import type { FeatureModule } from '../../core/contracts';
import { EconomyLibraryScreen } from './Screen';

const economyLibrary: FeatureModule = {
  id: 'economy-library',
  title: 'Library',
  order: 3,
  navItem: { label: 'Library', icon: '📚', path: '/library' },
  Component: EconomyLibraryScreen,
  // Prime: register the real providers here when they are ready:
  // register(api) {
  //   api.registerProvider('coins', createCoinsProvider());
  //   api.registerProvider('lives', createLivesProvider());
  // },
};

export default economyLibrary;
