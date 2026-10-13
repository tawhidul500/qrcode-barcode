# Update an existing deployment

1. Run all of database/upgrade-large-templates.sql in your existing Neon SQL Editor, in the same branch/database as DATABASE_URL. Existing saved codes remain intact.
2. Update GitHub with this ZIP’s project files and redeploy Vercel. Keep your existing DATABASE_URL and Supabase settings.
3. Test a simple QR and the gift template that previously showed Request is too large. Test barcodes and custom logos too.

Large template images are compressed in transit and restored exactly before storage. SVG artwork is preserved, without rasterization, resizing or quality loss. QR saves use the selected 500/1000/2000 size. Dashboard downloads remain SVG (the original artwork); PNG/SVG format selection controls generator downloads. Barcode SVGs remain scalable; the size selector controls PNG export.

Supported: every code type and template the generator can successfully render. Practical limits remain: 32 MB decoded image, 3.7 MB compressed base64 upload, 50 codes / 256 MB per account, and browser memory. Arbitrarily large external images cannot be guaranteed. Database/provider free-tier limits still apply.

Use a current browser supporting CompressionStream. Ordinary small codes work without it. Low-contrast templates may be saved, but need a successful scan test before use.

Verification: 363 QR template/size combinations and 420 barcode type/template combinations round-tripped without artwork changes in local tests. Dashboard fetches metadata first and images individually to avoid oversized aggregate responses. Live database testing requires your configured deployment.
