# Profile settings update

- Added responsive profile tabs using the existing blue account theme.
- Added Neon profile storage and real storage meter.
- Added password/email updates, authenticator setup and MFA enforcement for account APIs.
- Added notification preferences and contact actions for storage/deletion requests.
- Added upgrade-profile.sql and PROFILE_SETUP.md.

# Large template saving update

- Lossless gzip transfer for large code images, including dashboard responses.
- QR saves preserve the chosen export width and original SVG artwork.
- Updated database limits and added upgrade-large-templates.sql for existing deployments.
- Save accepts low-contrast designs; test scans before sharing.

# Neon cloud storage update

- Added authenticated server API for saving, listing, renaming, archiving, restoring and deleting account codes.
- Added Neon schema, duplicate protection, concurrent quota enforcement and deployment guide.
- Added explicit legacy browser import and dashboard refresh on focus/interval.
- Switched from static export to Next.js server hosting.
- Updated privacy wording and blocked low-contrast generator saves.

## Post-login dashboard — October 13, 2026

- Replace the basic account screen with a responsive blue-and-white dashboard inspired by the supplied reference.
- Keep verified login and OAuth redirects at `/account`.
- Add sidebar navigation, real saved-code counts, search/sort, download, rename, archive/restore, profile details, plan links and logout.
- Add explicit Save to My Codes actions to the QR and barcode generators; saves verify the current account first.
- Persist up to 50 code images per account in this browser, with duplicate protection, validated records and clear storage errors. No cross-device synchronization or scan analytics are claimed.
- Start with an honest empty state for accounts without saved codes.
- Translate the dashboard in all supported languages and update the privacy policy for local storage.
- Verify authentication, generator regressions, storage isolation and dashboard interactions with automated checks.

## Authentication navigation — October 13, 2026

- Add a visible, keyboard-accessible Back to Home link on both sign-in and sign-up pages.
- Localize the link in all supported languages and reverse its arrow for RTL layouts.

## Local language and pricing reliability fix — October 13, 2026

- Use two bounded country lookups with browser timezone and regional locale fallback.
- Share detection between pricing and the language prompt.
- Prompt once again for legacy saved English defaults; preserve newly confirmed choices.
- Closing, Escape, or clicking outside the prompt chooses English.
- Render converted local prices independently of live exchange-rate availability.
- Use validated cached rates or bundled ExchangeRate-API rates dated October 12, 2026; show the date when fallback rates are over 24 hours old.
- Refresh expired rates through independent providers, with a five-second timeout.
- Support blocked browser storage without losing the popup or prices.
- Complete pricing translations for all supported languages.
- Add regression coverage for blocked APIs, timezone fallback, preference migration, storage denial, country override and independent rate refresh.

Rebuild and redeploy with `npm ci` and `npm run build`. Static files are generated in `out/`. This fix preserves the existing design.

# Review fixes

1. Kept template selection when modifying colors, captions, logos, dots and eyes.
2. Removed fallback sample payloads from generation and downloads; required valid user content.
3. Added input validation and structured contact fields.
4. Connected header QR-type actions to the generator and correct input focus.
5. Removed the 2.42 MB embedded SVG module; fetch only the selected public template with caching, retries and stale-preview protection.
6. Corrected feature descriptions, app availability, repeated copy, spelling and footer year.
7. Aligned the static export configuration, startup command and README; included a dependency-free static preview server.

Existing external-service placeholders remain explicitly labeled. No backend credentials or provider accounts were supplied.

Validation completed: production build and TypeScript passed; six regression tests passed; 21 templates and all nine dot/eye shape combinations decoded successfully using software rasterization. Static homepage/login/assets returned 200; missing page returned 404. Physical-device and visual browser checks were not performed.

# Barcode details spacing fix

- Replaced the fixed details offset with font-size-aware clearance below barcode bars and EAN/UPC guard bars.
- Applies to all sidebar types, templates, live previews, and PNG/SVG exports through the shared generator.
- Verified 135 type/font/height combinations by raster pixel separation, TypeScript, and production build. PDF417/Data Matrix do not emit native human-readable details.
- Run `npm run test:barcode-spacing` after `npm ci`. Physical scanner tests were not performed.

## Barcode Generator standalone page
- Added /barcode-generator and active navigation.
- Implemented reference section sequence with SVG artwork and icons.
- Type cards update the generator and focus its input.
- Added responsive page styles and barcode defaults for FAQ/blog.

## Barcode input validation — 2026-10-13

- Removed the example-data fallback. Empty and whitespace-only content now leaves the barcode preview empty; example values appear only in input placeholders.
- Download, copy, and share require a successfully rendered barcode. Their handlers also reject blank or invalid input.
- Derive the preview from current input and settings, so clearing or changing content cannot leave a previous barcode available for export.
- Added component interaction checks for all 15 formats, whitespace, clearing, invalid EAN input, explicit copy/share content, SVG downloads, and switching barcode type.
- Preserves the earlier on-demand QR template loading update.

## Barcode contrast protection — 2026-10-13

- Added a 3:1 minimum contrast safeguard for barcode image exports, matching the existing QR export threshold.
- Check active foreground/background paints, including full gradient luminance ranges and minima between gradient stops. Identical, overlapping, or insufficiently separated colors block downloads.
- Disable both PNG and SVG downloads, guard the download handler, and show an accessible warning connected to the button. Preview remains available for editing; copy/share still operate on valid text content.
- Downloads become available immediately when the colors are corrected. A passing contrast check is not a substitute for testing the code with its intended scanner and print setup.
- Five contrast/input regression tests passed, including all 15 barcode formats. TypeScript and static production build passed with the existing environment-only memory reporting workaround.
- Preserves the earlier on-demand QR template loading and blank-input fixes.

## Privacy title and contact email — 2026-10-13

- Added the privacy route to the language provider's title map, using the existing translated Privacy Policy label.
- Changed the privacy contact default, all three page mail links, setup documentation, and example environment configuration to gcappexplore1@gmail.com.
- Verified the client title effect in all 10 locales, the existing language suite, TypeScript, and static production export (using the environment-only memory reporting workaround).
- Includes all previous template loading, barcode input, and contrast fixes.

## Full privacy policy localization — 2026-10-13

- Connected all policy content to the existing language selector with a scoped client component.
- Added complete Arabic, Spanish, Mexican Spanish, French, Indonesian, Brazilian Portuguese, Turkish, Bengali, and Russian translations; preserved the English policy.
- Preserved server metadata, the configured contact email, policy date, and all link destinations.
- Isolated email and domain text left-to-right for Arabic display.
- Translation coverage and source integration checks are documented in tests/privacy-i18n.test.cjs.
- Validation: three privacy localization regression checks passed. Full production build and browser visual checks were not run because application dependencies were unavailable.

## Official mobile app download links — 2026-10-13

- Connected Google Play and App Store badges in the shared app banner and footer to the owner's official listing URLs.
- Covers the homepage, QR generator, barcode generator, scanner, and all pages with the shared footer.
- Replaced unavailable-download notices with direct links opening in a new tab; retained badge sizing, hover styles and accessible names, and added keyboard focus outlines.
- Centralized listing URLs in app/lib/mobile-app-links.ts.
- Verified exact URL wiring and removal of download placeholder handlers. Production build and browser testing remain unverified because dependencies are unavailable in this environment.

## Footer year cleanup — 2026-10-13

- Updated the footer copyright to 2026 in English and every supported translation, including Bengali numerals.
- Checked the pricing source: the supplied design and pricing regression checks both specify Advanced at $15.40 and Professional at $9.04 per month, billed annually. A replacement Professional price requires the owner's intended amount.
- Language and pricing regression checks passed. Includes the latest app links, privacy translations, and previous fixes.
