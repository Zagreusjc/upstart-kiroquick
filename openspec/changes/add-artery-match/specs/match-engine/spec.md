## ADDED Requirements

### Requirement: Deterministic, seedable engine
The system SHALL implement the game rules as a pure TypeScript module with no React or DOM dependency, and SHALL produce identical results for the same seed and the same moves.

#### Scenario: Same seed, same board
- **GIVEN** two games created with the same seed
- **WHEN** the same moves are played
- **THEN** both boards and scores SHALL be identical

### Requirement: Valid start board
The system SHALL create a starting board of 6 columns by 6 rows by default, with no existing matches, no cholesterol and at least one legal move. Other sizes SHALL remain available as options for tests.

#### Scenario: New game
- **GIVEN** any seed
- **WHEN** a game is created with default options
- **THEN** the board SHALL be 6 by 6, no row or column SHALL contain 3 identical tiles, no cell SHALL hold cholesterol and at least one legal swap SHALL exist

#### Scenario: Custom size
- **GIVEN** explicit row and column options
- **WHEN** a game is created
- **THEN** the board SHALL have those dimensions

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
The system SHALL drop normal tiles after a clear, refill empty cells, and resolve new matches until the board is stable. Cholesterol blocks SHALL NOT fall; normal tiles SHALL fall past them into empty cells below.

#### Scenario: Cascade
- **GIVEN** a clear after which falling tiles form a new match
- **WHEN** the board resolves
- **THEN** the new match SHALL also clear and count as a cascade step

#### Scenario: Fixed blocks during gravity
- **GIVEN** a column with a cholesterol block and empty cells below it
- **WHEN** gravity applies
- **THEN** the block SHALL keep its cell and the empty cells SHALL be filled by falling normal tiles or refill
