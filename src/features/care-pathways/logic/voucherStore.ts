import { emit, loadJSON, saveJSON, type CoinsProvider } from '../../../core';
import type { Rng, Voucher, VoucherOffer } from '../types';
import {
  checkAffordable,
  createVoucher,
  markRedeemed,
  normalizeCode,
  verifyCode,
  type VerifyResult,
} from './vouchers';

/**
 * Voucher persistence and side effects (coins, events). Same-device only in
 * the MVP: the clinic verify page reads the same localStorage.
 */

export const VOUCHERS_KEY = 'inlababoo.care.vouchers.v1';

export function loadVouchers(): Voucher[] {
  const stored = loadJSON<Voucher[]>(VOUCHERS_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

function saveVouchers(vouchers: Voucher[]): void {
  saveJSON(VOUCHERS_KEY, vouchers);
}

export type IssueResult = { ok: true; voucher: Voucher } | { ok: false; missing: number };

type CoinsLike = Pick<CoinsProvider, 'balance' | 'spend'>;

/** Spend coins once, then store the voucher and emit `voucher.issued`. */
export function issueVoucher(
  offer: VoucherOffer,
  coins: CoinsLike,
  now: number = Date.now(),
  rng: Rng = Math.random,
): IssueResult {
  const balance = coins.balance();
  const affordable = checkAffordable(balance, offer.cost);
  if (!affordable.ok) return affordable;
  if (!coins.spend(offer.cost, `voucher:${offer.id}`)) {
    return { ok: false, missing: Math.max(1, offer.cost - coins.balance()) };
  }

  const vouchers = loadVouchers();
  const codes = new Set(vouchers.map((v) => normalizeCode(v.code)));
  const voucher = createVoucher(offer, now, rng, codes);
  saveVouchers([...vouchers, voucher]);
  emit('voucher.issued', { voucherId: voucher.id, partnerId: voucher.partnerId, cost: voucher.cost });
  return { ok: true, voucher };
}

/** Look up a code without changing anything (front desk "Check"). */
export function checkVoucher(code: string, now: number = Date.now()): VerifyResult {
  return verifyCode(loadVouchers(), code, now);
}

/** Verify again and, if still valid, mark redeemed and emit `voucher.redeemed`. */
export function redeemVoucher(code: string, now: number = Date.now()): VerifyResult {
  const vouchers = loadVouchers();
  const result = verifyCode(vouchers, code, now);
  if (result.status !== 'valid') return result;
  const updated = markRedeemed(vouchers, result.voucher.id, now);
  saveVouchers(updated);
  emit('voucher.redeemed', { voucherId: result.voucher.id, partnerId: result.voucher.partnerId });
  const voucher = updated.find((v) => v.id === result.voucher.id)!;
  return { status: 'valid', voucher };
}
