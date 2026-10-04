/**
 * Public entry point for shared code. Features import from `../../core`.
 * OWNER: Jolo (edited on `base/scaffold` only).
 */
export type {
  CoinSource,
  CoinsProvider,
  CoreApi,
  FeatureModule,
  HealthProvider,
  HealthSnapshot,
  LifeSource,
  LivesProvider,
  NavItem,
  ProviderKind,
  ProviderMap,
} from './contracts';
export {
  clearEventLog,
  emit,
  getEventLog,
  on,
  type EventMap,
  type EventType,
  type LoggedEvent,
} from './events';
export { CoinIcon, LifeIcon, MovesIcon, PlaqueIcon, ScoreIcon } from './icons';
export { getProvider, registerProvider, useCoins, useHealth, useLives } from './providers';
export { loadJSON, removeKey, saveJSON } from './storage';
export { MAX_LIVES } from './stubs/lives';
export { dayKey, todayISO } from './time';
