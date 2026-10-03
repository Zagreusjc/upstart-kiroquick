## ADDED Requirements

### Requirement: Cholesterol plaque blocks
The system SHALL model cholesterol as spreading plaque blocks. A block SHALL NOT be swapped and SHALL NOT take part in matches itself. Blocks SHALL NOT appear on refill; they SHALL only appear by seeding or spreading.

#### Scenario: Block cannot be swapped
- **GIVEN** a cholesterol block next to a normal tile
- **WHEN** the player tries to swap them
- **THEN** the move SHALL be rejected

#### Scenario: Two blocks cannot be swapped
- **GIVEN** two adjacent cholesterol blocks
- **WHEN** the player tries to swap them
- **THEN** the move SHALL be rejected

#### Scenario: Refill never spawns a block
- **GIVEN** any resolved move
- **WHEN** empty cells are refilled
- **THEN** every refilled tile SHALL be a normal tile

### Requirement: Grace period
The system SHALL keep the board free of cholesterol for the first 3 player moves. The start board SHALL NOT contain cholesterol.

#### Scenario: New game
- **GIVEN** any seed
- **WHEN** a game is created
- **THEN** the board SHALL contain no cholesterol block

#### Scenario: No seed during the grace period
- **GIVEN** a new game
- **WHEN** the player resolves moves 1, 2 and 3
- **THEN** no cholesterol block SHALL be seeded

### Requirement: Seeding
The system SHALL seed a single cholesterol block whenever the board has had zero blocks at the end of 2 consecutive resolved player moves, and never before the grace period ends. The seed SHALL replace one normal tile chosen with the game RNG, preferring a cell whose conversion still leaves at least one legal move.

#### Scenario: First seed
- **GIVEN** a new game in which no cholesterol has appeared
- **WHEN** the player resolves move 4
- **THEN** exactly one cholesterol block SHALL be seeded at the end of that move and a `plaqueSeeded` event SHALL be emitted

#### Scenario: Re-seed after the last block is cleared
- **GIVEN** a move that destroys the last cholesterol block on the board
- **WHEN** the next move also ends with zero blocks
- **THEN** a new block SHALL be seeded at the end of that next move and not at the end of the clearing move

#### Scenario: Seed keeps the game playable when possible
- **GIVEN** a plaque-free board where converting some normal tiles would leave no legal move and converting others would not
- **WHEN** a seed is placed
- **THEN** the seed SHALL be placed on a cell that leaves at least one legal move

### Requirement: Spreading
The system SHALL count clean moves, the consecutive resolved player moves in which no cholesterol block was destroyed. When the clean-move count reaches the spread interval, exactly one existing block chosen with the RNG SHALL convert one orthogonally adjacent normal tile chosen with the RNG into cholesterol, and the count SHALL reset to 0. Seeding and spreading SHALL happen once per player move, after all cascades of that move resolve, and SHALL NOT trigger matches.

#### Scenario: Spread after clean moves
- **GIVEN** a board with cholesterol, a score below 2000 and 1 clean move counted
- **WHEN** the player resolves a move that destroys no block
- **THEN** exactly one normal tile orthogonally adjacent to a block SHALL become cholesterol and a `plaqueSpread` event SHALL be emitted

#### Scenario: Destroying a block resets the count
- **GIVEN** a board with two cholesterol blocks and 1 clean move counted
- **WHEN** the player resolves a move that destroys one block
- **THEN** the clean-move count SHALL be 0 and no block SHALL spread

#### Scenario: Only orthogonal normal neighbours are converted
- **GIVEN** a block whose diagonal neighbours are normal tiles
- **WHEN** it spreads
- **THEN** the converted cell SHALL be orthogonally adjacent to a block and SHALL have been a normal tile

#### Scenario: No room to spread
- **GIVEN** a board where no block has a normal orthogonal neighbour
- **WHEN** the spread interval is reached
- **THEN** no tile SHALL be converted

### Requirement: Escalating spread interval
The system SHALL spread after every 2 clean moves while the score is below 2000 and after every clean move at a score of 2000 or more. The interval SHALL never increase as the score rises.

#### Scenario: Early game
- **GIVEN** a score of 0 or 1999
- **WHEN** the spread interval is computed
- **THEN** it SHALL be 2

#### Scenario: Late game
- **GIVEN** a score of 2000 or more
- **WHEN** the spread interval is computed
- **THEN** it SHALL be 1

#### Scenario: Monotonic non-increase
- **GIVEN** two scores where the first is lower
- **WHEN** both intervals are computed
- **THEN** the first interval SHALL be greater than or equal to the second

### Requirement: Immobile blocks
The system SHALL keep cholesterol blocks fixed in their cells. Gravity SHALL move normal tiles down past fixed blocks into empty cells, and refill SHALL fill the remaining empty non-cholesterol cells.

#### Scenario: Tiles pass over plaque
- **GIVEN** a cholesterol block above a cleared cell in the same column
- **WHEN** gravity applies
- **THEN** the block SHALL stay in its cell, normal tiles above or below it SHALL fall into the empty cells beneath them, and refill SHALL fill the remaining empty cells

### Requirement: Adjacent destruction
The system SHALL destroy a cholesterol block only when a cell orthogonally adjacent to it is cleared by a match in that wave. Diagonal neighbours SHALL NOT count.

#### Scenario: Adjacent match destroys a block
- **GIVEN** a cholesterol block orthogonally adjacent to a cell in a new match
- **WHEN** the match clears
- **THEN** the block SHALL be destroyed and score 500 times the wave multiplier

#### Scenario: Diagonal match does not destroy a block
- **GIVEN** a cholesterol block that only touches a matched cell diagonally
- **WHEN** the match clears
- **THEN** the block SHALL remain in its cell

### Requirement: Seeded determinism
The system SHALL make every seeding and spreading choice with the RNG stored in the game state, so the same seed and the same moves produce the same plaque layout.

#### Scenario: Deterministic plaque
- **GIVEN** two games created with the same seed
- **WHEN** the same moves are played
- **THEN** blocks SHALL be seeded and spread in the same cells
