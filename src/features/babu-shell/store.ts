import { dayKey, emit, loadJSON, saveJSON, todayISO, type CoinsProvider } from '../../core';
import { CHECKIN_COINS, STORAGE_KEYS } from './constants';
import { shiftDate } from './dates';
import { applyCheckin } from './streak';

export interface BabuState {
  /** Epoch ms when onboarding was accepted, or null on first run. */
  onboardedAt: number | null;
  lastCheckin: string | null;
  streak: number;
  /** Demo-only day offset for Baboo's clock. 0 means real today. */
  dayOffset: number;
}

export interface CheckinOutcome {
  checkedIn: boolean;
  date: string;
  streak: number;
  /** Total coins actually awarded by this check-in (daily plus bonus). */
  coins: number;
  /** Milestone bonus reached by this check-in (0 if none). */
  bonus: number;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function sanitize(raw: Partial<BabuState> | null): BabuState {
  const s = raw ?? {};
  const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
  return {
    onboardedAt: typeof s.onboardedAt === 'number' && Number.isFinite(s.onboardedAt) ? s.onboardedAt : null,
    lastCheckin: typeof s.lastCheckin === 'string' && ISO_DATE.test(s.lastCheckin) ? s.lastCheckin : null,
    streak: isInt(s.streak) && s.streak >= 0 ? s.streak : 0,
    dayOffset: isInt(s.dayOffset) && s.dayOffset >= 0 ? s.dayOffset : 0,
  };
}

/**
 * Persisted Baboo state plus the side effects of a check-in (coins, event).
 * The rules themselves are pure and live in `streak.ts` and `mood.ts`.
 */
export function createBabuStore(storageKey: string = STORAGE_KEYS.babu) {
  let state = sanitize(loadJSON<Partial<BabuState> | null>(storageKey, null));
  const listeners = new Set<() => void>();

  const commit = (next: BabuState) => {
    state = next;
    saveJSON(storageKey, state);
    listeners.forEach((listener) => listener());
  };

  /** Baboo's "now": the real date moved by the demo day offset. */
  const currentDate = (base: Date = new Date()) => shiftDate(base, state.dayOffset);

  return {
    getState: () => state,

    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    currentDate,

    today: (base: Date = new Date()) => todayISO(currentDate(base)),

    acceptOnboarding: (at: number = Date.now()) => {
      commit({ ...state, onboardedAt: at });
    },

    checkIn: (coins: CoinsProvider, base: Date = new Date()): CheckinOutcome => {
      const now = currentDate(base);
      const date = todayISO(now);
      const result = applyCheckin(state, date);
      if (!result.checkedIn) {
        return { checkedIn: false, date, streak: state.streak, coins: 0, bonus: 0 };
      }

      const { streak } = result.state;
      commit({ ...state, ...result.state });

      let earned = 0;
      if (coins.award('checkin', CHECKIN_COINS, dayKey('checkin', 'daily', now))) {
        earned += CHECKIN_COINS;
      }
      let bonus = 0;
      if (result.bonus > 0 && coins.award('streak', result.bonus, dayKey('streak', `day-${streak}`, now))) {
        bonus = result.bonus;
        earned += bonus;
      }

      emit('checkin.done', { date, streak });
      return { checkedIn: true, date, streak, coins: earned, bonus };
    },

    /** Demo control: move Baboo's clock forward by whole days. */
    shiftDays: (days: number) => {
      if (!Number.isInteger(days) || days <= 0) return;
      commit({ ...state, dayOffset: state.dayOffset + days });
    },

    /** Demo control: back to real today with a fresh streak. Onboarding is kept. */
    resetDemoDays: () => {
      commit({ ...state, lastCheckin: null, streak: 0, dayOffset: 0 });
    },

    /** Re-read from storage (tests). */
    reload: () => {
      state = sanitize(loadJSON<Partial<BabuState> | null>(storageKey, null));
      listeners.forEach((listener) => listener());
    },
  };
}

export type BabuStore = ReturnType<typeof createBabuStore>;

/** The app-wide Baboo store used by the Home screen. */
export const babuStore = createBabuStore();
