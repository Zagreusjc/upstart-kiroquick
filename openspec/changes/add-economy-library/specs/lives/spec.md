## ADDED Requirements

### Requirement: Lives bounds
The system SHALL start the player with 3 lives, never allow fewer than 0, and never allow more than 3.

#### Scenario: New player
- **GIVEN** a first launch
- **WHEN** the header is shown
- **THEN** it SHALL display 3 of 3 lives

#### Scenario: No lives left
- **GIVEN** 0 lives
- **WHEN** a life is spent
- **THEN** the spend SHALL fail and lives SHALL remain 0

#### Scenario: Refill cap
- **GIVEN** 3 lives
- **WHEN** a life is awarded
- **THEN** lives SHALL remain 3

### Requirement: Ways to refill lives
The system SHALL refill lives when the player reads a library card for the first time, shares the game, reaches the daily steps target, or logs enough sleep.

#### Scenario: Read a card
- **GIVEN** 1 life and an unread card
- **WHEN** the player reads the card
- **THEN** lives SHALL increase by 1 exactly once for that card

#### Scenario: Steps target reached
- **GIVEN** 2 lives and no steps refill today
- **WHEN** the health snapshot reaches the daily steps target
- **THEN** lives SHALL increase by 1 and SHALL NOT refill again until the next day

#### Scenario: Enough sleep
- **GIVEN** 2 lives and no sleep refill today
- **WHEN** the health snapshot shows at least the sleep target
- **THEN** lives SHALL increase by 1 and SHALL NOT refill again until the next day
