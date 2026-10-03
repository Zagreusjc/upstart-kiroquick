import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearEventLog,
  getEventLog,
  registerProvider,
  type CoinSource,
  type CoinsProvider,
  type LifeSource,
  type LivesProvider,
} from '../../core';
import {
  createGame,
  findLegalMove,
  trySwap,
  validateSwap,
  type Cell,
  type GameEvent,
  type GameState,
  type SwapResult,
} from './engine';
import { ArteriaMatchGame } from './Game';
import { resetGameSession } from './sessionStore';
import type { GameDeps } from './useGameSession';

const SEED = 1;

function fakeLives(initial: number) {
  let lives = initial;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const provider = {
    max: 3,
    lives: () => lives,
    spend: vi.fn(() => {
      if (lives <= 0) return false;
      lives -= 1;
      notify();
      return true;
    }),
    award: vi.fn((count: number, _source: LifeSource) => {
      lives = Math.min(3, lives + count);
      notify();
    }),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  } satisfies LivesProvider;
  return provider;
}

function fakeCoins() {
  let balance = 0;
  const listeners = new Set<() => void>();
  const provider = {
    balance: () => balance,
    award: vi.fn((_source: CoinSource, amount: number, _key?: string) => {
      balance += amount;
      listeners.forEach((listener) => listener());
      return true;
    }),
    spend: vi.fn(() => false),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  } satisfies CoinsProvider;
  return provider;
}

let lives: ReturnType<typeof fakeLives>;
let coins: ReturnType<typeof fakeCoins>;

function setLives(count: number) {
  lives = fakeLives(count);
  registerProvider('lives', lives);
}

beforeEach(() => {
  resetGameSession();
  setLives(2);
  coins = fakeCoins();
  registerProvider('coins', coins);
  clearEventLog();
});

function gameElement(deps: GameDeps = {}) {
  return (
    <StrictMode>
      <ArteriaMatchGame newSeed={() => SEED} stepMs={0} {...deps} />
    </StrictMode>
  );
}

function renderGame(deps: GameDeps = {}) {
  const user = userEvent.setup();
  render(gameElement(deps));
  return user;
}

function boardLabels() {
  const grid = screen.getByRole('grid', { name: 'Arteria Match board' });
  return within(grid)
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label'));
}

function cellButton(cell: Cell) {
  return screen.getByRole('button', {
    name: new RegExp(`row ${cell.row + 1}, column ${cell.col + 1}$`),
  });
}

/** An injected swap that ends the game with 1200 points after 3 waves. */
function overSwap() {
  return vi.fn((state: GameState): SwapResult => {
    const events: GameEvent[] = [{ type: 'swap', a: { row: 0, col: 0 }, b: { row: 0, col: 1 }, board: state.board }];
    for (const wave of [1, 2, 3]) {
      events.push({ type: 'match', wave, multiplier: wave, cells: [{ row: 0, col: 0 }], points: 400 });
      events.push({ type: 'refill', wave, spawned: [], board: state.board });
    }
    events.push({ type: 'gameOver', score: 1200 });
    return {
      ok: true,
      state: { ...state, score: 1200, moves: 1, maxCascade: 3, over: true },
      events,
    };
  });
}

async function playToGameOver(deps: GameDeps = {}) {
  const user = renderGame({ swap: overSwap(), ...deps });
  await user.click(screen.getByRole('button', { name: 'Play' }));
  await user.click(cellButton({ row: 0, col: 0 }));
  await user.click(cellButton({ row: 0, col: 1 }));
  await screen.findByRole('heading', { name: 'Complete Arterial Occlusion' });
  return user;
}

const pngCard = () => Promise.resolve(new Blob(['png'], { type: 'image/png' }));

function eventsOf(type: string) {
  return getEventLog().filter((event) => event.type === type);
}

describe('Arteria Match game', () => {
  it('spends a life and shows a 6x6 board when starting with lives', async () => {
    const user = renderGame();
    expect(screen.getByRole('heading', { name: 'Arteria Match' })).toBeInTheDocument();
    expect(screen.getByText('Each game costs 1 life.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(lives.spend).toHaveBeenCalledTimes(1);
    expect(lives.lives()).toBe(1);
    const grid = screen.getByRole('grid', { name: 'Arteria Match board' });
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(36);
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
  });

  it('blocks the start at 0 lives and explains how to earn lives', async () => {
    setLives(0);
    const user = renderGame();

    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.getByText("You're out of lives.")).toBeInTheDocument();
    const hint = screen.getByText(/^Earn lives by/);
    expect(hint.textContent).toMatch(/library card/);
    expect(hint.textContent).toMatch(/shar/);
  });

  it('moves the selection on a non-adjacent tap and keeps the score on a no-match swap', async () => {
    const user = renderGame();
    await user.click(screen.getByRole('button', { name: 'Play' }));

    await user.click(cellButton({ row: 0, col: 0 }));
    expect(cellButton({ row: 0, col: 0 })).toHaveAttribute('aria-pressed', 'true');
    await user.click(cellButton({ row: 0, col: 2 }));
    expect(cellButton({ row: 0, col: 0 })).not.toHaveAttribute('aria-pressed');
    expect(cellButton({ row: 0, col: 2 })).toHaveAttribute('aria-pressed', 'true');
    await user.click(cellButton({ row: 0, col: 2 }));
    expect(cellButton({ row: 0, col: 2 })).not.toHaveAttribute('aria-pressed');

    const game = createGame(SEED);
    let pair: [Cell, Cell] | null = null;
    for (let row = 0; row < game.rows && !pair; row += 1) {
      for (let col = 0; col + 1 < game.cols && !pair; col += 1) {
        const a = { row, col };
        const b = { row, col: col + 1 };
        if (validateSwap(game, a, b) === 'no-match') pair = [a, b];
      }
    }
    expect(pair).not.toBeNull();
    const [a, b] = pair!;
    await user.click(cellButton(a));
    await user.click(cellButton(b));

    expect(screen.getByText('Score: 0')).toBeInTheDocument();
    expect(screen.getByText('Moves: 0')).toBeInTheDocument();
    expect(screen.getByText('No match there. Try another swap.')).toBeInTheDocument();
  });

  it('scores a legal tap-tap swap with the real engine', async () => {
    const user = renderGame();
    await user.click(screen.getByRole('button', { name: 'Play' }));

    const move = findLegalMove(createGame(SEED));
    expect(move).not.toBeNull();
    const [a, b] = move!;
    await user.click(cellButton(a));
    await user.click(cellButton(b));

    expect(screen.getByText('Moves: 1')).toBeInTheDocument();
    expect(screen.queryByText('Score: 0')).not.toBeInTheDocument();
  });

  it('ends the game once, awarding coins and emitting game.finished exactly once', async () => {
    await playToGameOver({ makeCard: pngCard });

    expect(screen.getByText('Optimal Flow!')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(coins.award).toHaveBeenCalledTimes(1);
    expect(coins.award).toHaveBeenCalledWith('game_score', 10, expect.stringMatching(/^game_score:/));
    const finished = eventsOf('game.finished');
    expect(finished).toHaveLength(1);
    expect(finished[0].payload).toMatchObject({ score: 1200, coins: 10, moves: 1, maxCascade: 3 });
  });

  it('replays the cascade frames with a delay before the game over screen', async () => {
    const user = renderGame({ swap: overSwap(), stepMs: 5, makeCard: pngCard });
    await user.click(screen.getByRole('button', { name: 'Play' }));
    await user.click(cellButton({ row: 0, col: 0 }));
    await user.click(cellButton({ row: 0, col: 1 }));

    await screen.findByRole('heading', { name: 'Complete Arterial Occlusion' });
    expect(screen.getByText('Score: 1,200')).toBeInTheDocument();
    expect(coins.award).toHaveBeenCalledTimes(1);
    expect(eventsOf('game.finished')).toHaveLength(1);
  });

  it('awards one life for a completed share, and only once per game', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const user = await playToGameOver({ makeCard: pngCard, nav: { share, canShare: () => true } });
    const shareButton = screen.getByRole('button', { name: 'Share brag card' });
    await waitFor(() => expect(shareButton).toBeEnabled());

    await user.click(shareButton);
    await screen.findByText('Shared! +1 life');
    expect(lives.award).toHaveBeenCalledTimes(1);
    expect(lives.award).toHaveBeenCalledWith(1, 'share');
    expect(eventsOf('share.completed')).toHaveLength(1);

    await user.click(shareButton);
    await screen.findByText('Shared!');
    expect(share).toHaveBeenCalledTimes(2);
    expect(lives.award).toHaveBeenCalledTimes(1);
    expect(eventsOf('share.completed')).toHaveLength(1);
  });

  it('awards nothing when the share is cancelled', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    const user = await playToGameOver({ makeCard: pngCard, nav: { share, canShare: () => true } });
    const shareButton = screen.getByRole('button', { name: 'Share brag card' });
    await waitFor(() => expect(shareButton).toBeEnabled());

    await user.click(shareButton);

    await screen.findByText('Share cancelled');
    expect(lives.award).not.toHaveBeenCalled();
    expect(eventsOf('share.completed')).toHaveLength(0);
  });

  it('downloads the image without awarding when Web Share is missing', async () => {
    const download = vi.fn();
    const user = await playToGameOver({ makeCard: pngCard, nav: {}, download });
    const shareButton = screen.getByRole('button', { name: 'Share brag card' });
    await waitFor(() => expect(shareButton).toBeEnabled());

    await user.click(shareButton);

    await screen.findByText('Image downloaded');
    expect(download).toHaveBeenCalledTimes(1);
    expect(lives.award).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Play again' })).toBeEnabled();
  });

  it('reports an unavailable image, without downloading or awarding, when the card fails and Web Share is missing', async () => {
    const download = vi.fn();
    const user = await playToGameOver({
      makeCard: () => Promise.reject(new Error('canvas')),
      nav: {},
      download,
    });
    const shareButton = screen.getByRole('button', { name: 'Share brag card' });
    await waitFor(() => expect(shareButton).toBeEnabled());

    await user.click(shareButton);

    await screen.findByText('Brag card image unavailable. Nothing was shared.');
    expect(screen.queryByText('Image downloaded')).not.toBeInTheDocument();
    expect(download).not.toHaveBeenCalled();
    expect(lives.award).not.toHaveBeenCalled();
    expect(eventsOf('share.completed')).toHaveLength(0);
  });

  it('announces the score once the move has finished playing back', async () => {
    await playToGameOver({ makeCard: pngCard, stepMs: 5 });

    expect(screen.getByText('Score after move 1: 1,200')).toBeInTheDocument();
    expect(screen.getByText('Score: 1,200')).not.toHaveAttribute('aria-live');
  });
});

describe('Arteria Match pointer drag', () => {
  const TILE_PX = 40;
  const win = window as unknown as { PointerEvent?: typeof MouseEvent };
  const nativePointerEvent = win.PointerEvent;

  // jsdom has no PointerEvent: a MouseEvent with a pointerId is enough for the board.
  beforeEach(() => {
    if (nativePointerEvent) return;
    win.PointerEvent = class extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
      }
    };
  });

  afterEach(() => {
    if (!nativePointerEvent) delete win.PointerEvent;
  });

  it('swaps exactly once for a drag past 0.4 tiles and ignores the click that follows', async () => {
    const swap = vi.fn(trySwap);
    const user = renderGame({ swap });
    await user.click(screen.getByRole('button', { name: 'Play' }));
    const grid = screen.getByRole('grid', { name: 'Arteria Match board' });
    // jsdom has no layout: the board is 6 tiles of 40px.
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({ width: 6 * TILE_PX } as DOMRect);
    const proto = HTMLElement.prototype as { setPointerCapture?: (id: number) => void };
    const hadCapture = 'setPointerCapture' in proto;
    const original = proto.setPointerCapture;
    const capture = vi.fn();
    proto.setPointerCapture = capture;

    try {
      const [a, b] = findLegalMove(createGame(SEED))!;
      const dirX = b.col - a.col;
      const dirY = b.row - a.row;
      const start = cellButton(a);
      const at = (fraction: number) => ({
        pointerId: 1,
        clientX: 100 + dirX * fraction * TILE_PX,
        clientY: 100 + dirY * fraction * TILE_PX,
      });

      fireEvent.pointerDown(start, at(0));
      expect(capture).toHaveBeenCalledWith(1);
      fireEvent.pointerMove(start, at(0.3));
      expect(swap).not.toHaveBeenCalled();
      fireEvent.pointerMove(start, at(0.5));
      fireEvent.pointerMove(start, at(1));
      fireEvent.pointerUp(start, at(1));
      fireEvent.click(start);

      expect(swap).toHaveBeenCalledTimes(1);
      expect(swap).toHaveBeenCalledWith(expect.anything(), a, b);
      expect(screen.getByText('Moves: 1')).toBeInTheDocument();
      // The trailing click neither selects the tile nor starts a second swap.
      expect(screen.getByRole('grid').querySelector('[aria-pressed="true"]')).toBeNull();
    } finally {
      if (hadCapture) proto.setPointerCapture = original;
      else delete proto.setPointerCapture;
    }
  });
});

describe('Arteria Match keyboard', () => {
  it('has one tab stop, moves focus with arrows and swaps with Enter then Space', async () => {
    const swap = vi.fn(trySwap);
    const user = renderGame({ swap });
    await user.click(screen.getByRole('button', { name: 'Play' }));
    const grid = screen.getByRole('grid', { name: 'Arteria Match board' });
    const buttons = within(grid).getAllByRole('button');
    expect(buttons.filter((button) => button.tabIndex === 0)).toHaveLength(1);

    await user.tab();
    expect(cellButton({ row: 0, col: 0 })).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowUp}');
    expect(cellButton({ row: 0, col: 0 })).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(cellButton({ row: 1, col: 1 })).toHaveFocus();
    expect(cellButton({ row: 1, col: 1 })).toHaveAttribute('tabindex', '0');
    expect(cellButton({ row: 0, col: 0 })).toHaveAttribute('tabindex', '-1');
    await user.keyboard('{ArrowUp}{ArrowLeft}');
    expect(cellButton({ row: 0, col: 0 })).toHaveFocus();

    const [a, b] = findLegalMove(createGame(SEED))!;
    await user.keyboard('{ArrowDown}'.repeat(a.row) + '{ArrowRight}'.repeat(a.col));
    expect(cellButton(a)).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(cellButton(a)).toHaveAttribute('aria-pressed', 'true');

    const toB =
      b.col > a.col ? '{ArrowRight}' : b.col < a.col ? '{ArrowLeft}' : b.row > a.row ? '{ArrowDown}' : '{ArrowUp}';
    await user.keyboard(toB);
    expect(cellButton(b)).toHaveFocus();
    await user.keyboard(' ');

    expect(swap).toHaveBeenCalledTimes(1);
    expect(swap).toHaveBeenCalledWith(expect.anything(), a, b);
    expect(screen.getByText('Moves: 1')).toBeInTheDocument();
  });
});

describe('Arteria Match session persistence', () => {
  it('resumes the same game after the screen unmounts and remounts', async () => {
    const user = userEvent.setup();
    const view = render(gameElement());
    await user.click(screen.getByRole('button', { name: 'Play' }));
    const [a, b] = findLegalMove(createGame(SEED))!;
    await user.click(cellButton(a));
    await user.click(cellButton(b));
    expect(screen.getByText('Moves: 1')).toBeInTheDocument();
    const before = boardLabels();
    const scoreText = screen.getByText(/^Score: /).textContent;

    // Switching bottom-nav tabs unmounts the routed screen.
    view.unmount();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    render(gameElement());

    expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument();
    expect(screen.getByText('Moves: 1')).toBeInTheDocument();
    expect(screen.getByText(/^Score: /).textContent).toBe(scoreText);
    expect(boardLabels()).toEqual(before);
    expect(lives.spend).toHaveBeenCalledTimes(1);
  });

  it('awards coins and game.finished exactly once when the screen unmounts mid-playback of the final move', async () => {
    const user = userEvent.setup();
    const view = render(gameElement({ swap: overSwap(), stepMs: 20, makeCard: pngCard }));
    await user.click(screen.getByRole('button', { name: 'Play' }));
    await user.click(cellButton({ row: 0, col: 0 }));
    await user.click(cellButton({ row: 0, col: 1 }));
    expect(coins.award).not.toHaveBeenCalled();

    view.unmount();

    await waitFor(() => expect(eventsOf('game.finished')).toHaveLength(1));
    expect(coins.award).toHaveBeenCalledTimes(1);
    expect(coins.award).toHaveBeenCalledWith('game_score', 10, expect.stringMatching(/^game_score:/));

    render(gameElement({ makeCard: pngCard }));
    expect(screen.getByRole('heading', { name: 'Complete Arterial Occlusion' })).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(coins.award).toHaveBeenCalledTimes(1);
    expect(eventsOf('game.finished')).toHaveLength(1);
    expect(lives.spend).toHaveBeenCalledTimes(1);
  });
});
