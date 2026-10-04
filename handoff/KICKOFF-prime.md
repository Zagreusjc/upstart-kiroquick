# KICKOFF: Prime (economy and library)

Paste everything below the line into the Kiro chat on your machine.

---

You are helping Prime build the **economy and library** feature of INLABABOO, a mobile-first PWA health game for the Kiro x Quick Hackathon. There are about 11 build hours in total. Work in small, verified steps.

## 0. Setup (run in PowerShell, then open the folder in Kiro)

```powershell
git clone https://github.com/Zagreusjc/upstart-kiroquick.git
cd upstart-kiroquick
git checkout feat/economy-library
npm install
npm run dev -- --host
```

If the folder already exists, run `git fetch origin`, `git checkout feat/economy-library` and `git merge origin/base/scaffold`.

## 1. Read first (do not skip)

`README.md`, `CONTRIBUTING.md`, `openspec/project.md`, everything in `.kiro/steering/`, then your change in `openspec/changes/add-economy-library/` (proposal, design, tasks, specs). Also read `src/core/contracts.ts` and `src/core/stubs/` to see the interfaces you implement.

## 2. Your mission

You own the shared economy that every other feature uses.

1. Refine `design.md` and `tasks.md` with me. Answer the open questions in `design.md`. If `openspec` is installed, validate the change (`openspec validate add-economy-library --strict`).
2. Implement the tasks in order. Write failing tests first for the logic (coins, lives, milestones), then the code.
3. Register the real `coins` and `lives` providers from your feature's `register(api)` in `src/features/economy-library/index.ts`. Replace the placeholder screen with the Library tab (list, card detail, milestones, share).
4. Commit small (`feat:`, `test:`, `docs:`), push your branch often: `git push`.
5. Post progress in the team chat at hours 2, 4 and 6: what works, what is blocked.

## 3. Scope and acceptance

Build exactly what your specs say:

- **Coins ledger**: idempotent earn (use `dayKey()` from `src/core`), safe spend, persistence. Sources: `library_read`, `streak`, `checkin`, `game_score`, `share`, `milestone`, `voucher_spend`.
- **Lives**: start 3, min 0, max 3. Refill from first read of a library card, from sharing, and from health (steps and sleep targets, once per day each, using `useHealth()`).
- **Library**: 8 to 10 short CVD cards, each with a cited source link and plain language. First read awards coins and a life once. Emit `library.read`.
- **Milestones**: transparent tiers with visible progress (for example "read 3 modules to unlock a screening discount"). No random rewards, no lootboxes.
- **Sharing**: Web Share API with a clipboard fallback. Awards 1 life once per completed share. Emit `share.completed`.

**Demo you must be able to show on a phone:** read 3 cards, see coins and lives change in the header, unlock the milestone tier, share for a life.

## 4. Platform duty: Amazon Quick (required by the judges)

- Use **Quick Research** to draft and cite the library cards. Keep the cited report.
- Load the cards into **Quick Index** and capture a grounded, cited Q&A for the demo. It is shown inside Quick, not embedded in the app.
- Save screenshots for the pitch.

## 5. Hard rules

- Edit only `src/features/economy-library/` and `openspec/changes/add-economy-library/`.
- Never edit `src/core/`, `src/app/`, `package.json`, `package-lock.json`, configs or other people's folders. If you need a dependency or a core change, ask Jolo.
- Import shared code only from `../../core`. Never import from another feature. Talk to other features through providers and events.
- Until other providers merge, the stubs run. Build against the interfaces.
- Deterministic logic, no AI in rules. No lootboxes, PvP, power-up tiles or leveling.
- Every medical card needs a cited source. Show "Screening awareness, not a diagnosis" on card detail.
- Do not write tests that depend on other features' screen text.

## 6. Definition of done

`npm run lint`, `npm test` and `npm run build` pass, every scenario in your specs has a test or a manual check, and the demo above works on your phone.
