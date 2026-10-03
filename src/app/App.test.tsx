import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function navLink(name: string) {
  const nav = screen.getByRole('navigation', { name: 'Main' });
  return within(nav).getByRole('link', { name: new RegExp(name) });
}

// These tests must not depend on what a feature renders inside its own
// folder, so feature owners can replace their placeholder screens freely.
describe('App shell', () => {
  it('renders one nav item per feature module', () => {
    renderAt('/home');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.textContent?.replace(/[^\w]/g, ''))).toEqual([
      'Home',
      'Play',
      'Library',
      'Care',
    ]);
  });

  it('shows lives and coins in the header', () => {
    renderAt('/home');
    expect(screen.getByLabelText('Lives: 3 of 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Coins: 0')).toBeInTheDocument();
  });

  it('redirects the root path to the first tab', () => {
    renderAt('/');
    expect(navLink('Home')).toHaveAttribute('aria-current', 'page');
  });

  it('marks the tab of the current route as active', () => {
    renderAt('/care');
    expect(navLink('Care')).toHaveAttribute('aria-current', 'page');
    expect(navLink('Home')).not.toHaveAttribute('aria-current');
  });

  it('shows a not-found page for unknown paths', () => {
    renderAt('/nope');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
