## 1. Specs and data
- [x] 1.1 Refine `design.md` and validate the specs in this change (`openspec` CLI not installed; checked by hand: every requirement has a scenario)
- [ ] 1.2 Source and cite the WHO non-lab CVD risk chart tables; record edition and link (source and edition recorded; cell values not yet transcribed, so the simplified screen ships)
- [x] 1.3 Create seeded clinics JSON (16 entries, illustrative) and medical missions JSON (8 entries)

## 2. Risk survey (pure logic first)
- [x] 2.1 Tests using reference cases checked against the source table (`logic/risk.test.ts`)
- [x] 2.2 Implement `assessRisk(input)` returning a band and message
- [x] 2.3 Survey form with validation, result screen with the disclaimer and a link to nearby clinics; emit `risk.assessed`
- [x] 2.4 Survey reward: 20 coins and 1 life, once a day

## 3. Clinic finder and missions
- [x] 3.1 Haversine distance and sort (tested) with a manual city fallback
- [x] 3.2 Leaflet map (lazy loaded) with markers and a list view
- [x] 3.3 Medical initiatives list with filters (organizer level, city, date window)
- [x] 3.4 Clinic cards open booking link and appointment number; public / private filter

## 4. Vouchers
- [x] 4.1 Voucher model and rules (pure, tested): cost, expiry, one-time use
- [x] 4.2 Redeem screen: spend coins through the coins provider, issue a voucher, show a QR code; emit `voucher.issued`
- [x] 4.3 `/care/verify` clinic page to check a code and mark it redeemed; emit `voucher.redeemed`; reject expired or used codes

## 5. Partner export and Quick Sight
- [x] 5.1 CSV export from the event log plus a synthetic seed dataset (clearly labeled) at `/care/export`
- [ ] 5.2 Upload the CSV to Quick and build a Quick Sight dashboard: risk bands, screenings claimed, redemptions by clinic
- [ ] 5.3 Save screenshots for the pitch

## 6. Finish
- [x] 6.1 Lint, tests and build pass
- [ ] 6.2 Demo on a phone: survey, nearest clinic, redeem a voucher, verify it at the clinic page

## Scenario coverage

| Spec scenario | Covered by |
|---|---|
| risk-survey: same input, reference case, smoker >= non-smoker | `logic/risk.test.ts` |
| risk-survey: invalid blood pressure | `logic/risk.test.ts`, `CarePathways.test.tsx` |
| risk-survey: result screen, fallback labeled | `CarePathways.test.tsx` |
| risk-survey: reward first check, repeat same day, invalid survey | `logic/surveyReward.test.ts`, `CarePathways.test.tsx` |
| clinic-finder: location granted, denied, public / private filter, data notice | `logic/geo.test.ts`, `CarePathways.test.tsx` |
| clinic-finder: map view | manual check on phone (Leaflet does not render in jsdom) |
| clinic-finder: open booking options, illustrative contacts, unsafe link | `logic/contact.test.ts`, `CarePathways.test.tsx` |
| medical-initiatives: browse, organizer level filter, city filter, past hidden, empty | `logic/missions.test.ts`, `CarePathways.test.tsx` |
| vouchers: enough / insufficient coins, QR content | `logic/vouchers.test.ts`, `CarePathways.test.tsx` |
| vouchers: double redemption, expired, valid code, unknown code | `logic/vouchers.test.ts`, `CarePathways.test.tsx` |
| partner-export: real events, no personal data, empty log, synthetic label | `logic/csv.test.ts` |
| partner-export: dashboard content | manual (Quick Sight) |
