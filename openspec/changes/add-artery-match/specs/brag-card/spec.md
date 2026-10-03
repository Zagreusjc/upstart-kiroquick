## ADDED Requirements

### Requirement: Shareable brag card
The system SHALL generate a PNG card with the player's score and a challenge message (for example "My Vascular Flow Score is 24,500! Can you clear your arteries faster?") and SHALL let the player share it.

#### Scenario: Card generated
- **GIVEN** the game over screen
- **WHEN** the player taps share
- **THEN** a PNG with the score SHALL be generated

#### Scenario: Share awards a life
- **GIVEN** fewer than 3 lives and a completed share
- **WHEN** the share succeeds
- **THEN** 1 life SHALL be awarded and `share.completed` SHALL be emitted

#### Scenario: Share cancelled
- **GIVEN** the share sheet is open
- **WHEN** the player cancels
- **THEN** no life SHALL be awarded

#### Scenario: No Web Share support
- **GIVEN** a browser without file sharing
- **WHEN** the player taps share
- **THEN** the image SHALL be offered as a download and the game SHALL keep working
