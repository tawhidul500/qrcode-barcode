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
