## 1. Specs
- [x] 1.1 Refine `design.md` with the mood threshold table and streak milestones, and put the numbers in the spec scenarios
- [x] 1.2 Validate the change (`openspec` CLI not installed; format checked by hand: every requirement uses SHALL and has at least one scenario)

## 2. Mood rules (pure logic)
- [x] 2.1 Write failing tests from the mood scenarios (`mood.test.ts`)
- [x] 2.2 Implement `goalsMet` and `computeMood(snapshot, checkin, today)` as pure functions
- [x] 2.3 Implement Rest Mode entry (2 or more days since the last check-in) and exit (check in today)

## 3. Health input and provider
- [x] 3.1 Sliders for steps, sleep and activity, labeled "Demo input"
- [x] 3.2 Implement and register the real `HealthProvider` (persist, clamp, keep previous on invalid, stable snapshot, subscribe)

## 4. Baboo UI
- [x] 4.1 SVG heart with four expressions and a visible state label
- [x] 4.2 Home screen showing Baboo, today's snapshot and the mood message; disclaimer at the bottom of the snapshot card
- [x] 4.3 Main menu at `/home` (Baboo screen moves to `/home/baboo`) with buttons to every tab and Baboo's live mood (`components/MainMenu.tsx`, `MainMenu.test.tsx`)
- [ ] 4.4 Check the main menu on a phone at 360px

## 5. Check-in and streak
- [x] 5.1 Write failing tests, then streak logic (pure): increment, reset after a missed day, month boundary, milestones 3/7/14/30
- [x] 5.2 Check-in button awards 10 coins with `dayKey('checkin', 'daily')`, pays the milestone bonus with source `streak`, emits `checkin.done`
- [x] 5.3 Demo day controls (Next day, Skip 2 days, Reset demo days)

## 6. Onboarding
- [x] 6.1 First-run flow with consent checkbox and the disclaimer
- [x] 6.2 Persist the first-run flag; do not show it again

## 7. Kiro evidence and pitch pack
- [ ] 7.1 Make sure `.kiro/steering`, `.kiro/hooks` and OpenSpec changes are visible and used; capture screenshots (checklist in `pitch/KIRO-EVIDENCE.md`)
- [x] 7.2 Write the 2-minute pitch script and a Q&A bank (semis)
- [x] 7.3 Write the finals feasibility pack: PH Data Privacy Act, clinic voucher validation flow, pilot path (barangay health center or one HMO), why clinics and HMOs participate, scale to hypertension and diabetes
- [ ] 7.4 Record a backup demo video

## 8. Finish
- [x] 8.1 Lint, tests and build pass
- [ ] 8.2 Demo on a phone: change the sliders and watch Baboo's mood change; check in and see the streak and coins update

## Scenario coverage

| Spec | Scenario | Covered by |
|---|---|---|
| babu-companion | Good day, No sleep, Short sleep, Too much sleep, No movement, Partial day, Just below every target, Low day, New player, Same input | `mood.test.ts` |
| babu-companion | Sliders show the effect | `Screen.test.tsx` |
| babu-companion | Player away, Rest Mode wins, Checked in yesterday, Return from Rest Mode | `mood.test.ts`, `Screen.test.tsx` |
| babu-companion | State label | `Screen.test.tsx` |
| health-input | Out-of-range, Invalid number, Persistence, Stable snapshot | `healthProvider.test.ts` |
| health-input | Update values, Demo label, Persistence | `Screen.test.tsx` |
| daily-streak | All rule scenarios | `streak.test.ts`, `store.test.ts` |
| daily-streak | First check-in, Second tap, Next day, Milestone bonus, Displayed streak | `store.test.ts`, `Screen.test.tsx` |
| onboarding | First launch, Completed onboarding, Consent required, Home content | `Screen.test.tsx`, `store.test.ts` |
| all | Works on a 360px phone with touch | Manual check (8.2) |
