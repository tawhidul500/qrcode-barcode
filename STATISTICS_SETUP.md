# Statistics setup for your existing Vercel / Supabase / Neon deployment

1. Run all of database/upgrade-statistics.sql in Neon SQL Editor, in the branch/database used by DATABASE_URL. Existing saved codes and profiles remain unchanged.
2. Check SITE_URL in Vercel: it must be your permanent HTTPS website origin, e.g. https://qrcode-barcode-peach.vercel.app (no path or query). If omitted, the project defaults to that domain. Change it if you use another domain; printed tracked QRs depend on that domain staying available.
3. Optional: set ANALYTICS_HASH_SECRET to a long randomly generated secret in Vercel Production. Do not prefix it NEXT_PUBLIC_. If omitted, DATABASE_URL is used for hashing; changing that URL will change device hashes.
4. Update GitHub and redeploy Vercel. Existing Supabase and DATABASE_URL values remain unchanged.
5. Sign in → My Account → Statistics. Create a tracked QR with a title and an HTTP(S) destination, or open the QR generator and choose Enable visit tracking before downloading/saving. All design controls and templates continue to work.
6. Open the newly created QR with a phone and follow its link. Refresh/apply filters in Statistics. Only these new tracked links report visits; old printed/downloaded static QRs cannot be retroactively tracked.

## Features and measurement limits

- Total counts ordinary GET visits to /r/ID, not physical camera scans. Repeat visits count; bot and prefetch filtering is best effort. A visitor may open a link without scanning a QR.
- Estimated unique devices count distinct first-party browser identifiers using a 30-day HttpOnly cookie. They are not unique people or hardware identities. Cookie clearing, another browser, cookie restrictions, and secret rotation affect estimates.
- Country comes from the x-vercel-ip-country header when hosted on Vercel. It may be approximate or unknown; VPNs can affect it. Elsewhere countries show Unknown unless the code is adapted to a trusted provider. No raw IP or full user agent is stored.
- Device classification is Mobile, Tablet, Desktop or Unknown from the user-agent string.
- Date filters use UTC and a maximum 90-day range/reporting window. Unique counts for grouped rows are not additive across dates/countries/devices.
- CSV exports the currently applied filter results. Draft changes do not apply until Apply Filters is clicked.
- Up to 50 distinct tracked links per account; title+destination duplicates are reused. Pausing tracking stops recording new visits while keeping the destination redirect working.
- Up to 10,000 recorded visits per link per UTC day to bound storage. Traffic after this cap still redirects but is not recorded. Analytics write failures also still redirect; outages during destination lookup can stop a link.
- Old events are removed for a code when its next ordinary visit is recorded. For inactive codes, run database/cleanup-old-statistics.sql periodically if you want removal beyond the reporting window. No automatic global cleanup is configured in this ZIP. Provider/free-tier capacity and compute limits still apply.
- API statistics and tracked-link management require a verified Supabase user and MFA when enabled. Queries always scope to the owner. Public tracking URLs are intentionally accessible to visitors.
- Wi-Fi/contact/text QRs, phone/payment URI codes and product barcodes do not report opens. Only HTTP(S) destination QRs can use visit tracking.
- Tracked links stay available when a saved image is archived/deleted. Pause recording in Statistics separately. For an account deletion, verified support must remove tracked_codes too (visits cascade), plus saved_codes, account_profiles and Supabase Auth.

## Checks

npm run test:statistics
npm run test:cloud
npm run test:profile
npx tsc --noEmit
npm run build

Local tests mock database boundaries; configure Neon and verify real redirects/metrics before launch. The privacy policy now describes the tracking cookie and recorded data. No external analytics SDK or scan-count fixture is used.
