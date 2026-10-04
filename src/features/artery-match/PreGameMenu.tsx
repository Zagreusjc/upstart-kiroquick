import { CoinIcon, LifeIcon } from '../../core';
import { EARN_LIVES_HINT } from './adapters';
import type { TileType } from './engine';
import { TileIcon } from './TileIcon';

const HERO_TILES: readonly TileType[] = ['rbc', 'wbc', 'platelet', 'plasma', 'cholesterol'];

interface PreGameMenuProps {
  lives: number;
  maxLives: number;
  coins: number;
  /** False when the player has no lives left (and free play is off). */
  canPlay: boolean;
  onPlay(): void;
}

/** The screen shown before a game: hero art, lives and coins, a big Play button, a quick guide. */
export function PreGameMenu({ lives, maxLives, coins, canPlay, onPlay }: PreGameMenuProps) {
  return (
    <div className="am-menu">
      <div className="am-hero">
        <div className="am-hero__tiles" aria-hidden="true">
          {HERO_TILES.map((type, i) => (
            <span key={type} className="am-hero__tile" style={{ '--i': i } as React.CSSProperties}>
              <TileIcon type={type} />
            </span>
          ))}
        </div>
        <h2 id="am-title" className="am-hero__title">
          Arteria Match
        </h2>
        <p className="am-hero__tag">Keep the artery flowing</p>
      </div>

      <div className="ui-card am-menu__panel">
        <div className="am-stats">
          <p className="ui-pill m-0">
            <span className="am-hearts" aria-hidden="true">
              {Array.from({ length: maxLives }, (_, i) => (
                <LifeIcon key={i} className={`h-5 w-5 ${i < lives ? '' : 'am-heart--empty'}`} />
              ))}
            </span>
            {lives} of {maxLives} lives
          </p>
          <p className="ui-pill m-0">
            <CoinIcon />
            {coins} coins
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button type="button" onClick={onPlay} disabled={!canPlay} aria-describedby="am-cost" className="ui-btn am-play">
            Play
            <span aria-hidden="true" className="am-play__cost">
              <LifeIcon className="h-4 w-4" />
              -1
            </span>
          </button>
          <p id="am-cost" className="am-note">
            Each game costs 1 life.
          </p>
          {!canPlay && (
            <>
              <p role="alert" className="am-note text-baboo-600">
                You're out of lives.
              </p>
              <p className="am-note font-medium">{EARN_LIVES_HINT}</p>
            </>
          )}
        </div>

        <section aria-labelledby="am-how-title" className="flex flex-col gap-2">
          <h3 id="am-how-title" className="m-0 text-center text-sm font-black uppercase tracking-widest">
            How to play
          </h3>
          <ul className="am-how">
            <li className="am-how__card">
              <span className="am-how__art" aria-hidden="true">
                <TileIcon type="rbc" />
              </span>
              Swap to match 3 or more
            </li>
            <li className="am-how__card">
              <span className="am-how__art" aria-hidden="true">
                <TileIcon type="cholesterol" />
              </span>
              Plaque spreads. Match next to it
            </li>
            <li className="am-how__card">
              <span className="am-how__art am-how__art--coin" aria-hidden="true">
                <CoinIcon className="h-9 w-9" />
              </span>
              Finish a game to earn coins
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
