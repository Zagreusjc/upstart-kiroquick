## Why

This is the "Redeem" step and the proof of real-world impact. Many people with cardiovascular risk never get screened. INLABABOO connects engagement to action: a deterministic risk survey, nearby clinics and medical missions, and vouchers for discounted screenings. The clinic verify page shows judges a real front-desk workflow, and the partner dashboard shows why clinics and HMOs would take part.

## What Changes

- Add a deterministic cardiovascular risk survey based on the WHO non-laboratory CVD risk chart (age, sex, systolic blood pressure, smoking, BMI, diabetes). It outputs a risk band and always shows "Screening awareness, not a diagnosis". If the official tables cannot be transcribed in time, fall back to a transparent guideline-based checklist and label it clearly.
- Add a clinic finder: seeded clinics JSON, geolocation with a manual city fallback, distance sorting (haversine) and a Leaflet map.
- Add a medical missions list: seeded JSON with filters.
- Add vouchers: spend coins to get a one-time QR voucher with partner, expiry and code, plus a clinic verify page that marks it redeemed.
- Add an events CSV export (with synthetic seed data) for the Quick Sight partner dashboard.
- Platform duty (Quick): build a Quick Sight dashboard (risk bands, screenings claimed, redemptions by clinic).

## Impact

- Affected specs: risk-survey, clinic-finder, medical-missions, vouchers, partner-export (all new).
- Affected code: `src/features/care-pathways/` only. Uses `useCoins()` to spend coins.
- Emits events: `risk.assessed`, `voucher.issued`, `voucher.redeemed`. Reads the event log for the CSV export.
- Owner: Ralph. Branch: `feat/care-pathways`.
