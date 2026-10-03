import { beforeEach, describe, expect, it } from 'vitest';
import { clearEventLog, getEventLog } from '../../core';
import { EARN_LIVES_HINT, emitGameFinished, emitShareCompleted } from './adapters';

describe('adapters', () => {
  beforeEach(() => {
    clearEventLog();
  });

  it('emits one game.finished with the full summary', () => {
    emitGameFinished({ score: 1200, coins: 10, moves: 7, cholesterolCleared: 2, maxCascade: 3 });
    const events = getEventLog().filter((e) => e.type === 'game.finished');
    expect(events).toHaveLength(1);
    expect(events[0].payload).toEqual({
      score: 1200,
      coins: 10,
      moves: 7,
      cholesterolCleared: 2,
      maxCascade: 3,
    });
  });

  it('emits share.completed with the artery-match context', () => {
    emitShareCompleted('web_share_file');
    const events = getEventLog().filter((e) => e.type === 'share.completed');
    expect(events).toHaveLength(1);
    expect(events[0].payload).toEqual({ channel: 'web_share_file', context: 'artery-match' });
  });

  it('explains how to earn lives', () => {
    expect(EARN_LIVES_HINT).toMatch(/library card/);
    expect(EARN_LIVES_HINT).toMatch(/shar/);
  });
});
