import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { on, registerProvider, type CoinsProvider } from '../../core';
import { createHealthProvider } from './healthProvider';
import { BabuShellScreen } from './Screen';
import { babuStore } from './store';

function createFakeCoins(): CoinsProvider {
  let balance = 0;
  const keys = new Set<string>();
  const listeners = new Set<() => void>();
  return {
    balance: () => balance,
    award: (_source, amount, key) => {
      if (amount <= 0 || (key !== undefined && keys.has(key))) return false;
      if (key !== undefined) keys.add(key);
      balance += amount;
      listeners.forEach((l) => l());
      return true;
    },
    spend: () => false,
    subscribe: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

// UI tests render the whole Home tab; slow laptops under a full parallel run
// can exceed the 5s default, which then leaks DOM into the next test.
vi.setConfig({ testTimeout: 20_000 });

/** user-event without artificial delays between actions. */
const setupUser = () => userEvent.setup({ delay: null });

let coins: CoinsProvider;

beforeEach(() => {
  // Fake only Date so Baboo's "today" is fixed; timers stay real for user-event.
  vi.useFakeTimers({ now: new Date(2026, 9, 4, 12, 0, 0), toFake: ['Date'] });
  babuStore.reload();
  coins = createFakeCoins();
  registerProvider('coins', coins);
  registerProvider('health', createHealthProvider('test.ui.health'));
});

afterEach(() => {
  vi.useRealTimers();
});

function renderOnboarded() {
  act(() => babuStore.acceptOnboarding(1));
  return render(<BabuShellScreen />);
}

const slider = (name: RegExp) => screen.getByRole('slider', { name });
const checkinButton = () => screen.getByRole('button', { name: /check(ed)? in/i });

describe('onboarding', () => {
  // Scenarios: First launch, Consent is required
  it('shows onboarding first and requires consent before entering Home', () => {
    render(<BabuShellScreen />);
    expect(screen.getByRole('heading', { name: 'Meet Baboo' })).toBeInTheDocument();
    expect(screen.getByText(/Screening awareness, not a diagnosis/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start caring for Baboo' })).toBeDisabled();
    expect(screen.queryByRole('heading', { name: 'Daily check-in' })).not.toBeInTheDocument();
  });

  // Scenario: Completed onboarding
  it('enters Home after consent and does not show onboarding again', async () => {
    const user = setupUser();
    const { unmount } = render(<BabuShellScreen />);
    await user.click(screen.getByRole('checkbox', { name: /stores my data on this device/ }));
    await user.click(screen.getByRole('button', { name: 'Start caring for Baboo' }));
    expect(screen.getByRole('heading', { name: 'Daily check-in' })).toBeInTheDocument();

    unmount();
    babuStore.reload(); // simulate reopening the app
    render(<BabuShellScreen />);
    expect(screen.queryByRole('heading', { name: 'Meet Baboo' })).not.toBeInTheDocument();
  });
});

describe('home', () => {
  // Scenarios: Home content, Demo label, Accessible Baboo
  it('shows Baboo, the snapshot, the check-in button, the streak and the disclaimer', () => {
    renderOnboarded();
    expect(screen.getByRole('img', { name: /Baboo is/ })).toBeInTheDocument();
    expect(screen.getByTestId('mood-label')).toBeVisible();
    expect(screen.getByRole('heading', { name: "Today's snapshot" })).toBeInTheDocument();
    expect(screen.getAllByText(/Demo input/).length).toBeGreaterThan(0);
    expect(checkinButton()).toBeEnabled();
    expect(screen.getByTestId('streak')).toHaveTextContent('0 days streak');
    expect(screen.getByText(/Screening awareness, not a diagnosis/)).toBeInTheDocument();
  });

  // Scenario: Update values
  it('changes Baboo mood as the sliders move', () => {
    renderOnboarded();
    const energy = () => screen.getByRole('meter', { name: "Baboo's energy" });
    expect(screen.getByTestId('mood-label')).toHaveTextContent('Tired');
    expect(energy()).toHaveAttribute('aria-valuenow', '0');

    // Maxing out movement does not make up for no sleep.
    fireEvent.change(slider(/Steps/), { target: { value: '20000' } });
    fireEvent.change(slider(/Activity/), { target: { value: '120' } });
    expect(screen.getByTestId('mood-label')).toHaveTextContent('Tired');
    expect(screen.getByTestId('mood-hint')).toHaveTextContent(/barely slept/);
    expect(energy()).toHaveAttribute('aria-valuenow', '60');

    fireEvent.change(slider(/Sleep/), { target: { value: '5' } });
    expect(screen.getByTestId('mood-label')).toHaveTextContent('OK');
    expect(screen.getByText('2 of 3 goals reached', { exact: false })).toBeInTheDocument();
    expect(screen.getByTestId('mood-hint')).toHaveTextContent(/short sleep/);

    fireEvent.change(slider(/Sleep/), { target: { value: '8' } });
    expect(screen.getByTestId('mood-label')).toHaveTextContent('Happy');
    expect(screen.getByRole('img', { name: 'Baboo is happy' })).toBeInTheDocument();
    expect(screen.getAllByText('✓ Goal met')).toHaveLength(3);
    expect(screen.queryByTestId('mood-hint')).not.toBeInTheDocument();

    // Too much sleep is not the goal either.
    fireEvent.change(slider(/Sleep/), { target: { value: '12' } });
    expect(screen.getByTestId('mood-label')).toHaveTextContent('OK');
    expect(screen.getByText('A bit too much')).toBeInTheDocument();
  });

  // Scenario: Persistence
  it('keeps entered values after a reload', () => {
    const { unmount } = renderOnboarded();
    fireEvent.change(slider(/Steps/), { target: { value: '4500' } });
    unmount();

    registerProvider('health', createHealthProvider('test.ui.health'));
    render(<BabuShellScreen />);
    expect(slider(/Steps/)).toHaveValue('4500');
  });
});

describe('check-in', () => {
  // Scenarios: First check-in today, Second tap the same day
  it('awards coins once, updates the streak and emits checkin.done', async () => {
    const user = setupUser();
    const events: unknown[] = [];
    const off = on('checkin.done', (e) => events.push(e.payload));
    renderOnboarded();

    await user.click(checkinButton());

    expect(coins.balance()).toBe(10);
    expect(screen.getByTestId('streak')).toHaveTextContent('1 day streak');
    expect(screen.getByRole('status')).toHaveTextContent('+10 coins');
    expect(checkinButton()).toBeDisabled();
    expect(checkinButton()).toHaveTextContent('Checked in today');
    expect(events).toEqual([{ date: '2026-10-04', streak: 1 }]);
    off();
  });

  // Scenarios: Next day, Milestone bonus
  it('grows the streak with the demo Next day control and pays the 3-day bonus', async () => {
    const user = setupUser();
    renderOnboarded();
    const demo = () => within(screen.getByText(/^Demo controls/).closest('details')!);

    await user.click(checkinButton());
    await user.click(demo().getByRole('button', { name: 'Next day' }));
    expect(checkinButton()).toBeEnabled();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    await user.click(checkinButton());
    await user.click(demo().getByRole('button', { name: 'Next day' }));
    await user.click(checkinButton());

    expect(screen.getByTestId('streak')).toHaveTextContent('3 days streak');
    expect(coins.balance()).toBe(50);
    expect(screen.getByRole('status')).toHaveTextContent('streak bonus of 20');
  });

  // Scenarios: Player away, Return from Rest Mode, Displayed streak after a gap
  it('shows Rest Mode after 2 days away and wakes Baboo on check-in', async () => {
    const user = setupUser();
    renderOnboarded();
    await user.click(checkinButton());

    await user.click(screen.getByRole('button', { name: 'Skip 2 days' }));
    expect(screen.getByTestId('mood-label')).toHaveTextContent('Rest Mode');
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    expect(screen.getByTestId('streak')).toHaveTextContent('0 days streak');
    expect(screen.getByText('Start a fresh streak today.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Wake Baboo up/ }));
    expect(screen.getByTestId('mood-label')).not.toHaveTextContent('Rest Mode');
    expect(screen.getByTestId('streak')).toHaveTextContent('1 day streak');
  });
});
