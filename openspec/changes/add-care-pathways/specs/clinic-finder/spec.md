## ADDED Requirements

### Requirement: Nearest clinics
The system SHALL list clinics sorted by distance from the player's location using the haversine formula, from seeded illustrative data.

#### Scenario: Location granted
- **GIVEN** geolocation permission is granted
- **WHEN** the clinic list loads
- **THEN** clinics SHALL be sorted from nearest to farthest with the distance shown

#### Scenario: Location denied
- **GIVEN** geolocation is denied or unavailable
- **WHEN** the clinic list loads
- **THEN** the player SHALL be able to pick a city manually and the list SHALL sort from that city

### Requirement: Clinic types and map
The system SHALL show PhilHealth and private clinics and SHALL offer a map view with markers.

#### Scenario: Filter by type
- **GIVEN** the clinic list
- **WHEN** the player filters by PhilHealth
- **THEN** only PhilHealth clinics SHALL be listed

#### Scenario: Map view
- **GIVEN** the clinic list
- **WHEN** the player opens the map
- **THEN** markers SHALL be shown for the listed clinics and tapping one SHALL show its details

### Requirement: Illustrative data label
The system SHALL say that clinic data is illustrative.

#### Scenario: Data notice
- **GIVEN** the clinic screen
- **WHEN** it is displayed
- **THEN** it SHALL include an illustrative-data notice
