## ADDED Requirements

### Requirement: Points
The system SHALL award 30 points for a standard 3-tile match and 500 points for each cholesterol block cleared.

#### Scenario: Basic match
- **GIVEN** a single 3-tile match with no cascade
- **WHEN** it clears
- **THEN** the score SHALL increase by 30

#### Scenario: Cholesterol cleared
- **GIVEN** a match that destroys one cholesterol block
- **WHEN** it clears
- **THEN** the score SHALL increase by the match points plus 500

### Requirement: Cascade multipliers
The system SHALL multiply points by 2 for the first automatic cascade, 3 for the second and 4 for the third and beyond.

#### Scenario: First cascade
- **GIVEN** a player move followed by one automatic match
- **WHEN** the board resolves
- **THEN** the automatic match SHALL score with a 2x multiplier

#### Scenario: Multiplier cap
- **GIVEN** five automatic matches in a row
- **WHEN** the board resolves
- **THEN** the fourth and fifth SHALL score with a 4x multiplier

### Requirement: Combo callouts
The system SHALL show a short callout (for example "Optimal Flow!") for large combos, and SHALL NOT rely on sound alone.

#### Scenario: Big combo
- **GIVEN** a move that triggers a cascade of 3 or more
- **WHEN** the board resolves
- **THEN** a visible callout SHALL appear
