import { useEffect, useRef, useState } from 'react';
import { useCoins, useLives } from '../../core';
import { emitGameFinished, emitShareCompleted } from './adapters';
import { createBragCardBlob } from './brag/bragCard';
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
export type ShareStatus = 'idle' | 'sharing' | 'shared-life' | 'shared' | 'cancelled' | 'downloaded';
export type MoveHint = 'no-match' | 'cholesterol' | null;

const DEFAULT_STEP_MS = 160;
const CALLOUT_MS = 1200;
const SHAKE_MS = 300;
const NO_CLEARING: ReadonlySet<string> = new Set();

// UI-only seed source; the engine itself never touches Math.random or Date.
const defaultSeed = () => (Date.now() ^ Math.floor(Math.random() * 2 ** 32)) >>> 0;

interface Frame {
  board?: Board;
  clearing: ReadonlySet<string>;
  score: number;
}

/** Turns engine events into display frames: swap, then per wave clearing and refill. */
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
    } else if (event.type === 'refill') {
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

export function useGameSession(deps: GameDeps = {}) {
  const lives = useLives();
  const coins = useCoins();
  const swap = deps.swap ?? trySwap;
  const makeCard = deps.makeCard ?? createBragCardBlob;

  const [phase, setPhase] = useState<Phase>('idle');
  const [game, setGame] = useState<GameState | null>(null);
  const [display, setDisplay] = useState<Board | null>(null);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [clearing, setClearing] = useState<ReadonlySet<string>>(NO_CLEARING);
  const [locked, setLocked] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [hint, setHint] = useState<MoveHint>(null);
  const [callout, setCallout] = useState<Callout | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');

  // Refs are only read and written in event handlers and timer callbacks.
  const gameRef = useRef<GameState | null>(null);
  const gameIdRef = useRef('');
  const lockedRef = useRef(false);
  const finishedRef = useRef('');
  const sharedRef = useRef('');
  const timersRef = useRef(new Set<number>());
  const calloutTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  };

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current.clear();
    calloutTimerRef.current = null;
  };

  const setLock = (value: boolean) => {
    lockedRef.current = value;
    setLocked(value);
  };

  const start = () => {
    clearTimers();
    if (!lives.spend()) {
      setPhase('blocked');
      return;
    }
    const seed = (deps.newSeed ?? defaultSeed)();
    const next = createGame(seed);
    gameIdRef.current = `${Date.now().toString(36)}-${seed}`;
    gameRef.current = next;
    setGame(next);
    setDisplay(next.board);
    setScore(next.score);
    setSelected(null);
    setClearing(NO_CLEARING);
    setLock(false);
    setInvalid(false);
    setHint(null);
    setCallout(null);
    setCoinsEarned(0);
    setShareStatus('idle');
    setPhase('playing');
  };

  /** Awards coins and emits game.finished at most once per game (StrictMode-safe: handler only). */
  const finishGame = (final: GameState) => {
    const gameId = gameIdRef.current;
    if (finishedRef.current === gameId) return;
    finishedRef.current = gameId;
    const earned = coinsForScore(final.score);
    if (earned > 0) coins.award('game_score', earned, `game_score:${gameId}`);
    setCoinsEarned(earned);
    emitGameFinished({
      score: final.score,
      coins: earned,
      moves: final.moves,
      cholesterolCleared: final.cholesterolCleared,
      maxCascade: final.maxCascade,
    });
  };

  const showCallout = (value: Callout | null) => {
    if (calloutTimerRef.current !== null) {
      window.clearTimeout(calloutTimerRef.current);
      timersRef.current.delete(calloutTimerRef.current);
      calloutTimerRef.current = null;
    }
    setCallout(value);
    if (value) {
      calloutTimerRef.current = schedule(() => {
        calloutTimerRef.current = null;
        setCallout(null);
      }, CALLOUT_MS);
    }
  };

  const finishMove = (next: GameState, waves: number) => {
    setDisplay(next.board);
    setClearing(NO_CLEARING);
    setScore(next.score);
    setGame(next);
    showCallout(calloutForWaves(waves));
    if (next.over) {
      finishGame(next);
      setPhase('over');
      return;
    }
    setLock(false);
  };

  const flashInvalid = (reason: Exclude<MoveHint, null>) => {
    setInvalid(true);
    setHint(reason);
    schedule(() => setInvalid(false), SHAKE_MS);
  };

  const attemptSwap = (a: Cell, b: Cell) => {
    const current = gameRef.current;
    if (!current || lockedRef.current) return;
    setSelected(null);
    const result = swap(current, a, b);
    if (!result.ok) {
      if (result.reason === 'no-match' || result.reason === 'cholesterol') flashInvalid(result.reason);
      return;
    }
    setHint(null);
    gameRef.current = result.state;
    setLock(true);
    const { frames, waves } = framesFor(result.events, current.score);
    const apply = (frame: Frame) => {
      if (frame.board) setDisplay(frame.board);
      setClearing(frame.clearing);
      setScore(frame.score);
    };
    const stepMs = deps.stepMs ?? DEFAULT_STEP_MS;
    if (stepMs === 0 || prefersReducedMotion()) {
      finishMove(result.state, waves);
      return;
    }
    let index = 0;
    const tick = () => {
      if (index < frames.length) {
        apply(frames[index]);
        index += 1;
        schedule(tick, stepMs);
      } else {
        finishMove(result.state, waves);
      }
    };
    tick();
  };

  const tapCell = (cell: Cell) => {
    if (phase !== 'playing' || lockedRef.current) return;
    if (!selected) {
      setSelected(cell);
      return;
    }
    if (selected.row === cell.row && selected.col === cell.col) {
      setSelected(null);
      return;
    }
    if (isAdjacent(selected, cell)) {
      attemptSwap(selected, cell);
      return;
    }
    setSelected(cell);
  };

  const dragSwap = (a: Cell, b: Cell) => {
    if (phase !== 'playing') return;
    attemptSwap(a, b);
  };

  const share = async (blob: Blob | null) => {
    const gameId = gameIdRef.current;
    const hadRoom = lives.lives < lives.max;
    let awarded = false;
    setShareStatus('sharing');
    const outcome = await shareBragCard({
      blob,
      score,
      url: window.location.href,
      nav: deps.nav ?? navigator,
      download: deps.download ?? downloadBlob,
      onShared: (channel) => {
        // At most one share life per finished game (anti-farming).
        if (sharedRef.current === gameId) return;
        sharedRef.current = gameId;
        awarded = true;
        lives.award(1, 'share');
        emitShareCompleted(channel);
      },
    });
    if (outcome === 'cancelled' || outcome === 'downloaded') setShareStatus(outcome);
    else setShareStatus(awarded && hadRoom ? 'shared-life' : 'shared');
  };

  return {
    phase,
    lives: lives.lives,
    maxLives: lives.max,
    board: display,
    score,
    moves: game?.moves ?? 0,
    selected,
    clearing,
    locked: locked || phase !== 'playing',
    invalid,
    hint,
    callout,
    coinsEarned,
    shareStatus,
    makeCard,
    start,
    tapCell,
    dragSwap,
    share,
  };
}
