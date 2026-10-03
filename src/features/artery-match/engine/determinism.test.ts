import { describe, it, expect } from 'vitest';
import { createGame, trySwap } from './game';
import { findLegalMove } from './legal';
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

function cholesterolSpawns(run: Playthrough): Cell[] {
  return run.events
    .flat()
    .flatMap((e) => (e.type === 'refill' ? e.spawned : []))
    .filter((s) => s.type === 'cholesterol')
    .map((s) => s.cell);
}

describe('determinism', () => {
  it('replays 40 moves identically for the same seed', () => {
    const a = play(42, 40);
    const b = play(42, 40);
    expect(a.states.length).toBeGreaterThan(1);
    expect(a).toEqual(b);
    expect(cholesterolSpawns(a)).toEqual(cholesterolSpawns(b));
  });

  it('spawns cholesterol deterministically across seeds 1..5', () => {
    let total = 0;
    for (let seed = 1; seed <= 5; seed++) {
      const first = cholesterolSpawns(play(seed, 40));
      expect(cholesterolSpawns(play(seed, 40))).toEqual(first);
      total += first.length;
    }
    expect(total).toBeGreaterThan(0);
  });

  it('diverges for a different seed', () => {
    expect(createGame(43).board).not.toEqual(createGame(42).board);
  });
});
