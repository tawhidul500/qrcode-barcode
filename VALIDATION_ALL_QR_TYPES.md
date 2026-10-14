# Validation

- Passed: 44 automated checks covering advanced QR types, native QR payloads, owner-scoped cloud storage, hosted publishing/edit guards, account UI, statistics, management and CSV import. Cloud template storage checks also cover 363 QR template/size and 420 barcode type/template combinations.
- Passed: TypeScript and production Next.js build.
- Passed in an isolated PostgreSQL-compatible PGlite instance: fresh Neon schema, repeated migrations, owner guards, password preservation, hosted transfers, private-file transfer rollback and 50-page quota. Separate mocked Supabase schema checks cover private bucket, repeat setup, folder isolation, quota and MFA policy behavior.
- Not verified against the owner's live Neon/Supabase/Vercel project; apply ALL_QR_TYPES_SETUP_BN.md before deployment.
- Known translation limitation: the privacy translation coverage test reports missing non-English translations for several paragraphs changed in earlier upgrades and the new hosted-content paragraph. These fall back to current English text. The new hosted-content paragraph is translated into Bangla. Privacy layout/metadata checks pass after accounting for the added section.
