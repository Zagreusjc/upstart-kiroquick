## ADDED Requirements

### Requirement: First-run onboarding
The system SHALL show onboarding on first launch with a short explanation, consent to store data on the device, and the disclaimer "Screening awareness, not a diagnosis".

#### Scenario: First launch
- **GIVEN** a fresh install
- **WHEN** the Home tab opens
- **THEN** onboarding SHALL appear before the Babu screen

#### Scenario: Completed onboarding
- **GIVEN** the player accepted onboarding
- **WHEN** the app is reopened
- **THEN** onboarding SHALL NOT appear again

#### Scenario: Consent is required
- **GIVEN** onboarding is showing
- **WHEN** the player has not accepted
- **THEN** the player SHALL NOT be able to enter the Home screen

### Requirement: Home screen
The system SHALL present Babu, today's snapshot, the check-in button and the streak on the Home screen.

#### Scenario: Home content
- **GIVEN** onboarding is complete
- **WHEN** the Home tab opens
- **THEN** Babu, the health snapshot, the check-in button and the streak SHALL be visible
