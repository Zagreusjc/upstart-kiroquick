## 1. Specs
- [x] 1.1 Refine `design.md` and validate the specs in this change

## 2. Engine (pure TypeScript, tests first)
- [x] 2.1 Seedable RNG and board generation with no initial matches and at least one legal move
- [x] 2.2 Swap validation and match detection (rows and columns of 3 or more)
- [x] 2.3 Clear, gravity, refill and cascades with multipliers
- [x] 2.4 Cholesterol spawn with escalating chance (3% to 10%), immobility and adjacent destruction
- [x] 2.5 Legal-move detection and the occlusion loss condition
- [x] 2.6 Scoring: 30 per match, 500 per cholesterol cleared, cascade multipliers

## 3. Game UI
- [x] 3.1 Board with four tile shapes (red blood cell, white blood cell, platelet, plasma) and the cholesterol block
- [x] 3.2 Touch swap (tap-tap and drag) with simple animations
- [x] 3.3 Score display and callouts for big combos

## 4. Session and economy wiring
- [x] 4.1 Start game spends 1 life via `useLives()`; block start at 0 lives with a helpful message
- [x] 4.2 Game over screen: award coins via `useCoins()` and emit `game.finished`

## 5. Brag card
- [x] 5.1 Canvas PNG with the score and the challenge text
- [x] 5.2 Share through Web Share (with files when supported); award 1 life and emit `share.completed`; download fallback

## 6. Integration and deploy (Jolo)
- [ ] 6.1 Maintain `base/scaffold`; announce updates
- [ ] 6.2 Merge branches into `integration` with Kiro in order Prime, CJ, Jolo, Ralph; run the smoke checklist
- [ ] 6.3 Deploy to Amplify; test "Add to Home Screen" on every teammate's phone

## 7. Finish
- [x] 7.1 Lint, tests and build pass
- [ ] 7.2 Demo on a phone: play a round, clear cholesterol, lose a life, share the brag card
