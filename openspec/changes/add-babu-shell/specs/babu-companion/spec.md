## ADDED Requirements

### Requirement: Deterministic Babu mood
The system SHALL compute Babu's state (Happy, OK, Tired or Rest Mode) from steps, sleep hours, activity minutes and the last check-in date using fixed thresholds (steps 6000, sleep 7 hours, activity 30 minutes, each met at or above the target), with no randomness and no AI.

#### Scenario: Good day
- **GIVEN** steps 6000, sleep 7 hours and activity 30 minutes
- **WHEN** Babu's mood is computed
- **THEN** Babu SHALL be Happy

#### Scenario: Partial day
- **GIVEN** steps 8000, sleep 5 hours and activity 0 minutes (1 of 3 goals met)
- **WHEN** Babu's mood is computed
- **THEN** Babu SHALL be OK

#### Scenario: Just below every target
- **GIVEN** steps 5999, sleep 6.5 hours and activity 29 minutes, and a check-in today
- **WHEN** Babu's mood is computed
- **THEN** Babu SHALL be Tired

#### Scenario: Low day
- **GIVEN** none of the targets met but the player checked in today
- **WHEN** Babu's mood is computed
- **THEN** Babu SHALL be Tired

#### Scenario: New player
- **GIVEN** a player who has never checked in
- **WHEN** Babu's mood is computed
- **THEN** the goal rules SHALL apply and Babu SHALL NOT be in Rest Mode

#### Scenario: Same input, same mood
- **GIVEN** the same snapshot, check-in state and date
- **WHEN** the mood is computed twice
- **THEN** both results SHALL be identical

### Requirement: Rest Mode, never death
The system SHALL show Rest Mode with supportive wording when the last check-in was 2 or more local days ago, and Babu SHALL NOT die or be removed.

#### Scenario: Player away
- **GIVEN** the last check-in was 2 or more days ago
- **WHEN** the player opens the app
- **THEN** Babu SHALL be in Rest Mode and the message SHALL be encouraging, not blaming

#### Scenario: Rest Mode wins over goals
- **GIVEN** all 3 goals met and the last check-in 3 days ago
- **WHEN** Babu's mood is computed
- **THEN** Babu SHALL be in Rest Mode

#### Scenario: Checked in yesterday
- **GIVEN** the last check-in was yesterday
- **WHEN** Babu's mood is computed
- **THEN** Babu SHALL NOT be in Rest Mode

#### Scenario: Return from Rest Mode
- **GIVEN** Babu is in Rest Mode
- **WHEN** the player checks in
- **THEN** Babu SHALL leave Rest Mode immediately

### Requirement: Accessible Babu
The system SHALL convey Babu's state with a distinct face and a visible text label, not with color alone.

#### Scenario: State label
- **GIVEN** any mood
- **WHEN** Babu is displayed
- **THEN** the SVG SHALL have an accessible name naming the state and a text label SHALL be visible
