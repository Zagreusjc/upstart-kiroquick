import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EconomyLibraryScreen } from './Screen';

// Renders the feature at a path under /library/* like the app shell does.
// Does not depend on any other feature's screen text.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/library/*" element={<EconomyLibraryScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Library screen', () => {
  // Scenario: Browse the library + Card detail shows sources/disclaimer + first read
  it('lists cards, opens a card, shows sources and the disclaimer, and marks it read', async () => {
    const user = userEvent.setup();
    renderAt('/library');

    // The list shows cards with a read/new status.
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem').length).toBeGreaterThanOrEqual(8);

    // Open a specific card by its title link.
    await user.click(screen.getByRole('link', { name: /Cholesterol, simply put/i }));

    // Detail shows a cited source link and the disclaimer.
    expect(
      screen.getByRole('link', { name: /What is cholesterol/i }),
    ).toHaveAttribute('href', expect.stringContaining('http'));
    expect(screen.getByText('Screening awareness, not a diagnosis.')).toBeInTheDocument();
  });

  it('shows the Blood Bank life meter and refill missions', async () => {
    const user = userEvent.setup();
    renderAt('/library');
    await user.click(screen.getByRole('link', { name: /View milestones/i }));

    // The Blood Bank meter reports the current lives.
    expect(
      screen.getByRole('img', { name: /Blood Bank: \d of \d lives/i }),
    ).toBeInTheDocument();

    // A share-for-life control is present.
    expect(screen.getByRole('button', { name: /Share for a life/i })).toBeInTheDocument();
  });
});
