# Tech guide

## Stack (versions are pinned exactly in package.json)

React, TypeScript, Vite, Tailwind CSS v4, Zustand, react-router-dom, vite-plugin-pwa, Vitest with jsdom and Testing Library, ESLint, Leaflet with react-leaflet (OpenStreetMap tiles), the `qrcode` library. No backend. Persist to localStorage through `src/core/storage.ts`.

## Commands

- `npm install`
- `npm run dev -- --host` (open `http://<PC-IP>:5173` on a phone on the same Wi-Fi)
- `npm run lint`
- `npm test` (single run) or `npm run test:watch`
- `npm run build` (type-checks, then builds the PWA into `dist/`)

## Rules

- Do not add or change dependencies in your feature branch. Do not edit `package.json` or `package-lock.json`. If you need a package, ask Jolo. He adds it on `base/scaffold` and announces it.
- Deterministic first. Pure logic (game engine, risk scoring, mood rules, ledger rules) lives in plain TypeScript modules with unit tests and no React or browser APIs. UI calls into them.
- Tests first for logic. Each OpenSpec scenario should map to at least one test.
- Seedable randomness: pass an RNG function into anything random so tests are deterministic.
- Accessibility: semantic HTML, labels, visible focus, color is never the only signal.
- Keep bundles small. Lazy-load the map (Leaflet) and the QR library where practical.
- Geolocation and PWA install need HTTPS. Always offer a manual fallback for location.
- No secrets in the repo. `.env*` files are git-ignored.

## Definition of done

Lint, tests and build all pass, and the feature's demo scenario works on a phone.
