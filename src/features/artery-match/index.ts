import type { FeatureModule } from '../../core/contracts';
import { ArteryMatchScreen } from './Screen';

const arteryMatch: FeatureModule = {
  id: 'artery-match',
  title: 'Play',
  order: 2,
  navItem: { label: 'Play', icon: '🎮', path: '/play' },
  Component: ArteryMatchScreen,
};

export default arteryMatch;
