import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProvider, registerProvider } from '../../../core';
import { createHealthProvider } from '../healthProvider';
import { BabuShellScreen } from '../Screen';
import { babuStore } from '../store';

/** Shows the current path for other tabs, so tests can follow menu links. */
function Elsewhere() {
  const { pathname } = useLocation();
  return <p data-testid="elsewhere">{pathname}</p>;
}

function renderMenu() {
  return render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/home/*" element={<BabuShellScreen />} />
        <Route path="*" element={<Elsewhere />} />
      </Routes>
    </MemoryRouter>,
  );
}

const menu = () => within(screen.getByRole('navigation', { name: 'Main menu' }));

beforeEach(() => {
  vi.useFakeTimers({ now: new Date(2026, 9, 4, 12, 0, 0), toFake: ['Date'] });
  babuStore.reload();
  registerProvider('health', createHealthProvider('test.menu.health'));
  act(() => babuStore.acceptOnboarding(1));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('main menu', () => {
  it('is the landing screen of the Home tab after onboarding', () => {
    renderMenu();
    expect(screen.getByRole('heading', { name: 'INLABABOO.' })).toBeInTheDocument();
    expect(screen.getByText(/Merge habits\. Save hearts\./i)).toBeInTheDocument();
  });

  it('links every button to its tab', () => {
    renderMenu();
    const href = (name: RegExp) => menu().getByRole('link', { name }).getAttribute('href');
    expect(href(/^Play!$/)).toBe('/play');
    expect(href(/Blood Bank/)).toBe('/library/milestones');
    expect(href(/^Library/)).toBe('/library');
    expect(href(/^Baboo/)).toBe('/home/baboo');
    expect(href(/Refer a Buddy/)).toBe('/library/milestones');
    expect(href(/^Get screened!$/)).toBe('/care');
    expect(href(/Settings/)).toBe('/home/settings');
    expect(menu().queryByRole('link', { name: /Pulse|Milestones/ })).not.toBeInTheDocument();
  });

  it('uses one Get screened button, a text-only Baboo button and a bigger Play button', () => {
    renderMenu();
    expect(menu().getAllByRole('link')).toHaveLength(7);

    // Only the main Baboo above the buttons is drawn; the Baboo button is text only.
    expect(screen.getAllByRole('img', { name: /^Baboo is/ })).toHaveLength(1);
    expect(menu().getByRole('link', { name: /^Baboo/ }).querySelector('svg')).toBeNull();

    // Solid fills (no gradients) with a raised shadow under every button.
    for (const link of menu().getAllByRole('link')) {
      expect(link.style.boxShadow).not.toBe('');
      expect(link.className).not.toMatch(/bg-linear/);
    }

    // Play is the biggest; Blood Bank, Library, Baboo and Get screened share one size.
    const play = menu().getByRole('link', { name: /^Play!$/ });
    expect(play).toHaveAttribute('data-size', 'big');
    expect(play.className).toMatch(/\bh-32\b/);
    expect(play.className).toMatch(/\bw-64\b/);
    for (const name of [/Blood Bank/, /^Library/, /^Baboo/, /^Get screened!$/]) {
      const link = menu().getByRole('link', { name });
      expect(link).toHaveAttribute('data-size', 'regular');
      expect(link.className).toMatch(/\bh-16\b/);
      expect(link.className).toMatch(/\bw-44\b/);
    }
  });

  it('uses plain white lettering on teal (no outline)', () => {
    renderMenu();
    for (const name of [/Blood Bank/, /^Library/, /^Baboo/, /Refer a Buddy/, /Settings/]) {
      expect(menu().getByRole('link', { name }).style.textShadow).toBe('');
    }
  });

  it('uses dark pink for Play, white-lettered teal for the rest, and a white Get screened', () => {
    renderMenu();
    const cls = (name: RegExp) => menu().getByRole('link', { name }).className;
    expect(cls(/^Play!$/)).toContain('bg-[#f0556a]');
    for (const name of [/Blood Bank/, /^Library/, /^Baboo/, /Refer a Buddy/, /Settings/]) {
      expect(cls(name)).toContain('bg-[#3cc4b4]');
      expect(cls(name)).toContain('text-white');
    }
    expect(cls(/^Get screened!$/)).toContain('bg-white');
    expect(menu().getByRole('link', { name: /^Library/ })).toHaveTextContent('Play to learn!');
  });

  it('fills the screen instead of sitting in a card', () => {
    renderMenu();
    const menuEl = screen.getByTestId('main-menu');
    expect(menuEl.className).toContain('-m-4');
    expect(menuEl.className).not.toMatch(/rounded|shadow/);
  });

  it('opens settings from the menu', async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();
    await user.click(menu().getByRole('link', { name: /Settings/ }));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Erase all my data on this device' })).toBeInTheDocument();
  });

  it('shows the same live mood as the Baboo screen', () => {
    renderMenu();
    // Fresh health data (all zero) means Baboo is tired.
    expect(screen.getByRole('img', { name: 'Baboo is a little tired' })).toBeInTheDocument();
    expect(screen.getByTestId('menu-mood')).toHaveTextContent('Tired');

    act(() => getProvider('health').update({ steps: 8000, sleepHours: 8, activityMinutes: 40 }));
    expect(screen.getByRole('img', { name: 'Baboo is happy' })).toBeInTheDocument();
    expect(screen.getByTestId('menu-mood')).toHaveTextContent('Happy');
  });

  it('shows Rest Mode on the menu too when the player has been away', () => {
    act(() => {
      babuStore.checkIn(getProvider('coins'));
      babuStore.shiftDays(2);
    });
    renderMenu();
    expect(screen.getByRole('img', { name: 'Baboo is in Rest Mode, sleeping' })).toBeInTheDocument();
    expect(screen.getByTestId('menu-mood')).toHaveTextContent('Rest Mode');
  });

  it('opens the Baboo screen from the Baboo button and comes back with Main menu', async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();
    await user.click(menu().getByRole('link', { name: /^Baboo/ }));
    expect(screen.getByRole('heading', { name: 'Daily check-in' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Main menu/ }));
    expect(screen.getByTestId('main-menu')).toBeInTheDocument();
  });

  it('leaves the Home tab for other tabs', async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();
    await user.click(menu().getByRole('link', { name: /^Play!$/ }));
    expect(screen.getByTestId('elsewhere')).toHaveTextContent('/play');
  });
});
