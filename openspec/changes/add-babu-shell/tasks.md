## 1. Specs
- [ ] 1.1 Refine `design.md` with the mood threshold table and validate the specs in this change

## 2. Mood rules (pure logic)
- [ ] 2.1 Write failing tests from the mood scenarios
- [ ] 2.2 Implement `computeMood(snapshot, lastCheckin)` as a pure function
- [ ] 2.3 Implement Rest Mode entry and exit rules

## 3. Health input and provider
- [ ] 3.1 Sliders or number inputs for steps, sleep and activity, labeled "demo input"
- [ ] 3.2 Implement and register the real `HealthProvider` (persist, clamp, subscribe)

## 4. Babu UI
- [ ] 4.1 SVG heart with four expressions
- [ ] 4.2 Home screen showing Babu, today's snapshot and the mood message

## 5. Check-in and streak
- [ ] 5.1 Streak logic (pure, tested): increment, reset after a missed day, bonus milestones
- [ ] 5.2 Check-in button awards coins with an idempotency key and emits `checkin.done`

## 6. Onboarding
- [ ] 6.1 First-run flow with consent and the disclaimer
- [ ] 6.2 Persist the first-run flag; do not show it again

## 7. Kiro evidence and pitch pack
- [ ] 7.1 Make sure `.kiro/steering`, `.kiro/hooks` and OpenSpec changes are visible and used; capture screenshots
- [ ] 7.2 Write the 2-minute pitch script and a Q&A bank (semis)
- [ ] 7.3 Write the finals feasibility pack: PH Data Privacy Act, clinic voucher validation flow, pilot path (barangay health center or one HMO), why clinics and HMOs participate, scale to hypertension and diabetes
- [ ] 7.4 Record a backup demo video

## 8. Finish
- [ ] 8.1 Lint, tests and build pass
- [ ] 8.2 Demo on a phone: change the sliders and watch Babu's mood change; check in and see the streak
