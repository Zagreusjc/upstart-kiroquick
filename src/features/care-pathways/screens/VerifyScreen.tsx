import { useState, type FormEvent } from 'react';
import { OFFERS, clinicById } from '../data';
import { checkVoucher, redeemVoucher } from '../logic/voucherStore';
import { VERIFY_MESSAGE, type VerifyResult } from '../logic/vouchers';
import { Card, IllustrativeNotice, Page, buttonPrimary, inputClass } from '../ui';

const STATUS_STYLE: Record<VerifyResult['status'], string> = {
  valid: 'border-emerald-600 bg-emerald-50 text-emerald-900',
  unknown: 'border-red-600 bg-red-50 text-red-900',
  already_redeemed: 'border-red-600 bg-red-50 text-red-900',
  expired: 'border-red-600 bg-red-50 text-red-900',
};

/** Front-desk page for clinic staff: check a code, then mark it redeemed. */
export function VerifyScreen() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [redeemed, setRedeemed] = useState(false);

  function onCheck(event: FormEvent) {
    event.preventDefault();
    setRedeemed(false);
    setResult(checkVoucher(code));
  }

  function onRedeem() {
    if (!result || result.status !== 'valid') return;
    const final = redeemVoucher(result.voucher.code);
    setResult(final);
    setRedeemed(final.status === 'valid');
  }

  const voucher = result && result.status !== 'unknown' ? result.voucher : null;
  const partner = voucher ? clinicById(voucher.partnerId) : undefined;
  const offer = voucher ? OFFERS.find((o) => o.id === voucher.offerId) : undefined;

  return (
    <Page
      title="Verify a voucher"
      intro="For clinic staff. Enter the code under the patient's QR code."
    >
      <IllustrativeNotice what="Partner clinics" />
      <p className="text-sm text-slate-700">
        Demo note: vouchers are stored on this device, so verify on the same phone that issued
        the voucher.
      </p>

      <form onSubmit={onCheck} className="space-y-3" aria-label="Verify voucher">
        <div>
          <label htmlFor="verify-code" className="block font-semibold">
            Voucher code
          </label>
          <input
            id="verify-code"
            className={`${inputClass} mt-1 font-mono uppercase`}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setResult(null);
              setRedeemed(false);
            }}
            placeholder="INB-XXXX-XXXX"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
        </div>
        <button type="submit" className={`${buttonPrimary} w-full`} disabled={code.trim() === ''}>
          Check code
        </button>
      </form>

      <div role="status" aria-live="polite">
        {result && (
          <div className={`space-y-2 rounded-xl border-2 p-4 ${STATUS_STYLE[result.status]}`}>
            <p className="font-bold">
              <span aria-hidden="true">{result.status === 'valid' ? '✔ ' : '✖ '}</span>
              {redeemed ? 'Redeemed. The screening discount can be applied.' : VERIFY_MESSAGE[result.status]}
            </p>
            {voucher && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                <dt className="font-semibold">Offer</dt>
                <dd>{offer?.title ?? voucher.offerId}</dd>
                <dt className="font-semibold">Partner</dt>
                <dd>{partner?.name ?? voucher.partnerId}</dd>
                <dt className="font-semibold">Expires</dt>
                <dd>{new Date(voucher.expiresAt).toLocaleDateString('en-PH')}</dd>
              </dl>
            )}
          </div>
        )}
      </div>

      {result?.status === 'valid' && !redeemed && (
        <Card>
          <button type="button" className={`${buttonPrimary} w-full`} onClick={onRedeem}>
            Mark as redeemed
          </button>
        </Card>
      )}
    </Page>
  );
}
