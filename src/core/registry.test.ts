import { describe, expect, it, vi } from 'vitest';
import { bootstrapFeatures, getFeatureModules, resetBootstrap } from './registry';

describe('feature registry', () => {
  it('discovers all four feature modules in nav order', () => {
    const ids = getFeatureModules().map((m) => m.id);
    expect(ids).toEqual([
      'babu-shell',
      'artery-match',
      'economy-library',
      'care-pathways',
    ]);
  });

  it('gives every module a unique nav path and a component', () => {
    const modules = getFeatureModules();
    const paths = modules.map((m) => m.navItem.path);
    expect(new Set(paths).size).toBe(modules.length);
    for (const m of modules) expect(m.Component).toBeTypeOf('function');
  });

  it('calls register once per module when bootstrapping', () => {
    resetBootstrap();
    const modules = getFeatureModules();
    const spies = modules.map((m) => {
      const spy = vi.fn();
      m.register = spy;
      return spy;
    });

    bootstrapFeatures();
    bootstrapFeatures();

    for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
    resetBootstrap();
  });
});
