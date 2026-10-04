# Contributing to INLABABOO

Four people, four branches, one app. These rules keep the branches mergeable without conflicts.

## Ownership

| Owner | Branch | Folder you may edit | OpenSpec change |
|---|---|---|---|
| Prime | `feat/economy-library` | `src/features/economy-library/` | `add-economy-library` |
| CJ | `feat/babu-shell` | `src/features/babu-shell/` | `add-babu-shell` |
| Jolo | `feat/artery-match` | `src/features/artery-match/` | `add-artery-match` |
| Ralph | `feat/care-pathways` | `src/features/care-pathways/` | `add-care-pathways` |

Also yours: `openspec/changes/<your-change>/` and your own `handoff/KICKOFF-<name>.md` if you want notes.

Do not edit: `src/app/`, `src/core/`, `package.json`, `package-lock.json`, config files, `README.md`, `openspec/project.md`, `.kiro/`, or anyone else's folders. Jolo owns these on `base/scaffold`.

## Daily flow

1. `git checkout <your-branch>`
2. Work in your folder with Kiro. Commit small and often.
3. `git push` (only your own branch).
4. When Jolo announces a `base/scaffold` update: `git fetch origin` then `git merge origin/base/scaffold`. It only touches shared files, so it should merge cleanly.

## Need a dependency or a core change?

Message Jolo. He adds it on `base/scaffold`, announces it, and everyone merges `base/scaffold`. Do not work around it by editing `package.json` or `src/core/` yourself.

## Commit messages

Use a prefix: `feat:`, `fix:`, `test:`, `docs:`, `chore:`. Example: `feat(library): award a life on first card read`.

## Definition of done

- `npm run lint`, `npm test` and `npm run build` pass.
- Each scenario in your OpenSpec change has a test (for logic) or a manual check (for UI).
- Your demo scenario works on a phone.

## Testing rules

- Logic lives in plain TypeScript modules with unit tests. Keep randomness seedable.
- Do not write tests that depend on another feature's screen text. Placeholders get replaced.
- Keep tests fast. No network calls.

## Final merge (done with Kiro)

Order: Prime, CJ, Jolo, Ralph, into an `integration` branch, then `main`. Expect only small wiring fixes. Jolo runs the integration smoke checklist and deploys.
