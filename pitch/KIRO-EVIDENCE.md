# Kiro and Quick evidence checklist

Owner: CJ. Missing Kiro or Quick evidence costs 5 points each. Save screenshots in `pitch/screenshots/` (create the folder when you take them).

## Kiro (capture these)

- [ ] `.kiro/steering/` open with `product.md`, `tech.md` and `structure.md` visible
- [ ] Kiro chat applying a steering rule (for example refusing to edit `src/core/` or `package.json`)
- [ ] `.kiro/hooks/check-feature-on-save.json` in the Agent Hooks panel, and the hook firing after a save (lint and tests run)
- [ ] `openspec/changes/add-babu-shell/` with `design.md` (mood table, streak milestones) and a spec with scenarios
- [ ] Kiro turning a scenario into a failing test, then the passing run (`test(babu): failing tests...` then `feat(babu): ...` in `git log`)
- [ ] The four feature branches and the merge into `integration` done with Kiro

## Quick (owned by Prime and Ralph, CJ collects for the pitch)

- [ ] Quick Research output with citations, used for the library cards
- [ ] Quick Index grounded Q&A answer shown inside Quick
- [ ] Quick Sight partner dashboard from the exported events CSV

## Team chat updates (hours 2, 4 and 6)

Template:

```
CJ update (hour N)
Works: ...
Next: ...
Blocked: ... (or "nothing")
```

## Backup demo video (record once the integrated app is stable)

Shot list, about 90 seconds, phone screen recording:

1. Onboarding: tick consent, start.
2. Home: move the sliders, Babu goes Tired, then OK, then Happy.
3. Check in: coins and streak update. Demo controls: Next day twice, check in to reach the 3-day bonus.
4. Demo controls: Skip 2 days. Rest Mode with its welcome-back message, then check in to wake Babu.
5. Play one round of Arteria Match (a life is spent).
6. Read a library card (life and coins awarded).
7. Risk survey, result with the disclaimer, clinic list.
8. Redeem a voucher, show the QR, verify it on `/care/verify`.
