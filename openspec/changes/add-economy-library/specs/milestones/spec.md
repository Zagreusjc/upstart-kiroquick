## ADDED Requirements

### Requirement: Transparent milestone tiers
The system SHALL show reward tiers with visible requirements and progress, and SHALL NOT use random rewards.

#### Scenario: Progress is visible
- **GIVEN** the player has read 2 cards and the first tier needs 3
- **WHEN** the milestones screen opens
- **THEN** it SHALL show 2 of 3 and what unlocks at 3

#### Scenario: Tier unlocks
- **GIVEN** the player has read 2 cards
- **WHEN** the player reads a third card
- **THEN** the "screening discount" tier SHALL unlock and coins SHALL be awarded once with source `milestone`

#### Scenario: Unlock is permanent
- **GIVEN** a tier is unlocked
- **WHEN** the app is reloaded
- **THEN** the tier SHALL still be unlocked and SHALL NOT award coins again
