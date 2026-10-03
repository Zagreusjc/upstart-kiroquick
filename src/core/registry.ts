import type { CoreApi, FeatureModule } from './contracts';
import { registerProvider } from './providers';

/**
 * Auto-discovers every `src/features/<name>/index.ts(x)` (default export must
 * be a `FeatureModule`). Nobody edits a central routes file, so feature
 * branches never conflict here.
 *
 * OWNER: Jolo (edited on `base/scaffold` only).
 */
const discovered = import.meta.glob<{ default: FeatureModule }>(
  '../features/*/index.{ts,tsx}',
  { eager: true },
);

export function getFeatureModules(): FeatureModule[] {
  return Object.values(discovered)
    .map((entry) => entry.default)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

const coreApi: CoreApi = { registerProvider };
let bootstrapped = false;

/** Let every feature register its providers. Safe to call more than once. */
export function bootstrapFeatures(): void {
  if (bootstrapped) return;
  bootstrapped = true;
  for (const module of getFeatureModules()) {
    module.register?.(coreApi);
  }
}

/** Allow bootstrapping again (tests only). */
export function resetBootstrap(): void {
  bootstrapped = false;
}
