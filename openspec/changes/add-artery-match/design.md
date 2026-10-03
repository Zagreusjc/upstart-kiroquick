## Context

Owner: Jolo. Game name in the UI: **Arteria Match**. Code lives only in `src/features/artery-match/`; shared code is imported only from `../../core`. `src/core/` is not changed by this change. Anything needed from other features or the core that does not exist yet is behind a local adapter with a clearly marked `TODO(integration)` placeholder.

## Decisions

### Board and rendering
- 8 columns x 8 rows (engine accepts `rows`/`cols` options for tests).
- SVG tiles in a CSS grid. Animations use `transform` and `opacity` transitions only. No canvas for the board.
- Input: pointer events. Tap-tap (select, then tap an orthogonal neighbour) and drag (swap once the pointer moves more than 40% of a tile in one axis).
- Keyboard: `role="grid"` > `role="row"` > `role="gridcell"` with a roving tabindex, so the board is one tab stop. Arrow keys move focus between cells (clamped at the edges); Enter/Space activates the cell button, which runs the same tap-tap handler as a pointer tap.
- Screen readers: the visible score updates every playback frame and is not a live region. A visually hidden `aria-live="polite"` region announces "Score after move N: S" once per finished move.

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
- Starting a game spends 1 life via `useLives()` from `../../core`. At 0 lives the start is blocked with a message explaining how to earn lives (read a library card, share a brag card, stay active), as the game-session spec requires.
- Coins by score band, source `game_score`, capped at 30 per game: below 300 → 0, 300+ → 5, 1,000+ → 10, 2,500+ → 20, 5,000+ → 30. The bands are a local constant and should be confirmed with Prime's economy at integration.
- Game over emits `game.finished` with `{ score, coins, moves, cholesterolCleared, maxCascade }` through the core event bus.
- The live session (resolved engine state, on-screen board, phase, share status, the per-game "coins awarded" and "share life awarded" guards, and all playback timers) lives in a module-level store, `sessionStore.ts`, read through `useSyncExternalStore` in `useGameSession`. `App.tsx` mounts `/play` as a route element, so a bottom-nav tab switch unmounts the screen, but the store keeps the game: returning to Play resumes the same board, score and moves (or the game-over panel). No life is spent on resume; only the Play / Play again handler spends 1 life.
- Playback timers belong to the store and are not cleared on unmount. If the player leaves while the final move is still playing back, the last timer still runs `finishMove`, which awards coins and emits `game.finished` from the store, exactly once per game id. StrictMode double-mount runs no store action (all actions are called from handlers or store timers, never from effects), so it cannot double-spend a life or double-award coins.
- The session lasts for the page lifetime only; a full reload starts at the idle screen, as before.

### Brag card
- 1080x1080 canvas exported as PNG, showing the score, "Arteria Match" and a challenge line.
- If `navigator.canShare({ files })` is true, the PNG is shared as a file. Otherwise text and URL are shared when `navigator.share` exists, and the PNG is downloaded.
- 1 life is awarded and `share.completed` emitted only when a share promise resolves. A cancelled share (`AbortError`) or the download-only fallback awards nothing (prevents farming).
- If the PNG could not be generated (`makeCard` rejected) and there is no Web Share, or the text share fails, the outcome is `unavailable`: nothing is downloaded, nothing is awarded, and the panel says "Brag card image unavailable. Nothing was shared." instead of claiming a download.

## Risks

- Deadlock start boards: covered by generation retries and seeded tests.
- Animation complexity: ship simple fall and fade transitions first.
- Touch input: test drag and tap-tap on a real phone.
- Core API mismatch: if a needed core export is missing, use a local adapter with a `TODO(integration)` note instead of editing `src/core/`.

## Implementation notes

- Refill test seam: `trySwapWith(state, a, b, refill)` takes a `RefillSource`; `trySwap` uses `rngRefill(state.rngState)`. Tests script exact cascade chains with `scriptedRefill` (test-only helper, not in the barrel).
- Board snapshots in events: the `swap` and `refill` events carry the board after that step, so the UI replays frames (swap, clearing cells per wave, refill) without engine logic of its own. `stepMs = 0` or `prefers-reduced-motion` applies the final board instantly.
- `maxCascade` is the largest number of waves resolved in one move (1 = no cascade).
- Share reward: 1 life only after a share promise resolves, and at most one share life per finished game (store guard keyed by game id). Cancel (`AbortError`), other errors and the download-only fallback award nothing.
- The brag card PNG is generated when the game over panel mounts, so the share tap calls `navigator.share` inside the user activation. The Share button stays disabled until the card is ready.
- Coins are awarded with idempotency key `game_score:${gameId}`, and `game.finished` is emitted from the move's handler or store timer callback (never an effect), guarded by the store's finished game id, so StrictMode cannot double-award.
- The 0-lives message follows the game-session spec: "Earn lives by reading a library card, sharing your Arteria Match brag card, or staying active." (`adapters.ts`, `TODO(integration)` to confirm with Prime and CJ).
- Touch targets: 8 columns on a 360px screen give cells of about 41px, slightly under the 44px guideline. Accepted for the board; drag input mitigates it. All other buttons are at least 44px tall.
- `game.finished` adapter: core types the payload as `{ score, cholesterolCleared }`. `adapters.ts` emits the full `{ score, coins, moves, cholesterolCleared, maxCascade }` as `EventMap['game.finished'] & GameFinishedExtras`, with `TODO(integration)` for Jolo to widen `EventMap` on `base/scaffold`.

## Manual checks (phone)

- [ ] Tap-tap swap and drag swap both work; a drag does not also trigger a tap (also covered in jsdom by the pointer-drag test in `Game.test.tsx`).
- [ ] Fall and fade animations are smooth on a low-end phone.
- [ ] A cascade of 3 or more shows "Optimal Flow!" (2 shows "Good Flow").
- [ ] A match next to a cholesterol block clears it and adds 500 x multiplier.
- [ ] Starting a game spends 1 life; at 0 lives the start is blocked with the earn-lives message.
- [ ] Game over shows "Complete Arterial Occlusion", score and coins earned.
- [ ] Share opens the share sheet with the PNG on Android Chrome and iOS Safari, and awards 1 life.
- [ ] On desktop Firefox (no file share) the PNG downloads and no life is awarded.
- [ ] "Add to Home Screen" installs the PWA and the game runs from the icon.
- [ ] Switch to another tab mid-game and back: the same board, score and moves return, and no extra life is spent.

## Verification (review fixes: session store, share outcome, board keyboard, drag tests)

Run on Windows from the repo root on `feat/artery-match`:

- `npm run lint`: exit 0, no warnings.
- `npx vitest run`: 22 files, 122 tests passed (before the fixes: 22 files, 114 tests). New: 2 share outcome tests in `brag/share.test.ts`; in `Game.test.tsx` the unavailable-image panel, the per-move score announcement, the pointer drag (exactly one swap past 0.4 tiles, trailing click ignored; a mutation that drops the click suppression fails it), arrow-key navigation with Enter/Space swap, resume after unmount, and the award-once-after-unmount-mid-playback case.
- `npm run build`: exit 0 (`tsc --noEmit` and `vite build`).
- `openspec validate add-artery-match --strict`: "Change 'add-artery-match' is valid".
- `git diff --name-only origin/base/scaffold`: only paths under `src/features/artery-match/` and `openspec/changes/add-artery-match/`.
