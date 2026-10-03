import { loadJSON, removeKey, saveJSON } from './storage';

/**
 * Typed event bus plus a persisted event log.
 *
 * The log is what Ralph exports as CSV for the Quick Sight partner dashboard,
 * so keep payloads small, flat and free of personal data.
 *
 * OWNER: Jolo (edited on `base/scaffold` only).
 */

export interface EventMap {
  'library.read': { cardId: string };
  'game.finished': { score: number; cholesterolCleared: number };
  'risk.assessed': { band: string };
  'voucher.issued': { voucherId: string; partnerId: string; cost: number };
  'voucher.redeemed': { voucherId: string; partnerId: string };
  'share.completed': { channel: string; context: string };
  'checkin.done': { date: string; streak: number };
}

export type EventType = keyof EventMap;

export interface LoggedEvent<T extends EventType = EventType> {
  id: string;
  type: T;
  /** Epoch milliseconds. */
  at: number;
  payload: EventMap[T];
}

const LOG_KEY = 'inlababu.events.v1';
const MAX_LOG = 1000;

type Handler<T extends EventType> = (event: LoggedEvent<T>) => void;

const handlers = new Map<EventType, Set<Handler<EventType>>>();
let log: LoggedEvent[] | null = null;
let counter = 0;

function loadLog(): LoggedEvent[] {
  if (log === null) log = loadJSON<LoggedEvent[]>(LOG_KEY, []);
  return log;
}

/** Emit an event: append it to the persisted log, then notify listeners. */
export function emit<T extends EventType>(
  type: T,
  payload: EventMap[T],
): LoggedEvent<T> {
  const entries = loadLog();
  counter += 1;
  const event: LoggedEvent<T> = {
    id: `${Date.now().toString(36)}-${counter}`,
    type,
    at: Date.now(),
    payload,
  };
  entries.push(event as LoggedEvent);
  if (entries.length > MAX_LOG) entries.splice(0, entries.length - MAX_LOG);
  saveJSON(LOG_KEY, entries);

  const set = handlers.get(type);
  if (set) {
    for (const handler of [...set]) handler(event as LoggedEvent);
  }
  return event;
}

/** Listen for one event type. Returns an unsubscribe function. */
export function on<T extends EventType>(
  type: T,
  handler: Handler<T>,
): () => void {
  let set = handlers.get(type);
  if (!set) {
    set = new Set();
    handlers.set(type, set);
  }
  set.add(handler as Handler<EventType>);
  return () => {
    set.delete(handler as Handler<EventType>);
  };
}

/** A copy of the persisted log, oldest first. */
export function getEventLog(): LoggedEvent[] {
  return [...loadLog()];
}

/** Clear the log (tests and the demo reset button). */
export function clearEventLog(): void {
  log = [];
  removeKey(LOG_KEY);
}

/** Drop the in-memory cache so the next read reloads from storage (tests). */
export function resetEventCache(): void {
  log = null;
}
