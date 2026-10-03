## ADDED Requirements

### Requirement: Deterministic, seedable engine
The system SHALL implement the game rules as a pure TypeScript module with no React or DOM dependency, and SHALL produce identical results for the same seed and the same moves.

#### Scenario: Same seed, same board
- **GIVEN** two games created with the same seed
- **WHEN** the same moves are played
- **THEN** both boards and scores SHALL be identical

### Requirement: Valid start board
The system SHALL create a starting board with no existing matches and at least one legal move.

#### Scenario: New game
- **GIVEN** any seed
- **WHEN** a game is created
- **THEN** no row or column SHALL contain 3 identical tiles and at least one legal swap SHALL exist

### Requirement: Swap and match
The system SHALL accept a swap of two adjacent non-cholesterol tiles only if it creates a match of 3 or more in a row or column.

#### Scenario: Valid swap
- **GIVEN** a swap that creates 3 in a row
- **WHEN** the swap is attempted
- **THEN** the matched tiles SHALL clear

#### Scenario: Invalid swap
- **GIVEN** a swap that creates no match
- **WHEN** the swap is attempted
- **THEN** the board SHALL NOT change and the move SHALL be rejected

#### Scenario: Non-adjacent swap
- **GIVEN** two tiles that are not adjacent
- **WHEN** a swap is attempted
- **THEN** it SHALL be rejected

### Requirement: Gravity, refill and cascades
The system SHALL drop tiles after a clear, refill the top, and resolve new matches until the board is stable.

#### Scenario: Cascade
- **GIVEN** a clear after which falling tiles form a new match
- **WHEN** the board resolves
- **THEN** the new match SHALL also clear and count as a cascade step
