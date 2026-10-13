# Profile settings update

## Existing deployment

1. Run the complete database/upgrade-profile.sql in your Neon SQL Editor (same database/branch as DATABASE_URL). This adds account_profiles; existing codes remain unchanged.
2. Update GitHub with the new project files and redeploy Vercel. Existing environment variables are sufficient.
3. Sign in, open My Account → My Profile, fill optional details, and Save Changes. Check the same profile on another device.
4. If you have not applied the previous large-template update, run database/upgrade-large-templates.sql too. Fresh installations can run database/schema.sql instead.

## What works

- Personal details: first/last name, email change through Supabase confirmation, up to five contact phone numbers, date of birth.
- Company details: company name/category/email, address, website, tax/VAT identifier.
- Language and time zone: saved in Neon; language applied on account load, time zone used for saved-code dates.
- Real account storage meter includes archived codes, with code count and storage limits.
- Password change: current password verification, confirmation, minimum 12 characters, authenticator verification for MFA accounts. Social-only accounts can use the existing password-reset flow.
- TOTP setup with Google Authenticator or another compatible app: enroll, scan QR/manual setup key, verify code, cancel unfinished setup, and disable with a verified code.
- MFA sign-in checkpoint: /verify follows password/social login when needed. Codes and profile APIs reject sessions that have not completed MFA. A lost authenticator requires a verified support recovery process in your Supabase project; do not enable MFA until you can provide recovery support. Supabase TOTP enrollment/challenge APIs must be enabled in Authentication → MFA settings.
- Notification opt-in preferences are saved; this project does not send marketing/notification emails.
- More-storage button opens contact; billing/paid storage upgrades are not implemented.
- Request account deletion opens the contact form with a deletion-request message. Self-service permanent deletion is not implemented; support must verify ownership and remove that user's saved_codes and account_profiles rows from Neon plus their Supabase Auth account. Contact delivery needs your existing NEXT_PUBLIC_CONTACT_ENDPOINT, or users can use the privacy support email. These actions are requests, not fake purchase/deletion success.

## Privacy

All optional profile fields can be left blank. Neon stores profile information under the verified Supabase user ID. No database credentials or passwords are stored in the profile. Authenticator setup secrets are displayed only during enrollment and are not saved in Neon. Never log or share them. Keep backup/admin recovery procedures with your deployment owner.

## Checks

npm run test:profile
npm run test:cloud
npx tsc --noEmit
npm run build

Tests cover profile validation, ownership isolation, form/preferences saving and mocked TOTP setup/verification. Live email confirmation, password and TOTP behavior require testing your configured Supabase project.
