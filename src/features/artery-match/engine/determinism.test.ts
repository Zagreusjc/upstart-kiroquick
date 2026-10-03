import { describe, it, expect } from 'vitest';
import { createGame, trySwap } from './game';
import { findLegalMove } from './legal';
import { countCholesterol } from './plaque';
import { NORMAL_TILE_TYPES } from './types';
import type { Cell, GameEvent, GameState } from './types';

interface Playthrough {
  states: GameState[];
  events: GameEvent[][];
}

function play(seed: number, moves: number): Playthrough {
  let state = createGame(seed);
  const states = [state];
  const events: GameEvent[][] = [];
  for (let i = 0; i < moves && !state.over; i++) {
    const move = findLegalMove(state);
    if (!move) break;
    const result = trySwap(state, move[0], move[1]);
    if (!result.ok) throw new Error(`findLegalMove gave a rejected swap: ${result.reason}`);
    state = result.state;
    states.push(state);
    events.push(result.events);
  }
  return { states, events };
}

/** Ordered plaque changes: seed cells and spread from/to pairs. */
type PlaqueChange = { seed?: Cell; from?: Cell; to?: Cell };

function plaqueChanges(run: Playthrough): PlaqueChange[] {
  return run.events.flat().flatMap((e): PlaqueChange[] => {
    if (e.type === 'plaqueSeeded') return [{ seed: e.cell }];
    if (e.type === 'plaqueSpread') return [{ from: e.from, to: e.to }];
    return [];
  });
}

describe('determinism', () => {
  it('replays 40 moves identically for the same seed, including the plaque layout', () => {
    const a = play(42, 40);
    const b = play(42, 40);
    expect(a.states.length).toBeGreaterThan(1);
    expect(a).toEqual(b);
    expect(plaqueChanges(a)).toEqual(plaqueChanges(b));
  });

  it('seeds and spreads plaque deterministically across seeds 1..5', () => {
    let total = 0;
    for (let seed = 1; seed <= 5; seed++) {
      const first = plaqueChanges(play(seed, 40));
      expect(plaqueChanges(play(seed, 40))).toEqual(first);
      total += first.length;
    }
    expect(total).toBeGreaterThan(0);
  });

  it('never refills with cholesterol', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const spawned = play(seed, 40)
        .events.flat()
        .flatMap((e) => (e.type === 'refill' ? e.spawned : []));
      expect(spawned.length).toBeGreaterThan(0);
      for (const s of spawned) expect(NORMAL_TILE_TYPES).toContain(s.type);
    }
  });

  it('keeps the first 3 moves plaque-free and seeds one block at the end of move 4', () => {
    let reached = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const run = play(seed, 4);
      if (run.events.length < 4) continue;
      reached++;
      for (let move = 0; move < 3; move++) {
        expect(run.events[move].some((e) => e.type === 'plaqueSeeded')).toBe(false);
        expect(countCholesterol(run.states[move + 1].board)).toBe(0);
      }
      expect(run.events[3].filter((e) => e.type === 'plaqueSeeded')).toHaveLength(1);
      expect(countCholesterol(run.states[4].board)).toBe(1);
    }
    expect(reached).toBeGreaterThanOrEqual(15);
  });

  it('diverges for a different seed', () => {
    expect(createGame(43).board).not.toEqual(createGame(42).board);
  });
});
