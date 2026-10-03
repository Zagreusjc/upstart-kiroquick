## ADDED Requirements

### Requirement: Cholesterol blocks
The system SHALL spawn cholesterol blocks during refill. A block SHALL NOT be swapped and SHALL NOT take part in matches itself. It SHALL be destroyed when a standard match occurs in an adjacent cell. Whether blocks fall with gravity is decided in `design.md` (recommended: they fall like other tiles but can never be swapped).

#### Scenario: Block cannot be swapped
- **GIVEN** a cholesterol block next to a normal tile
- **WHEN** the player tries to swap them
- **THEN** the move SHALL be rejected

#### Scenario: Two blocks cannot be swapped
- **GIVEN** two adjacent cholesterol blocks
- **WHEN** the player tries to swap them
- **THEN** the move SHALL be rejected

#### Scenario: Adjacent match destroys a block
- **GIVEN** a cholesterol block adjacent to a cell in a new match
- **WHEN** the match clears
- **THEN** the block SHALL be destroyed

### Requirement: Escalating spawn chance
The system SHALL scale the per-cell spawn chance from 3% at the start of a session to 10% at the score cap defined in the design.

#### Scenario: Start of session
- **GIVEN** a score of 0
- **WHEN** the spawn chance is computed
- **THEN** it SHALL be 3%

#### Scenario: High score
- **GIVEN** a score at or above the cap
- **WHEN** the spawn chance is computed
- **THEN** it SHALL be 10%

#### Scenario: Monotonic increase
- **GIVEN** two scores where the first is lower
- **WHEN** both chances are computed
- **THEN** the first chance SHALL be less than or equal to the second

### Requirement: Seeded spawning
The system SHALL use the injected RNG for spawn decisions so tests are deterministic.

#### Scenario: Deterministic spawn
- **GIVEN** the same seed and moves
- **WHEN** blocks spawn
- **THEN** they SHALL spawn in the same cells
