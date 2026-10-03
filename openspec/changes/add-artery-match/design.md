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
