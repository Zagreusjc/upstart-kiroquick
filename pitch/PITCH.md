# INLABABU semis pitch (2 min) and Q&A bank

Owner: CJ. Format: 2 minutes pitch, 2 minutes Q&A. The demo runs on a phone, mirrored to the screen.

Scoring weights to aim at: MVP and technical implementation 30%, problem and domain fit 25%, technology judgment 25%, innovation 15%, pitch 5%. Show Kiro and Quick on screen. Each missing platform costs 5 points.

## Script (about 280 words)

**0:00 Problem (20 s)**
"Heart disease is the number one killer in the Philippines. In 2025, ischaemic heart disease caused about 1 in 5 registered deaths. Most people only find out late, because screening feels far away, costly and scary."

**0:20 Solution (15 s)**
"INLABABU turns heart care into a game you want to open every day. Take care of your Babus, by taking care of yourself! Our loop is Track, Play, Redeem."

**0:35 Track (25 s), live on the phone**
"This is Babu. I enter today's steps, sleep and activity. It's labeled demo input, because we don't pretend to read sensors. Watch Babu go from Tired to OK to Happy. I check in, my streak grows and I earn coins. Babu never dies. If I'm away, Babu goes into Rest Mode and welcomes me back. No guilt."

**1:00 Play (15 s)**
"Each game of Arteria Match costs one of three lives. You clear cholesterol before the artery closes. Reading a cited library card earns lives and coins, so learning feeds playing."

**1:15 Redeem (20 s)**
"Coins become a one-time QR voucher for a discounted screening. A deterministic WHO-based risk survey points you to nearby clinics and medical missions. At the front desk, the clinic opens /care/verify, enters the code and marks it redeemed. Screening awareness, not a diagnosis."

**1:35 Technology judgment (15 s)**
"We used AI only where it beats a rule. Babu's mood, the risk survey and the match engine are deterministic and unit tested. Amazon Quick does the AI work: Quick Research for cited content, Quick Index for grounded Q&A, and Quick Sight for the partner dashboard."

**1:50 Close (10 s)**
"Built spec-first with Kiro: steering, hooks and OpenSpec changes for four parallel branches. INLABABU: healthy habits today, a screening slot tomorrow."

## Demo checklist (before going on stage)

- [ ] Onboarding already accepted. Health sliders at 0, so Babu starts Tired.
- [ ] Demo controls reset ("Reset demo days"). Coins visible in the header.
- [ ] One library card unread; lives at 3; enough coins for a voucher, or a pre-filled demo state.
- [ ] Kiro open on `.kiro/steering`, one OpenSpec change and the hooks panel (second screen or tab).
- [ ] Quick open on the Quick Sight dashboard and one Quick Index answer.
- [ ] Backup video ready on the laptop, offline.

## Q&A bank

**Problem and domain fit**

- *Why heart disease?* It's the leading cause of death in the Philippines, and most of the risk factors (activity, sleep, smoking, blood pressure) respond to habits and early screening.
- *Who is the user?* Young working adults and students who have never had a check-up, plus their families. The pet and the game make the first step easy.
- *Isn't this just another step counter?* No. Step counters stop at data. We end at a real screening slot through vouchers, a clinic finder and medical missions.

**Technology judgment**

- *Where is the AI?* In Quick: Research curates cited library content, Index answers grounded questions over those sources, Sight turns redemption data into a partner dashboard. Rules handle anything that has to be predictable, explainable or testable.
- *Why not use AI for Babu's mood or the risk score?* A rule beats AI there. Thresholds are transparent, the same input always gives the same output, and a clinic can audit the risk chart. An AI risk score would be a liability.
- *How do you know it works?* Every OpenSpec scenario maps to a unit or UI test. Lint, tests and build run before every merge.
- *Why manual health input?* It keeps the MVP honest and private. Health Connect and HealthKit integration plugs into the same `HealthProvider` interface later.

**MVP and implementation**

- *Is the data stored anywhere?* Only on the device, in localStorage. There's no backend and no account. The QR code holds only a random voucher code.
- *How do four people build in parallel?* Each feature is a plugin folder auto-discovered by the shell. Features share typed providers and an event bus and never import each other. Kiro steering enforces the ownership rules, and a hook lints and tests on save.
- *Can I install it?* Yes. It's a PWA on AWS Amplify Hosting: open the link, then Add to Home Screen.

**Safety and ethics**

- *Could someone mistake the result for a diagnosis?* Every result and every piece of health advice says "Screening awareness, not a diagnosis". Moderate or higher risk always recommends seeing a professional.
- *Isn't gamifying health manipulative?* We use positive framing only. Babu never dies, there are no lootboxes, no PvP and no pay-to-win. Rewards are transparent milestones.
- *What about privacy law?* We designed for the Data Privacy Act of 2012 (RA 10173): data minimization, on-device storage, explicit consent at onboarding and no personal data in exports.

**Business and feasibility**

- *Why would a clinic join?* Unused slots get filled with pre-screened, motivated patients, and the clinic sees results in a dashboard. See `FEASIBILITY.md`.
- *Who pays for the discount?* In a pilot, a partner clinic, HMO or LGU health office funds a small number of discounted screenings. That's cheaper than late treatment and counts toward their prevention targets.
- *What's next?* A pilot at one barangay health center or one HMO, then hypertension and diabetes modules on the same engine.

**Innovation**

- *What is new here?* It closes the loop from habit to education to an actual screening appointment, with a clinic-side verification page and a partner dashboard. It also stays deterministic and private by design.

## Sources

- [PSA, 2025 Cause of Death Statistics (as of 30 April 2026)](https://psa.gov.ph/system/files/vsd/Press%20Release_2025%20Cause%20of%20Death%20Statistics_as%20of%2030%20April%202026_mepe-signed_0.pdf): ischaemic heart diseases were the leading cause, at 19.7% of registered deaths in 2025.
