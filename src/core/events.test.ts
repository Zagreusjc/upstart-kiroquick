import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearEventLog, emit, getEventLog, on, resetEventCache } from './events';

describe('event bus and log', () => {
  beforeEach(() => {
    clearEventLog();
  });

  it('delivers typed events to subscribers until unsubscribed', () => {
    const handler = vi.fn();
    const off = on('library.read', handler);

    emit('library.read', { cardId: 'c1' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0].payload).toEqual({ cardId: 'c1' });

    off();
    emit('library.read', { cardId: 'c2' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('only notifies handlers of the matching type', () => {
    const risk = vi.fn();
    on('risk.assessed', risk);
    emit('checkin.done', { date: '2026-10-03', streak: 1 });
    expect(risk).not.toHaveBeenCalled();
  });

  it('persists the log in order and survives a cache reload', () => {
    emit('game.finished', { score: 300, cholesterolCleared: 1 });
    emit('voucher.issued', { voucherId: 'v1', partnerId: 'p1', cost: 50 });

    resetEventCache();
    const log = getEventLog();
    expect(log.map((e) => e.type)).toEqual(['game.finished', 'voucher.issued']);
    expect(log[0]?.at).toBeLessThanOrEqual(log[1]?.at ?? 0);
  });

  it('clears the log', () => {
    emit('share.completed', { channel: 'whatsapp', context: 'brag_card' });
    clearEventLog();
    expect(getEventLog()).toEqual([]);
  });
});
