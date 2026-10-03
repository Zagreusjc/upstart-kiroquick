# Repository structure and ownership

```
src/
  app/                 App shell: header, bottom nav, routes (Jolo, base/scaffold only)
  core/                Shared contracts, providers, events, storage (Jolo, base/scaffold only)
    stubs/             In-memory stand-ins so every feature runs alone
  features/
    babu-shell/        CJ     branch feat/babu-shell       change add-babu-shell
    artery-match/      Jolo   branch feat/artery-match     change add-artery-match
    economy-library/   Prime  branch feat/economy-library  change add-economy-library
    care-pathways/     Ralph  branch feat/care-pathways    change add-care-pathways
openspec/
  project.md           Conventions and contracts
  specs/               Archived capability specs (filled at merge time)
  changes/<id>/        One folder per feature: proposal, design, tasks, specs
handoff/               KICKOFF-<name>.md prompts
.kiro/                 Steering and hooks
```

## The one rule

You edit only `src/features/<your-feature>/` and `openspec/changes/<your-change>/`. Never edit `src/app/`, `src/core/`, `package.json`, `package-lock.json`, configs, or another person's folder. This keeps the four branches conflict-free.

## How features plug in

- Each feature folder has `index.ts` with a default export of type `FeatureModule` (see `src/core/contracts.ts`). The app finds it automatically with `import.meta.glob`. There is no central routes file.
- Your screen is routed at `${navItem.path}/*`. Use nested `<Routes>` inside your feature for sub-pages.
- Shared state goes through providers: `useCoins()`, `useLives()`, `useHealth()` from `src/core`. Until the real provider is merged, a stub is used, so build against the interface.
- Real providers are registered from your feature's `register(api)` with `api.registerProvider(kind, impl)`. Prime registers `coins` and `lives`. CJ registers `health`.
- Features talk to each other through the typed event bus (`emit`, `on` from `src/core`) and never import from each other.
- Import shared code from `../../core` (barrel). Never import from `../other-feature/`.

## Providers and who registers them

| Provider | Registered by | Used by |
|---|---|---|
| coins | Prime | Prime, CJ (streak), Jolo (game), Ralph (vouchers) |
| lives | Prime | Prime, Jolo (game start), CJ |
| health | CJ | CJ, Prime (lives from steps/sleep) |

## Merge order

Prime, then CJ, then Jolo, then Ralph, into `integration`, then `main`.
