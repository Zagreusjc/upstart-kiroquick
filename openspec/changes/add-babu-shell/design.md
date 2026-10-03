## Context

Owner: CJ. Baboo, the Home tab, onboarding, manual health input and the daily check-in streak. All rules are deterministic and live in plain TypeScript under `src/features/babu-shell/`. Every number below is defined once in `constants.ts`.

## Decisions

### Daily targets

| Input | Target (goal met when value is at or above) | Slider range | Provider clamp |
|---|---|---|---|
| Steps | 6000 | 0 to 20000, step 250 | 0 to 100000, integer |
| Sleep hours | 7 to 10 (a healthy range, not "more is better") | 0 to 12, step 0.5 | 0 to 24, one decimal |
| Activity minutes | 30 | 0 to 120, step 5 | 0 to 1440, integer |

Rationale: 7 hours is the low end of the adult sleep recommendation, 30 minutes a day is the common way to present WHO's 150 minutes a week, and 6000 steps is an achievable MVP target (one constant, per the open question).

### Mood rule table (`computeMood(snapshot, checkin, today)`)

Counting goals alone let one factor hide another (for example 0 hours of sleep with maxed steps and activity still read as a decent day). The rules now score each factor and let the weakest link win. All numbers live in `MOOD_RULES` in `constants.ts`; the pure function is `assessDay(snapshot)` in `mood.ts`.

Factor scores, each 0 to 1:
- Steps: `steps / 6000`, capped at 1. Activity: `minutes / 30`, capped at 1.
- Sleep: `hours / 7` up to 7 h, 1 from 7 to 10 h, then minus 0.125 per extra hour (floor 0.5).
- Energy (shown as 0 to 100%) = 40% sleep + 30% steps + 30% activity. Sleep weighs most because it is the hardest to make up for.

Rules are checked top to bottom. The first match wins.

| # | Condition | Mood |
|---|---|---|
| 1 | A check-in exists and the last one was 2 or more local days before today | Rest Mode |
| 2 | Sleep under 4 h | Tired (hint: sleep) |
| 3 | Steps and activity both under 25% of their goals | Tired (hint: move) |
| 4 | All 3 goals met (sleep within 7 to 10 h) | Happy |
| 5 | Energy 50% or more | OK |
| 6 | Otherwise | Tired |

Examples: 0 h sleep + maxed movement = Tired, 60% energy. 5.5 h sleep + maxed movement = OK. 12 h sleep + other goals met = OK. 8 h sleep + no movement = Tired. Just below every target = OK, 96%.

The snapshot card shows "Baboo right now", an energy meter and a hint for the weakest goal while the player moves the sliders, so the link between input and mood is visible below the fold too.

- A player who has never checked in is not in Rest Mode (fresh players start from the goal rules).
- A last check-in dated after today (clock moved back) is treated as "not away".
- Same inputs always give the same mood. No randomness, no AI, no `Date.now()` inside the function: `today` is passed in.

### Rest Mode

- Enter: last check-in is 2 or more days ago (yesterday was missed).
- Exit: checking in today. The mood is recomputed immediately and falls through to the goal rules.
- Baboo never dies, shrinks or loses anything. Rest Mode is a sleeping heart with a "z", a soft lavender color and this wording: "Baboo is resting and saved a spot for you. Welcome back! Check in to wake Baboo up."

### Mood messages (positive framing)

| Mood | Message |
|---|---|
| Happy | Baboo is happy! You reached all 3 goals today. |
| OK | Baboo is doing OK. {n} of 3 goals reached, nice progress. |
| Tired | Baboo is a little tired. A short walk or an early night will perk Baboo up. |
| Rest Mode | Baboo is resting and saved a spot for you. Welcome back! Check in to wake Baboo up. |

Color is never the only signal: each state has its own face and a visible text label.

### Check-in and streak (`applyCheckin(state, today)`)

- A "day" is the local calendar date (`todayISO()` from core). Day gaps are computed from `yyyy-mm-dd` strings in UTC, so time zones and DST do not matter.
- Same day as the last check-in: nothing changes, no coins.
- Exactly 1 day later: streak + 1.
- Anything else (first ever, 2 or more days later, or a date before the last check-in): streak = 1.
- Each check-in awards 10 coins, source `checkin`, key `dayKey('checkin', 'daily')`.
- Milestones award a bonus, source `streak`, key `dayKey('streak', 'day-<n>')`:

| Streak reaches | Bonus |
|---|---|
| 3 days | 20 coins |
| 7 days | 50 coins |
| 14 days | 80 coins |
| 30 days | 150 coins |

- A milestone pays again if a later streak reaches it again. That's still one payment per milestone per day, and it can't be farmed faster than real days.
- The displayed streak is the stored streak if the last check-in was today or yesterday, otherwise 0 ("Start a fresh streak today").
- Emits `checkin.done` with `{ date, streak }` after a successful check-in.

### Demo day controls

Collapsed "Demo controls" panel on Home: "Next day", "Skip 2 days" and "Reset demo days". They shift a persisted day offset that only Baboo's clock uses, so the streak, milestones and Rest Mode can be shown on a phone in one sitting. They are labeled as demo controls.

### Health provider

`createHealthProvider()` implements `HealthProvider`. It clamps to the ranges above, keeps the previous value when a patch value is not a finite number, returns the same snapshot object until data changes, persists to `inlababu.babu.health.v1` and notifies subscribers. Registered from `register(api)` in `index.ts`. Values persist across reloads and are not reset at midnight in the MVP.

### Storage (all through `src/core/storage.ts`)

| Key | Content |
|---|---|
| `inlababu.babu.v1` | `{ onboardedAt, lastCheckin, streak, dayOffset }` |
| `inlababu.babu.health.v1` | Health snapshot |

### Liquid Glass styling (Home tab)

Inspired by Apple's iOS 26 Liquid Glass (WWDC 2025): translucent surfaces that blur and saturate what is behind them, bright specular rims, tinted glass for prominent actions, capsule shapes and springy presses. Everything is in `glass.css` (classes prefixed `lg-`) and `components/GlassScene.tsx`.

- Scene: a soft pink, teal and lilac aurora drifts slowly behind every Home tab screen, so the glass has color to pick up.
- `lg-glass` (buttons): blur 18px + saturate 180%, white rim, inner glow, layered shadow, press scales to 95% with a spring curve. Tints: `--pink` (Play, check-in), `--teal` (Baboo, Library, Blood Bank, Refer a Buddy, Settings), `--clear` (Get screened, demo controls).
- `lg-card` (content cards) and `lg-pill` (labels, back links): more frosted so text stays readable.
- Web limit: true refraction needs an SVG filter inside `backdrop-filter`, which iPhone Safari does not support, so the edge is simulated with highlights. `-webkit-backdrop-filter` is included for Safari.
- Fallbacks: solid fills when `backdrop-filter` is unsupported or `prefers-reduced-transparency` is on; no drifting or press animation with `prefers-reduced-motion`.
- The app header and bottom tab bar belong to the shell (Jolo) and are not glass yet; a floating glass tab bar would complete the look.

### Baboo artwork

One inline SVG heart (no external assets). Each state changes the face (eyes, mouth, cheeks), the fill color and the visible label. `role="img"` with an `aria-label` such as "Baboo is happy".

### Module layout

- `constants.ts`: targets, ranges, coins, milestones, storage keys, messages
- `dates.ts`: `daysBetween`, `shiftDate`
- `mood.ts`: `goalsMet`, `computeMood`
- `streak.ts`: `applyCheckin`, `currentStreak`, `milestoneBonus`, `nextMilestone`
- `healthProvider.ts`: the real `HealthProvider`
- `store.ts`: persisted Baboo state, `acceptOnboarding`, `checkIn`, demo day controls
- `components/`: `Baboo`, `HealthInput`, `CheckinCard`, `Onboarding`, `Home`, `DemoControls`

## Risks

- Health input is manual. The UI says "Demo input" so judges are not misled.
- Mood and streak logic stay deterministic and unit tested.
- Tone: no fear or guilt language anywhere. Rest Mode and a reset streak are framed as a welcome back.
