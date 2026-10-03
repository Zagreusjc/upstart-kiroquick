## Context

Owner: Jolo. Game name in the UI: **Arteria Match**. Code lives only in `src/features/artery-match/`; shared code is imported only from `../../core`. `src/core/` is not changed by this change. Anything needed from other features or the core that does not exist yet is behind a local adapter with a clearly marked `TODO(integration)` placeholder.

## Decisions

### Board and rendering
- 8 columns x 8 rows (engine accepts `rows`/`cols` options for tests).
- SVG tiles in a CSS grid. Animations use `transform` and `opacity` transitions only. No canvas for the board.
- Input: pointer events. Tap-tap (select, then tap an orthogonal neighbour) and drag (swap once the pointer moves more than 40% of a tile in one axis).

### Engine API (pure TypeScript, `engine/`, no React or DOM)
```ts
createGame(seed: number, opts?: { rows?: number; cols?: number }): GameState
trySwap(state: GameState, a: Cell, b: Cell):
  | { ok: false; reason: 'not-adjacent' | 'cholesterol' | 'no-match' | 'game-over' }
  | { ok: true; state: GameState; events: GameEvent[] }
hasLegalMove(state: GameState): boolean
findLegalMove(state: GameState): [Cell, Cell] | null
spawnChance(score: number): number
```
- `GameState` is immutable and holds `board`, `score`, `rngState`, `moves`, `cholesterolCleared`, `maxCascade`, `over`.
- `trySwap` resolves all cascades in one call and returns ordered events for the UI to replay: `swap`, `match { cells, points, wave, multiplier }`, `cholesterolCleared { cells, points }`, `fall`, `refill { spawned }`, `gameOver`.

### RNG
- mulberry32. Its single uint32 state lives in `GameState.rngState` so the same seed and moves always reproduce the same game.

### Matching and scoring
- A match is 3 or more identical normal tiles in a row or column. Cells shared by intersecting runs (L, T) are counted once.
- Base points: 10 per cleared tile (30 for a 3-match, 40 for 4, 50 for 5).
- Wave multiplier: the player's move is wave 1 (1x); automatic cascades are 2x, 3x, then 4x for every later wave.
- Cholesterol: 500 per block destroyed, multiplied by the multiplier of the wave that destroyed it.
- Callouts: wave depth 2 shows "Good Flow", depth 3 or more shows "Optimal Flow!". Callouts are visible text, never sound only.

### Cholesterol
- Destroyed when any cell orthogonally adjacent to it is cleared by a match in that wave. Diagonals do not count.
- Never swappable and never part of a match. It falls with gravity like other tiles.
- Spawns only on refill, never on the start board. Each refilled cell rolls `spawnChance(score)` using the score at the start of the refill.
- `spawnChance(score) = 0.03 + 0.07 * min(max(score, 0), 6000) / 6000`. The cap score is **6,000** (blocks are worth 500, so a 10,000 cap would rarely be reached).

### Start board and loss
- Generation fills cells in order and rerolls any tile that would complete a match. If the finished board has no legal move, generation repeats with the advanced RNG.
- Legal swap: two orthogonally adjacent cells, both normal tiles (not cholesterol), where the swap creates at least one match.
- Loss: after a move resolves, if no legal swap exists the game is over and the UI shows "Complete Arterial Occlusion". No reshuffle.

### Session and economy
- Starting a game spends 1 life via `useLives()` from `../../core`. At 0 lives the start is blocked with a message explaining how to earn lives (share a brag card, daily check-in).
- Coins by score band, source `game_score`, capped at 30 per game: below 300 → 0, 300+ → 5, 1,000+ → 10, 2,500+ → 20, 5,000+ → 30. The bands are a local constant and should be confirmed with Prime's economy at integration.
- Game over emits `game.finished` with `{ score, coins, moves, cholesterolCleared, maxCascade }` through the core event bus.

### Brag card
- 1080x1080 canvas exported as PNG, showing the score, "Arteria Match" and a challenge line.
- If `navigator.canShare({ files })` is true, the PNG is shared as a file. Otherwise text and URL are shared when `navigator.share` exists, and the PNG is downloaded.
- 1 life is awarded and `share.completed` emitted only when a share promise resolves. A cancelled share (`AbortError`) or the download-only fallback awards nothing (prevents farming).

## Risks

- Deadlock start boards: covered by generation retries and seeded tests.
- Animation complexity: ship simple fall and fade transitions first.
- Touch input: test drag and tap-tap on a real phone.
- Core API mismatch: if a needed core export is missing, use a local adapter with a `TODO(integration)` note instead of editing `src/core/`.

## Implementation notes

- Refill test seam: `trySwapWith(state, a, b, refill)` takes a `RefillSource`; `trySwap` uses `rngRefill(state.rngState)`. Tests script exact cascade chains with `scriptedRefill` (test-only helper, not in the barrel).
- Board snapshots in events: the `swap` and `refill` events carry the board after that step, so the UI replays frames (swap, clearing cells per wave, refill) without engine logic of its own. `stepMs = 0` or `prefers-reduced-motion` applies the final board instantly.
- `maxCascade` is the largest number of waves resolved in one move (1 = no cascade).
- Share reward: 1 life only after a share promise resolves, and at most one share life per finished game (ref keyed by game id). Cancel (`AbortError`), other errors and the download-only fallback award nothing.
- The brag card PNG is generated when the game over panel mounts, so the share tap calls `navigator.share` inside the user activation. The Share button stays disabled until the card is ready.
- Coins are awarded with idempotency key `game_score:${gameId}`, and `game.finished` is emitted from the move's handler or timer callback (never an effect), guarded by a ref, so StrictMode cannot double-award.
- The 0-lives message follows the game-session spec: "Earn lives by reading a library card, sharing your Arteria Match brag card, or staying active." (`adapters.ts`, `TODO(integration)` to confirm with Prime and CJ).
- Touch targets: 8 columns on a 360px screen give cells of about 41px, slightly under the 44px guideline. Accepted for the board; drag input mitigates it. All other buttons are at least 44px tall.
- `game.finished` adapter: core types the payload as `{ score, cholesterolCleared }`. `adapters.ts` emits the full `{ score, coins, moves, cholesterolCleared, maxCascade }` as `EventMap['game.finished'] & GameFinishedExtras`, with `TODO(integration)` for Jolo to widen `EventMap` on `base/scaffold`.

## Manual checks (phone)

- [ ] Tap-tap swap and drag swap both work; a drag does not also trigger a tap.
- [ ] Fall and fade animations are smooth on a low-end phone.
- [ ] A cascade of 3 or more shows "Optimal Flow!" (2 shows "Good Flow").
- [ ] A match next to a cholesterol block clears it and adds 500 x multiplier.
- [ ] Starting a game spends 1 life; at 0 lives the start is blocked with the earn-lives message.
- [ ] Game over shows "Complete Arterial Occlusion", score and coins earned.
- [ ] Share opens the share sheet with the PNG on Android Chrome and iOS Safari, and awards 1 life.
- [ ] On desktop Firefox (no file share) the PNG downloads and no life is awarded.
- [ ] "Add to Home Screen" installs the PWA and the game runs from the icon.
