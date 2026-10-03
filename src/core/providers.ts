import { useSyncExternalStore } from 'react';
import type { ProviderKind, ProviderMap } from './contracts';
import { createCoinsStub } from './stubs/coins';
import { createHealthStub } from './stubs/health';
import { createLivesStub } from './stubs/lives';

/**
 * Provider registry. Features call `registerProvider` (through `CoreApi`)
 * to replace a stub with the real implementation. Hooks always resolve the
 * current provider, falling back to a lazily created stub.
 *
 * OWNER: Jolo (edited on `base/scaffold` only).
 */

const registered: { [K in ProviderKind]?: ProviderMap[K] } = {};
const stubs: { [K in ProviderKind]?: ProviderMap[K] } = {};

const stubFactories: { [K in ProviderKind]: () => ProviderMap[K] } = {
  coins: () => createCoinsStub(),
  lives: () => createLivesStub(),
  health: () => createHealthStub(),
};

export function registerProvider<K extends ProviderKind>(
  kind: K,
  impl: ProviderMap[K],
): void {
  registered[kind] = impl as never;
}

export function getProvider<K extends ProviderKind>(kind: K): ProviderMap[K] {
  const real = registered[kind] as ProviderMap[K] | undefined;
  if (real) return real;
  let stub = stubs[kind] as ProviderMap[K] | undefined;
  if (!stub) {
    stub = stubFactories[kind]() as ProviderMap[K];
    stubs[kind] = stub as never;
  }
  return stub;
}

/** Forget registered providers and cached stubs (tests only). */
export function resetProviders(): void {
  for (const kind of Object.keys(registered) as ProviderKind[]) {
    delete registered[kind];
  }
  for (const kind of Object.keys(stubs) as ProviderKind[]) {
    delete stubs[kind];
  }
}

// ---------------------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------------------

export function useCoins() {
  const provider = getProvider('coins');
  const balance = useSyncExternalStore(provider.subscribe, provider.balance);
  return { balance, award: provider.award, spend: provider.spend };
}

export function useLives() {
  const provider = getProvider('lives');
  const lives = useSyncExternalStore(provider.subscribe, provider.lives);
  return {
    lives,
    max: provider.max,
    spend: provider.spend,
    award: provider.award,
  };
}

export function useHealth() {
  const provider = getProvider('health');
  const snapshot = useSyncExternalStore(provider.subscribe, provider.snapshot);
  return { snapshot, update: provider.update };
}
