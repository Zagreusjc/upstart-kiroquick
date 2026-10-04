# KICKOFF: Ralph (care pathways)

Paste everything below the line into the Kiro chat on your machine.

---

You are helping Ralph build the **care pathways** feature of INLABABOO, a mobile-first PWA health game for the Kiro x Quick Hackathon: risk survey, clinics, medical missions, vouchers and the partner dashboard. There are about 11 build hours in total. Work in small, verified steps.

## 0. Setup (run in PowerShell, then open the folder in Kiro)

```powershell
git clone https://github.com/Zagreusjc/upstart-kiroquick.git
cd upstart-kiroquick
git checkout feat/care-pathways
npm install
npm run dev -- --host
```

If the folder already exists, run `git fetch origin`, `git checkout feat/care-pathways` and `git merge origin/base/scaffold`.

## 1. Read first (do not skip)

`README.md`, `CONTRIBUTING.md`, `openspec/project.md`, everything in `.kiro/steering/`, then your change in `openspec/changes/add-care-pathways/` (proposal, design, tasks, specs). Also read `src/core/contracts.ts`, `src/core/events.ts` and `src/core/stubs/coins.ts`.

## 2. Your mission

1. Start with the **data and the source** (first hour): find the official WHO non-laboratory cardiovascular risk chart for the Southeast Asia region, record its exact edition and link in `design.md`, and prepare the clinics and medical missions JSON. Refine `design.md` and `tasks.md` with me. If `openspec` is installed, validate the change (`openspec validate add-care-pathways --strict`).
2. Build pure logic first (risk scoring, haversine sort, voucher rules), with tests, then the screens.
3. Commit small (`feat:`, `test:`, `docs:`), push your branch often: `git push`.
4. Post progress in the team chat at hours 2, 4 and 6: what works, what is blocked.

## 3. Scope and acceptance

- **Risk survey**: age, sex, systolic blood pressure, smoking, BMI, diabetes. A pure `assessRisk(input)` using the published chart encoded as data, returning a band and a next-step message. No AI, no randomness. Validate inputs. Always show "Screening awareness, not a diagnosis". If you cannot transcribe and verify the official tables in time, use a transparent guideline-based checklist and label it "simplified screen" on the result. Emit `risk.assessed`.
- **Clinic finder**: seeded JSON (12 to 20 clinics, PhilHealth and private, illustrative), geolocation with a manual city fallback, haversine distance sort, Leaflet map (lazy load it, import its CSS), list view, type filter. Label the data illustrative.
- **Medical missions**: seeded JSON (6 to 10), filters by city and date, hide past ones, empty state.
- **Vouchers**: redeem coins through `useCoins().spend(...)` for a one-time voucher with partner, code, expiry and a QR code (use the `qrcode` package; the QR holds only the voucher code). Emit `voucher.issued`. Reject insufficient coins. Build `/care/verify` for a clinic to enter a code and mark it redeemed (reject expired or already used). Emit `voucher.redeemed`. Label partners illustrative.
- **Partner export**: CSV from the event log (`getEventLog()` in `src/core`) with flat, non-personal columns, plus a clearly labeled synthetic dataset so the dashboard looks meaningful.

**Demo you must be able to show on a phone:** take the survey, see the nearest clinic, redeem a voucher, verify it on the clinic page.

## 4. Platform duty: Amazon Quick (required by the judges)

- Upload the CSV to Quick and build a **Quick Sight** dashboard: risk band distribution, vouchers issued versus redeemed, redemptions by clinic.
- Save screenshots for the pitch.
- Why clinics and HMOs would participate (for the finals): fills unused appointment slots with pre-screened, motivated patients; early detection costs less than treating late-stage cardiac events. Share this with CJ for the feasibility pack.

## 5. Hard rules

- Edit only `src/features/care-pathways/` and `openspec/changes/add-care-pathways/`.
- Never edit `src/core/`, `src/app/`, `package.json`, `package-lock.json`, configs or other people's folders. Leaflet, react-leaflet and `qrcode` are already installed. If you need anything else, ask Jolo.
- Import shared code only from `../../core`. Never import from another feature. Until Prime's coins provider merges, the stub runs. Build against the interface.
- Deterministic logic, no AI in the rules. No lootboxes, PvP, power-up tiles or leveling.
- No personal data in the QR code or the CSV.
- Do not write tests that depend on other features' screen text.

## 6. Definition of done

`npm run lint`, `npm test` and `npm run build` pass, every scenario in your specs has a test or a manual check, and the demo above works on your phone.
