## ADDED Requirements

### Requirement: Idempotent coin earning
The system SHALL award coins at most once per idempotency key and SHALL reject non-positive or non-integer amounts.

#### Scenario: Repeated award with the same key
- **GIVEN** the player already earned coins with key `library_read:card-1:2026-10-03`
- **WHEN** the same award is attempted again
- **THEN** the balance SHALL NOT change and the call SHALL return false

#### Scenario: Invalid amount
- **GIVEN** any balance
- **WHEN** an award of 0, a negative number or 1.5 is attempted
- **THEN** the balance SHALL NOT change and the call SHALL return false

### Requirement: Safe spending
The system SHALL reject a spend that exceeds the balance and SHALL never let the balance go below zero.

#### Scenario: Insufficient balance
- **GIVEN** a balance of 20 coins
- **WHEN** the player tries to spend 50
- **THEN** the spend SHALL fail and the balance SHALL remain 20

#### Scenario: Exact spend
- **GIVEN** a balance of 20 coins
- **WHEN** the player spends 20
- **THEN** the spend SHALL succeed and the balance SHALL be 0

### Requirement: Persistence
The system SHALL persist the balance and used keys on the device.

#### Scenario: Reload keeps coins
- **GIVEN** a balance of 30 coins
- **WHEN** the app is reloaded
- **THEN** the balance SHALL still be 30
