## ADDED Requirements

### Requirement: Deterministic risk estimate
The system SHALL compute a cardiovascular risk band from age, sex, systolic blood pressure, smoking status, BMI and diabetes status using a published, cited chart or checklist encoded as data, and SHALL NOT use AI or randomness.

#### Scenario: Same input, same band
- **GIVEN** identical survey answers
- **WHEN** the risk is computed twice
- **THEN** both results SHALL be identical

#### Scenario: Reference case
- **GIVEN** a reference input taken from the active model's source (the WHO chart, or the simplified checklist table in `design.md`)
- **WHEN** the risk is computed
- **THEN** the band SHALL match the source

#### Scenario: Higher risk factors raise the band
- **GIVEN** two inputs that differ only by a smoker versus a non-smoker
- **WHEN** both are assessed
- **THEN** the smoker's band SHALL be greater than or equal to the non-smoker's

### Requirement: Input validation
The system SHALL reject out-of-range answers and SHALL explain what is valid.

#### Scenario: Invalid blood pressure
- **GIVEN** the survey form
- **WHEN** the player enters a systolic pressure of 20
- **THEN** the form SHALL show an error and SHALL NOT compute a result

### Requirement: Safe messaging
The system SHALL show "Screening awareness, not a diagnosis" with every result and SHALL recommend seeing a health professional for moderate or higher bands.

#### Scenario: Result screen
- **GIVEN** a computed result
- **WHEN** the result screen opens
- **THEN** it SHALL show the band, the disclaimer, the next-step advice and a link to nearby clinics, and a `risk.assessed` event SHALL be emitted

### Requirement: Reward for completing the check
The system SHALL award 20 coins and 1 life through the coins and lives providers when the player completes the Heart Risk Check, at most once per local calendar day, and SHALL give the same reward for every result.

#### Scenario: First check of the day
- **GIVEN** no survey reward claimed today
- **WHEN** the player submits a valid survey
- **THEN** 20 coins and 1 life SHALL be awarded and the result screen SHALL say so

#### Scenario: Repeat check the same day
- **GIVEN** the reward was already claimed today
- **WHEN** the player submits the survey again
- **THEN** no coins or lives SHALL be awarded and the screen SHALL say to come back tomorrow

#### Scenario: Invalid survey
- **GIVEN** a survey with invalid answers
- **WHEN** it is submitted
- **THEN** no reward SHALL be awarded

### Requirement: Fallback model is labeled
If the official chart is not used, the system SHALL label the result as a simplified screen.

#### Scenario: Fallback in use
- **GIVEN** the simplified checklist model is active
- **WHEN** a result is shown
- **THEN** the screen SHALL say it is a simplified screen and not the WHO chart
