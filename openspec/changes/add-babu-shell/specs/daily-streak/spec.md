## ADDED Requirements

### Requirement: Daily check-in
The system SHALL let the player check in once per local calendar day and SHALL award coins once per day using an idempotency key.

#### Scenario: First check-in today
- **GIVEN** no check-in today
- **WHEN** the player taps check in
- **THEN** coins SHALL be awarded with source `checkin`, the streak SHALL update and a `checkin.done` event SHALL be emitted

#### Scenario: Second tap the same day
- **GIVEN** the player already checked in today
- **WHEN** they tap check in again
- **THEN** no coins SHALL be awarded and the streak SHALL NOT change

### Requirement: Streak rules
The system SHALL increase the streak on consecutive days, reset it after a missed day, and award a bonus at defined milestones.

#### Scenario: Consecutive days
- **GIVEN** a streak of 2 and a check-in yesterday
- **WHEN** the player checks in today
- **THEN** the streak SHALL be 3

#### Scenario: Missed day
- **GIVEN** a last check-in 2 days ago
- **WHEN** the player checks in today
- **THEN** the streak SHALL reset to 1

#### Scenario: Milestone bonus
- **GIVEN** a streak of 2 and a check-in yesterday
- **WHEN** the player checks in and reaches the first milestone
- **THEN** a one-time bonus of coins SHALL be awarded with source `streak`
