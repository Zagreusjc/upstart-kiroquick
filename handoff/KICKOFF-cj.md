# KICKOFF: CJ (Babu, home and pitch pack)

Paste everything below the line into the Kiro chat on your machine.

---

You are helping CJ build **Babu, the home screen, onboarding and the pitch and feasibility pack** of INLABABU, a mobile-first PWA health game for the Kiro x Quick Hackathon. There are about 11 build hours in total. Work in small, verified steps.

## 0. Setup (run in PowerShell, then open the folder in Kiro)

```powershell
git clone https://github.com/Zagreusjc/upstart-kiroquick.git
cd upstart-kiroquick
git checkout feat/babu-shell
npm install
npm run dev -- --host
```

If the folder already exists, run `git fetch origin`, `git checkout feat/babu-shell` and `git merge origin/base/scaffold`.

## 1. Read first (do not skip)

`README.md`, `CONTRIBUTING.md`, `openspec/project.md`, everything in `.kiro/steering/`, then your change in `openspec/changes/add-babu-shell/` (proposal, design, tasks, specs). Also read `src/core/contracts.ts` and `src/core/stubs/health.ts`.

## 2. Your mission

1. Refine `design.md` and `tasks.md` with me. Fix the mood threshold table and the streak milestones. If `openspec` is installed, validate the change (`openspec validate add-babu-shell --strict`).
2. Implement the tasks in order. Write failing tests first for the mood and streak rules, then the code.
3. Register the real `health` provider from `register(api)` in `src/features/babu-shell/index.ts`. Replace the placeholder with the Home tab.
4. Commit small (`feat:`, `test:`, `docs:`), push your branch often: `git push`.
5. Post progress in the team chat at hours 2, 4 and 6: what works, what is blocked.

## 3. Scope and acceptance

- **Babu**: an SVG heart with four states: Happy, OK, Tired, Rest Mode. The state comes from a pure function `computeMood(snapshot, checkinState)` with fixed thresholds. No randomness, no AI. Babu never dies. Rest Mode has supportive wording, never blame.
- **Health input**: manual sliders or number inputs for steps, sleep hours and activity minutes, clearly labeled "demo input". This is the real `HealthProvider` (clamped, persisted, subscribable).
- **Daily check-in and streak**: one check-in per local day awards coins (use `useCoins()` and `dayKey()` from `src/core`), the streak grows on consecutive days, resets after a missed day, and gives a bonus at milestones. Emit `checkin.done`.
- **Onboarding**: first-run screen with consent to store data on the device and the disclaimer "Screening awareness, not a diagnosis". Persist the flag.
- **Home screen**: Babu, today's snapshot, check-in button, streak.

**Demo you must be able to show on a phone:** move the sliders and watch Babu's mood change, check in, see the streak and coins update.

## 4. Platform and pitch duties (these are scored)

- **Kiro evidence**: keep `.kiro/steering`, `.kiro/hooks` and the OpenSpec changes visible and in use. Capture screenshots of specs, steering and hooks in action.
- **Semi-finals pitch** (2 minutes pitch, 2 minutes Q&A): write the script and a Q&A bank. The demo loop is Track, Play, Redeem. Say: "We used AI only where it beats a rule." The semis score MVP and technical implementation 30 percent, problem and domain fit 25 percent, technology judgment 25 percent, innovation 15 percent, pitch 5 percent. Failing to show Kiro or Quick costs 5 points each.
- **Finals feasibility pack**: cover real-world impact, practical deployment (PH Data Privacy Act, "screening awareness, not a diagnosis", how a clinic validates a voucher at the front desk with the `/care/verify` page), a pilot path (one barangay health center or one HMO), why clinics and HMOs would participate (fills unused slots with pre-screened motivated patients; early detection costs less than late treatment), and how it scales to hypertension and diabetes and other regions.
- Record a backup demo video once the integrated app is stable.

## 5. Hard rules

- Edit only `src/features/babu-shell/` and `openspec/changes/add-babu-shell/`. Pitch files can go under a `pitch/` folder that only you create.
- Never edit `src/core/`, `src/app/`, `package.json`, `package-lock.json`, configs or other people's folders. If you need a dependency or a core change, ask Jolo.
- Import shared code only from `../../core`. Never import from another feature.
- Deterministic logic only. No lootboxes, PvP, power-up tiles or leveling.
- Positive tone everywhere. No fear or guilt mechanics.
- Do not write tests that depend on other features' screen text.

## 6. Definition of done

`npm run lint`, `npm test` and `npm run build` pass, every scenario in your specs has a test or a manual check, and the demo above works on your phone.
