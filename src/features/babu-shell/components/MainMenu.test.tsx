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
    expect(href(/Pulse/)).toBe('/home/baboo');
    expect(href(/Milestones/)).toBe('/library/milestones');
    expect(href(/^Baboo/)).toBe('/home/baboo');
    expect(href(/Refer a Buddy/)).toBe('/library/milestones');
    expect(href(/Get screened/)).toBe('/care');
    expect(href(/Partner organizations/)).toBe('/care/initiatives');
    expect(href(/Nearest hospital or clinic/)).toBe('/care/clinics');
    expect(href(/^Library$/)).toBe('/library');
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
