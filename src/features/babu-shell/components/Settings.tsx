import { Link } from 'react-router-dom';
import { eraseAppData } from '../dataReset';
import { MENU_LINKS } from '../menuLinks';
import { DemoControls } from './DemoControls';

const backLink =
  'inline-flex min-h-11 items-center rounded-xl px-1 text-sm font-semibold text-rose-700 underline hover:text-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-800';

/** Settings, opened from the main menu: demo controls and on-device data. */
export function Settings({ reload = () => window.location.reload() }: { reload?: () => void }) {
  function erase() {
    const ok = window.confirm(
      'Erase all INLABABU data on this device? Baboo, coins, lives, vouchers and progress will be reset. This cannot be undone.',
    );
    if (!ok) return;
    eraseAppData();
    reload();
  }

  return (
    <section aria-labelledby="settings-title" className="space-y-4">
      <Link to={MENU_LINKS.home} className={backLink}>
        <span aria-hidden="true">←&nbsp;</span>Main menu
      </Link>
      <h2 id="settings-title" className="text-2xl font-bold">
        Settings
      </h2>

      <DemoControls />

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Your data</h3>
        <p className="mt-1 text-sm text-slate-700">
          Everything you enter stays on this phone. Nothing is sent to a server.
        </p>
        <button
          type="button"
          onClick={erase}
          className="mt-3 min-h-11 rounded-xl border-2 border-red-700 bg-white px-4 text-sm font-semibold text-red-800 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
        >
          Erase all my data on this device
        </button>
      </div>
    </section>
  );
}
