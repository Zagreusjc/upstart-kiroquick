## 1. Specs and content
- [ ] 1.1 Refine `design.md` and validate the specs in this change
- [ ] 1.2 Use Quick Research to draft 8 to 10 CVD cards with cited sources
- [ ] 1.3 Review each card for accuracy and plain language

## 2. Coins ledger (provider)
- [ ] 2.1 Write failing tests for earn, idempotency, spend and bounds
- [ ] 2.2 Implement the `CoinsProvider` with persistence
- [ ] 2.3 Register it from `register(api)` and confirm the header balance updates

## 3. Lives (provider)
- [ ] 3.1 Write failing tests for start value, bounds and refill
- [ ] 3.2 Implement the `LivesProvider` with persistence
- [ ] 3.3 Register it and confirm the header shows the real value
- [ ] 3.4 Refill from health: steps and sleep thresholds, once per day

## 4. Library
- [ ] 4.1 Library list screen and card detail screen with source links
- [ ] 4.2 First read awards coins and a life once; emit `library.read`
- [ ] 4.3 Read/unread state persisted

## 5. Milestones and sharing
- [ ] 5.1 Milestone tier logic (pure function, tested) and screen
- [ ] 5.2 Share-for-life with Web Share API and clipboard fallback; emit `share.completed`

## 6. Quick platform duty
- [ ] 6.1 Load the cards into Quick Index and capture a grounded, cited Q&A for the demo
- [ ] 6.2 Save screenshots for the pitch

## 7. Finish
- [ ] 7.1 Lint, tests and build pass
- [ ] 7.2 Demo on a phone: read 3 cards, unlock the tier, share for a life
