import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearEventLog,
  getEventLog,
  getProvider,
  registerProvider,
  type CoinsProvider,
  type LivesProvider,
} from '../../core';
import { issueVoucher, loadVouchers } from './logic/voucherStore';
import { seededRng } from './logic/rng';
import { CarePathwaysScreen } from './Screen';
import { InitiativesScreen } from './screens/InitiativesScreen';
import { OFFERS } from './data';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/care/*" element={<CarePathwaysScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

function setGeolocation(impl: Geolocation['getCurrentPosition'] | undefined) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: impl ? { getCurrentPosition: impl } : undefined,
  });
}

/** Fresh in-memory providers per test, built only against the core interfaces. */
function freshProviders(startLives = 3): { coins: CoinsProvider; lives: LivesProvider } {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };
  let balance = 0;
  let lifeCount = startLives;
  const keys = new Set<string>();
  return {
    coins: {
      balance: () => balance,
      award: (_source, amount, key) => {
        if (amount <= 0 || (key !== undefined && keys.has(key))) return false;
        if (key !== undefined) keys.add(key);
        balance += amount;
        notify();
        return true;
      },
      spend: (amount) => {
        if (amount <= 0 || balance < amount) return false;
        balance -= amount;
        notify();
        return true;
      },
      subscribe,
    },
    lives: {
      max: 3,
      lives: () => lifeCount,
      spend: () => {
        if (lifeCount === 0) return false;
        lifeCount -= 1;
        notify();
        return true;
      },
      award: (count) => {
        lifeCount = Math.min(3, lifeCount + count);
        notify();
      },
      subscribe,
    },
  };
}

beforeEach(() => {
  clearEventLog();
  const { coins, lives } = freshProviders();
  registerProvider('coins', coins);
  registerProvider('lives', lives);
});

describe('care home', () => {
  it('links to every care screen and shows the disclaimer', () => {
    renderAt('/care');
    for (const name of ['Heart risk check', 'Nearby clinics', 'Medical initiatives', 'Vouchers']) {
      expect(screen.getByRole('link', { name: new RegExp(name) })).toBeInTheDocument();
    }
    expect(screen.getByText('Screening awareness, not a diagnosis')).toBeInTheDocument();
  });
});

describe('risk survey screen', () => {
  async function fill(user: ReturnType<typeof userEvent.setup>, systolic: string) {
    await user.type(screen.getByLabelText('Age (years)'), '55');
    await user.click(screen.getByRole('radio', { name: 'Male' }));
    await user.type(screen.getByLabelText(/Systolic blood pressure/), systolic);
    const smoke = screen.getByRole('group', { name: /currently smoke/ });
    await user.click(within(smoke).getByRole('radio', { name: 'Yes' }));
    await user.type(screen.getByLabelText('Height (cm)'), '170');
    await user.type(screen.getByLabelText('Weight (kg)'), '78');
    const diabetes = screen.getByRole('group', { name: /diabetes/ });
    await user.click(within(diabetes).getByRole('radio', { name: 'No' }));
  }

  it('rejects a systolic pressure of 20 and computes nothing', async () => {
    const user = userEvent.setup();
    renderAt('/care/survey');
    await fill(user, '20');
    await user.click(screen.getByRole('button', { name: 'See my result' }));

    expect(screen.getByText(/must be 70 to 250 mmHg/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Systolic blood pressure/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Higher risk')).not.toBeInTheDocument();
    expect(getEventLog()).toHaveLength(0);
    expect(getProvider('coins').balance()).toBe(0); // no reward for an invalid survey
  });

  it('shows band, disclaimer, simplified label, advice and a clinic link, and emits risk.assessed', async () => {
    const user = userEvent.setup();
    renderAt('/care/survey');
    await fill(user, '145');
    await user.click(screen.getByRole('button', { name: 'See my result' }));

    expect(screen.getByRole('heading', { name: /Higher risk/ })).toHaveFocus();
    expect(screen.getByText('Screening awareness, not a diagnosis')).toBeInTheDocument();
    expect(screen.getByText(/Simplified screen, not the WHO chart/)).toBeInTheDocument();
    expect(screen.getAllByText(/health professional/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Find a nearby clinic' })).toHaveAttribute('href', '/care/clinics');

    const events = getEventLog();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: 'risk.assessed', payload: { band: 'high' } });
  });

  it('rewards 20 coins and 1 life once a day for finishing the check', async () => {
    const coins = getProvider('coins');
    const lives = getProvider('lives');
    lives.spend(); // 2 of 3, so the +1 life is visible

    const user = userEvent.setup();
    renderAt('/care/survey');
    expect(screen.getByText(/earn 20 coins and 1 life/)).toBeInTheDocument();
    await fill(user, '115');
    await user.click(screen.getByRole('button', { name: 'See my result' }));

    expect(screen.getByText(/\+20 coins and \+1 life/)).toBeInTheDocument();
    expect(coins.balance()).toBe(20);
    expect(lives.lives()).toBe(3);

    await user.click(screen.getByRole('button', { name: 'Take the check again' }));
    await fill(user, '115');
    await user.click(screen.getByRole('button', { name: 'See my result' }));
    expect(screen.getByText(/already earned today's reward/)).toBeInTheDocument();
    expect(coins.balance()).toBe(20);
  });
});

describe('clinic finder screen', () => {
  it('shows the illustrative notice and falls back to a city when location is denied', async () => {
    setGeolocation((_ok, fail) => fail?.({ code: 1 } as GeolocationPositionError));
    const user = userEvent.setup();
    renderAt('/care/clinics');

    expect(screen.getByText(/Illustrative data/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Use my location/ }));
    expect(screen.getByText(/Location is not available/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Or pick your city'), 'Cebu City');
    const list = screen.getByRole('list', { name: 'Clinics, nearest first' });
    const first = within(list).getAllByRole('listitem')[0];
    expect(within(first).getByText(/Cebu City/)).toBeInTheDocument();
  });

  it('sorts from the device location when granted', async () => {
    setGeolocation((ok) =>
      ok({ coords: { latitude: 7.19, longitude: 125.45 } } as GeolocationPosition),
    );
    const user = userEvent.setup();
    renderAt('/care/clinics');
    await user.click(screen.getByRole('button', { name: /Use my location/ }));

    expect(screen.getByText(/sorted from your location/)).toBeInTheDocument();
    const first = within(screen.getByRole('list', { name: 'Clinics, nearest first' })).getAllByRole('listitem')[0];
    expect(within(first).getByText(/Davao City/)).toBeInTheDocument();
  });

  it('tapping a clinic shows its booking link and appointment number', async () => {
    const user = userEvent.setup();
    renderAt('/care/clinics');
    const toggle = screen.getByRole('button', { name: /Puso Konsulta Health Center/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: /Book an appointment online/ })).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(toggle.getAttribute('aria-controls')!)!;
    const book = within(panel).getByRole('link', { name: /Book an appointment online/ });
    expect(book).toHaveAttribute('href', 'https://example.com/book/qc-puso-konsulta');
    expect(book).toHaveAttribute('target', '_blank');
    expect(book).toHaveAttribute('rel', expect.stringContaining('noopener'));

    // Seed numbers are illustrative: shown, but never dialled.
    expect(within(panel).getByText('(02) 8000 0101')).toBeInTheDocument();
    expect(within(panel).queryByRole('link', { name: /^Call/ })).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('filters by public and by private', async () => {
    const user = userEvent.setup();
    renderAt('/care/clinics');
    const listItems = () =>
      within(screen.getByRole('list', { name: 'Clinics, nearest first' })).getAllByRole('listitem');

    await user.click(screen.getByRole('radio', { name: 'Public' }));
    expect(listItems().length).toBeGreaterThan(0);
    for (const item of listItems()) {
      expect(within(item).getByText('Public')).toBeInTheDocument();
      expect(within(item).queryByText('Private')).not.toBeInTheDocument();
    }

    await user.click(screen.getByRole('radio', { name: 'Private' }));
    for (const item of listItems()) {
      expect(within(item).getByText('Private')).toBeInTheDocument();
      expect(within(item).queryByText('Public')).not.toBeInTheDocument();
    }
  });
});

describe('medical initiatives screen', () => {
  function renderMissions() {
    return render(
      <MemoryRouter>
        <InitiativesScreen today="2026-10-04" />
      </MemoryRouter>,
    );
  }

  it('is titled Medical initiatives and the old missions link redirects to it', () => {
    renderAt('/care/missions');
    expect(screen.getByRole('heading', { name: 'Medical initiatives' })).toBeInTheDocument();
  });

  it('shows organizer, place, date and free status, hiding past initiatives', () => {
    renderMissions();
    const list = screen.getByRole('list', { name: 'Upcoming initiatives' });
    expect(within(list).getByText('Free blood pressure week')).toBeInTheDocument();
    expect(within(list).queryByText('Heart health caravan')).not.toBeInTheDocument();
    expect(within(list).getAllByText(/\(sample\)/).length).toBeGreaterThan(0);
    expect(within(list).getAllByText('Free').length).toBeGreaterThan(0);
    expect(within(list).getAllByText('Fees may apply').length).toBeGreaterThan(0);
    expect(screen.getByText(/Illustrative data/)).toBeInTheDocument();
  });

  it('filters by city and shows an empty state with a reset', async () => {
    const user = userEvent.setup();
    renderMissions();
    await user.selectOptions(screen.getByLabelText('City'), 'Cebu City');
    const items = within(screen.getByRole('list', { name: 'Upcoming initiatives' })).getAllByRole('listitem');
    expect(items).toHaveLength(1);

    await user.selectOptions(screen.getByLabelText('City'), 'Baguio');
    await user.selectOptions(screen.getByLabelText('When'), '30');
    expect(screen.getByText('No initiatives match these filters yet.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show all upcoming initiatives' }));
    expect(screen.getByRole('list', { name: 'Upcoming initiatives' })).toBeInTheDocument();
  });

  it('filters by National, Municipal, Barangay and Organizational', async () => {
    const user = userEvent.setup();
    renderMissions();
    const group = screen.getByRole('group', { name: 'Organizer' });

    for (const label of ['National', 'Municipal', 'Barangay', 'Organizational']) {
      await user.click(within(group).getByRole('radio', { name: label }));
      const items = within(screen.getByRole('list', { name: 'Upcoming initiatives' })).getAllByRole('listitem');
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) expect(within(item).getByText(label)).toBeInTheDocument();
    }

    await user.click(within(group).getByRole('radio', { name: 'All' }));
    expect(screen.getByRole('status')).toHaveTextContent('9 initiatives');
  });
});

describe('vouchers screen', () => {
  it('rejects redemption without enough coins and says how many are missing', async () => {
    const user = userEvent.setup();
    renderAt('/care/vouchers');
    const offer = OFFERS[0];
    await user.click(screen.getByRole('button', { name: `Redeem for ${offer.cost} coins` }));

    expect(screen.getByRole('alert')).toHaveTextContent(`You need ${offer.cost} more coins`);
    expect(loadVouchers()).toHaveLength(0);
    expect(getEventLog()).toHaveLength(0);
  });

  it('issues a voucher with a QR code that holds only the code', async () => {
    const offer = OFFERS[0];
    getProvider('coins').award('other', offer.cost + 5);
    const user = userEvent.setup();
    renderAt('/care/vouchers');
    await user.click(screen.getByRole('button', { name: `Redeem for ${offer.cost} coins` }));

    const [voucher] = loadVouchers();
    expect(getProvider('coins').balance()).toBe(5);
    expect(screen.getByRole('status')).toHaveTextContent(voucher.code);
    const qr = await screen.findByAltText(`QR code for voucher ${voucher.code}`);
    expect(qr.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
    expect(getEventLog().map((e) => e.type)).toEqual(['voucher.issued']);
    expect(screen.getByText(/Illustrative data/)).toBeInTheDocument();
  });
});

describe('clinic verify page (/care/verify)', () => {
  function issue() {
    const coins = { balance: () => 1000, spend: () => true };
    const result = issueVoucher(OFFERS[1], coins, Date.now(), seededRng(11));
    if (!result.ok) throw new Error('setup failed');
    return result.voucher;
  }

  it('marks a valid code redeemed, emits voucher.redeemed, then rejects reuse', async () => {
    const voucher = issue();
    const user = userEvent.setup();
    renderAt('/care/verify');

    await user.type(screen.getByLabelText('Voucher code'), voucher.code.toLowerCase());
    await user.click(screen.getByRole('button', { name: 'Check code' }));
    expect(screen.getByText(/Valid voucher/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mark as redeemed' }));
    expect(screen.getByText(/Redeemed\. The screening discount/)).toBeInTheDocument();
    expect(getEventLog().filter((e) => e.type === 'voucher.redeemed')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Check code' }));
    expect(screen.getByText(/already redeemed/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark as redeemed' })).not.toBeInTheDocument();
  });

  it('rejects an unknown code with a clear message', async () => {
    const user = userEvent.setup();
    renderAt('/care/verify');
    await user.type(screen.getByLabelText('Voucher code'), 'INB-2222-3333');
    await user.click(screen.getByRole('button', { name: 'Check code' }));
    expect(screen.getByText(/No voucher found with this code/)).toBeInTheDocument();
  });
});
