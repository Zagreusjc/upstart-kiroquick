## ADDED Requirements

### Requirement: Events CSV export
The system SHALL export the persisted event log as a CSV with flat, non-personal columns for use in the Quick Sight partner dashboard.

#### Scenario: Export real events
- **GIVEN** the event log has risk, voucher issued and voucher redeemed events
- **WHEN** the player or operator exports
- **THEN** a CSV SHALL be produced with one row per event and a header row

#### Scenario: No personal data
- **GIVEN** any export
- **WHEN** the CSV is inspected
- **THEN** it SHALL NOT contain names, contact details or exact locations

#### Scenario: Empty log
- **GIVEN** an empty event log
- **WHEN** the export runs
- **THEN** a CSV with only the header row SHALL be produced

### Requirement: Synthetic demo dataset
The system SHALL provide a clearly labeled synthetic dataset so the dashboard has meaningful data for the demo.

#### Scenario: Synthetic data labeled
- **GIVEN** the synthetic dataset
- **WHEN** it is exported
- **THEN** it SHALL be labeled as synthetic in its filename or a column

### Requirement: Partner dashboard (Quick Sight)
The team SHALL build a Quick Sight dashboard showing risk bands, screenings claimed and redemptions by clinic.

#### Scenario: Dashboard content
- **GIVEN** the exported CSV uploaded to Quick
- **WHEN** the dashboard opens
- **THEN** it SHALL show risk band distribution, vouchers issued versus redeemed, and redemptions by clinic
