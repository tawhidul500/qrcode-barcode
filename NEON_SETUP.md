# Neon cross-device storage setup

This version keeps Supabase Auth and stores saved QR/barcode images in Neon Postgres. Neon is the database, not the website host. Deploy this Next.js application to a host that runs Next.js server routes (for example Vercel), rather than uploading an `out/` directory.

## Activate

1. Create a Neon project and choose its database region. Copy its connection string.
2. Run the complete `database/schema.sql` in that database's Neon SQL Editor.
3. Copy `.env.example` to `.env.local` for local development. Set:
   - `DATABASE_URL`: Neon Postgres connection string, server-only.
   - `NEXT_PUBLIC_SUPABASE_URL`: your existing Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: your Supabase publishable/anon key.
4. Add the same values in your website host's environment settings. Never expose DATABASE_URL in a NEXT_PUBLIC variable, frontend file, or public repository.
5. Configure Supabase Site URL and callback allowlist for the deployed domain as described in AUTH_SETUP.md.
6. Use Node.js 22 or newer. Run `npm ci`, `npm run build`, and `npm start`, or deploy the project as a Next.js app. Rebuild after public environment changes.

The app does not create a Neon account or database automatically. No live database credentials are included in this ZIP. Check current provider free-tier allowances in your own console; this app has no billing integration.

## Behavior

- Save to My Codes uploads the image and metadata using your Supabase access token.
- Every API request verifies that token with Supabase; ownership comes from the verified user, never from request data.
- Rename, archive, restore and delete update individual records scoped to the owner.
- Codes load at sign-in, on window focus, and every 60 seconds while the dashboard is visible. Refresh loads immediately. This is refresh-based synchronization, not a live websocket feed.
- Existing browser records remain on the original device. Use Import to my account there to upload them explicitly. Originals remain in local storage as a backup. Imports preserve dates and archive state; retries are idempotent by ID/image hash. If an import stops partway, successfully imported codes remain available and retry skips duplicates. Deleting a cloud code and later importing its local backup restores it.
- Limits: 50 codes, 256 MB total image data per account, 32 MB per image. Large images are gzip-compressed for upload and restored exactly on the server. No image resizing or lossy compression is used. The transport limit is 3.7 MB of compressed base64 data. These limits are enforced during concurrent saves by a database function and an account-level transaction lock.
- Saving is allowed for every rendered design, including low-contrast artwork; generator downloads still show contrast protection. Test scans before sharing.
- Duplicate images are not saved twice, including archived images. Restore an archived copy if you want it active again.
- Data images may contain personal information or Wi-Fi passwords. Only save codes you intend to store remotely. Deleting an authentication user does not cascade into Neon; for an account-deletion request, delete their rows in saved_codes by verified user_id too. Database backups follow your provider settings.

## Verify before launch

1. Sign in on device A, generate a code and save it.
2. Sign in to the same account on device B; verify it appears.
3. Rename/archive/restore/delete on one device; refresh the other.
4. Sign in as a different user and confirm the first user's codes are absent.
5. Import a legacy browser code twice; confirm no duplicate.
6. Unset DATABASE_URL or stop the database; confirm the UI shows failure without claiming a local save succeeded.

Local checks: `npm run test:cloud` and `npx tsc --noEmit`. API tests mock database/auth boundaries; they do not substitute for testing your configured Neon database. Static-export tests and the old standalone static-server script describe the earlier deployment and are not applicable to the cloud deployment.
