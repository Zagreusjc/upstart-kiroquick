import { useEffect, useState } from 'react';

/**
 * QR image for a voucher. The QR encodes ONLY the voucher code (no personal
 * data). `qrcode` is imported lazily so it stays out of the main bundle, and
 * the SVG renderer works without canvas.
 */
export function VoucherQr({ code }: { code: string }) {
  const [svg, setSvg] = useState<{ code: string; markup: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('qrcode')
      .then((qr) => qr.toString(code, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }))
      .then((markup) => {
        if (!cancelled) setSvg({ code, markup });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (failed) return <p className="text-sm">QR code unavailable. Show the code instead.</p>;
  if (!svg || svg.code !== code) return <p className="text-sm">Making QR code…</p>;

  return (
    <img
      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.markup)}`}
      alt={`QR code for voucher ${code}`}
      width={176}
      height={176}
      className="mx-auto rounded bg-white p-1"
    />
  );
}
