## Context

Owner: Prime. Refine this file with Kiro before implementing. Keep it short.

## Decisions to make

- Ledger storage shape (balance plus a list of used idempotency keys, plus entries for export).
- How "steps" and "sleep" refill lives using the `health` provider (thresholds, once per day).
- Card content format (TypeScript constants or JSON) with a `sources` array per card.
- Milestone tier definitions and where progress is stored.
- Share flow: `navigator.share` with a clipboard fallback.

## Risks

- Double-awarding coins or lives on repeat reads. Mitigate with idempotency keys from `dayKey()`.
- Web Share API is not available on every desktop browser. Provide a fallback and never block the game.
- Medical content accuracy. Every card needs a cited source and a reviewed date.

## Open questions

- Which sources to cite (for example DOH, WHO, PhilHealth, AHA)? Confirm with Quick Research output.
