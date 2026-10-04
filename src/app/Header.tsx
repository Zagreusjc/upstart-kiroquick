import { CoinIcon, LifeIcon, useCoins, useLives } from '../core';

/** Top bar: app name, lives and coins. Values come from the active providers. */
export function Header() {
  const { lives, max } = useLives();
  const { balance } = useCoins();

  return (
    <header className="app-header">
      <h1 className="app-title">INLABABOO</h1>
      <div className="flex items-center gap-2 text-sm">
        <span className="ui-pill" aria-label={`Lives: ${lives} of ${max}`}>
          <LifeIcon />
          <span aria-hidden="true">
            {lives}/{max}
          </span>
        </span>
        <span className="ui-pill" aria-label={`Coins: ${balance}`}>
          <CoinIcon />
          <span aria-hidden="true">{balance}</span>
        </span>
      </div>
    </header>
  );
}
