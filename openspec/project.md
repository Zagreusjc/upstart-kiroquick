# Project context: INLABABOO

## Purpose

INLABABOO is a mobile-first PWA health game for the Kiro x Quick Hackathon (Health domain). The demo loop is Track, Play, Redeem:

- Track: Babu (a heart-shaped pet) reflects steps, sleep, activity and daily check-ins.
- Play: an artery match-3 game ("Arteria Match"). Each game costs 1 of 3 lives.
- Redeem: coins become one-time QR vouchers for discounted clinic screenings. A deterministic WHO non-lab CVD risk survey points users to nearby clinics and medical missions.

## Principles

- AI only where it beats a rule. The risk survey, Babu mood and the match engine are deterministic.
- Positive framing: Babu enters Rest Mode and never dies.
- No lootboxes, PvP, power-up tiles or leveling in the MVP (stretch only).
- Health input is manual demo input and is labeled that way.
- Always show "Screening awareness, not a diagnosis" near risk results. Partner and clinic data are illustrative.
- All data stays on the device (localStorage). No backend.

## Tech stack

React, TypeScript, Vite, Tailwind CSS v4, Zustand, react-router-dom, vite-plugin-pwa, Vitest + Testing Library, ESLint, Leaflet (OpenStreetMap), `qrcode`. Dependencies are pinned and only changed on `base/scaffold` by Jolo. Deploy: AWS Amplify Hosting.

## Conventions

- Feature code lives in `src/features/<feature-id>/` and exports a default `FeatureModule` from `index.ts`.
- Pure logic in plain TypeScript with unit tests. Seedable randomness.
- Commit prefixes: `feat:`, `fix:`, `test:`, `docs:`, `chore:`.
- OpenSpec: one change folder per feature under `openspec/changes/<id>/` with `proposal.md`, `design.md`, `tasks.md` and `specs/<capability>/spec.md`. Requirements use SHALL/MUST and every requirement has at least one `#### Scenario:`. After the final merge, Kiro archives the changes into `openspec/specs/`.

## Contracts (source of truth: `src/core/contracts.ts`)

```ts
type CoinSource = 'library_read' | 'streak' | 'checkin' | 'game_score'
  | 'share' | 'milestone' | 'voucher_spend' | 'other';

interface CoinsProvider {
  balance(): number;
  award(source: CoinSource, amount: number, idempotencyKey?: string): boolean;
  spend(amount: number, reason: string): boolean;
  subscribe(listener: () => void): () => void;
}

interface LivesProvider {
  lives(): number;
  readonly max: number;          // 3
  spend(): boolean;
  award(count: number, source: LifeSource): void;
  subscribe(listener: () => void): () => void;
}

interface HealthProvider {
  snapshot(): { steps: number; sleepHours: number; activityMinutes: number; updatedAt: number };
  update(patch: Partial<{ steps: number; sleepHours: number; activityMinutes: number }>): void;
  subscribe(listener: () => void): () => void;
}

interface FeatureModule {
  id: string; title: string; order: number;
  navItem: { label: string; icon: string; path: string };
  Component: React.ComponentType;
  register?(api: { registerProvider(kind, impl): void }): void;
}
```

Events (`src/core/events.ts`): `library.read`, `game.finished`, `risk.assessed`, `voucher.issued`, `voucher.redeemed`, `share.completed`, `checkin.done`. Every emitted event is also appended to a persisted log that Ralph exports as CSV.

Idempotency key convention: `${source}:${subject}:${yyyy-mm-dd}`, built with `dayKey()` from `src/core`.

## Folder ownership

| Folder | Owner |
|---|---|
| `src/features/economy-library/` | Prime |
| `src/features/babu-shell/` | CJ |
| `src/features/artery-match/` | Jolo |
| `src/features/care-pathways/` | Ralph |
| `src/app/`, `src/core/`, configs, `package.json`, `openspec/project.md`, `.kiro/` | Jolo (`base/scaffold` only) |

## Merge order

Prime, CJ, Jolo, Ralph, into `integration`, then `main`.

## Quick usage (platform requirement)

Quick Research produces the cited library content. Quick Index powers a grounded Q&A demo shown inside Quick. Quick Sight shows a partner dashboard from the exported events CSV.
