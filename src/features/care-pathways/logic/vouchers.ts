import type { Rng, Voucher, VoucherOffer } from '../types';

/**
 * Pure voucher rules: codes, affordability, expiry and one-time use.
 * Storage, coins and events live in `voucherStore.ts`.
 */

export const DAY_MS = 86_400_000;

/** No look-alike characters (0/O, 1/I/L). 31 symbols. */
export const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_PREFIX = 'INB';

/** `INB-XXXX-XXXX`. Holds no personal data. */
export function generateCode(rng: Rng): string {
  const block = () =>
    Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)]).join('');
  return `${CODE_PREFIX}-${block()}-${block()}`;
}

/** Uppercase and drop spaces and dashes so `inb abcd efgh` matches `INB-ABCD-EFGH`. */
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export type Affordability = { ok: true } | { ok: false; missing: number };

export function checkAffordable(balance: number, cost: number): Affordability {
  return balance >= cost ? { ok: true } : { ok: false, missing: cost - balance };
}

export function createVoucher(
  offer: VoucherOffer,
  now: number,
  rng: Rng,
  existingCodes: ReadonlySet<string> = new Set(),
): Voucher {
  let code = generateCode(rng);
  // 31^8 codes make collisions very unlikely; retry anyway to guarantee uniqueness.
  while (existingCodes.has(normalizeCode(code))) code = generateCode(rng);
  return {
    id: `v-${now.toString(36)}-${normalizeCode(code).slice(-4).toLowerCase()}`,
    code,
    offerId: offer.id,
    partnerId: offer.partnerId,
    cost: offer.cost,
    issuedAt: now,
    expiresAt: now + offer.validDays * DAY_MS,
    status: 'issued',
  };
}

export type DisplayStatus = 'issued' | 'redeemed' | 'expired';

/** Expired is derived from the clock, never stored. Redeemed wins over expired. */
export function displayStatus(voucher: Voucher, now: number): DisplayStatus {
  if (voucher.status === 'redeemed') return 'redeemed';
  if (now > voucher.expiresAt) return 'expired';
  return 'issued';
}

export type VerifyResult =
  | { status: 'valid'; voucher: Voucher }
  | { status: 'unknown' }
  | { status: 'already_redeemed'; voucher: Voucher }
  | { status: 'expired'; voucher: Voucher };

export function findByCode(vouchers: readonly Voucher[], code: string): Voucher | undefined {
  const wanted = normalizeCode(code);
  if (wanted === '') return undefined;
  return vouchers.find((v) => normalizeCode(v.code) === wanted);
}

export function verifyCode(vouchers: readonly Voucher[], code: string, now: number): VerifyResult {
  const voucher = findByCode(vouchers, code);
  if (!voucher) return { status: 'unknown' };
  const status = displayStatus(voucher, now);
  if (status === 'redeemed') return { status: 'already_redeemed', voucher };
  if (status === 'expired') return { status: 'expired', voucher };
  return { status: 'valid', voucher };
}

/** Returns a new list with the voucher marked redeemed. */
export function markRedeemed(vouchers: readonly Voucher[], id: string, now: number): Voucher[] {
  return vouchers.map((v) => (v.id === id ? { ...v, status: 'redeemed', redeemedAt: now } : v));
}

export const VERIFY_MESSAGE: Record<VerifyResult['status'], string> = {
  valid: 'Valid voucher. You can mark it as redeemed.',
  unknown: 'No voucher found with this code. Check the code and try again.',
  already_redeemed: 'This voucher was already redeemed. Each voucher can be used once.',
  expired: 'This voucher has expired and cannot be redeemed.',
};
