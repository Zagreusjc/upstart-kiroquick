## ADDED Requirements

### Requirement: Manual demo health input
The system SHALL let the player enter steps, sleep hours and activity minutes manually with labeled sliders, SHALL label the input as demo input, and SHALL register the real `health` provider.

#### Scenario: Update values
- **GIVEN** the Home screen
- **WHEN** the player sets steps to 8000, sleep to 7 and activity to 30
- **THEN** the health snapshot SHALL show those values and Baboo's mood SHALL update to Happy

#### Scenario: Out-of-range input
- **GIVEN** the health provider
- **WHEN** it receives sleep of 30 hours or negative steps
- **THEN** the values SHALL be clamped to 0 to 24 hours of sleep, 0 to 100000 steps and 0 to 1440 activity minutes

#### Scenario: Invalid number
- **GIVEN** a stored value
- **WHEN** the provider receives a value that is not a finite number
- **THEN** the previous value SHALL be kept

#### Scenario: Demo label
- **GIVEN** the health input area
- **WHEN** it is displayed
- **THEN** it SHALL say the values are demo input

#### Scenario: Persistence
- **GIVEN** entered values
- **WHEN** the app is reloaded
- **THEN** the values SHALL still be shown

#### Scenario: Stable snapshot
- **GIVEN** no update since the last read
- **WHEN** `snapshot()` is called twice
- **THEN** it SHALL return the same object
