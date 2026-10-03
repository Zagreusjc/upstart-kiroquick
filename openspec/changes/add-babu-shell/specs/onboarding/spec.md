## ADDED Requirements

### Requirement: First-run onboarding
The system SHALL show onboarding on first launch with a short explanation, consent to store data on the device, and the disclaimer "Screening awareness, not a diagnosis", and SHALL persist the accepted flag in `inlababu.babu.v1`.

#### Scenario: First launch
- **GIVEN** a fresh install
- **WHEN** the Home tab opens
- **THEN** onboarding SHALL appear before the Baboo screen

#### Scenario: Completed onboarding
- **GIVEN** the player accepted onboarding
- **WHEN** the app is reopened
- **THEN** onboarding SHALL NOT appear again

#### Scenario: Consent is required
- **GIVEN** onboarding is showing
- **WHEN** the player has not ticked the consent box
- **THEN** the start button SHALL be disabled and the player SHALL NOT be able to enter the Home screen

### Requirement: Home screen
The system SHALL present Baboo, today's snapshot, the health input, the check-in button, the streak and the "Screening awareness, not a diagnosis" disclaimer on the Home screen.

#### Scenario: Home content
- **GIVEN** onboarding is complete
- **WHEN** the Home tab opens
- **THEN** Baboo, the health snapshot, the check-in button, the streak and the disclaimer SHALL be visible
