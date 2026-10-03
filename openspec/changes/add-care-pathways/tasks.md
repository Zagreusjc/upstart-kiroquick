## 1. Specs and data
- [ ] 1.1 Refine `design.md` and validate the specs in this change
- [ ] 1.2 Source and cite the WHO non-lab CVD risk chart tables; record edition and link
- [ ] 1.3 Create seeded clinics JSON (12 to 20 entries, illustrative) and medical missions JSON (6 to 10 entries)

## 2. Risk survey (pure logic first)
- [ ] 2.1 Write failing tests using reference cases checked against the source tables
- [ ] 2.2 Implement `assessRisk(input)` returning a band and message
- [ ] 2.3 Survey form with validation, result screen with the disclaimer and a link to nearby clinics; emit `risk.assessed`

## 3. Clinic finder and missions
- [ ] 3.1 Haversine distance and sort (tested) with a manual city fallback
- [ ] 3.2 Leaflet map (lazy loaded) with markers and a list view
- [ ] 3.3 Medical missions list with filters (city, date, type)

## 4. Vouchers
- [ ] 4.1 Voucher model and rules (pure, tested): cost, expiry, one-time use
- [ ] 4.2 Redeem screen: spend coins through `useCoins()`, issue a voucher, show a QR code; emit `voucher.issued`
- [ ] 4.3 `/care/verify` clinic page to check a code and mark it redeemed; emit `voucher.redeemed`; reject expired or used codes

## 5. Partner export and Quick Sight
- [ ] 5.1 CSV export from the event log plus a synthetic seed dataset (clearly labeled)
- [ ] 5.2 Upload the CSV to Quick and build a Quick Sight dashboard: risk bands, screenings claimed, redemptions by clinic
- [ ] 5.3 Save screenshots for the pitch

## 6. Finish
- [ ] 6.1 Lint, tests and build pass
- [ ] 6.2 Demo on a phone: survey, nearest clinic, redeem a voucher, verify it at the clinic page
