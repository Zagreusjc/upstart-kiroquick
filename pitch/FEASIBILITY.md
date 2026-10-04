# INLABABOO finals feasibility pack

Owner: CJ. INLABABOO provides screening awareness, not a diagnosis. Clinic, mission and voucher partner data in the app are illustrative.

## 1. Real-world impact

- **The problem.** Ischaemic heart disease was the leading cause of death in the Philippines in 2025, at 19.7% of registered deaths ([PSA](https://psa.gov.ph/system/files/vsd/Press%20Release_2025%20Cause%20of%20Death%20Statistics_as%20of%2030%20April%202026_mepe-signed_0.pdf)). The main risk factors (inactivity, poor sleep, smoking, high blood pressure, diabetes) are detectable early and respond to behavior change.
- **The gap.** People rarely go for a first screening. It feels costly, inconvenient and frightening, and nothing reminds them in between.
- **What INLABABOO changes.** A daily, positive habit loop (Baboo, check-ins, streaks), cited education (library cards), a deterministic risk survey and a direct pathway to a discounted, verified screening slot.
- **Outcome we measure.** Not app opens but **screenings completed**: vouchers redeemed at a partner, and the share of moderate-or-higher risk users who reach a clinic.

## 2. Practical deployment

### Data privacy (Data Privacy Act of 2012, RA 10173)

Health information is *sensitive personal information* under the Act, so we design for data minimization from the start.

| Principle | How INLABABOO applies it |
|---|---|
| Transparency and consent | Onboarding explains what is stored and requires an explicit tick box before use. |
| Proportionality (data minimization) | No names, contact details, accounts or precise location. Health input is manual and stays on the device. |
| Security | No backend in the MVP. Data lives in the browser's localStorage on the user's phone. |
| Voucher privacy | The QR encodes only a random voucher code. The clinic learns nothing else from it. |
| Partner reporting | The events CSV has flat, non-personal columns (date, event type, risk band, partner id, voucher status). The Quick Sight dashboard is built from aggregates. |

For a pilot that moves beyond on-device data (for example a shared voucher registry), we would add a privacy notice, register a Data Protection Officer and sign a data sharing agreement with each partner, following National Privacy Commission rules.

### Safety messaging

- "Screening awareness, not a diagnosis" appears on onboarding, on Home and with every risk result.
- Moderate or higher risk bands always recommend seeing a health professional and link to nearby clinics.
- Baboo never dies. There are no fear or guilt mechanics.

### How a clinic validates a voucher at the front desk

1. The patient shows the voucher QR or the short code on their phone.
2. Front desk staff open `/care/verify` on any browser (clinic phone or PC).
3. They scan or type the code. The page shows **Valid** (partner, service, expiry), **Already used** or **Expired**.
4. They tap **Mark redeemed**. The voucher becomes one-time used and a `voucher.redeemed` event is recorded.
5. The redemption shows up in the partner's Quick Sight dashboard (issued vs redeemed, redemptions by clinic).

No account, app install or patient data entry is needed at the desk. That fits a busy barangay health station.

### Hosting and cost

The app is a static PWA on AWS Amplify Hosting. It installs from a link, works on low-end Android phones and needs no app store. Running cost is close to zero at pilot scale.

## 3. Pilot path

**Option A: one barangay health center (public)**

- Partner: one LGU rural health unit or barangay health station that already runs NCD risk assessment under DOH's PhilPEN protocol ([AO 2012-0029](https://pmc.ncbi.nlm.nih.gov/articles/PMC13103910/)) and is accredited for PhilHealth's YAKAP primary care package (Konsulta was rebranded YAKAP in 2025, per [PhilHealth Advisory 2025-0061](https://www.philhealth.gov.ph/advisories/2025/PA2025-0061.pdf)).
- Offer: free or discounted BP check and risk assessment slots on set days, promoted in the app's medical missions list.

**Option B: one HMO**

- Partner: one HMO that offers a member wellness program.
- Offer: coins redeem for an annual check-up slot or a lab panel at an in-network clinic.
- Fit: PhilHealth and private insurers signed an MOU (October 2026) positioning YAKAP as the first layer of primary care coverage, with HMOs adding benefits on top ([DOF](https://www.dof.gov.ph/philhealth-private-insurers-build-on-yakap-to-maximize-primary-care-coverage/)). Prevention traffic into YAKAP-accredited clinics fits that model.

**Pilot plan (8 to 12 weeks)**

| Phase | Weeks | Work |
|---|---|---|
| Setup | 1 to 2 | Sign MOU and data sharing terms, load the real clinic and slot data, train front desk on `/care/verify` (15 minutes). |
| Run | 3 to 10 | Promote through barangay channels, schools or the HMO member portal. Weekly Quick Sight review with the partner. |
| Review | 11 to 12 | Compare outcomes to baseline, decide go or no-go for a second site. |

**Pilot metrics**: installs, onboarding completion, 7-day check-in retention, risk surveys completed, vouchers issued, vouchers redeemed (target redemption rate agreed with the partner), and the share of moderate-or-higher risk users who reach a clinic.

## 4. Why clinics and HMOs would participate

- **Fill unused slots.** Clinics have idle capacity on slow days. Vouchers can target those days and times.
- **Pre-screened, motivated patients.** Users arrive having completed a risk survey and read about heart health. Visits are more productive, and higher-risk patients are flagged for follow-up.
- **Early detection costs less than late treatment.** Catching hypertension or diabetes early with low-cost primary care is cheaper than treating a heart attack or stroke later. That matters to HMOs, which carry the cost of hospital care, and to LGUs.
- **Measurable reach.** The Quick Sight dashboard shows issued vs redeemed vouchers and risk band distribution, evidence for prevention programs and PhilHealth primary care targets.
- **Low effort.** No integration, no new hardware. A browser page at the front desk is enough.

## 5. How it scales

**To hypertension and diabetes**

The architecture is condition-agnostic. Each part swaps cleanly:

| Part | Heart (MVP) | Hypertension | Diabetes |
|---|---|---|---|
| Library cards (Quick Research) | CVD basics | BP, salt, adherence | Sugar, diet, foot care |
| Deterministic survey | WHO non-lab CVD chart | BP history and readings | A validated diabetes risk score encoded as data |
| Voucher | Screening discount | BP check or home BP monitor loan | Fasting blood sugar or HbA1c test |
| Baboo signals | Steps, sleep, activity | Plus BP log | Plus meal log |

**To other regions**

- Swap in the WHO regional risk chart and local clinic and mission data (JSON, no code change).
- Translate UI and cards (Filipino, Cebuano, Ilocano) and let Quick Research source local guidelines.
- Partners onboard through the same `/care/verify` page and get their own dashboard filter.

**Technically**

- Health input moves from manual to Health Connect or HealthKit behind the same `HealthProvider` interface.
- An optional, consented backend (shared voucher registry) is added only when a partner needs cross-device verification, with the privacy steps in section 2.
