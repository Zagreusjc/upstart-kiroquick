## ADDED Requirements

### Requirement: Daily check-in
The system SHALL let the player check in once per local calendar day and SHALL award 10 coins once per day with source `checkin` and the idempotency key `checkin:daily:<yyyy-mm-dd>`.

#### Scenario: First check-in today
- **GIVEN** no check-in today
- **WHEN** the player taps check in
- **THEN** 10 coins SHALL be awarded with source `checkin`, the streak SHALL update and a `checkin.done` event SHALL be emitted with the date and the new streak

#### Scenario: Second tap the same day
- **GIVEN** the player already checked in today
- **WHEN** they tap check in again
- **THEN** no coins SHALL be awarded, the streak SHALL NOT change and no event SHALL be emitted

### Requirement: Streak rules
The system SHALL increase the streak on consecutive local days, reset it to 1 after a missed day, and award a bonus with source `streak` when the streak reaches 3 days (20 coins), 7 days (50), 14 days (80) or 30 days (150).

#### Scenario: First ever check-in
- **GIVEN** a player who has never checked in
- **WHEN** they check in
- **THEN** the streak SHALL be 1

#### Scenario: Consecutive days
- **GIVEN** a streak of 2 and a check-in yesterday
- **WHEN** the player checks in today
- **THEN** the streak SHALL be 3

#### Scenario: Missed day
- **GIVEN** a last check-in 2 days ago
- **WHEN** the player checks in today
- **THEN** the streak SHALL reset to 1

#### Scenario: Month boundary
- **GIVEN** a streak of 4 and a last check-in on 2026-10-31
- **WHEN** the player checks in on 2026-11-01
- **THEN** the streak SHALL be 5

#### Scenario: Milestone bonus
- **GIVEN** a streak of 2 and a check-in yesterday
- **WHEN** the player checks in and reaches the first milestone (3 days)
- **THEN** a one-time bonus of 20 coins SHALL be awarded with source `streak` in addition to the daily 10

#### Scenario: Displayed streak after a gap
- **GIVEN** a stored streak of 5 and a last check-in 2 days ago
- **WHEN** the Home screen shows the streak
- **THEN** it SHALL show 0 with an invitation to start a fresh streak, not a loss message

### Requirement: Demo day controls
The system SHALL offer clearly labeled demo controls that move Babu's day forward so the streak, milestones and Rest Mode can be shown in one sitting.

#### Scenario: Next day
- **GIVEN** the player checked in today
- **WHEN** they tap "Next day" in the demo controls
- **THEN** the check-in button SHALL be available again and checking in SHALL grow the streak
