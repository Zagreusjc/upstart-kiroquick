import type { ComponentType } from 'react';

/**
 * Shared contracts for INLABABOO.
 *
 * OWNER: Jolo (edited on `base/scaffold` only). Feature owners must not edit
 * this file. If you need a change, message Jolo.
 *
 * Providers are plain objects of closures. Do NOT rely on `this`, because the
 * React hooks pass methods such as `provider.subscribe` around unbound.
 */

// ---------------------------------------------------------------------------
// Coins
// ---------------------------------------------------------------------------

/** Why coins were awarded or spent (used in the ledger and the events CSV). */
export type CoinSource =
  | 'library_read'
  | 'streak'
  | 'checkin'
  | 'game_score'
  | 'share'
  | 'milestone'
  | 'voucher_spend'
  | 'other';

export interface CoinsProvider {
  /** Current coin balance (never negative). */
  balance(): number;
  /**
   * Award coins. Returns false (and changes nothing) when `amount <= 0` or
   * when `idempotencyKey` was already used. Recommended key format:
   * `${source}:${subject}:${yyyy-mm-dd}` (see `dayKey` in core/time.ts).
   */
  award(source: CoinSource, amount: number, idempotencyKey?: string): boolean;
  /** Spend coins. Returns false (and changes nothing) if the balance is too low. */
  spend(amount: number, reason: string): boolean;
  /** Subscribe to balance changes. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
}

// ---------------------------------------------------------------------------
// Lives
// ---------------------------------------------------------------------------

export type LifeSource =
  | 'library_read'
  | 'share'
  | 'steps'
  | 'sleep'
  | 'refill'
  | 'other';

export interface LivesProvider {
  /** Lives left, always between 0 and `max`. */
  lives(): number;
  /** Maximum lives (3). */
  readonly max: number;
  /** Spend one life. Returns false when no lives are left. */
  spend(): boolean;
  /** Add lives, clamped to `max`. */
  award(count: number, source: LifeSource): void;
  subscribe(listener: () => void): () => void;
}

// ---------------------------------------------------------------------------
// Health (manual demo input)
// ---------------------------------------------------------------------------

export interface HealthSnapshot {
  steps: number;
  sleepHours: number;
  activityMinutes: number;
  /** Epoch milliseconds of the last update (0 if never updated). */
  updatedAt: number;
}

export interface HealthProvider {
  /** Must return a referentially stable object until the data changes. */
  snapshot(): HealthSnapshot;
  /** Manual demo input. Health data in the MVP is typed in by the user. */
  update(patch: Partial<Omit<HealthSnapshot, 'updatedAt'>>): void;
  subscribe(listener: () => void): () => void;
}

// ---------------------------------------------------------------------------
// Provider registry types
// ---------------------------------------------------------------------------

export interface ProviderMap {
  coins: CoinsProvider;
  lives: LivesProvider;
  health: HealthProvider;
}

export type ProviderKind = keyof ProviderMap;

// ---------------------------------------------------------------------------
// Feature modules
// ---------------------------------------------------------------------------

export interface NavItem {
  /** Short label shown under the icon. */
  label: string;
  /** A single emoji. It is hidden from screen readers; the label is read. */
  icon: string;
  /** Route path, for example `/play`. The feature owns everything below it. */
  path: string;
}

/** What `register` receives so a feature can plug in without editing core. */
export interface CoreApi {
  registerProvider<K extends ProviderKind>(kind: K, impl: ProviderMap[K]): void;
}

export interface FeatureModule {
  /** Unique id, matches the folder name under src/features. */
  id: string;
  title: string;
  /** Sort order in the bottom nav. */
  order: number;
  navItem: NavItem;
  /** Routed at `${navItem.path}/*`. Use nested <Routes> inside if needed. */
  Component: ComponentType;
  /** Optional hook to register real providers. Runs once at startup. */
  register?(api: CoreApi): void;
}
