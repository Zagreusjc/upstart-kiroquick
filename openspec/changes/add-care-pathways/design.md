## Context

Owner: Ralph. Refine this file with Kiro before implementing. Keep it short.

## Decisions to make

- Risk model source: find the official WHO CVD risk charts for the Southeast Asia region (non-laboratory version) and record the exact table, edition and link in the design. Encode the tables as data (a typed constant) and write a pure `assessRisk(input)` function. If the tables cannot be transcribed and verified in time, use a transparent checklist based on published guidance and label it as a simplified screen.
- Risk bands and the message for each band (what to do next, never a diagnosis).
- Clinic and mission data schema: id, name, type (PhilHealth, private, municipal), city, lat, lng, services, hours, partner flag. Use realistic but illustrative data and label it so.
- Voucher model: id, partnerId, code, cost, issuedAt, expiresAt, status (issued, redeemed, expired). Where it is stored. How the QR encodes the code (a plain string, no personal data).
- Clinic verify page: how a front desk checks a code (manual entry or scan) and marks it redeemed.
- Events CSV columns for Quick Sight (for example date, event type, risk band, partner id, voucher status) with no personal data.

## Risks

- Medical accuracy and liability. Keep wording to awareness and advice to see a professional. Show the disclaimer on every result.
- Geolocation needs HTTPS and permission. Always provide a manual city selector.
- Leaflet in Vite: import its CSS and fix default marker icons.
- Fake partners can look like real endorsements. Label all partners as illustrative.

## Open questions

- Which regional WHO chart applies to the Philippines (Southeast Asia region)? Confirm and cite the exact table.
- How many coins should a screening voucher cost so the demo loop is reachable within a minute or two of play?
