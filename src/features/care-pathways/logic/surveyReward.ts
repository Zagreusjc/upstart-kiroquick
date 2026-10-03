import {
  dayKey,
  loadJSON,
  saveJSON,
  todayISO,
  type CoinsProvider,
  type LivesProvider,
} from '../../../core';

/**
 * Reward for completing the Heart Risk Check: coins and one life, once per
 * local calendar day. The same reward is given for every result, so nobody
 * is nudged to change their answers.
 */

export const SURVEY_REWARD_COINS = 20;
export const SURVEY_REWARD_LIVES = 1;
export const SURVEY_REWARD_KEY = 'inlababu.care.surveyReward.v1';

interface RewardRecord {
  /** Last local date (`yyyy-mm-dd`) the reward was claimed. */
  lastClaimed: string | null;
}

export type SurveyReward =
  | { granted: true; coins: number; lives: number; livesWereFull: boolean }
  | { granted: false; reason: 'already_today' };

/** Pure rule: one reward per local calendar day. */
export function canClaimSurveyReward(lastClaimed: string | null, today: string): boolean {
  return lastClaimed !== today;
}

type Coins = Pick<CoinsProvider, 'award'>;
type Lives = Pick<LivesProvider, 'award' | 'lives' | 'max'>;

export function claimSurveyReward(coins: Coins, lives: Lives, now: Date = new Date()): SurveyReward {
  const key = dayKey('risk_survey', 'heart-check', now);
  const today = todayISO(now);
  const record = loadJSON<RewardRecord>(SURVEY_REWARD_KEY, { lastClaimed: null });
  if (!canClaimSurveyReward(record.lastClaimed, today)) return { granted: false, reason: 'already_today' };

  // The idempotency key also stops a double award if the coins ledger saw it already.
  const coinsGranted = coins.award('other', SURVEY_REWARD_COINS, key);
  saveJSON(SURVEY_REWARD_KEY, { lastClaimed: today } satisfies RewardRecord);
  if (!coinsGranted) return { granted: false, reason: 'already_today' };

  const livesWereFull = lives.lives() >= lives.max;
  lives.award(SURVEY_REWARD_LIVES, 'other');
  return { granted: true, coins: SURVEY_REWARD_COINS, lives: SURVEY_REWARD_LIVES, livesWereFull };
}
