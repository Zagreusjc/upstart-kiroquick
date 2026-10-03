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

### Requirement: Five nearest clinics with their services
The system SHALL list only the 5 clinics nearest to the player's location or picked city, after the type filter, and SHALL show the services each clinic usually offers on its card without opening it.

#### Scenario: Top five
- **GIVEN** more than 5 clinics match the type filter
- **WHEN** the clinic list loads
- **THEN** only the 5 nearest SHALL be listed, nearest first

#### Scenario: Fewer than five
- **GIVEN** fewer than 5 clinics match the type filter
- **WHEN** the clinic list loads
- **THEN** all matching clinics SHALL be listed

#### Scenario: Services visible
- **GIVEN** the clinic list
- **WHEN** it is displayed
- **THEN** each clinic card SHALL show the services it usually offers without being opened

### Requirement: Clinic types and map
The system SHALL show public (government-run) and private clinics, SHALL let the player filter by public or private, and SHALL offer a map view with markers.

#### Scenario: Filter by type
- **GIVEN** the clinic list
- **WHEN** the player filters by public (or private)
- **THEN** only public (or private) clinics SHALL be listed

#### Scenario: Map view
- **GIVEN** the clinic list
- **WHEN** the player opens the map
- **THEN** markers SHALL be shown for the listed clinics and tapping one SHALL show its details

### Requirement: Book or call a clinic
The system SHALL let the player tap a clinic to see how to make an appointment: an online booking link and the clinic's appointment phone number. Booking links SHALL open only over `https`, and phone numbers SHALL be dialable only when the clinic's contact details are verified.

#### Scenario: Open booking options
- **GIVEN** the clinic list
- **WHEN** the player taps a clinic
- **THEN** its booking link (opening in a new tab) and appointment number SHALL be shown

#### Scenario: Illustrative contact details
- **GIVEN** a clinic whose contact details are not verified
- **WHEN** its booking options are shown
- **THEN** the number SHALL be displayed as a sample and SHALL NOT be a call link

#### Scenario: Unsafe booking link
- **GIVEN** a booking link that is not `https`
- **WHEN** booking options are shown
- **THEN** the link SHALL NOT be offered

### Requirement: Illustrative data label
The system SHALL say that clinic data is illustrative.

#### Scenario: Data notice
- **GIVEN** the clinic screen
- **WHEN** it is displayed
- **THEN** it SHALL include an illustrative-data notice
