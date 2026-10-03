## ADDED Requirements

### Requirement: A game costs a life
The system SHALL spend 1 life through `LivesProvider` when a game starts and SHALL NOT start a game at 0 lives.

#### Scenario: Start with lives
- **GIVEN** 2 lives
- **WHEN** the player starts a game
- **THEN** lives SHALL become 1 and the game SHALL start

#### Scenario: Start without lives
- **GIVEN** 0 lives
- **WHEN** the player taps play
- **THEN** no game SHALL start and the screen SHALL explain how to earn lives (read a library card, share, be active)

### Requirement: Loss by full occlusion
The system SHALL end the game when no legal move exists.

#### Scenario: No legal moves
- **GIVEN** a board where no swap creates a match
- **WHEN** the board stabilizes
- **THEN** the game SHALL end with a "Complete Arterial Occlusion" message

#### Scenario: Still playable
- **GIVEN** a board with at least one legal swap
- **WHEN** the board stabilizes
- **THEN** the game SHALL continue

### Requirement: Game end rewards and events
The system SHALL award coins by score band through `CoinsProvider` with source `game_score` and SHALL emit `game.finished` with the score and cholesterol cleared.

#### Scenario: Game ends
- **GIVEN** a finished game with a score
- **WHEN** the game over screen opens
- **THEN** coins SHALL be awarded once for that game and `game.finished` SHALL be emitted once
