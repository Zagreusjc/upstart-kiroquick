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
    expect(screen.getByRole('heading', { name: 'INLABABOO!' })).toBeInTheDocument();
    expect(screen.getByText(/Love hearts\. Save lives\./i)).toBeInTheDocument();
    expect(screen.queryByText(/Merge habits/i)).not.toBeInTheDocument();
  });

  it('links every button to its tab', () => {
    renderMenu();
    const href = (name: RegExp) => menu().getByRole('link', { name }).getAttribute('href');
    expect(href(/^Play!$/)).toBe('/play');
    expect(href(/Blood Bank/)).toBe('/library/milestones');
    expect(href(/^Library/)).toBe('/library');
    expect(href(/^Baboo/)).toBe('/home/baboo');
    expect(href(/Refer a Buddy/)).toBe('/library/milestones');
    expect(href(/^Get checked!$/)).toBe('/care');
    expect(href(/Settings/)).toBe('/home/settings');
    expect(menu().queryByRole('link', { name: /Pulse|Milestones/ })).not.toBeInTheDocument();
  });

  it('uses one Get screened button, a text-only Baboo button and a bigger Play button', () => {
    renderMenu();
    expect(menu().getAllByRole('link')).toHaveLength(7);

    // Only the main Baboo above the buttons is drawn; the Baboo button is text only.
    expect(screen.getAllByRole('img', { name: /^Baboo is/ })).toHaveLength(1);
    expect(menu().getByRole('link', { name: /^Baboo/ }).querySelector('svg')).toBeNull();

    // Solid fills (no gradient backgrounds); every button is a raised game button
    // (lip, drop shadow, gloss and press from menu.css).
    for (const link of menu().getAllByRole('link')) {
      expect(link.className).toMatch(/\bmm-btn\b/);
      expect(link.className).not.toMatch(/bg-linear/);
    }
    expect(menu().getByRole('link', { name: /^Play!$/ }).className).toMatch(/\bmm-play\b/);

    // Play is the biggest (256px wide); Get screened is a bit narrower (224px);
    // Baboo, Library and Blood Bank share one size (176px).
    const play = menu().getByRole('link', { name: /^Play!$/ });
    expect(play).toHaveAttribute('data-size', 'big');
    expect(play.className).toContain('h-[clamp(4rem,12dvh,8rem)]');
    expect(play.className).toMatch(/\bw-64\b/);
    for (const name of [/Blood Bank/, /^Library/, /^Baboo/, /^Get checked!$/]) {
      const link = menu().getByRole('link', { name });
      expect(link).toHaveAttribute('data-size', 'regular');
      // Never under 44px tall (touch target), never over 64px.
      expect(link.className).toContain('h-[clamp(2.75rem,7dvh,4rem)]');
    }
    // Teal widths step down: Baboo 192px, Blood Bank 176px, Library 160px.
    expect(menu().getByRole('link', { name: /^Baboo/ }).className).toMatch(/\bw-48\b/);
    expect(menu().getByRole('link', { name: /Blood Bank/ }).className).toMatch(/\bw-44\b/);
    expect(menu().getByRole('link', { name: /^Library/ }).className).toMatch(/\bw-40\b/);
    expect(menu().getByRole('link', { name: /^Get checked!$/ }).className).toMatch(/\bw-56\b/);
  });

  it('orders the stack Play, Baboo, Blood Bank, Library', () => {
    renderMenu();
    const names = menu()
      .getAllByRole('link')
      .slice(0, 4)
      .map((link) => link.textContent);
    expect(names).toEqual(['Play!', 'BabooYour heart buddy!', 'Blood BankTop up your lives!', 'LibraryPlay to learn!']);
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
    expect(cls(/^Get checked!$/)).toContain('bg-white');
    expect(menu().getByRole('link', { name: /^Library/ })).toHaveTextContent('Play to learn!');
  });

  it('fills the screen instead of sitting in a card', () => {
    renderMenu();
    const menuEl = screen.getByTestId('main-menu');
    expect(menuEl.className).not.toMatch(/rounded|shadow/);
    // A full-screen layer, exactly one screen tall, so nothing scrolls.
    expect(menuEl.className).toMatch(/\bfixed\b/);
    expect(menuEl.className).toMatch(/\binset-0\b/);
    expect(menuEl.className).toMatch(/\bh-dvh\b/);
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

  it('gives the Baboo screen the menu look, toned down', async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();
    await user.click(menu().getByRole('link', { name: /^Baboo/ }));

    const babooScreen = screen.getByTestId('baboo-screen');
    expect(babooScreen.className).toContain('mm-root');
    expect(babooScreen.className).toContain('-mx-4');

    // Same game buttons, but with the shallower "soft" lip and no Play shine.
    const back = screen.getByRole('link', { name: /Main menu/ });
    expect(back.className).toMatch(/\bmm-btn\b.*\bmm-btn--soft\b/);
    const checkin = screen.getByRole('button', { name: /check in/i });
    expect(checkin.className).toMatch(/\bmm-btn--pink\b/);
    expect(checkin.className).toMatch(/\bmm-btn--soft\b/);
    expect(babooScreen.querySelector('.mm-play')).toBeNull();

    // Frosted cards for the hero, snapshot and check-in.
    expect(screen.getByTestId('babu-hero').className).toMatch(/\bmm-card\b/);
    expect(screen.getByRole('region', { name: "Today's snapshot" }).className).toMatch(/\bmm-card\b/);
    expect(screen.getByRole('region', { name: 'Daily check-in' }).className).toMatch(/\bmm-card\b/);
  });

  it('hides the app header and bottom nav on the menu and brings them back elsewhere', async () => {
    const user = userEvent.setup({ delay: null });
    // Stand-ins for the shell's header and bottom nav (src/app, owned by Jolo).
    const header = document.body.appendChild(document.createElement('header'));
    const nav = document.body.appendChild(document.createElement('nav'));
    nav.setAttribute('aria-label', 'Main');

    renderMenu();
    for (const el of [header, nav]) {
      expect(el).toHaveAttribute('inert');
      expect(el).toHaveAttribute('aria-hidden', 'true');
    }
    // The menu's own title area is not hidden.
    expect(screen.getByRole('heading', { name: 'INLABABOO!' }).closest('[inert]')).toBeNull();

    // Baboo screen: header and nav are back.
    await user.click(menu().getByRole('link', { name: /^Baboo/ }));
    for (const el of [header, nav]) {
      expect(el).not.toHaveAttribute('inert');
      expect(el).not.toHaveAttribute('aria-hidden');
    }

    // Back to the menu hides them again; another tab shows them.
    await user.click(screen.getByRole('link', { name: /Main menu/ }));
    expect(header).toHaveAttribute('inert');
    await user.click(menu().getByRole('link', { name: /^Play!$/ }));
    expect(header).not.toHaveAttribute('inert');
    expect(nav).not.toHaveAttribute('inert');

    header.remove();
    nav.remove();
  });

  it('leaves the Home tab for other tabs', async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();
    await user.click(menu().getByRole('link', { name: /^Play!$/ }));
    expect(screen.getByTestId('elsewhere')).toHaveTextContent('/play');
  });
});
