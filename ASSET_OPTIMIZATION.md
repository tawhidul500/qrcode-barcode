# Asset optimization

Public asset size: 82,222,842 bytes before; 53,071,227 bytes after (35.5% smaller), including new previews.

- Optimized 70 SVG files. Recompressed embedded images, capped embedded raster dimensions at 1920 pixels, and simplified SVG markup.
- Compared every changed SVG against its original render at up to 800 pixels. Changes exceeding the visual-difference threshold were discarded. Spot-checked backgrounds and the largest template illustrations side by side.
- Added 120 lossless WebP QR template thumbnails at up to 192 pixels. Combined preview size is 1,311,664 bytes versus 25,266,552 bytes for their original SVG files. QR downloads still use the existing vector renderer.
- Added lazy loading and asynchronous decoding to QR and barcode template thumbnails.
- Converted the authentication background and illustration to lossless WebP; verified zero visible-pixel differences.
- TypeScript, seven QR tests, and the 100-template test suite passed.
- This is an asset/source check, not a measured live-site speed score. Browser QA was unavailable. The production build remains unverified due to the previously observed environment error.

Includes earlier privacy footer link, generator validation, and QR test fixes.

## Category template loading (October 2026)

- Replaced the 18,446,045-byte category preset module with a 4,915-byte loader and filename manifest. All 100 preset objects now live in `public/assets/qr-templates/` as separate JSON files with content hashes in their names.
- Selecting a category template loads only its JSON file. Concurrent requests share a promise, successful loads stay cached for the session, and failed requests can be retried. Built-in Hot templates do not fetch category data.
- The generator clears obsolete previews immediately and ignores late results from previous selections. Download stays disabled until the current content and design have rendered successfully.
- The synchronous `renderQR` API remains available. Call and await `loadCategoryTemplate(design.templateIndex)` before rendering category templates outside the generator. Rendering an unloaded category template throws instead of silently generating a plain code.
- When editing a preset, update its JSON file, recalculate the first 12 hexadecimal characters of its SHA-256 hash, rename the file, and update the filename manifest. Keep template IDs stable.

Validation: TypeScript passed; 12 QR/loader tests passed; all 100 category rendering checks passed; extracted JSON objects exactly matched the originals. Static production export passed and includes all 100 JSON assets. Across the entire exported site, JavaScript totals 4,693,890 bytes uncompressed; scripts referenced directly by the QR page total 4,474,959 bytes. These are resulting sizes, not a measured before/after delta, and other existing assets still contribute to the bundle.

The production build needed a temporary, non-shipped workaround for this sandbox's `uv_resident_set_memory` error. Browser QA could not run because the browser binary download failed. No application configuration was changed for these environment limitations.
