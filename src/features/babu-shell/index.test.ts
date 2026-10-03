import { describe, expect, it, vi } from 'vitest';
import babuShell from './index';

describe('babu-shell feature module', () => {
  it('registers a working health provider', () => {
    const registerProvider = vi.fn();
    babuShell.register?.({ registerProvider });

    expect(registerProvider).toHaveBeenCalledTimes(1);
    const [kind, provider] = registerProvider.mock.calls[0];
    expect(kind).toBe('health');
    provider.update({ sleepHours: 30 });
    expect(provider.snapshot().sleepHours).toBe(24);
  });

  it('owns the Home tab', () => {
    expect(babuShell.navItem).toEqual({ label: 'Home', icon: '🏠', path: '/home' });
    expect(babuShell.order).toBe(1);
  });
});
