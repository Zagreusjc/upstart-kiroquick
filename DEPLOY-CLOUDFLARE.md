# Deploying INLABABU to Cloudflare Pages

INLABABU is a static PWA with no backend. Cloudflare Pages serves the `dist/` folder. The AWS Amplify setup (`amplify.yml`, `DEPLOY.md`) still works; this is an alternative.

## What is already set up

- `public/_redirects`: sends every route to `index.html` (`/* /index.html 200`) so refreshing `/play` or `/care` works.
- `public/_headers`: security headers (CSP, nosniff, frame denial, HSTS), `Permissions-Policy: geolocation=(self)`, long immutable cache for `/assets/*`, and `no-cache` for `index.html`, `sw.js`, `registerSW.js` and `manifest.webmanifest` so updates reach phones.
- `wrangler.toml`: `pages_build_output_dir = "dist"` for the Wrangler CLI.
- Vite `base` is `/` (default), so assets load from the site root.

Vite copies everything in `public/` into `dist/`, so the two files above ship with each build.

## Option 1: Git integration (dashboard)

1. Cloudflare dashboard, Workers & Pages, Create, Pages, Connect to Git.
2. Pick this repository and the branch to deploy (for example `integration` or `main`).
3. Build settings:
   - Framework preset: None (or Vite)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable (optional): `NODE_VERSION` set to a current LTS, for example `22`
4. Save and deploy. Every push to the branch redeploys. Other branches get preview URLs.

## Option 2: Wrangler CLI (direct upload)

```
npm ci
npm run build
npx wrangler login
npx wrangler pages deploy dist --project-name inlababu
```

The first deploy creates the project if it does not exist.

## After deploying

- Use the `https://<project>.pages.dev` URL on phones. Cloudflare serves HTTPS by default, which geolocation and the PWA install prompt both need. The app keeps a manual location fallback.
- Android Chrome: menu, "Install app". iOS Safari: Share, "Add to Home Screen".
- The CSP allows map tiles from `https://*.tile.openstreetmap.org`, `data:` and `blob:` images (brag card, QR codes), inline styles (Leaflet and Tailwind), and same-origin scripts and the service worker. If you add an external script, font or API, extend the matching directive in `public/_headers`.
- Clinic, mission and voucher partner data are illustrative. Keep that notice in the UI.

## Checks

- `npm run lint`, `npm test`, `npm run build` all pass.
- `dist/_redirects` and `dist/_headers` exist after the build.
- Open a deep link such as `/care` and refresh: it should load, not 404.
