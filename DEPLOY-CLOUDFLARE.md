# Deploying INLABABOO to Cloudflare

INLABABOO is a static PWA with no backend. Cloudflare serves the `dist/` folder through Workers static assets, configured in `wrangler.toml`. The AWS Amplify setup (`amplify.yml`, `DEPLOY.md`) still works; this is an alternative.

## What is already set up

- `wrangler.toml`: `name = "upstart-kiroquick"` (must match the project name in the Cloudflare dashboard), assets from `./dist`, and `not_found_handling = "single-page-application"` so refreshing `/play` or `/care` loads the app instead of a 404.
- `public/_headers`: security headers (CSP, nosniff, frame denial, HSTS), `Permissions-Policy: geolocation=(self)`, long immutable cache for `/assets/*`, and `no-cache` for `index.html`, `sw.js`, `registerSW.js` and `manifest.webmanifest` so updates reach phones.
- There is no `_redirects` file on purpose. Workers assets reject the usual `/* /index.html 200` rule as an infinite loop; the SPA fallback above replaces it.
- Vite `base` is `/`, so assets load from the site root.

Vite copies everything in `public/` into `dist/`, so `_headers` ships with each build.

## Option 1: Git integration (dashboard)

1. Cloudflare dashboard, Workers & Pages, Create, connect this GitHub repository, branch `main`.
2. Build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy` (the default)
   - Root directory: leave empty
   - Environment variable (optional): `NODE_VERSION` set to `22`
3. Save and deploy. Every push to `main` redeploys.

If the project name in the dashboard differs from `name` in `wrangler.toml`, change the file to match.

## Option 2: Wrangler CLI (direct upload)

```
npm ci
npm run build
npx wrangler login
npx wrangler deploy
```

## After deploying

- Use the `https://<name>.<account>.workers.dev` URL on phones. Cloudflare serves HTTPS by default, which geolocation and the PWA install prompt both need. The app keeps a manual location fallback.
- Android Chrome: menu, "Install app". iOS Safari: Share, "Add to Home Screen".
- The CSP allows map tiles from `https://*.tile.openstreetmap.org`, `data:` and `blob:` images (brag card, QR codes), inline styles (Leaflet and Tailwind), and same-origin scripts and the service worker. If you add an external script, font or API, extend the matching directive in `public/_headers`.
- Clinic, mission and voucher partner data are illustrative. Keep that notice in the UI.

## Checks

- `npm run lint`, `npm test`, `npm run build` all pass.
- `dist/_headers` exists after the build.
- Open a deep link such as `/care` and refresh: it should load, not 404.