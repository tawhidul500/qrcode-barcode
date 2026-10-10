# QR & Barcode sign-in page

Requires Node.js 22 or newer.

Run `npm install`, then `npm run dev`. Open http://localhost:3000.

Production: `npm run build`, then `npm start`.

Original supplied assets are included. Desktop layout targets the 1448×728 reference. Mobile layout stacks the branding and form. Email validation and password visibility work. Authentication providers, registration, reset, and legal documents require integration; buttons display a preview notice. No passwords are transmitted or saved.

Hosted preview uses the Sites Next.js-compatible Vinext runtime. This archive uses standard Next.js on Node.js. Hosted production build passed; this standalone Next.js build has not been run. Browser pixel comparison has not been performed.

Updated: social button shadows and aligned labels; a six-second floating animation with reduced-motion support on the illustration.

Added a glowing scan beam moving up and down over the QR card, synchronized with the floating illustration.

Removed the baked-in red scan stripe using an edited transparent asset. Animated laser has feathered ends, diffuse glow, and soft reversals.

Scanner updated to blue with a thicker core and wide, gradually fading halo.

Extended scan travel through the bottom of the front code and increased the blue halo.


Part 5 update: added the 16-type QR catalogue. Choose buttons select the matching generator type, expand content, scroll to the generator and focus its input. Four columns on desktop and two on mobile. Next.js production build and TypeScript checks passed. All 16 cards appear in prerendered output and all referenced icons exist. Browser interaction and Figma pixel matching remain unverified. No deployment was made from this workspace.
