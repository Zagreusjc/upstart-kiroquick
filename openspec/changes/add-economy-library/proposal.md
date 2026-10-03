## Why

Every other feature depends on one shared economy: lives to play, coins to redeem, and a reason to learn. Without it the Track, Play, Redeem loop has no currency. The library also delivers the "Awareness" goal with cited cardiovascular content, and the reward tiers replace lootboxes with transparent milestones.

## What Changes

- Add a coins ledger with idempotent earning and safe spending, registered as the real `coins` provider.
- Add a lives system (start 3, max 3), registered as the real `lives` provider, with refills from reading, sharing, steps and sleep.
- Add a library of 8 to 10 cited CVD cards. First read of a card awards coins and a life once.
- Add transparent milestone tiers (for example "read 3 modules to unlock a screening discount").
- Add share-for-life via the Web Share API (WhatsApp, Facebook).
- Platform duty (Quick): use Quick Research to curate the cited card content and Quick Index for a grounded Q&A demo shown inside Quick.

## Impact

- Affected specs: coins-ledger, lives, library, milestones, sharing (all new).
- Affected code: `src/features/economy-library/` only. Registers `coins` and `lives` providers through `register(api)`.
- Emits events: `library.read`, `share.completed`. Consumed by: Jolo (lives, coins on game end), CJ (coins on streak), Ralph (coins on vouchers).
- Owner: Prime. Branch: `feat/economy-library`.
