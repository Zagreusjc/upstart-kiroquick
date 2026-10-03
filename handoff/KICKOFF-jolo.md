# KICKOFF: Jolo (match-3 game, scaffold, integration, deploy)

Paste everything below the line into the Kiro chat on your machine.

---

You are helping Jolo build the **artery match-3 game** of INLABABU and maintain the shared scaffold, integration and deployment. INLABABU is a mobile-first PWA health game for the Kiro x Quick Hackathon. There are about 11 build hours in total. Jolo is the computer science lead, so the hardest work is here. Work in small, verified steps.

## 0. Setup (run in PowerShell, then open the folder in Kiro)

```powershell
git clone https://github.com/Zagreusjc/upstart-kiroquick.git
cd upstart-kiroquick
git checkout feat/artery-match
npm install
npm run dev -- --host
```

If the folder already exists, run `git fetch origin`, `git checkout feat/artery-match` and `git merge origin/base/scaffold`.

## 1. Read first (do not skip)

`README.md`, `CONTRIBUTING.md`, `DEPLOY.md`, `openspec/project.md`, everything in `.kiro/steering/`, then your change in `openspec/changes/add-artery-match/` (proposal, design, tasks, specs). Also read all of `src/core/` and `src/app/`.

## 2. Your mission

1. Refine `design.md` and `tasks.md` with me: board size, engine API, RNG, spawn-chance cap score, loss rule, rendering choice. If `openspec` is installed, validate the change (`openspec validate add-artery-match --strict`).
2. Build the **engine first** as pure TypeScript with seeded tests (no React, no DOM). Only then build the UI.
3. Commit small (`feat:`, `test:`, `docs:`), push your branch often: `git push`.
4. Post progress in the team chat at hours 2, 4 and 6: what works, what is blocked.

## 3. Scope and acceptance (game)

- **Engine**: grid, swap validation (adjacent, non-cholesterol tiles, must create a match), match detection (3 or more), clear, gravity, refill, cascades. Deterministic and seedable. The start board has no matches and at least one legal move.
- **Tiles**: red blood cell (red concave circle), white blood cell (pale-blue spiky sphere), platelet (purple multi-pointed star), plasma (golden-aqua teardrop). High-contrast, simple SVG silhouettes.
- **Cholesterol blocks**: cannot be swapped, destroyed by adjacent matches, spawn chance scaling from 3 percent at score 0 to 10 percent at a score cap you choose in `design.md`.
- **Loss**: no legal move left, shown as "Complete Arterial Occlusion".
- **Scoring**: 30 points per 3-tile match, 500 per cholesterol cleared, cascade multipliers 2x, 3x, 4x. Visible callouts such as "Optimal Flow!".
- **Session**: starting a game spends 1 life (`useLives()`), and is blocked at 0 lives with a message on how to earn lives. Game over awards coins by score band (`useCoins()`, source `game_score`), emits `game.finished`.
- **Brag card**: canvas PNG with the score, shared via Web Share (files when supported, download fallback). A completed share awards 1 life and emits `share.completed`.
- Name the game **Arteria Match** in the UI. Never use the trademarked "Candy Crush" name. Power-ups, PvP and lootboxes are out of scope.

**Demo you must be able to show on a phone:** play a round, clear a cholesterol block, lose a life, share the brag card.

## 4. Scaffold, integration and deploy duties (you only)

- You are the only person who edits `src/core/`, `src/app/`, configs, `package.json` and `package-lock.json`, and only on `base/scaffold`. When a teammate asks for a dependency or a core change, add it on `base/scaffold`, run lint, tests and build, push, and announce it. Everyone then runs `git merge origin/base/scaffold`.
- Connect AWS Amplify Hosting to the repo (see `DEPLOY.md`) and set up the SPA rewrite. Try branch deployments so each person gets a live URL.
- Integration, from about hour 7 and with Kiro: create `integration` from `base/scaffold`, merge in order **Prime, CJ, Jolo, Ralph**, fix small wiring issues, and run the smoke checklist: read a card (coins, life), check in (streak), play a game (life spent, coins awarded), take the risk survey, find a clinic, redeem a voucher, verify it at `/care/verify`.
- Deploy `integration` and test "Add to Home Screen" on every teammate's phone. Keep `main` untouched until the final merge.
- Optional stretch, only if everything else is stable: Capacitor APK for Android.

## 5. Hard rules

- Game code goes only in `src/features/artery-match/` and `openspec/changes/add-artery-match/` on your feature branch. Scaffold changes happen only on `base/scaffold`.
- Import shared code only from `../../core`. Never import from another feature.
- Deterministic engine, seeded tests. No AI in game rules.
- Do not write tests that depend on other features' screen text.
- Keep it smooth on a low-end phone: pointer events, simple CSS transitions.

## 6. Definition of done

`npm run lint`, `npm test` and `npm run build` pass, every scenario in your specs has a test or a manual check, and the demo above works on your phone.
