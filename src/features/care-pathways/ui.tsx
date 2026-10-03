import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DISCLAIMER } from './logic/risk';
import { carePaths } from './paths';

/** Small shared building blocks for the care screens. */

export const focusRing =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-700';

export const buttonPrimary = `inline-flex min-h-11 items-center justify-center rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-400 ${focusRing}`;

export const buttonSecondary = `inline-flex min-h-11 items-center justify-center rounded-lg border border-rose-700 bg-white px-4 py-2 font-semibold text-rose-800 hover:bg-rose-50 ${focusRing}`;

export const inputClass = `min-h-11 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-base text-slate-900 ${focusRing}`;

export function Page({
  title,
  intro,
  children,
  back = true,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  back?: boolean;
}) {
  return (
    <section aria-labelledby="care-page-title" className="space-y-4">
      {back && (
        <Link to={carePaths.home} className={`inline-flex min-h-11 items-center text-sm font-semibold text-rose-800 underline ${focusRing}`}>
          <span aria-hidden="true">←&nbsp;</span>Care home
        </Link>
      )}
      <header>
        <h2 id="care-page-title" className="text-xl font-bold">
          {title}
        </h2>
        {intro && <p className="mt-1 text-sm text-slate-700">{intro}</p>}
      </header>
      {children}
    </section>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-white p-4 shadow ${className}`}>{children}</div>;
}

/** Labels seeded clinic, mission and partner data as illustrative. */
export function IllustrativeNotice({ what }: { what: string }) {
  return (
    <p className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
      <span aria-hidden="true">ℹ️ </span>
      <strong>Illustrative data.</strong> {what} are samples for this demo, not real partners or
      endorsements.
    </p>
  );
}

export function Disclaimer() {
  return (
    <p className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm font-semibold text-slate-800">
      <span aria-hidden="true">⚕️ </span>
      {DISCLAIMER}
    </p>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-medium text-red-800">
      <span aria-hidden="true">⚠ </span>
      {message}
    </p>
  );
}
