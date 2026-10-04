import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Settings } from './Settings';

function renderSettings(reload = vi.fn()) {
  render(
    <MemoryRouter>
      <Settings reload={reload} />
    </MemoryRouter>,
  );
  return reload;
}

describe('Settings', () => {
  it('links back to the main menu and keeps the demo controls', () => {
    renderSettings();
    expect(screen.getByRole('link', { name: /Main menu/ })).toHaveAttribute('href', '/home');
    expect(screen.getByText(/Demo controls/)).toBeInTheDocument();
  });

  it('erases data only after the player confirms', async () => {
    const user = userEvent.setup({ delay: null });
    localStorage.setItem('inlababoo.babu.v1', '{}');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const reload = renderSettings();
    const erase = screen.getByRole('button', { name: 'Erase all my data on this device' });

    await user.click(erase);
    expect(localStorage.getItem('inlababoo.babu.v1')).toBe('{}');
    expect(reload).not.toHaveBeenCalled();

    await user.click(erase);
    expect(localStorage.getItem('inlababoo.babu.v1')).toBeNull();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(2);
  });
});
