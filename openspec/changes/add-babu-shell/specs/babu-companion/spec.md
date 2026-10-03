## ADDED Requirements

### Requirement: Deterministic Babu mood
The system SHALL compute Babu's state (Happy, OK, Tired or Rest Mode) from steps, sleep hours and activity minutes using fixed thresholds, with no randomness and no AI.

#### Scenario: Good day
- **GIVEN** steps, sleep and activity all at or above their targets
- **WHEN** Babu's mood is computed
- **THEN** Babu SHALL be Happy

#### Scenario: Partial day
- **GIVEN** some but not all targets met
- **WHEN** Babu's mood is computed
- **THEN** Babu SHALL be OK

#### Scenario: Low day
- **GIVEN** none of the targets met but the player checked in today
- **WHEN** Babu's mood is computed
- **THEN** Babu SHALL be Tired

#### Scenario: Same input, same mood
- **GIVEN** the same snapshot and check-in state
- **WHEN** the mood is computed twice
- **THEN** both results SHALL be identical

### Requirement: Rest Mode, never death
The system SHALL show Rest Mode with supportive wording when the player has been away, and Babu SHALL NOT die or be removed.

#### Scenario: Player away
- **GIVEN** no check-in for 2 or more days
- **WHEN** the player opens the app
- **THEN** Babu SHALL be in Rest Mode and the message SHALL be encouraging, not blaming

#### Scenario: Return from Rest Mode
- **GIVEN** Babu is in Rest Mode
- **WHEN** the player checks in
- **THEN** Babu SHALL leave Rest Mode immediately
