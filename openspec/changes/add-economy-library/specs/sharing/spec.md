## ADDED Requirements

### Requirement: Share for a life
The system SHALL let the player share the app through the Web Share API and SHALL award 1 life once per completed share event.

#### Scenario: Successful share
- **GIVEN** fewer than 3 lives
- **WHEN** the player completes a share
- **THEN** 1 life SHALL be awarded and a `share.completed` event SHALL be emitted

#### Scenario: Share cancelled
- **GIVEN** the share sheet is open
- **WHEN** the player cancels
- **THEN** no life SHALL be awarded

#### Scenario: Web Share unavailable
- **GIVEN** a browser without the Web Share API
- **WHEN** the player taps share
- **THEN** the system SHALL copy the share link to the clipboard and show a confirmation, and SHALL NOT crash
