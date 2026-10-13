# Code management update

## Activate on your existing deployment

1. If the previous Statistics update is not installed, run database/upgrade-statistics.sql first.
2. Run ALL of database/upgrade-code-management.sql in the existing Neon database/branch used by DATABASE_URL. Existing saved images remain; new columns, folders, aliases and transfer tables are added. Duplicate copies are now permitted.
3. Update GitHub with the ZIP’s project files, then redeploy Vercel. Existing DATABASE_URL, Supabase and SITE_URL settings remain. Fresh installations can run database/schema.sql instead.
4. Open My Account → My QR Codes / My Barcodes. Test folders, search, pagination, copy and archive.

## Added options

- New Folder, All folders / Unfiled / folder filters, name/date sorting, 10/20/50 per-page pagination.
- Select All selects all FILTERED codes across pages. Bulk copy, move, archive/restore and permanent delete.
- Options: Statistics (when linked), Settings (rename/folder), code-type details, Edit Code Design, Edit Content, Custom URL, Change Owner, Move to Folder, Make a Copy, Archive/Restore and Delete.
- Storage size and last-90-day visit counts. Static QR/barcode cards show Untracked rather than misleading zero scans.
- Newly saved QR/barcode records preserve editor inputs/settings. Reopen with Edit Code Design or Edit Content, then Save to My Codes to update the same record. QR selected size and designs are preserved; barcode format options remain generator export options.
- Static code content changes create a new image; previously printed static QRs/barcodes do not change. For tracked HTTP(S) QRs, Edit Content changes the server destination so already printed tracking QRs stay useful.
- Custom URL assigns a unique /r/alias on your SITE_URL domain. The original /r/UUID remains valid. Use Customize QR in Statistics to download the alias version. Changing an existing alias breaks old alias URLs; the UI warns before saving. This does not configure a custom domain or DNS.

## Existing records

Images saved before this update do not contain recoverable design/source settings. They still support download, rename, folders, copy, archive/delete and transfer. Editing controls show source unavailable. Create/resave from the generator to add editable source. A legacy identical-image save can enrich that record with supplied editor settings, but source is never invented from an old image.

Earlier tracked-code images saved without tracking_id cannot automatically be associated with scan records. Statistics still has their tracked links; Customize QR there and save again to create a linked editable record.

## Copies and limits

Copies retain the image/editor settings and folder. Tracked copies share the same redirect link and counts. Save duplicates from the generator are still deduplicated; Make a Copy explicitly creates a new row. Account limits remain 50 saved codes / 256 MB of image data, 50 folders and 50 tracked links. If a bulk copy reaches the quota partway, completed copies remain; the UI reloads actual records after a failure.

## Change Owner

1. Sender chooses Options → Change Owner and enters the recipient’s existing account email.
2. Create transfer link. Share it privately yourself; this project does not send an email.
3. Recipient signs in with that CONFIRMED email, opens the link and clicks Accept transfer. If login was required, reopen the link after login.
4. The code, editable data and linked tracking/history move atomically. The sender loses access; the recipient receives an unfiled code. Printed tracked links continue to work.
5. Invitation expires after 24 hours, is single-use and can be revoked in the Change Owner dialog. Creating another invitation for the same code invalidates the previous one.

Transfers require recipient quota, a valid verified email and MFA if enabled. A tracked link used by another saved copy cannot be transferred until the shared copy is removed. Recipient tracking-title/destination conflicts or tracking quota block transfer without partially changing ownership. No permanent account privileges are granted. Support account deletion must remove folders/transfers as well as the existing saved codes, profiles, tracking records and Supabase account.

## Verification

npm run test:management
npm run test:cloud
npm run test:statistics
npm run test:profile
npx tsc --noEmit
npm run build

Local Postgres integration checked the schema, repeat-safe upgrade, folder ownership, in-place edits, explicit duplicate copies, recipient-email validation, shared-link protection and atomic tracking/code ownership changes. Live cross-account/email flows still need testing on your configured deployment.
