# INLABABOO product guide

INLABABOO is a mobile-first PWA health game for the Kiro x Quick Hackathon (Health domain). Tagline: "Take care of your Babus, by taking care of yourself!"

## Goals

- Awareness: cited cardiovascular disease (CVD) library cards.
- Healthy behavior: track steps, sleep and activity to keep Babu healthy.
- Direct healthcare pathways: coins become one-time QR vouchers for discounted screenings.

## The demo loop: Track, Play, Redeem

- Track: Babu, a heart-shaped pet, reflects the user's lifestyle. Babu never dies. When neglected it enters Rest Mode.
- Play: an artery match-3 game (working name "Arteria Match"). Never use the trademarked "Candy Crush" name. Each game costs 1 of 3 lives.
- Redeem: coins from reading, streaks, game results and sharing become vouchers. A deterministic WHO non-lab CVD risk survey points to nearby clinics and medical missions.

## Design principles

- AI only where it beats a rule. Risk survey, Babu mood and the match engine are deterministic.
- Positive framing. No death, shame or fear mechanics.
- No lootboxes, PvP, power-up tiles or leveling in the MVP (stretch only).
- Health input (steps, sleep, activity) is manual demo input and must be labeled as such in the UI.
- Mobile first: 360px wide, touch targets at least 44px, readable contrast, labels for all controls.

## Required disclaimers

- Show "Screening awareness, not a diagnosis" wherever a risk result or health advice appears.
- Clinic, medical mission and voucher partner data are illustrative. Say so in the UI where it appears.
- Never collect names, contact details or precise location beyond what a feature needs. Keep all data on the device.

## Platform duties (judged)

- Kiro and Amazon Quick must both be visibly used. A missing platform costs 5 points.
- Kiro evidence: `.kiro/steering`, `.kiro/hooks`, OpenSpec changes under `openspec/changes/`.
- Quick: Quick Research for cited library content, Quick Index for a grounded Q&A demo shown inside Quick, Quick Sight for a partner dashboard built from an exported events CSV.
