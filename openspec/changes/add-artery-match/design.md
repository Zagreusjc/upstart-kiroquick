## Context

Owner: Jolo. Game name in the UI: **Arteria Match**. Code lives only in `src/features/artery-match/`; shared code is imported only from `../../core`. `src/core/` is not changed by this change. Anything needed from other features or the core that does not exist yet is behind a local adapter with a clearly marked `TODO(integration)` placeholder.

## Decisions

### Board and rendering
- 6 columns x 6 rows by default (engine accepts `rows`/`cols` options for tests). Changed from 8x8: the same board width now holds 6 tiles, so each tap target is about a third larger, and 36 cells make plaque spread readable within a short demo round.
- SVG tiles in a CSS grid (`repeat(cols, minmax(0, 1fr))`, square cells), so the board keeps its full width at any column count. Animations use `transform` and `opacity` transitions only. No canvas for the board.
- Input: pointer events. Tap-tap (select, then tap an orthogonal neighbour) and drag (swap once the pointer moves more than 40% of a tile in one axis). The tile size for the drag threshold is the measured width of the pressed cell button; if that measures 0 (jsdom), it falls back to board width / cols.
- Plaque coverage: a visible "Plaque: N%" text next to score and moves (blocks / cells, rounded). The first time plaque appears in a game, a visible text hint "Plaque is spreading! Match next to it to clear it." shows until the next successful move.
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
spreadInterval(score: number): number   // 2 below 2000, 1 at 2000+
countCholesterol(board: Board): number
```
- `spawnChance` and the `SPAWN_*` constants are removed: refill never creates cholesterol.
- `GameState` is immutable and holds `board`, `score`, `rngState`, `moves`, `cholesterolCleared`, `maxCascade`, `over`, plus `cleanMoves` (consecutive resolved moves that destroyed no block) and `movesWithoutPlaque` (consecutive resolved moves that ended with zero blocks on the board). Both start at 0.
- `trySwap` resolves all cascades in one call and returns ordered events for the UI to replay: `swap`, `match { cells, points, wave, multiplier }`, `cholesterolCleared { cells, points }`, `fall`, `refill { spawned }`, then at most one of `plaqueSeeded { cell, board }` or `plaqueSpread { from, to, board }`, then `gameOver`.

### RNG
- mulberry32. Its single uint32 state lives in `GameState.rngState` so the same seed and moves always reproduce the same game.

### Matching and scoring
- A match is 3 or more identical normal tiles in a row or column. Cells shared by intersecting runs (L, T) are counted once.
- Base points: 10 per cleared tile (30 for a 3-match, 40 for 4, 50 for 5).
- Wave multiplier: the player's move is wave 1 (1x); automatic cascades are 2x, 3x, then 4x for every later wave.
- Cholesterol: 500 per block destroyed, multiplied by the multiplier of the wave that destroyed it.
- Callouts: wave depth 2 shows "Good Flow", depth 3 or more shows "Optimal Flow!". Callouts are visible text, never sound only.

### Cholesterol (spreading plaque)
Modelled on the spreading "chocolate" obstacle in Candy Crush (reference only, never named in the UI): plaque grows from one block like an infection and is only cleared by matching right next to it. This replaces the earlier per-refill spawn chance (3% to 10%, cap 6,000), which scattered blocks randomly and never felt like a growing threat.

- Start board: never contains cholesterol. Refill never creates cholesterol.
- Grace period: no cholesterol during the first 3 player moves (`GRACE_MOVES = 3`). Grace gates seeding only; real games cannot have blocks before then.
- Seeding (the "fountain"): after each resolved move, `movesWithoutPlaque` becomes `movesWithoutPlaque + 1` if the board has zero blocks, else 0. If the board has zero blocks, `moves > 3` and `movesWithoutPlaque >= 2` (`SEED_DELAY_MOVES = 2`), one seed is placed and `movesWithoutPlaque` resets to 0. So the first seed appears at the end of move 4 at the earliest, and after the last block is destroyed in move k the next seed appears at the end of move k+1.
- Seed cell: the normal cells in row-major order are the candidates. One RNG draw picks a start index; candidates are tried from there, wrapping around, and the first whose conversion still leaves a legal move wins. If none does, the drawn cell is used and the loss rule applies.
- Spread: after each resolved move, `cleanMoves` is 0 if the move destroyed at least one block, else `cleanMoves + 1`. If the board then has zero blocks, `cleanMoves` is set to 0 (nothing to count). If blocks exist and `cleanMoves >= spreadInterval(score)` (score after the move), one spread is attempted and `cleanMoves` resets to 0 whether or not a tile could be converted.
- Spread choice: the blocks that have at least one normal orthogonal neighbour, row-major, are candidates; one RNG draw picks the block, a second draw picks among its normal neighbours in the order up, right, down, left. That tile becomes cholesterol. If no block has a normal neighbour, nothing spreads (no draws).
- `spreadInterval(score)`: 2 clean moves while score < 2,000, then 1 (spreads every clean move) at 2,000+. Timing rationale: the reference obstacle spreads one cell on every move that clears none, but on a 6x6 board (36 cells) that covers the board within about a dozen ignored moves, too fast for a first round. Every 2 clean moves gives new players breathing room; at 2,000 points (about 4 cleared blocks, or a strong cascade player) it escalates to every move, so plaque pressure grows with skill and rounds stay short for the demo.
- Seeding and spreading happen at most once per player move (one or the other, never both), after all cascades of that move resolve. Converted cells become cholesterol, which never matches, and the board was stable before, so a seed or spread cannot create a match; nothing is auto-resolved afterwards. Converted cells get a fresh tile id so the UI animates them in.
- Destroyed only when a cell orthogonally adjacent to it is cleared by a match in that wave. Diagonals do not count. 500 points times the wave multiplier, counted in `cholesterolCleared`.
- Immobile: never swappable, never part of a match, and does not fall. Gravity treats blocks as fixed: in each column, normal tiles fall into the empty non-cholesterol cells below them, passing over blocks, and refill fills the remaining empty cells (which can sit below a block). This "tiles pass over plaque" rule is a simplification: real plaque would dam the flow, but blocking the column would strand empty cells and need a second refill path.
- All seed and spread draws come from the mulberry32 stream in `GameState.rngState`, continuing after the refill draws of the same move.

### Start board and loss
- Generation fills cells in order and rerolls any tile that would complete a match. If the finished board has no legal move, generation repeats with the advanced RNG.
- Legal swap: two orthogonally adjacent cells, both normal tiles (not cholesterol), where the swap creates at least one match.
- Loss: after a move resolves (including its seed or spread), if no legal swap exists the game is over and the UI shows "Complete Arterial Occlusion". No reshuffle. A board fully covered with plaque is one case of this.

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

- Refill test seam: `trySwapWith(state, a, b, refill)` takes a `RefillSource` whose `next()` returns a normal tile type (one RNG draw per tile); `trySwap` uses `rngRefill(state.rngState)`. Tests script exact cascade chains with `scriptedRefill(types, rngState?)` (test-only helper, not in the barrel); its `state()` seeds the plaque draws that follow the refill.
- Plaque step: `engine/plaque.ts` holds the pure `seedPlaque`, `spreadPlaque` and `resolvePlaque` functions, unit-tested on hand-built boards with explicit RNG states, and `trySwapWith` calls `resolvePlaque` once after the cascade loop.
- Board snapshots in events: the `swap` and `refill` events carry the board after that step, so the UI replays frames (swap, clearing cells per wave, refill) without engine logic of its own. `stepMs = 0` or `prefers-reduced-motion` applies the final board instantly.
- `maxCascade` is the largest number of waves resolved in one move (1 = no cascade).
- Share reward: 1 life only after a share promise resolves, and at most one share life per finished game (store guard keyed by game id). Cancel (`AbortError`), other errors and the download-only fallback award nothing.
- The brag card PNG is generated when the game over panel mounts, so the share tap calls `navigator.share` inside the user activation. The Share button stays disabled until the card is ready.
- Coins are awarded with idempotency key `game_score:${gameId}`, and `game.finished` is emitted from the move's handler or store timer callback (never an effect), guarded by the store's finished game id, so StrictMode cannot double-award.
- The 0-lives message follows the game-session spec: "Earn lives by reading a library card, sharing your Arteria Match brag card, or staying active." (`adapters.ts`, `TODO(integration)` to confirm with Prime and CJ).
- Touch targets: 6 columns on a 360px screen give cells of about 50px, above the 44px guideline (8 columns gave about 41px). All other buttons are at least 44px tall.
- `game.finished` adapter: core types the payload as `{ score, cholesterolCleared }`. `adapters.ts` emits the full `{ score, coins, moves, cholesterolCleared, maxCascade }` as `EventMap['game.finished'] & GameFinishedExtras`, with `TODO(integration)` for Jolo to widen `EventMap` on `base/scaffold`.

## Manual checks (phone)

- [ ] Tap-tap swap and drag swap both work; a drag does not also trigger a tap (also covered in jsdom by the pointer-drag test in `Game.test.tsx`).
- [ ] Fall and fade animations are smooth on a low-end phone.
- [ ] A cascade of 3 or more shows "Optimal Flow!" (2 shows "Good Flow").
- [ ] A match next to a cholesterol block clears it and adds 500 x multiplier.
- [ ] The 6x6 board fills the screen width; tiles are easy to tap and drag.
- [ ] The first plaque block appears around move 4 with the "Plaque is spreading!" hint; ignoring it makes it grow by one neighbour every 2 moves; "Plaque: N%" updates.
- [ ] Starting a game spends 1 life; at 0 lives the start is blocked with the earn-lives message.
- [ ] Game over shows "Complete Arterial Occlusion", score and coins earned.
- [ ] Share opens the share sheet with the PNG on Android Chrome and iOS Safari, and awards 1 life.
- [ ] On desktop Firefox (no file share) the PNG downloads and no life is awarded.
- [ ] "Add to Home Screen" installs the PWA and the game runs from the icon.
- [ ] Switch to another tab mid-game and back: the same board, score and moves return, and no extra life is spent.

## Verification (6x6 board and spreading plaque)

Run on Windows from the repo root on `feat/artery-match`:

- `npm run lint`: exit 0, no warnings.
- `npx vitest run`: 23 files, 145 tests passed (artery-match alone: 16 files, 120 tests). New: `engine/plaque.test.ts` (spread interval, seeding with legal-move preference and fallback, orthogonal-only spread, no room to spread, grace, first seed, re-seed, spread timing, destruction reset, determinism), plaque integration and fixed-block gravity in `engine/resolve.test.ts`, first seed at move 4 and refill-never-cholesterol in `engine/determinism.test.ts`, 6x6 default in `engine/board.test.ts`, and in `Game.test.tsx` the 36-cell board, "Plaque: N%", the once-per-game plaque hint and the tile-size drag threshold. The old `spawnChance` tests are removed.
- `npm run build`: exit 0 (`tsc --noEmit` and `vite build`).
- `openspec validate add-artery-match --strict`: "Change 'add-artery-match' is valid".
- `git diff --name-only origin/base/scaffold`: only paths under `src/features/artery-match/` and `openspec/changes/add-artery-match/`.
