## ADDED Requirements

### Requirement: Medical missions list
The system SHALL list municipal and organizational cardiovascular medical missions from seeded illustrative data, with filters by city and date.

#### Scenario: Browse missions
- **GIVEN** the missions screen
- **WHEN** it loads
- **THEN** each mission SHALL show the organizer, place, date and whether it is free

#### Scenario: Filter by city
- **GIVEN** missions in several cities
- **WHEN** the player filters by one city
- **THEN** only missions in that city SHALL be listed

#### Scenario: Past missions hidden
- **GIVEN** a mission dated in the past
- **WHEN** the list loads
- **THEN** it SHALL NOT be shown by default

#### Scenario: Empty result
- **GIVEN** a filter with no matches
- **WHEN** the list loads
- **THEN** the screen SHALL show a helpful empty state
