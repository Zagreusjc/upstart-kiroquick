## ADDED Requirements

### Requirement: Redeem coins for a voucher
The system SHALL let the player spend coins through `CoinsProvider` to receive a one-time voucher with partner, code, expiry and QR code, and SHALL emit `voucher.issued`.

#### Scenario: Enough coins
- **GIVEN** a balance at or above the voucher cost
- **WHEN** the player redeems
- **THEN** coins SHALL be deducted once, a voucher with a QR code SHALL be issued and `voucher.issued` SHALL be emitted

#### Scenario: Insufficient coins
- **GIVEN** a balance below the cost
- **WHEN** the player tries to redeem
- **THEN** no voucher SHALL be issued, no coins SHALL be deducted and the screen SHALL show how many coins are missing

### Requirement: One-time use and expiry
The system SHALL reject a voucher that is already redeemed or expired.

#### Scenario: Double redemption
- **GIVEN** a voucher already marked redeemed
- **WHEN** it is verified again
- **THEN** verification SHALL fail with a clear message

#### Scenario: Expired voucher
- **GIVEN** a voucher past its expiry
- **WHEN** it is verified
- **THEN** verification SHALL fail and the status SHALL be expired

### Requirement: Clinic verify page
The system SHALL provide a `/care/verify` page where a clinic can enter a code and mark a valid voucher redeemed, emitting `voucher.redeemed`.

#### Scenario: Valid code
- **GIVEN** an issued, unexpired voucher
- **WHEN** the clinic verifies the code
- **THEN** the voucher SHALL be marked redeemed and `voucher.redeemed` SHALL be emitted

#### Scenario: Unknown code
- **GIVEN** a code that does not exist
- **WHEN** the clinic verifies it
- **THEN** verification SHALL fail with a clear message

### Requirement: Privacy and labeling
The QR code SHALL encode only the voucher code with no personal data, and partners SHALL be labeled illustrative.

#### Scenario: QR content
- **GIVEN** an issued voucher
- **WHEN** the QR is generated
- **THEN** it SHALL contain only the voucher code
