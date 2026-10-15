## 2026-10-15 — QR preview and independent editing

- Isolated static decoration from the QR slot and render exactly one live QR layer.
- Rebuilt template backgrounds separately, retaining gradients and built-in center logos.
- Repaired missing finder outlines from source SVGs; replaced misidentified floral artwork in template 92 with QR eyes.
- Foreground color no longer changes eye color. Eye/dot shape edits retain the selected template.
- Custom gradients paint across the QR area; edited eye cutouts reveal the actual background.
- Refreshed content-hashed category assets to prevent stale template data.
- Validation: production build, template loading/hash tests, all 100 category template tests, and decoding all 121 choices with customized square dots/eyes and black-on-white colors passed.
- Decorative default presets are not universally scan-safe; always test the final chosen design and payload before printing.

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
