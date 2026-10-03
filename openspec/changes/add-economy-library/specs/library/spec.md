## ADDED Requirements

### Requirement: Cited library cards
The system SHALL provide 8 to 10 short cardiovascular education cards, each with at least one cited source link and a plain-language summary.

#### Scenario: Browse the library
- **GIVEN** the player opens the Library tab
- **WHEN** the list loads
- **THEN** every card SHALL show a title, read status and a source

#### Scenario: Card detail shows sources
- **GIVEN** the player opens a card
- **WHEN** the detail loads
- **THEN** it SHALL show the content, the cited source link and the disclaimer "Screening awareness, not a diagnosis"

### Requirement: First read reward
The system SHALL award coins and one life the first time a card is read, and SHALL NOT award again for that card.

#### Scenario: First read
- **GIVEN** an unread card
- **WHEN** the player reads it
- **THEN** coins and 1 life SHALL be awarded once and a `library.read` event SHALL be emitted

#### Scenario: Re-read
- **GIVEN** a card already read
- **WHEN** the player reads it again
- **THEN** no coins or lives SHALL be awarded
