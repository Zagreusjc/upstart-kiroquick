## Why

The game is the "Play" step of the loop and the main engagement hook. Reframing a match-3 as an artery (red cells carry oxygen, cholesterol blocks occlude the vessel) teaches cardiovascular health while people play. It also demonstrates good technology judgment: a plain, deterministic, well-tested engine, with no AI where none is needed.

## What Changes

- Add a pure TypeScript match-3 engine: grid, swap validation, match detection, cascades and gravity, seedable RNG.
- Add a 5x5 board (bigger tap targets on a phone) and a refill that never completes a line of 3 by luck, so chains come from the player's own moves instead of random refills.
- Add cholesterol plaque: immobile, cannot be swapped, destroyed only by orthogonally adjacent matches. After a 3-move grace period a single block is seeded whenever the board is plaque-free, and plaque spreads to one neighbouring tile after every 2 moves that clear none (every move from a score of 2,000), until it is cleared or the artery is occluded.
- Add scoring: 30 points per match, 500 per cholesterol block cleared, cascade multipliers.
- Add game sessions: starting a game spends 1 life, the game ends when the artery is fully occluded with no legal moves, coins are awarded and `game.finished` is emitted.
- Add a brag card: a shareable PNG of the score; sharing awards 1 life.
- Integration duties (Jolo): maintain `base/scaffold`, merge into `integration` with Kiro, deploy to Amplify, test install on devices.
- Out of scope (stretch only): power-up tiles, PvP, lootboxes.

## Impact

- Affected specs: match-engine, obstacles, scoring, game-session, brag-card (all new).
- Affected code: `src/features/artery-match/` only (plus `base/scaffold` maintenance).
- Uses `useLives()` to spend a life and `useCoins()` to award coins. Emits `game.finished` and `share.completed`.
- Owner: Jolo. Branch: `feat/artery-match`.
