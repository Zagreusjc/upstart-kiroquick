## Context

Owner: Prime. This feature owns the shared economy (coins + lives) that every
other feature uses, plus the CVD library, milestone tiers and share-for-life.
Code lives only in `src/features/economy-library/`. It registers the real
`coins` and `lives` providers through `register(api)` and talks to other
features only through providers and the typed event bus.

## Decisions

### Storage keys and shapes

All keys use the `inlababu.` prefix and a `.v1` version suffix, persisted via
`loadJSON` / `saveJSON` from `../../core`. The real providers use their own keys
(distinct from the `inlababu.stub.*` keys the stubs use) so a device that ran on
stubs does not leak a stale balance into the real provider.

- `inlababu.coins.v1` -> `{ balance: number; keys: string[]; entries: LedgerEntry[] }`
  - `keys`: used idempotency keys, capped to the most recent 500.
  - `entries`: append-only ledger rows `{ source, amount, reason, at }`, capped
    to the most recent 200, kept for a transparent in-app history. The CSV
    export that Ralph builds reads the core event log, not this ledger, so the
    ledger is for the player's own view only.
- `inlababu.lives.v1` -> `{ lives: number; refills: Record<string, true> }`
  - `refills`: set of consumed once-per-day refill keys (for example
    `steps::2026-10-04`, `sleep::2026-10-04`, `library_read:card-hpn:2026-10-04`,
    `share::<shareId>`). Keeps steps/sleep to once per local day and each card's
    read-life to once ever.
- `inlababu.library.v1` -> `{ read: Record<string, number> }` (cardId -> epoch ms
  first read). Presence means "read"; used to gate first-read rewards.
- `inlababu.milestones.v1` -> `{ unlocked: Record<string, true> }` (tierId ->
  unlocked). Presence means the tier's `milestone` coins were already awarded.
- `inlababu.share.v1` -> `{ shares: string[] }` ids of completed shares, so a
  life is awarded at most once per completed share.

### Idempotency

Coins use `dayKey(source, subject)` -> `${source}:${subject}:${yyyy-mm-dd}` for
daily-repeatable earns, and a stable per-subject key for once-ever earns
(for example first card read uses `library_read:${cardId}:${todayISO}` — the
same key the lives refill uses, scoped per card per day; the library read-state
map guarantees once-ever even across days). Milestone coins use the tier id as a
stable key `milestone:${tierId}` so the tier awards coins exactly once.

### Lives refill from health (thresholds, once per day)

Read through `useHealth()` snapshot. Defaults, overridable in `lives.ts`:

- Steps target: `>= 8000` steps -> +1 life, once per local day (`steps::<day>`).
- Sleep target: `>= 7` hours -> +1 life, once per local day (`sleep::<day>`).

The feature subscribes to the health provider and evaluates the snapshot on each
change. Awards are clamped to `max` (3), so hitting a target at full lives is a
no-op but still marks the day consumed, matching the "refill cap" scenario.

### Card content format

TypeScript constant array `CARDS: LibraryCard[]` in `library.ts`. Each card:
`{ id, title, summary, body (string[] paragraphs), takeaway, sources: Source[], reviewed: string }`
where `Source = { label: string; url: string }`. Keeping it as typed data (not
JSON) gives compile-time safety and lets tests assert on it directly. 9 cards
curated with Quick Research (see task 1.2); every card has at least one cited
source and a `reviewed` date.

### Reward amounts (deterministic, no randomness)

- First card read: +5 coins (`library_read`) and +1 life (`library_read`), once.
- Share completed: +1 life (`share`). No coins, to keep sharing about lives.
- Milestone tiers award `milestone` coins once on unlock.

### Milestone tiers

Pure function `evaluateMilestones(readCount)` returns tier states with visible
progress. Tiers (by cards read):

1. `curious` — read 1 card — "You started learning" — +10 coins.
2. `screening-discount` — read 3 cards — "Unlock a screening discount" — +25 coins.
3. `heart-scholar` — read 6 cards — "Heart Scholar badge" — +50 coins.

Progress is always visible (for example "2 of 3"). Unlock is permanent via
`inlababu.milestones.v1`; re-reaching a tier never re-awards coins.

### Share flow

`shareApp()`: if `navigator.share` exists, call it with title/text/url and treat
a resolved promise as a completed share (reject / `AbortError` = cancelled, no
reward). Otherwise fall back to `navigator.clipboard.writeText(url)` and show a
confirmation. Either success path records the share id and awards 1 life once,
then emits `share.completed`. Never throws to the caller; never blocks the game.

## Risks

- Double-awarding coins or lives on repeat reads. Mitigated with idempotency
  keys from `dayKey()` and the persisted read-state / refill maps.
- Web Share API is unavailable on many desktop browsers. Clipboard fallback,
  and the UI never blocks on it.
- Medical content accuracy. Every card has a cited source and a `reviewed` date;
  card detail shows "Screening awareness, not a diagnosis".

## Open questions — resolved

- Which sources to cite? Use WHO and the American Heart Association (AHA) as the
  primary global clinical sources, with Philippine DOH where locally relevant
  (hypertension, salt). Confirmed against Quick Research output; each card lists
  its own source link(s). PhilHealth is referenced only for the screening/
  coverage context card, not for clinical claims.
