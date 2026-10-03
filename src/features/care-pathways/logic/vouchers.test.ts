import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearEventLog, getEventLog, on } from '../../../core';
import type { VoucherOffer } from '../types';
import { seededRng } from './rng';
import { checkVoucher, issueVoucher, loadVouchers, redeemVoucher } from './voucherStore';
import {
  CODE_ALPHABET,
  DAY_MS,
  checkAffordable,
  createVoucher,
  displayStatus,
  generateCode,
  normalizeCode,
  verifyCode,
} from './vouchers';

const offer: VoucherOffer = {
  id: 'offer-test',
  partnerId: 'qc-tibok-heart',
  title: 'Test screening',
  cost: 50,
  validDays: 30,
};

const NOW = Date.UTC(2026, 9, 4, 2, 0, 0);

function fakeCoins(start: number) {
  let balance = start;
  return {
    balance: () => balance,
    spend: vi.fn((amount: number) => {
      if (balance < amount) return false;
      balance -= amount;
      return true;
    }),
  };
}

beforeEach(() => {
  clearEventLog();
});

describe('voucher codes', () => {
  it('are deterministic for a seed and use the INB-XXXX-XXXX format', () => {
    const a = generateCode(seededRng(7));
    expect(a).toBe(generateCode(seededRng(7)));
    expect(a).toMatch(new RegExp(`^INB-[${CODE_ALPHABET}]{4}-[${CODE_ALPHABET}]{4}$`));
  });

  it('normalise case, spaces and dashes', () => {
    expect(normalizeCode(' inb-ab2c defg ')).toBe('INBAB2CDEFG');
  });

  it('retry on collision', () => {
    const first = createVoucher(offer, NOW, seededRng(1));
    const second = createVoucher(offer, NOW, seededRng(1), new Set([normalizeCode(first.code)]));
    expect(second.code).not.toBe(first.code);
  });
});

describe('rules', () => {
  it('reports how many coins are missing', () => {
    expect(checkAffordable(20, 50)).toEqual({ ok: false, missing: 30 });
    expect(checkAffordable(50, 50)).toEqual({ ok: true });
  });

  it('derives expiry from the clock and lets redeemed win', () => {
    const v = createVoucher(offer, NOW, seededRng(2));
    expect(v.expiresAt).toBe(NOW + 30 * DAY_MS);
    expect(displayStatus(v, NOW)).toBe('issued');
    expect(displayStatus(v, v.expiresAt + 1)).toBe('expired');
    expect(displayStatus({ ...v, status: 'redeemed' }, v.expiresAt + 1)).toBe('redeemed');
  });

  it('verifyCode handles unknown, expired, redeemed and valid codes', () => {
    const v = createVoucher(offer, NOW, seededRng(3));
    expect(verifyCode([v], 'INB-NOPE-NOPE', NOW).status).toBe('unknown');
    expect(verifyCode([v], '', NOW).status).toBe('unknown');
    expect(verifyCode([v], v.code.toLowerCase(), NOW).status).toBe('valid');
    expect(verifyCode([v], v.code, v.expiresAt + 1).status).toBe('expired');
    expect(verifyCode([{ ...v, status: 'redeemed' }], v.code, NOW).status).toBe('already_redeemed');
  });
});

describe('issueVoucher', () => {
  it('with enough coins: deducts once, stores a voucher and emits voucher.issued', () => {
    const coins = fakeCoins(60);
    const result = issueVoucher(offer, coins, NOW, seededRng(4));

    expect(result.ok).toBe(true);
    expect(coins.spend).toHaveBeenCalledTimes(1);
    expect(coins.spend).toHaveBeenCalledWith(50, 'voucher:offer-test');
    expect(coins.balance()).toBe(10);
    expect(loadVouchers()).toHaveLength(1);

    const events = getEventLog().filter((e) => e.type === 'voucher.issued');
    expect(events).toHaveLength(1);
    if (result.ok) {
      expect(events[0].payload).toEqual({ voucherId: result.voucher.id, partnerId: 'qc-tibok-heart', cost: 50 });
    }
  });

  it('with too few coins: no voucher, no spend, reports the missing amount', () => {
    const coins = fakeCoins(20);
    const result = issueVoucher(offer, coins, NOW, seededRng(5));

    expect(result).toEqual({ ok: false, missing: 30 });
    expect(coins.spend).not.toHaveBeenCalled();
    expect(coins.balance()).toBe(20);
    expect(loadVouchers()).toHaveLength(0);
    expect(getEventLog()).toHaveLength(0);
  });

  it('does not issue when the provider refuses the spend', () => {
    const coins = { balance: () => 100, spend: () => false };
    expect(issueVoucher(offer, coins, NOW, seededRng(6)).ok).toBe(false);
    expect(loadVouchers()).toHaveLength(0);
  });
});

describe('redeemVoucher (clinic verify)', () => {
  function issued() {
    const result = issueVoucher(offer, fakeCoins(100), NOW, seededRng(8));
    if (!result.ok) throw new Error('setup failed');
    return result.voucher;
  }

  it('valid code: marks redeemed and emits voucher.redeemed', () => {
    const voucher = issued();
    const handler = vi.fn();
    const off = on('voucher.redeemed', handler);

    expect(checkVoucher(voucher.code, NOW).status).toBe('valid');
    const result = redeemVoucher(voucher.code, NOW + 1000);
    off();

    expect(result.status).toBe('valid');
    expect(loadVouchers()[0]).toMatchObject({ status: 'redeemed', redeemedAt: NOW + 1000 });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].payload).toEqual({ voucherId: voucher.id, partnerId: 'qc-tibok-heart' });
  });

  it('double redemption fails and emits nothing more', () => {
    const voucher = issued();
    redeemVoucher(voucher.code, NOW);
    expect(redeemVoucher(voucher.code, NOW).status).toBe('already_redeemed');
    expect(getEventLog().filter((e) => e.type === 'voucher.redeemed')).toHaveLength(1);
  });

  it('expired voucher fails with status expired', () => {
    const voucher = issued();
    expect(redeemVoucher(voucher.code, voucher.expiresAt + 1).status).toBe('expired');
    expect(loadVouchers()[0].status).toBe('issued');
  });

  it('unknown code fails', () => {
    issued();
    expect(redeemVoucher('INB-2222-2222', NOW).status).toBe('unknown');
  });
});
