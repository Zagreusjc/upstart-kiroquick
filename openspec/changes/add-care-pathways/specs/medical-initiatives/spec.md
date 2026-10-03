## ADDED Requirements

### Requirement: Medical initiatives list
The system SHALL list cardiovascular medical initiatives (missions, caravans and screening drives) from seeded illustrative data, with filters by organizer level, city and date. Organizer levels SHALL be National, Municipal, Barangay and Organizational.

#### Scenario: Browse initiatives
- **GIVEN** the medical initiatives screen
- **WHEN** it loads
- **THEN** each initiative SHALL show the organizer and its level, the place, the date and whether it is free

#### Scenario: Filter by organizer level
- **GIVEN** initiatives from national, municipal, barangay and organizational organizers
- **WHEN** the player picks one level
- **THEN** only initiatives from that level SHALL be listed

#### Scenario: Filter by city
- **GIVEN** initiatives in several cities
- **WHEN** the player filters by one city
- **THEN** only initiatives in that city SHALL be listed

#### Scenario: Past initiatives hidden
- **GIVEN** an initiative dated in the past
- **WHEN** the list loads
- **THEN** it SHALL NOT be shown by default

#### Scenario: Empty result
- **GIVEN** a filter with no matches
- **WHEN** the list loads
- **THEN** the screen SHALL show a helpful empty state with a way to clear the filters
