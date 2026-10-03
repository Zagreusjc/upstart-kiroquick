## ADDED Requirements

### Requirement: Deterministic, seedable engine
The system SHALL implement the game rules as a pure TypeScript module with no React or DOM dependency, and SHALL produce identical results for the same seed and the same moves.

#### Scenario: Same seed, same board
- **GIVEN** two games created with the same seed
- **WHEN** the same moves are played
- **THEN** both boards and scores SHALL be identical

### Requirement: Valid start board
The system SHALL create a starting board of 5 columns by 5 rows by default, with no existing matches, no cholesterol and at least one legal move. Other sizes SHALL remain available as options for tests.

#### Scenario: New game
- **GIVEN** any seed
- **WHEN** a game is created with default options
- **THEN** the board SHALL be 5 by 5, no row or column SHALL contain 3 identical tiles, no cell SHALL hold cholesterol and at least one legal swap SHALL exist

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

### Requirement: Refill avoids accidental matches
The system SHALL choose each refilled tile so that it does not complete a line of 3 identical tiles with the tiles currently around it, so a refill never starts a cascade by luck. Only tiles dropping into place MAY set off an automatic cascade. If every tile type would complete a line at a cell, the system MAY place any type there. The choice SHALL still use the injected RNG, one draw per refilled tile.

#### Scenario: Refill into a stable board
- **GIVEN** a move that clears 3 tiles in the top row so that nothing above them falls
- **WHEN** the row is refilled, for any seed
- **THEN** the refilled tiles SHALL NOT create a new match and the move SHALL end after one wave

#### Scenario: Deterministic refill
- **GIVEN** the same RNG state and the same surrounding tiles
- **WHEN** a tile is refilled twice
- **THEN** the same tile type SHALL be chosen both times

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

### Requirement: Feedback for a swap that makes no match
The system SHALL show the two swapped tiles trading places and then returning to their original cells when the player swaps two normal tiles that do not create a match. The board and score SHALL stay unchanged and no move SHALL be counted. Input SHALL be ignored while the animation plays. A swap involving a cholesterol block is rejected without this animation (the board shakes instead). When the player prefers reduced motion, the animation SHALL be skipped and the "No match there" message SHALL still be shown.

#### Scenario: No-match swap
- **GIVEN** two adjacent normal tiles whose swap creates no match
- **WHEN** the player swaps them
- **THEN** the tiles SHALL slide into each other's cells and back, the board SHALL be unchanged, and no move or life SHALL be spent

#### Scenario: Cholesterol swap
- **GIVEN** a swap that includes a cholesterol block
- **WHEN** the player attempts it
- **THEN** no tile SHALL slide and the swap SHALL be rejected
