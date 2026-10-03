## Context

Owner: Jolo. Refine this file with Kiro before implementing. Keep it short.

## Decisions to make

- Board size (suggested 8 columns by 8 rows; 7x7 is fine on small phones).
- Engine API, for example `createGame(seed)`, `trySwap(state, a, b)`, `step(state)` returning a list of events for the UI to animate. The engine returns new state and never touches React or the DOM.
- RNG: a small seedable generator (for example mulberry32) passed into the engine.
- Spawn rule: chance per refill cell, from 3% at score 0 scaling linearly to 10% at a cap score. Choose the cap (for example 10,000).
- Loss rule: no legal swap exists. Define "legal swap" precisely (a swap of two non-cholesterol tiles that creates a match).
- Rendering: SVG tiles in CSS grid with transitions, or canvas. Pick the simpler one that is smooth on a low-end phone.
- Brag card: draw to a canvas, export PNG, share through `navigator.share` with files when supported, otherwise download.

## Risks

- Deadlock boards at the start: the generator must never create a board with pre-existing matches, and should guarantee at least one legal move at start.
- Animation complexity. Ship a simple animation first.
- Touch input: use pointer events; test drag and tap-tap swap on a real phone.

## Open questions

- Should cholesterol clear rewards be capped per game to avoid coin inflation? Recommended: yes, cap coins per game and award by score bands.
