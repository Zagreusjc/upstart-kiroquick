// Local adapters between Arteria Match and the shared core. Only this file and the
// session hook talk to '../../core' events, so integration changes stay in one place.
import { emit, type EventMap } from '../../core';
import type { ShareChannel } from './brag/share';

/** Fields the design wants on game.finished that core does not type yet. */
export interface GameFinishedExtras {
  coins: number;
  moves: number;
  maxCascade: number;
}

export type GameSummary = EventMap['game.finished'] & GameFinishedExtras;

/** Emits game.finished with the full flat summary. */
export function emitGameFinished(summary: GameSummary): void {
  // TODO(integration): core/scaffold (Jolo on base/scaffold) widen EventMap['game.finished'] with coins, moves, maxCascade
  const payload: EventMap['game.finished'] & GameFinishedExtras = {
    score: summary.score,
    coins: summary.coins,
    moves: summary.moves,
    cholesterolCleared: summary.cholesterolCleared,
    maxCascade: summary.maxCascade,
  };
  emit('game.finished', payload);
}

/** Emits share.completed for a resolved brag card share. */
export function emitShareCompleted(channel: ShareChannel): void {
  emit('share.completed', { channel, context: 'artery-match' });
}

// TODO(integration): confirm life sources with Prime (economy-library lives) and CJ (activity)
export const EARN_LIVES_HINT =
  'Earn lives by reading a library card, sharing your Arteria Match brag card, or staying active.';
