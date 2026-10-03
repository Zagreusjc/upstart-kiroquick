import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getProvider, useCoins } from '../../../core';
import { OFFERS, clinicById } from '../data';
import { issueVoucher, loadVouchers } from '../logic/voucherStore';
import { displayStatus, type DisplayStatus } from '../logic/vouchers';
import type { Voucher, VoucherOffer } from '../types';
import { carePaths } from '../paths';
import { Card, IllustrativeNotice, Page, buttonPrimary, buttonSecondary, focusRing } from '../ui';
import { VoucherQr } from './VoucherQr';

const STATUS_LABEL: Record<DisplayStatus, string> = {
  issued: 'Ready to use',
  redeemed: 'Redeemed',
  expired: 'Expired',
};

const DEMO_TOP_UP = 100;

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function VouchersScreen() {
  const { balance, award } = useCoins();
  // Snapshot of stored vouchers plus the time it was read (expiry is derived from it).
  const [snapshot, setSnapshot] = useState<{ vouchers: Voucher[]; now: number }>(() => ({
    vouchers: loadVouchers(),
    now: Date.now(),
  }));
  const { vouchers, now } = snapshot;
  const [feedback, setFeedback] = useState<{ offerId: string; text: string; ok: boolean } | null>(null);

  function redeem(offer: VoucherOffer) {
    // Read the provider at click time so a just-updated balance is used.
    const result = issueVoucher(offer, getProvider('coins'));
    if (result.ok) {
      setSnapshot({ vouchers: loadVouchers(), now: result.voucher.issuedAt });
      setFeedback({ offerId: offer.id, ok: true, text: `Voucher ${result.voucher.code} is ready. Show it at the clinic.` });
    } else {
      setFeedback({
        offerId: offer.id,
        ok: false,
        text: `Not enough coins. You need ${result.missing} more ${result.missing === 1 ? 'coin' : 'coins'}.`,
      });
    }
  }

  const newestFirst = [...vouchers].sort((a, b) => b.issuedAt - a.issuedAt);

  return (
    <Page title="Screening vouchers" intro="Turn coins into one-time discounts for heart screenings.">
      <IllustrativeNotice what="Voucher partners and discounts" />

      <Card className="flex items-center justify-between gap-2">
        <p className="font-semibold">
          You have <span className="text-xl">{balance}</span> coins
        </p>
        {import.meta.env.DEV && (
          <button
            type="button"
            className={`${buttonSecondary} text-sm`}
            onClick={() => award('other', DEMO_TOP_UP)}
          >
            Demo: add {DEMO_TOP_UP} coins
          </button>
        )}
      </Card>

      <h3 className="font-bold">Offers</h3>
      <ul className="space-y-3">
        {OFFERS.map((offer) => {
          const partner = clinicById(offer.partnerId);
          const missing = Math.max(0, offer.cost - balance);
          const message = feedback?.offerId === offer.id ? feedback : null;
          return (
            <li key={offer.id}>
              <Card className="space-y-2">
                <h4 className="font-bold">{offer.title}</h4>
                <p className="text-sm text-slate-700">
                  {partner ? `${partner.name}, ${partner.city}` : 'Partner clinic'} · valid {offer.validDays} days
                </p>
                <button type="button" className={`${buttonPrimary} w-full`} onClick={() => redeem(offer)}>
                  Redeem for {offer.cost} coins
                </button>
                {missing > 0 && !message && (
                  <p className="text-sm text-slate-700">You need {missing} more coins for this one.</p>
                )}
                {message && (
                  <p
                    role={message.ok ? 'status' : 'alert'}
                    className={`text-sm font-semibold ${message.ok ? 'text-emerald-800' : 'text-red-800'}`}
                  >
                    <span aria-hidden="true">{message.ok ? '✔ ' : '⚠ '}</span>
                    {message.text}
                  </p>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      <h3 className="font-bold">My vouchers</h3>
      {newestFirst.length === 0 ? (
        <Card>
          <p className="text-sm">No vouchers yet. Earn coins by reading, playing and checking in.</p>
        </Card>
      ) : (
        <ul className="space-y-3" aria-label="My vouchers">
          {newestFirst.map((voucher) => {
            const partner = clinicById(voucher.partnerId);
            const offer = OFFERS.find((o) => o.id === voucher.offerId);
            const status = displayStatus(voucher, now);
            return (
              <li key={voucher.id}>
                <Card className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold">{offer?.title ?? 'Screening voucher'}</h4>
                    <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-900">
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{partner ? `${partner.name}, ${partner.city}` : voucher.partnerId}</p>
                  {status === 'issued' && <VoucherQr code={voucher.code} />}
                  <p className="text-center font-mono text-lg font-bold tracking-wider">{voucher.code}</p>
                  <p className="text-center text-sm text-slate-700">
                    {status === 'redeemed' && voucher.redeemedAt
                      ? `Redeemed ${formatDate(voucher.redeemedAt)}`
                      : `Expires ${formatDate(voucher.expiresAt)}`}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-sm">
        Clinic staff:{' '}
        <Link to={carePaths.verify} className={`font-semibold text-rose-800 underline ${focusRing}`}>
          verify a voucher
        </Link>
      </p>
    </Page>
  );
}
