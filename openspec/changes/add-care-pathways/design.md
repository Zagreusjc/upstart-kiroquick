## Context

Owner: Ralph. Feature folder `src/features/care-pathways/`, routed at `/care/*`. All data stays on the device. Shared state only through `useCoins()` and the event bus from `src/core`.

## Risk model source

- Reference chart: WHO CVD Risk Chart Working Group, "World Health Organization cardiovascular disease risk charts: revised models to estimate risk in 21 global regions", Lancet Glob Health 2019;7(10):e1332-e1345, doi:10.1016/S2214-109X(19)30318-3 (https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(19)30318-3/fulltext). The printed charts are in WHO "HEARTS technical package for cardiovascular disease management in primary health care: risk-based CVD management" (WHO, 2020, ISBN 9789240001367, https://www.who.int/publications/i/item/9789240001367).
- Which chart applies to the Philippines: the Philippines is a member of the WHO Western Pacific Region, but the 2019 charts are grouped by the 21 Global Burden of Disease regions, and the Philippines sits in the GBD "Southeast Asia" region (with Indonesia, Malaysia, Thailand, Viet Nam and others). So the right chart is the **non-laboratory chart, GBD Southeast Asia**, published inside the WHO Western Pacific Region chart set.
- Chart inputs: age 40-74 (5-year bands), sex, current smoking, systolic BP bands (<120, 120-139, 140-159, 160-179, >=180), BMI bands (<20, 20-24, 25-29, 30-35, >=35). Output bands: <5%, 5-<10%, 10-<20%, 20-<30%, >=30% (10-year risk). Diabetes is not part of the non-lab chart; WHO advises using the laboratory-based chart for people with diabetes.
- Status: **the official cell values are not encoded yet.** The charts are published as images, and the machine-readable sources found (WHORiskCalculator 1.0.0 on CRAN, which uses a self-described "simplified recalibration"; the Simple.org app, which loads its sheet from remote config) cannot be verified against the printed chart in the time available. Per the kickoff, the MVP ships the **simplified screen** below and labels every result "Simplified screen, not the WHO chart".
- Upgrade path: `risk.ts` takes a `RiskModel` (`id`, `label`, `assess`). A WHO chart model can be added later as a typed constant (`[sex][smoker][ageBand][sbpBand][bmiBand] -> riskBand`) with reference-case tests copied from the printed chart, without changing the screens.

## Simplified screen (deterministic checklist)

Points use the same variables and bands as the WHO non-lab chart, plus diabetes:

| Factor | Points |
|---|---|
| Age 40-49 / 50-59 / 60-69 / 70+ (under 40: 0) | 1 / 2 / 3 / 4 |
| Male | 1 |
| Systolic BP 120-139 / 140-159 / 160-179 / 180+ | 1 / 2 / 3 / 4 |
| Current smoker | 2 |
| BMI 25-29.9 / 30+ | 1 / 2 |
| Diabetes | 2 |

- Bands: `low` 0-3, `moderate` 4-6, `high` 7+.
- Overrides (never lower a band): diabetes gives at least `moderate`; systolic BP 160+ gives at least `moderate`; systolic BP 180+ gives `high` and an extra "recheck soon" note.
- Valid input: age 18-100 (integer), systolic 70-250 mmHg, height 120-220 cm, weight 30-250 kg, BMI from height and weight must be 12-60. Invalid input returns field errors and no result.
- Messages (awareness only, positive framing):
  - low: keep up healthy habits and check blood pressure at least once a year.
  - moderate: see a health professional for a check-up and blood pressure review.
  - high: see a health professional soon for a full check-up.
- Every result shows "Screening awareness, not a diagnosis", the model label, the next step and a link to nearby clinics. `risk.assessed { band }` is emitted once per submitted survey.

## Data (illustrative, labeled in the UI)

- `data/clinics.json`: 16 clinics in 8 cities. `{ id, name, type: 'public' | 'private', city, area, lat, lng, services[], hours, partner, phone?, bookingUrl?, contactVerified }`. Names are invented; coordinates are near city centres. Seed booking links use the reserved `example.com` domain and seed phone numbers are samples, so `contactVerified` is `false` everywhere.
- `data/missions.json`: 10 medical initiatives (one in the past). `{ id, title, organizer, organizerType: 'national' | 'municipal' | 'barangay' | 'organizational', city, venue, date (yyyy-mm-dd), free, services[] }`. The code type is still `Mission`; the UI says "medical initiatives".
- `data/cities.json`: city centroids for the manual location fallback.
- `data/offers.json`: voucher offers `{ id, partnerId (clinic id), title, cost, validDays }`.
- `data/index.ts` types the JSON and is the only module that imports it.

## Clinic finder

- Location: "Use my location" calls `navigator.geolocation` once; the position stays in memory only (never stored or exported). A city select is always available and is the fallback on denial or no HTTPS.
- Sorting: pure haversine (`geo.ts`), nearest first, distance shown in km. Type filter: all, public (government-run), private.
- Booking: tapping a clinic card expands it (`aria-expanded`) to show "Book an appointment online" (new tab), the appointment number and directions. `logic/contact.ts` only passes `https:` booking links and builds `tel:+63…` links only when `contactVerified` is true, so the demo never dials a made-up number that may belong to someone. To go live, enter the partner's confirmed number and booking page and set `contactVerified: true`.
- Map: `ClinicMap.tsx` loaded with `React.lazy`, imports `leaflet/dist/leaflet.css`, OpenStreetMap tiles, `CircleMarker` (no image icons, so no Vite icon fix needed) with a popup per clinic. The list is the accessible primary view; the map is optional.

## Medical initiatives (`/care/initiatives`; `/care/missions` redirects)

- Pure `filterMissions(missions, { city, window, organizer, today })`: hides entries before `today`, filters by organizer level (National, Municipal, Barangay, Organizational), city and a date window (all upcoming, next 30 days, next 90 days), sorts by date. Empty state offers to clear all filters.

## Survey reward

- Finishing a valid Heart Risk Check awards 20 coins (`award('other', 20, 'risk_survey:heart-check:<yyyy-mm-dd>')`) and 1 life (`award(1, 'other')`), once per local day (`logic/surveyReward.ts`, record in `inlababoo.care.surveyReward.v1`). Same reward for every band, so there is no reason to change answers. Uses `other` because `CoinSource` and `LifeSource` in core have no survey value; ask Jolo if a `risk_survey` source is wanted for the ledger.

## Vouchers

- Model: `{ id, code, offerId, partnerId, cost, issuedAt, expiresAt, status: 'issued' | 'redeemed', redeemedAt? }`. "Expired" is derived from `expiresAt` at check time, not stored.
- Code: `INB-XXXX-XXXX` from a 31-character alphabet without look-alikes (0/O, 1/I/L), drawn from an injected RNG (seedable in tests).
- Issue: `useCoins().spend(cost, 'voucher:<offerId>')` first; only on success the voucher is stored and `voucher.issued { voucherId, partnerId, cost }` is emitted. If the balance is too low, nothing is spent and the screen shows how many coins are missing.
- QR: `qrcode.toDataURL(code)` (lazy imported). The QR holds only the code.
- Storage: `inlababoo.care.vouchers.v1` via `saveJSON`. Because there is no backend, the clinic verify page works on the same device (demo). A real rollout needs a partner-side service.
- Verify (`/care/verify`): front desk types the code (case and spaces ignored). Results: `ok` (marks redeemed, emits `voucher.redeemed { voucherId, partnerId }`), `unknown`, `already_redeemed`, `expired`.
- Cost: 30 to 80 coins per offer (`offers.json`; tune once Prime's earn rates are final). In dev builds only, a "Demo: add 50 coins" button awards coins with source `other` so the loop can be shown before Prime's provider merges.

## Partner export (Quick Sight)

- CSV columns: `dataset, event_id, date, hour, event_type, risk_band, partner_id, partner_name, partner_city, voucher_id, coins, value, detail`.
  - `dataset` is `app` for the real log and `synthetic` for generated data (filename `inlababoo-events-synthetic.csv`).
  - `value`: game score or check-in streak. `detail`: library card id or share channel.
  - No names, contact details or coordinates. Partner name and city are the illustrative clinic, not the user.
- Cells are quoted when needed and prefixed with `'` if they start with `= + - @` (CSV injection guard).
- Synthetic generator: seeded RNG, 30 days of `risk.assessed`, `voucher.issued` and `voucher.redeemed` events across partner clinics.
- Dashboard (built in Quick Sight): risk band distribution, vouchers issued versus redeemed, redemptions by clinic.
- Why partners join (for CJ's feasibility pack): fills unused appointment slots with pre-screened, motivated patients; early detection costs less than treating late-stage cardiac events.

## Risks

- Medical accuracy and liability: awareness wording only, disclaimer on every result, "simplified screen" label until the WHO table is verified.
- Geolocation needs HTTPS and permission: manual city select always visible.
- Fake partners can look like endorsements: "Illustrative data" notice on clinics, missions and vouchers.
- Vouchers live in localStorage, so verification is same-device only in the MVP.

## Open questions

- Who on the team can transcribe and double-check the Southeast Asia non-lab chart (700 cells) to replace the simplified screen?
- Final voucher cost once Prime's coin rates are fixed.
