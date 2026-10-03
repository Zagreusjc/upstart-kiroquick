## ADDED Requirements

### Requirement: First-run onboarding
The system SHALL show onboarding on first launch with a short explanation, consent to store data on the device, and the disclaimer "Screening awareness, not a diagnosis", and SHALL persist the accepted flag in `inlababu.babu.v1`.

#### Scenario: First launch
- **GIVEN** a fresh install
- **WHEN** the Home tab opens
- **THEN** onboarding SHALL appear before the Baboo screen

#### Scenario: Completed onboarding
- **GIVEN** the player accepted onboarding
- **WHEN** the app is reopened
- **THEN** onboarding SHALL NOT appear again

#### Scenario: Consent is required
- **GIVEN** onboarding is showing
- **WHEN** the player has not ticked the consent box
- **THEN** the start button SHALL be disabled and the player SHALL NOT be able to enter the Home screen

### Requirement: Main menu
After onboarding, the Home tab (`/home`) SHALL open on a main menu with the INLABABOO title, Baboo in its current mood (the same mood as the Baboo screen) with a text label, and buttons to every part of the app: Play (`/play`), Pulse (today's tasks on the Baboo screen), Milestones (`/library/milestones`), Baboo (`/home/baboo`), Refer a Buddy (sharing on `/library/milestones`), a single Get screened button (`/care`) and Library (`/library`). Play SHALL be the largest button. Menu buttons other than Baboo's portrait SHALL be text only. The menu SHALL link by route path only and SHALL NOT import other features' code.

#### Scenario: Menu after onboarding
- **GIVEN** onboarding is complete
- **WHEN** the Home tab opens
- **THEN** the main menu SHALL be shown with every button linking to its tab

#### Scenario: Mood carries over
- **GIVEN** Baboo is Happy, Tired or in Rest Mode on the Baboo screen
- **WHEN** the main menu is shown
- **THEN** Baboo on the menu SHALL show the same mood, with its accessible name and a visible label

#### Scenario: Back to the menu
- **GIVEN** the Baboo screen
- **WHEN** the player taps "Main menu"
- **THEN** the main menu SHALL be shown

### Requirement: Home screen
The system SHALL present Baboo, today's snapshot, the health input, the check-in button and the streak on the Baboo screen (`/home/baboo`), and SHALL show the "Screening awareness, not a diagnosis" disclaimer at the bottom of the snapshot card (next to the health hints), not under Baboo.

#### Scenario: Home content
- **GIVEN** onboarding is complete
- **WHEN** the Baboo screen opens
- **THEN** Baboo, the health snapshot, the check-in button and the streak SHALL be visible, and the disclaimer SHALL appear at the bottom of the snapshot card and not in the Baboo hero
