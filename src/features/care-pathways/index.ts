import type { FeatureModule } from '../../core/contracts';
import { CarePathwaysScreen } from './Screen';

const carePathways: FeatureModule = {
  id: 'care-pathways',
  title: 'Care',
  order: 4,
  navItem: { label: 'Care', icon: '🏥', path: '/care' },
  Component: CarePathwaysScreen,
};

export default carePathways;
