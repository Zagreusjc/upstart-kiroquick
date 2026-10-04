# INLABABOO

> Take care of your Baboos, by taking care of yourself!

INLABABU is a mobile-first health game built for the **Kiro x Quick Hackathon** (Health domain). It turns healthy habits and cardiovascular education into coins, and coins into real discounted clinic screenings.

## Goals

- **Awareness**: learn about cardiovascular disease through short, cited library cards.
- **Healthy behavior**: track steps, sleep and activity to keep your Baboo (a heart-shaped pet) healthy.
- **Direct healthcare pathways**: coins become one-time QR vouchers for discounted check-ups and screenings at partner clinics.

## The demo loop: Track, Play, Redeem

1. **Track**: log steps, sleep and activity. Baboo's mood reflects your week. Baboo never dies; when neglected it enters **Rest Mode**.
2. **Play**: an artery match-3 game (working name "Arteria Match"). Clear cholesterol blocks before the artery is fully occluded. Each game costs 1 of 3 lives. Read library cards or share the game to refill lives.
3. **Redeem**: earn coins from reading, streaks, game results and sharing. Spend them on a one-time QR voucher. A deterministic WHO-based risk survey points you to nearby clinics and medical missions.

Design principle: **AI only where it beats a rule.** The risk survey, Baboo's mood and the match engine are deterministic. There are no lootboxes, PvP, power-up tiles or leveling in the MVP.

## Team, branches and ownership

| Owner | Branch | OpenSpec change | Scope |
|---|---|---|---|
| Prime | `feat/economy-library` | `add-economy-library` | Lives, coins ledger, CVD library, milestone tiers, share-for-life, Quick Research and Quick Index content |
| CJ | `feat/baboo-shell` | `add-baboo-shell` | Baboo and Rest Mode, manual step/sleep/activity input, daily check-in and streak, onboarding, home screen, Kiro evidence, pitch and feasibility pack |
| Jolo | `feat/artery-match` | `add-artery-match` | Match-3 engine, obstacles, game UI, brag card, integration and deploy |
| Ralph | `feat/care-pathways` | `add-care-pathways` | WHO-chart risk survey, clinic finder, medical missions, QR vouchers and clinic verify page, events CSV export, Quick Sight dashboard |

Other branches:

- `main`: untouched until the final merge (README only for now).
- `base/scaffold`: the shared runnable base every feature branch starts from. Only Jolo changes it.
- `integration`: created at the end for merging.

Final merge order (done with Kiro): **Prime, CJ, Jolo, Ralph**, into `integration`, then `main`.

## Tech stack

React, TypeScript, Vite, Tailwind CSS, Zustand, react-router-dom, vite-plugin-pwa, Vitest, ESLint, Leaflet with OpenStreetMap, a QR code library, localStorage persistence. No backend. Deployed on AWS Amplify Hosting as an installable PWA.

## Getting started for teammates (PowerShell)

```powershell
git clone https://github.com/Zagreusjc/upstart-kiroquick.git
cd upstart-kiroquick
git checkout <your-branch>      # see the branch table above
npm install
npm run dev -- --host           # open http://<PC-IP>:5173 on your phone (same Wi-Fi)
```

Then:

1. Open the folder in Kiro.
2. Open `handoff/KICKOFF-<yourname>.md` and paste it into the Kiro chat.
3. Let Kiro refine your OpenSpec change in `openspec/changes/<your-change>/`, then implement it.

## Working rules

- Edit only `src/features/<your-feature>/` and `openspec/changes/<your-change>/`.
- Never edit `src/core/`, `package.json`, `package-lock.json` or anyone else's folders. If you need a new dependency or a core change, message Jolo. He adds it on `base/scaffold` and announces it.
- When Jolo announces a scaffold update: `git fetch origin` then `git merge origin/base/scaffold` on your branch.
- Commit small (`feat:`, `fix:`, `test:`, `docs:`) and push only your own branch.
- Definition of done: lint, tests and build pass, and your demo scenario works on a phone.

See `CONTRIBUTING.md` and `openspec/project.md` for details.

## Install on your phone

Geolocation and the PWA install prompt need HTTPS, so use the deployed Amplify URL (Jolo shares it). Open it in Chrome (Android) or Safari (iOS), then choose **Add to Home Screen**. For a quick check during development, `npm run dev -- --host` over Wi-Fi works for everything except geolocation and install.

## Kiro and Quick

- **Kiro**: this repo is built with Kiro. See `.kiro/steering/`, `.kiro/hooks/` and the OpenSpec changes under `openspec/changes/`.
- **Amazon Quick**: Quick Research produces the cited library content, Quick Index powers a grounded Q&A demo (shown inside Quick), and Quick Sight shows a partner dashboard built from an exported events CSV.

## Disclaimer

INLABABU provides screening awareness, not a diagnosis. Health input (steps and sleep) is manual demo input. Clinic, medical mission and voucher partner data are illustrative.

The hackathon briefs are intentionally not stored in this repository.
