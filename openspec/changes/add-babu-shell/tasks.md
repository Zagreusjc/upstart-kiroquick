## 1. Specs
- [x] 1.1 Refine `design.md` with the mood threshold table and streak milestones, and put the numbers in the spec scenarios
- [ ] 1.2 Validate the change (`openspec validate add-babu-shell --strict` if the CLI is available, otherwise check the format by hand)

## 2. Mood rules (pure logic)
- [ ] 2.1 Write failing tests from the mood scenarios (`mood.test.ts`)
- [ ] 2.2 Implement `goalsMet` and `computeMood(snapshot, checkin, today)` as pure functions
- [ ] 2.3 Implement Rest Mode entry (2 or more days since the last check-in) and exit (check in today)

## 3. Health input and provider
- [ ] 3.1 Sliders for steps, sleep and activity, labeled "Demo input"
- [ ] 3.2 Implement and register the real `HealthProvider` (persist, clamp, keep previous on invalid, stable snapshot, subscribe)

## 4. Babu UI
- [ ] 4.1 SVG heart with four expressions and a visible state label
- [ ] 4.2 Home screen showing Babu, today's snapshot, the mood message and the disclaimer

## 5. Check-in and streak
- [ ] 5.1 Write failing tests, then streak logic (pure): increment, reset after a missed day, month boundary, milestones 3/7/14/30
- [ ] 5.2 Check-in button awards 10 coins with `dayKey('checkin', 'daily')`, pays the milestone bonus with source `streak`, emits `checkin.done`
- [ ] 5.3 Demo day controls (Next day, Skip 2 days, Reset demo days)

## 6. Onboarding
- [ ] 6.1 First-run flow with consent checkbox and the disclaimer
- [ ] 6.2 Persist the first-run flag; do not show it again

## 7. Kiro evidence and pitch pack
- [ ] 7.1 Make sure `.kiro/steering`, `.kiro/hooks` and OpenSpec changes are visible and used; capture screenshots
- [ ] 7.2 Write the 2-minute pitch script and a Q&A bank (semis)
- [ ] 7.3 Write the finals feasibility pack: PH Data Privacy Act, clinic voucher validation flow, pilot path (barangay health center or one HMO), why clinics and HMOs participate, scale to hypertension and diabetes
- [ ] 7.4 Record a backup demo video

## 8. Finish
- [ ] 8.1 Lint, tests and build pass
- [ ] 8.2 Demo on a phone: change the sliders and watch Babu's mood change; check in and see the streak and coins update
