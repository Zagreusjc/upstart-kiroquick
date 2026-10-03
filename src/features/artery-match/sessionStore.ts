// Module-level Arteria Match session. The routed screen unmounts when the player switches
// bottom-nav tabs, so the live game, its playback timers and the "awarded" guards live here,
// outside React. Components read it through useSyncExternalStore (see useGameSession).
import type { CoinsProvider, LivesProvider } from '../../core';
import { emitGameFinished, emitShareCompleted } from './adapters';
import { downloadBlob, shareBragCard, type ShareNavigator } from './brag/share';
import { calloutForWaves, type Callout } from './callouts';
import {
  createGame,
  isAdjacent,
  trySwap,
  type Board,
  type Cell,
  type GameEvent,
  type GameState,
} from './engine';
import { coinsForScore } from './rewards';
import { cellKey } from './tileLabels';

/** Injectable seams so tests (and the demo) can control randomness, timing and sharing. */
export interface GameDeps {
  newSeed?: () => number;
  swap?: typeof trySwap;
  /** Delay between playback frames. 0 applies every frame instantly. */
  stepMs?: number;
  makeCard?: (score: number) => Promise<Blob>;
  nav?: ShareNavigator;
  download?: (blob: Blob, filename: string) => void;
}

export type Phase = 'idle' | 'blocked' | 'playing' | 'over';
export type ShareStatus =
  | 'idle'
  | 'sharing'
  | 'shared-life'
  | 'shared'
  | 'cancelled'
  | 'downloaded'
  | 'unavailable';
export type MoveHint = 'no-match' | 'cholesterol' | null;

/** What the session needs from the core hooks (useLives / useCoins) and the injected deps. */
export interface SessionContext {
  lives: Pick<LivesProvider, 'max' | 'spend' | 'award'> & { lives: number };
  coins: Pick<CoinsProvider, 'award'>;
  deps: GameDeps;
}

export interface SessionSnapshot {
  phase: Phase;
  /** Last fully played-back engine state (drives the move counter). */
  game: GameState | null;
  /** Board on screen; may lag the resolved state while a move plays back. */
  board: Board | null;
  score: number;
  /** Score after the last finished move; null until the first move finishes. */
  settledScore: number | null;
  selected: Cell | null;
  clearing: ReadonlySet<string>;
  locked: boolean;
  invalid: boolean;
  hint: MoveHint;
  callout: Callout | null;
  /** True after the move that first seeded plaque this game, until the next successful move. */
  plaqueNotice: boolean;
  coinsEarned: number;
  shareStatus: ShareStatus;
}

const DEFAULT_STEP_MS = 160;
const CALLOUT_MS = 1200;
const SHAKE_MS = 300;
const NO_CLEARING: ReadonlySet<string> = new Set();

const INITIAL: SessionSnapshot = {
  phase: 'idle',
  game: null,
  board: null,
  score: 0,
  settledScore: null,
  selected: null,
  clearing: NO_CLEARING,
  locked: false,
  invalid: false,
  hint: null,
  callout: null,
  plaqueNotice: false,
  coinsEarned: 0,
  shareStatus: 'idle',
};

// UI-only seed source; the engine itself never touches Math.random or Date.
const defaultSeed = () => (Date.now() ^ Math.floor(Math.random() * 2 ** 32)) >>> 0;

let snapshot: SessionSnapshot = INITIAL;
/** Resolved engine state: ahead of `snapshot.game` while a move plays back. */
let resolved: GameState | null = null;
let gameId = '';
let finishedId = '';
let sharedId = '';
/** Game that has already shown the first-plaque hint. */
let plaqueNoticeId = '';
const timers = new Set<number>();
let calloutTimer: number | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<SessionSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSessionSnapshot(): SessionSnapshot {
  return snapshot;
}

function schedule(fn: () => void, ms: number): number {
  const id = window.setTimeout(() => {
    timers.delete(id);
    fn();
  }, ms);
  timers.add(id);
  return id;
}

function clearTimers() {
  timers.forEach((id) => window.clearTimeout(id));
  timers.clear();
  calloutTimer = null;
}

/** Forget the live game and cancel its timers (tests only). */
export function resetGameSession(): void {
  clearTimers();
  snapshot = INITIAL;
  resolved = null;
  gameId = '';
  finishedId = '';
  sharedId = '';
  plaqueNoticeId = '';
  listeners.forEach((listener) => listener());
}

interface Frame {
  board?: Board;
  clearing: ReadonlySet<string>;
  score: number;
}

/** Turns engine events into display frames: swap, per wave clearing and refill, then plaque. */
function framesFor(events: GameEvent[], startScore: number): { frames: Frame[]; waves: number } {
  const frames: Frame[] = [];
  let score = startScore;
  let waves = 0;
  for (const event of events) {
    if (event.type === 'swap') {
      frames.push({ board: event.board, clearing: NO_CLEARING, score });
    } else if (event.type === 'match' || event.type === 'cholesterolCleared') {
      if (event.type === 'match') waves += 1;
      score += event.points;
      const last = frames[frames.length - 1];
      const keys = event.cells.map(cellKey);
      if (last && !last.board) {
        // Same wave: merge cholesterol cells into the match frame.
        frames[frames.length - 1] = { clearing: new Set([...last.clearing, ...keys]), score };
      } else {
        frames.push({ clearing: new Set(keys), score });
      }
    } else if (event.type === 'refill' || event.type === 'plaqueSeeded' || event.type === 'plaqueSpread') {
      frames.push({ board: event.board, clearing: NO_CLEARING, score });
    }
  }
  return { frames, waves };
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Spends 1 life and starts a new game, or moves to 'blocked' at 0 lives. Handler only. */
export function startGame(ctx: SessionContext): void {
  clearTimers();
  if (!ctx.lives.spend()) {
    set({ phase: 'blocked' });
    return;
  }
  const seed = (ctx.deps.newSeed ?? defaultSeed)();
  const next = createGame(seed);
  gameId = `${Date.now().toString(36)}-${seed}`;
  resolved = next;
  set({ ...INITIAL, phase: 'playing', game: next, board: next.board, score: next.score });
}

/** Awards coins and emits game.finished at most once per game, from the store. */
function finishGame(final: GameState, coins: SessionContext['coins']) {
  if (finishedId === gameId) return;
  finishedId = gameId;
  const earned = coinsForScore(final.score);
  if (earned > 0) coins.award('game_score', earned, `game_score:${gameId}`);
  set({ coinsEarned: earned });
  emitGameFinished({
    score: final.score,
    coins: earned,
    moves: final.moves,
    cholesterolCleared: final.cholesterolCleared,
    maxCascade: final.maxCascade,
  });
}

function showCallout(value: Callout | null) {
  if (calloutTimer !== null) {
    window.clearTimeout(calloutTimer);
    timers.delete(calloutTimer);
    calloutTimer = null;
  }
  set({ callout: value });
  if (value) {
    calloutTimer = schedule(() => {
      calloutTimer = null;
      set({ callout: null });
    }, CALLOUT_MS);
  }
}

function finishMove(next: GameState, waves: number, seeded: boolean, coins: SessionContext['coins']) {
  set({ board: next.board, clearing: NO_CLEARING, score: next.score, settledScore: next.score, game: next });
  if (seeded && plaqueNoticeId !== gameId) {
    plaqueNoticeId = gameId;
    set({ plaqueNotice: true });
  }
  showCallout(calloutForWaves(waves));
  if (next.over) {
    finishGame(next, coins);
    set({ phase: 'over' });
    return;
  }
  set({ locked: false });
}

function flashInvalid(reason: Exclude<MoveHint, null>) {
  set({ invalid: true, hint: reason });
  schedule(() => set({ invalid: false }), SHAKE_MS);
}

function attemptSwap(ctx: SessionContext, a: Cell, b: Cell) {
  const current = resolved;
  if (!current || snapshot.locked) return;
  set({ selected: null });
  const result = (ctx.deps.swap ?? trySwap)(current, a, b);
  if (!result.ok) {
    if (result.reason === 'no-match' || result.reason === 'cholesterol') flashInvalid(result.reason);
    return;
  }
  resolved = result.state;
  set({ hint: null, plaqueNotice: false, locked: true });
  const { frames, waves } = framesFor(result.events, current.score);
  const seeded = result.events.some((event) => event.type === 'plaqueSeeded');
  const stepMs = ctx.deps.stepMs ?? DEFAULT_STEP_MS;
  if (stepMs === 0 || prefersReducedMotion()) {
    finishMove(result.state, waves, seeded, ctx.coins);
    return;
  }
  // Playback timers belong to the store, so a move (and a game over award) still completes
  // when the player leaves the Play tab mid-animation.
  let index = 0;
  const tick = () => {
    if (index < frames.length) {
      const frame = frames[index];
      index += 1;
      set({ ...(frame.board ? { board: frame.board } : {}), clearing: frame.clearing, score: frame.score });
      schedule(tick, stepMs);
    } else {
      finishMove(result.state, waves, seeded, ctx.coins);
    }
  };
  tick();
}

/** Tap-tap selection; keyboard Enter/Space reaches the board through the same path. */
export function tapCell(ctx: SessionContext, cell: Cell): void {
  if (snapshot.phase !== 'playing' || snapshot.locked) return;
  const { selected } = snapshot;
  if (!selected) {
    set({ selected: cell });
    return;
  }
  if (selected.row === cell.row && selected.col === cell.col) {
    set({ selected: null });
    return;
  }
  if (isAdjacent(selected, cell)) {
    attemptSwap(ctx, selected, cell);
    return;
  }
  set({ selected: cell });
}

export function dragSwap(ctx: SessionContext, a: Cell, b: Cell): void {
  if (snapshot.phase !== 'playing') return;
  attemptSwap(ctx, a, b);
}

export async function shareCard(ctx: SessionContext, blob: Blob | null): Promise<void> {
  const id = gameId;
  const hadRoom = ctx.lives.lives < ctx.lives.max;
  let awarded = false;
  set({ shareStatus: 'sharing' });
  const outcome = await shareBragCard({
    blob,
    score: snapshot.score,
    url: window.location.href,
    nav: ctx.deps.nav ?? navigator,
    download: ctx.deps.download ?? downloadBlob,
    onShared: (channel) => {
      // At most one share life per finished game (anti-farming).
      if (sharedId === id) return;
      sharedId = id;
      awarded = true;
      ctx.lives.award(1, 'share');
      emitShareCompleted(channel);
    },
  });
  if (outcome === 'cancelled' || outcome === 'downloaded' || outcome === 'unavailable') {
    set({ shareStatus: outcome });
  } else {
    set({ shareStatus: awarded && hadRoom ? 'shared-life' : 'shared' });
  }
}
