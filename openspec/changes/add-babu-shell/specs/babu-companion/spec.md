## ADDED Requirements

### Requirement: Deterministic Baboo mood
The system SHALL compute Baboo's state (Happy, OK, Tired or Rest Mode) from steps, sleep hours, activity minutes and the last check-in date with fixed rules and no randomness or AI. Goals: steps 6000 or more, activity 30 minutes or more, and sleep in a healthy range of 7 to 10 hours. Each factor SHALL score from 0 to 1 against its goal, and Baboo's energy SHALL be 40% sleep, 30% steps and 30% activity. Happy SHALL require all three goals. Sleep under 4 hours, or steps and activity both under 25% of their goals, SHALL make Baboo Tired whatever the other values are. Otherwise Baboo SHALL be OK at 50% energy or more and Tired below it.

#### Scenario: Good day
- **GIVEN** steps 6000, sleep 7 hours and activity 30 minutes
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL be Happy

#### Scenario: No sleep
- **GIVEN** sleep 0 hours with steps and activity at their maximum
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL be Tired and the hint SHALL point at sleep

#### Scenario: Short sleep
- **GIVEN** sleep 5.5 hours with steps and activity at their maximum
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL be OK, not Happy

#### Scenario: Too much sleep
- **GIVEN** sleep 12 hours with the other goals met
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL be OK, not Happy

#### Scenario: No movement
- **GIVEN** sleep 8 hours, 0 steps and 0 activity minutes
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL be Tired

#### Scenario: Partial day
- **GIVEN** steps 8000, sleep 5 hours and activity 0 minutes
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL be OK

#### Scenario: Just below every target
- **GIVEN** steps 5999, sleep 6.5 hours and activity 29 minutes, and a check-in today
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL be OK with 96% energy

#### Scenario: Low day
- **GIVEN** energy under 50% and a check-in today
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL be Tired

#### Scenario: Sliders show the effect
- **GIVEN** the Home tab
- **WHEN** the player moves any slider
- **THEN** the snapshot card SHALL show Baboo's current mood, an energy meter and a hint for the weakest goal

#### Scenario: New player
- **GIVEN** a player who has never checked in
- **WHEN** Baboo's mood is computed
- **THEN** the goal rules SHALL apply and Baboo SHALL NOT be in Rest Mode

#### Scenario: Same input, same mood
- **GIVEN** the same snapshot, check-in state and date
- **WHEN** the mood is computed twice
- **THEN** both results SHALL be identical

### Requirement: Rest Mode, never death
The system SHALL show Rest Mode with supportive wording when the last check-in was 2 or more local days ago, and Baboo SHALL NOT die or be removed.

#### Scenario: Player away
- **GIVEN** the last check-in was 2 or more days ago
- **WHEN** the player opens the app
- **THEN** Baboo SHALL be in Rest Mode and the message SHALL be encouraging, not blaming

#### Scenario: Rest Mode wins over goals
- **GIVEN** all 3 goals met and the last check-in 3 days ago
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL be in Rest Mode

#### Scenario: Checked in yesterday
- **GIVEN** the last check-in was yesterday
- **WHEN** Baboo's mood is computed
- **THEN** Baboo SHALL NOT be in Rest Mode

#### Scenario: Return from Rest Mode
- **GIVEN** Baboo is in Rest Mode
- **WHEN** the player checks in
- **THEN** Baboo SHALL leave Rest Mode immediately

### Requirement: Accessible Baboo
The system SHALL convey Baboo's state with a distinct face and a visible text label, not with color alone.

#### Scenario: State label
- **GIVEN** any mood
- **WHEN** Baboo is displayed
- **THEN** the SVG SHALL have an accessible name naming the state and a text label SHALL be visible
