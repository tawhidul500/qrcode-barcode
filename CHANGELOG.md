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
