import { useSyncExternalStore } from 'react';
import { useCoins, useLives } from '../../core';
import { createBragCardBlob } from './brag/bragCard';
import type { Cell } from './engine';
import {
  dragSwap,
  getSessionSnapshot,
  shareCard,
  startGame,
  subscribeSession,
  tapCell,
  type GameDeps,
  type SessionContext,
} from './sessionStore';

export type { GameDeps, MoveHint, Phase, ShareStatus } from './sessionStore';

/**
 * React view of the module-level session store. The live game survives this hook
 * unmounting (bottom-nav tab switches); every side effect runs in a store action called
 * from a handler or a store timer, never in an effect, so StrictMode cannot repeat it.
 */
export function useGameSession(deps: GameDeps = {}) {
  // TODO(integration): lives and coins use the core stubs until Prime (economy-library) registers
  // the real providers; the hooks resolve the provider at call time, so nothing changes here.
  const lives = useLives();
  const coins = useCoins();
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot);
  const makeCard = deps.makeCard ?? createBragCardBlob;
  const ctx: SessionContext = { lives, coins, deps };

  return {
    phase: session.phase,
    lives: lives.lives,
    maxLives: lives.max,
    board: session.board,
    score: session.score,
    settledScore: session.settledScore,
    moves: session.game?.moves ?? 0,
    selected: session.selected,
    clearing: session.clearing,
    locked: session.locked || session.phase !== 'playing',
    invalid: session.invalid,
    hint: session.hint,
    callout: session.callout,
    plaqueNotice: session.plaqueNotice,
    coinsEarned: session.coinsEarned,
    shareStatus: session.shareStatus,
    makeCard,
    start: () => startGame(ctx),
    tapCell: (cell: Cell) => tapCell(ctx, cell),
    dragSwap: (a: Cell, b: Cell) => dragSwap(ctx, a, b),
    share: (blob: Blob | null) => shareCard(ctx, blob),
  };
}
