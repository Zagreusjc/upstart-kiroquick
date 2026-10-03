import { useCoins, useLives } from '../core';

/** Top bar: app name, lives and coins. Values come from the active providers. */
export function Header() {
  const { lives, max } = useLives();
  const { balance } = useCoins();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-rose-600 px-4 py-3 text-white shadow">
      <h1 className="text-lg font-bold tracking-wide">INLABABOO</h1>
      <div className="flex items-center gap-4 text-sm font-semibold">
        <span aria-label={`Lives: ${lives} of ${max}`}>
          <span aria-hidden="true">🩸</span> {lives}/{max}
        </span>
        <span aria-label={`Coins: ${balance}`}>
          <span aria-hidden="true">🪙</span> {balance}
        </span>
      </div>
    </header>
  );
}
