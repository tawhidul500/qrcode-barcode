# Authentication setup

This project now integrates Supabase Auth for email/password signup and sign-in,
email confirmation, Google/Facebook/Apple OAuth, password recovery, session
refresh, an account page, and logout. It still uses Next.js static export.
No Supabase project or OAuth applications are provisioned by this ZIP.

## Activate email authentication

1. Create or select your Supabase project. In Authentication, enable email and
   password sign-in and **Confirm email**. Set the minimum password length to 12
   to match the signup/reset forms. Keep appropriate Auth rate limits enabled.
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your project's API settings.
   A publishable key or legacy anon key is appropriate. **Never put a secret or
   service_role key in a NEXT_PUBLIC variable or browser code.**
3. Set Supabase Authentication > URL Configuration > Site URL to your actual
   HTTPS origin. Add these exact redirect URLs, replacing the domain:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/auth/callback?next=/reset-password`
   For development also add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/reset-password`
   Use the same origin consistently; localhost and 127.0.0.1 are different.
4. Configure production SMTP in Supabase and verify the sender domain. Retain
   the standard confirmation and reset templates using `{{ .ConfirmationURL }}`.
   Confirm actual email delivery before launch.
5. Run `npm ci`, `npm run build`, then `npm start` for a static preview, or deploy
   `out/` to your static host. Environment values are compiled into the frontend:
   set them **before** building, and rebuild after any change. `npm run dev` is
   available during development.

Without the two public configuration values, forms are disabled and display a
clear unavailable message. No simulated local account or password store is used.

## Activate Google, Facebook, and Apple

Configure each provider in both the provider's developer console and Supabase
Authentication > Providers. Obtain its required client ID and secret/key. Put
provider secrets only in Supabase, never in this project's public environment.
Use the Supabase callback URL shown in its provider settings, typically
`https://YOUR_PROJECT.supabase.co/auth/v1/callback`, in the provider console.
This is distinct from the application's `/auth/callback` redirect URL above.
Finish any consent-screen, production-mode, domain, or app-review requirements.
For Apple, maintain the signing key/client-secret renewal schedule required by
Apple and Supabase. Enable each UI button only after configuring its provider:

```
NEXT_PUBLIC_AUTH_GOOGLE=true
NEXT_PUBLIC_AUTH_FACEBOOK=true
NEXT_PUBLIC_AUTH_APPLE=true
```

All three integrations are implemented. An unconfigured provider stays disabled.
No provider credentials or user accounts are included in the archive.

## Session and password behavior

- Supabase handles password hashing, authentication, reset tokens, OAuth, and
  rate limiting. Passwords are never stored by this application.
- The official SDK uses PKCE, stores its session and verifier in browser storage,
  and refreshes sessions. Email confirmation and reset links must be opened in
  the same browser/device where the flow began. Starting another flow can replace
  the verifier; request a fresh link if an old one stops working.
- `/auth/callback` exchanges the authorization code once and removes it from the
  address bar. Missing, denied, expired and reused callbacks show an error.
- `/account` checks the current user with Supabase. Password updates require an
  authenticated Supabase session. Password reset completion requests global
  logout; existing access tokens can remain valid until their normal expiration.
- Reset requests use a generic response that does not reveal whether an email
  address has an account.
- Account UI protection is not authorization for future private data. When adding
  saved codes, subscriptions, or other data, enforce Supabase RLS or server-side
  JWT authorization. No private database tables are introduced here.
- This update does not implement paid plans or code storage. Existing public QR
  and barcode generator pages remain public.
- Existing language dictionaries remain intact. New auth-specific copy currently
  falls back to English where translations have not yet been supplied.

## Verification

`npm run test:auth` uses the real SDK against a mocked HTTP backend. It verifies
signup/confirmation responses, incorrect credentials, successful login/session,
user lookup, recovery URLs, Google/Facebook/Apple PKCE URLs, callback deduplication,
password update, logout, password validation, and safe redirect destinations.
These tests send no messages and create no remote accounts.

For browser tests, run `npx playwright install chromium`, then start the dev
server with the test-only environment values documented in
`tests/auth-browser.test.cjs`. Run `npm run test:auth-browser` in a second terminal.
Do not deploy the test values. Browser tests mock only the identity backend.

Before launch, test email signup and confirmation, a wrong and correct password,
a delivered reset link, expired link, logout, and each enabled social provider
against your configured project on the real deployment domain.

## Official references

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/sessions/pkce-flow
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/social-login/auth-facebook
- https://supabase.com/docs/guides/auth/social-login/auth-apple
- https://supabase.com/docs/guides/auth/auth-smtp
