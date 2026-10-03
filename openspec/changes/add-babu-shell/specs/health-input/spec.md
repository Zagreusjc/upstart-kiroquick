## ADDED Requirements

### Requirement: Manual demo health input
The system SHALL let the player enter steps, sleep hours and activity minutes manually, SHALL label the input as demo input, and SHALL register the real `health` provider.

#### Scenario: Update values
- **GIVEN** the Home screen
- **WHEN** the player sets steps to 8000, sleep to 7 and activity to 30
- **THEN** the health snapshot SHALL show those values and Babu's mood SHALL update

#### Scenario: Out-of-range input
- **GIVEN** the inputs
- **WHEN** the player enters sleep of 30 hours or negative steps
- **THEN** the values SHALL be clamped to valid ranges

#### Scenario: Demo label
- **GIVEN** the health input area
- **WHEN** it is displayed
- **THEN** it SHALL say the values are demo input

#### Scenario: Persistence
- **GIVEN** entered values
- **WHEN** the app is reloaded
- **THEN** the values SHALL still be shown
