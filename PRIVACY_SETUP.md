# Privacy page deployment

Added /privacy-policy and activated the existing footer Privacy Policy link. Existing design and authentication logic are unchanged.

The default privacy contact is tawhidulislam500@gmail.com, the account address supplied during setup. Confirm that you monitor and want to publish this address. Override it with NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL before building if needed.

The policy describes the supplied source code. Check it against any production-only analytics, contact endpoint, advertising, payment integrations, and actual retention practices before publishing. No exact retention period or automatic deletion feature is promised.

Deploy these changes through the repository linked to your Vercel project; redeploying an old commit alone will not add this page. Do not upload .env.local or node_modules. Retain the Vercel Supabase environment values already configured.

After deployment, visit https://qrcode-barcode-peach.vercel.app/privacy-policy and confirm the footer link works. In Google Auth Platform > Branding, use this URL for the Privacy Policy and the root website URL for the homepage. Publishing is separate from brand/domain verification; follow any verification requirements shown by Google.
