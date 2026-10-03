# Deploying INLABABU (owner: Jolo)

The app is a static PWA. `npm run build` writes it to `dist/`. `amplify.yml` in the repo root tells AWS Amplify Hosting how to build it.

## Amplify Hosting

1. In the AWS console, open Amplify, then "Host web app", then connect this GitHub repository.
2. Choose the branch to deploy (for example `base/scaffold`, later `integration`). Amplify reads `amplify.yml` automatically.
3. Enable branch deployments for the feature branches if you want each person to have a live URL on their phone. Confirm this option in the Amplify console, because it depends on your app settings.
4. Add a rewrite rule so client-side routes work on refresh:
   - Source address: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - Target address: `/index.html`
   - Type: `200 (Rewrite)`

   Amplify's documentation lists the current recommended SPA rewrite pattern. Use that one if it differs.
5. Use the HTTPS URL on phones. Geolocation and the PWA install prompt need HTTPS.

## Install on a phone

- Android (Chrome): open the URL, menu, "Install app" or "Add to Home screen".
- iOS (Safari): open the URL, Share, "Add to Home Screen".

## Local device testing without deploying

`npm run dev -- --host`, then open `http://<PC-IP>:5173` on a phone on the same Wi-Fi. Geolocation and install do not work over plain HTTP, but everything else does.

## Optional: Android APK (stretch)

Wrap the same build with Capacitor and sideload the APK. Only attempt this if the core demo is already stable.
