## Why

The "Healthy behavior" goal needs an emotional, low-friction hook. Baboo, a heart-shaped pet, reflects the player's week and makes tracking feel rewarding. The home screen, onboarding and disclaimer also set the tone and the safety messaging for the whole app, and CJ's lane carries the Kiro evidence and the pitch and feasibility pack that the judges score.

## What Changes

- Add Baboo with four states: Happy, OK, Tired and Rest Mode, driven by simple threshold rules on steps, sleep and activity. Baboo never dies.
- Add manual health input (steps, sleep, activity) clearly labeled as demo input, registered as the real `health` provider.
- Add a daily check-in and a login streak that award coins and reset after a missed day.
- Add first-run onboarding with consent and the "Screening awareness, not a diagnosis" disclaimer.
- Add the Home screen that brings these together.
- Platform and pitch duties: keep Kiro evidence visible (steering, hooks, specs) and write the 2-minute pitch, Q&A bank and finals feasibility pack.

## Impact

- Affected specs: babu-companion, health-input, daily-streak, onboarding (all new).
- Affected code: `src/features/babu-shell/` only. Registers the `health` provider through `register(api)`.
- Emits events: `checkin.done`. Uses `useCoins()` to award streak coins.
- Owner: CJ. Branch: `feat/babu-shell`.
