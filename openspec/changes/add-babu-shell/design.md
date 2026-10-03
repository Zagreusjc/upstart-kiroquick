## Context

Owner: CJ. Baboo, the Home tab, onboarding, manual health input and the daily check-in streak. All rules are deterministic and live in plain TypeScript under `src/features/babu-shell/`. Every number below is defined once in `constants.ts`.

## Decisions

### Daily targets

| Input | Target (goal met when value is at or above) | Slider range | Provider clamp |
|---|---|---|---|
| Steps | 6000 | 0 to 20000, step 250 | 0 to 100000, integer |
| Sleep hours | 7 | 0 to 12, step 0.5 | 0 to 24, one decimal |
| Activity minutes | 30 | 0 to 120, step 5 | 0 to 1440, integer |

Rationale: 7 hours is the low end of the adult sleep recommendation, 30 minutes a day is the common way to present WHO's 150 minutes a week, and 6000 steps is an achievable MVP target (one constant, per the open question).

### Mood rule table (`computeMood(snapshot, checkin, today)`)

Rules are checked top to bottom. The first match wins.

| # | Condition | Mood |
|---|---|---|
| 1 | A check-in exists and the last one was 2 or more local days before today | Rest Mode |
| 2 | All 3 goals met | Happy |
| 3 | 1 or 2 goals met | OK |
| 4 | 0 goals met | Tired |

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
