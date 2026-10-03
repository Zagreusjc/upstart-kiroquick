import { describe, expect, it, vi } from 'vitest';
import {
  SURVEY_REWARD_COINS,
  canClaimSurveyReward,
  claimSurveyReward,
} from './surveyReward';

function fakes(livesNow = 1) {
  const keys = new Set<string>();
  let lives = livesNow;
  return {
    coins: {
      award: vi.fn((_source: string, _amount: number, key?: string) => {
        if (key && keys.has(key)) return false;
        if (key) keys.add(key);
        return true;
      }),
    },
    lives: {
      max: 3,
      lives: () => lives,
      award: vi.fn((count: number) => {
        lives = Math.min(3, lives + count);
      }),
    },
  };
}

const oct4 = new Date(2026, 9, 4, 9, 0);
const oct4Evening = new Date(2026, 9, 4, 21, 0);
const oct5 = new Date(2026, 9, 5, 8, 0);

describe('survey reward', () => {
  it('pure rule: once per calendar day', () => {
    expect(canClaimSurveyReward(null, '2026-10-04')).toBe(true);
    expect(canClaimSurveyReward('2026-10-04', '2026-10-04')).toBe(false);
    expect(canClaimSurveyReward('2026-10-04', '2026-10-05')).toBe(true);
  });

  it('awards coins and one life on the first survey of the day', () => {
    const { coins, lives } = fakes(1);
    const result = claimSurveyReward(coins, lives, oct4);
    expect(result).toEqual({ granted: true, coins: SURVEY_REWARD_COINS, lives: 1, livesWereFull: false });
    expect(coins.award).toHaveBeenCalledWith('other', SURVEY_REWARD_COINS, 'risk_survey:heart-check:2026-10-04');
    expect(lives.award).toHaveBeenCalledWith(1, 'other');
    expect(lives.lives()).toBe(2);
  });

  it('gives nothing for a second survey the same day, and again the next day', () => {
    const { coins, lives } = fakes(1);
    claimSurveyReward(coins, lives, oct4);
    expect(claimSurveyReward(coins, lives, oct4Evening)).toEqual({ granted: false, reason: 'already_today' });
    expect(lives.award).toHaveBeenCalledTimes(1);
    expect(claimSurveyReward(coins, lives, oct5).granted).toBe(true);
  });

  it('does not award a life if the coins ledger already used today\'s key', () => {
    const { coins, lives } = fakes(1);
    coins.award('other', 20, 'risk_survey:heart-check:2026-10-04');
    expect(claimSurveyReward(coins, lives, oct4).granted).toBe(false);
    expect(lives.award).not.toHaveBeenCalled();
  });

  it('reports when lives were already full', () => {
    const { coins, lives } = fakes(3);
    const result = claimSurveyReward(coins, lives, oct4);
    expect(result.granted && result.livesWereFull).toBe(true);
  });
});
