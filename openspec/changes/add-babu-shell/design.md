## Context

Owner: CJ. Refine this file with Kiro before implementing. Keep it short.

## Decisions to make

- Mood rule table: exact thresholds for steps, sleep and activity that map to Happy, OK, Tired and Rest Mode. Put the thresholds in one constants file and write them in the spec scenarios.
- How Rest Mode is entered and exited (for example after 2 days with no check-in) and how it is worded so it feels supportive, not punishing.
- Babu artwork: one SVG heart with facial expressions per state, no external assets.
- Streak rules: what counts as "a day" (local calendar date), the bonus milestones (for example day 3 and day 7).
- Where to store first-run and consent flags.

## Risks

- Health input is manual. The UI must say "demo input" so judges are not misled.
- Mood logic must stay deterministic and unit tested. Do not use AI here.
- Tone: avoid fear or guilt language anywhere.

## Open questions

- Should the daily step target be a fixed number (for example 6000) for the MVP? Recommended: yes, one constant.
