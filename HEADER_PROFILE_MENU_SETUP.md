# Header profile menu

Update GitHub with this ZIP’s code and redeploy Vercel. No new SQL or environment variables are required beyond the earlier code-management update.

After signing in, the top-right header shows an initials pill beside the language selector. Its dropdown opens Profile Settings, My QR Codes, My Barcodes, Statistics and Log out. Counts include active saved records only. It refreshes on opening the menu or returning to the browser window, without downloading code images. Counts are hidden if authentication/MFA/database verification is unavailable; navigation remains usable.

The menu supports Escape, arrow keys, Home/End and outside-click dismissal. Logged-out visitors see Sign In / Sign Up. Links use /account?view=... to open the selected section directly.
