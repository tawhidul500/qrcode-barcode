> Authentication update: email/password, Google/Facebook/Apple OAuth, account/logout and password recovery are now integrated through Supabase. Follow [AUTH_SETUP.md](AUTH_SETUP.md) to configure your project, email delivery and providers. Earlier design-preview auth limitations below describe the previous version.

# QR & Barcode Generator — Updated Homepage

## Run locally

```sh
npm ci
npm run dev
```

For a production static export:

```sh
npm run build
```

Serve the generated `out` directory with any static web server.

## Homepage update

- Updated hero, generator layouts, navigation, app banner, FAQ, blog and footer from the supplied 1440 × 6144 SVG export.
- Added a working barcode generator with 15 sidebar entries, including PDF417 and Data Matrix.
- Kept the three-step guide, both information cards, and every existing content section. They remain separate components for moving to another page later.
- Homepage image sources use SVG. Photographs and exported bitmap artwork remain embedded raster images within SVG containers; they are not falsely traced vector images. Original vector icons, store badges, barcode thumbnails and phone mockups are extracted from the supplied design.
- Responsive layouts cover desktop, tablet and narrow phones.

## Validation

- Production build and TypeScript checks passed.
- Browser checks at 1440, 1024, 768, 390 and 320 pixels.
- QR and barcode PNG/SVG export, barcode formats, type dialog and FAQ tabs checked.

## Existing limitations

- Sign-in, account management, scan analytics, newsletter and store links still require services or destination URLs.
- Tutorial playback uses the existing example clip; set real tutorial URLs in `app/lib/tutorial-video.ts` before launch.
- All 28 barcode templates retain their original SVG artwork and embed the live barcode; preview and PNG/SVG exports use the same renderer.
- Several advanced QR categories accept a link; they do not create hosted landing pages or upload documents.

## Main edited files

- `app/page.tsx`: navigation and section composition.
- `app/home-updated.css`: sizing, spacing and responsive overrides.
- `app/components/BarcodeGenerator.tsx`: barcode generation and export.
- `public/assets/updated/`: assets from the supplied homepage design.

- Barcode Text controls: separate Details and Heading tabs, independent font sizes/colors, visibility switches, SVG icons, and live preview/export.

## Complete category update

New, Social, WiFi, Event and Love each have 20 uploaded SVG templates plus No template. All use the Hot live renderer and PNG/SVG export flow. Hot is unchanged. Run npm run test:templates: 100 templates passed renderer checks. Full production build and scanner checks remain unverified.

## Dedicated Barcode Generator page

Open `/barcode-generator` for the supplied barcode page design. Includes SVG step illustrations and phone artwork extracted from the reference, SVG type icons, linked type cards, live PNG/SVG downloads, barcode-first FAQ and blog tabs, and responsive styling. Navigation links directly to the new route.

Validation: production static build, TypeScript, 135 barcode spacing combinations and 100 category template checks passed. Browser viewport QA was unavailable in this environment.


## Barcode page Figma corrections (October 2026)

The `/barcode-generator` route and homepage both render `app/components/BarcodeGenerator.tsx`. The editor, templates, text/color/height controls, preview and PNG/SVG downloads remain one shared implementation. Route-specific appearance is scoped under `.barcode-generator-page` in `app/barcode-generator-page.css`.

- Matched the supplied 1440 × 7261 reference section positions, typography, input border, sidebar elevation, template layout, preview card, type cards, illustrations and banner presentation.
- Added local Poppins 400/500/700 font files alongside the existing 600 font; no external font request is needed.
- Corrected excess blank canvas around the general barcode template while preserving its live barcode and quiet zones in both preview and exports.
- Fixed narrow-screen heading readability, horizontally scrollable type selection, customization controls, introduction card overlap and export sizing labels.
- Fixed SVG hero background scaling at narrow viewport widths.

Validation: production build and TypeScript passed. Browser checks at 1440, 1024, 768, 390 and 320 px showed no horizontal document overflow. Template selection, heading edits, color/height panels, PNG and SVG downloads, invalid barcode input, type-card navigation, modal dismissal and homepage shared-generator rendering passed without browser errors. All 135 barcode-spacing combinations passed. Physical scanner decoding was not part of this design update.

Run locally with `npm ci` and `npm run dev`. For a production preview, run `npm run build`, then `node scripts/serve-static.mjs` and open `http://localhost:3000/barcode-generator`.


### Generator background blending fix

The QR and barcode generator backdrops now fade smoothly into the steps section. `app/site-background.css` applies the fade only to the decorative layer, follows the generator's actual height, and preserves opaque controls and previews. The QR backdrop also scales independently of viewport aspect ratio, avoiding the clipped gradient visible on wide screens. The homepage layout is unaffected.

Validation: production build/TypeScript passed; browser screenshots checked for both generator pages at 1920, 1440 and 390 px. Pixel samples on both sides of the generator/steps boundary confirmed no abrupt color change; no horizontal overflow or browser errors was observed.


### Site-wide background and illustration cleanup

- Replaced the centered, fixed-width barcode page background with a full-width CSS backdrop, removing the vertical color edge on large displays.
- Moved the Choose and Download illustration glows out of cropped SVG files into transparent CSS radial gradients. Removed a duplicate shadow that exposed rectangular corners around the customization card.
- Kept the QR steps, introduction and type sections on one continuous background and applied the same smooth illustration glows. Sized the download glow for phones.
- Both barcode pages still use the same `BarcodeGenerator` component; customization and downloads remain shared.

Validation: production build and TypeScript passed. Audited all six routes (home, QR generator, barcode generator, blog, login and signup) at 1920, 1440, 768, 390 and 320 px: no horizontal document overflow, broken images or browser errors. Visually reviewed desktop and phone screenshots, and checked the revised step artwork and background boundaries. This pass covers layout and background presentation; existing service limitations above still apply.


## QR + Barcode Scanner page (October 2026)

Open `/scanner` for the supplied 1440 × 3819 scanner design. Direct links
`/scanner?mode=qr` and `/scanner?mode=barcode` select the corresponding tab.
The navbar Scanner link opens this page directly, without a submenu or dropdown.
Footer scan links select the corresponding scanner mode.

- Uses the supplied hero background and QR/barcode photos, exported as compact WebP assets.
- Responsive three-mode scanner with image upload, drag-and-drop and camera capture.
- PNG, JPEG and WebP input, up to 10 MB and 32 megapixels; images are resized to a maximum 2048-pixel edge for decoding.
- Locally bundled ZXing WebAssembly decoder loads when scanning starts. The page does not load the generator's template data or send images/camera frames to a server.
- Supports QR codes, Code 128, Code 39, Code 93, EAN-8/13, UPC-A/E, ITF, Codabar, Data Matrix, PDF417 and Aztec, among other decoder-supported types.
- Results include copy, save as text, scan again and explicit HTTP/HTTPS link opening. Scanned links never open automatically. Retail identifiers may be returned in their normalized GTIN form (for example, UPC-E expanded to EAN-13 digits).
- Camera scanning requires HTTPS or localhost and browser permission. Camera tracks stop on cancellation, mode changes, successful scans, page hiding and unmount. Permission and missing-camera errors offer image upload as an alternative.
- The shared header, app banner, FAQ and footer are reused. Scanner-specific layout rules are isolated in `app/scanner-page.css`.
- Code 93 generation now includes its required check characters so codes created here can be decoded.

Run `npm ci`, then `npm run dev` and visit `http://localhost:3000/scanner`.
For static hosting: `npm run build`, then serve the `out` directory. Local
static preview: `node scripts/serve-static.mjs`. Serve `.wasm` files with
`application/wasm`; the included static preview server handles this.
The `predev` and `prebuild` scripts copy the decoder binary matching the pinned
`zxing-wasm` version and its license into public assets.

Validation for this update: production build and TypeScript, scanner fixture tests
(`npm run test:scanner`), existing category-template tests and barcode-spacing
tests. Scanner tests decode actual generated images, including rotated and
inverted codes, and check mode filtering, invalid uploads and unsafe link rejection.
Visual browser QA and live camera permission/device tests were unavailable in the
implementation environment and still need to be checked on target devices.
Existing service placeholders documented above remain applicable.

### Scanner Figma sizing correction

The scanner now follows the supplied `Auto QR+ barcode_Scanner_page (1).svg`
1440 × 3819 artboard. This supersedes the earlier homepage-width adaptation.
The navbar Scanner item remains a direct link without a dropdown.

At the desktop reference width:

| Element | Reference dimensions / position |
| --- | --- |
| Scanner card | 886 × 616 px, x=277, y=302 |
| Mode tabs | 809 × 91 px, with 244 × 62 px buttons |
| Image upload area | 759 × 285 px, x=331, y=501 |
| Camera button | 759 × 67 px, x=331, y=820 |
| Information photo frames | 510.287 × 366.679 px |
| App banner | Starts at y=1928, 380.394 px tall |
| FAQ | 1107 px content width; 80 px closed cards, 18 px gaps |

- Restored Poppins headings and body copy from the design, plus locally bundled Roboto for scanner controls and FAQs. Roboto 5.2.8 assets include their license.
- Used the phone artwork directly from the supplied SVG, only on the scanner page.
- Scoped all desktop dimensions to this page. Tablet and phone layouts reflow rather than stretching the desktop scanner panel or fixing the full page height.
- Preserved scanning, uploads, result actions and the shared components used by the other pages.

Validation: production build, TypeScript, static export, SVG asset references and a CSS measurement audit. Browser visual QA is unavailable in this environment, so rendered pixel matching and live device layout still need visual verification.

### Matching generator hero backgrounds

The barcode and QR generator pages now share the same hero SVG, scaling, fade mask and underlying background colors in `app/site-background.css`. The continuous background also prevents a color seam where the hero fades into the next section. Generator controls and page sizing are unchanged.

Validation: production build and TypeScript passed; shared background declarations verified. Browser visual verification remains unavailable in this environment.

### Consistent generator navbar sizing

Removed barcode-only navbar overrides so the QR and barcode generator pages use the same shared header: 80 px tall above 1000 px viewport width and 68 px on tablet/mobile. Logo dimensions, link spacing, account buttons and active-link styling now follow the shared responsive rules. The header explicitly uses the same font on every page, and the types-menu label stays constant when switching routes. Scanner remains a direct link without a dropdown.

Validation: production build and TypeScript, matching exported header markup (apart from the active link), and a CSS audit of shared navbar styles. Browser visual verification remains unavailable in this environment.

### QR & Barcode Types page

Added `/qr-barcode-types` from the supplied `Qr& Barcode_ all types_page.svg` (1440 × 6716). The shared navbar now contains one direct **QR & Barcode Types** link with no submenu. Scanner remains a direct link. The shared 80 px desktop / 68 px mobile navbar sizing is preserved.

- Ten QR categories contain 66 cards in the design's order, followed by all 15 barcode formats.
- The page uses the supplied pale blue hero artwork, locally bundled Poppins fonts, existing colored icons, white cards and blue Choose buttons. At 1440 px the grid is 1224 px wide with four approximately 253 × 169 px cards per row. It reflows to three columns at 1000 px and two at 650 px.
- Each Choose link opens the existing generator with its type selected. Barcode deep links now support the same `?type=` selection pattern as QR codes; unknown values keep the default format. No second generator implementation was added.
- The existing footer is reused, and both footer type-directory links now reach the relevant section of the new page. Previous scanner, navbar and matching hero-background fixes are preserved.
- Document, media, payment and routing categories encode supplied content or links. They do not add hosting, payment processing, scan analytics or server-side routing services. Existing service placeholders documented above remain applicable.

Validation: production build and TypeScript; all 81 exported Choose links and their assets; identical shared navbar markup on five routes apart from active state; 135 barcode/font/height spacing cases. Browser visual verification remains unavailable in this environment.

### Full-width types-page hero background

The hero SVG now stretches to its CSS background viewport instead of preserving its original 1442 × 266 aspect ratio and creating blank side margins on wide screens. Desktop and mobile both use `background-size: 100% 100%`. Heading placement, card widths and navbar sizing are unchanged.

Validation: production build and TypeScript; SVG viewport rendering at 320, 650, 1000, 1440, 1905 and 2560 px widths confirms opaque artwork reaches both edges. Full-page browser visual verification remains unavailable.

### Functional site languages

The supplied language selector design is implemented with round flags, native language names, a selected checkmark, keyboard navigation and a scrollable menu. Language controls in the shared header, footer and authentication pages use one preference. The header control stays accessible when the navigation collapses.

- English (US), Arabic, Spanish, Spanish (Mexico), French, Indonesian, Portuguese (Brazil), Turkish, Bangla and Russian are available. Mexican Spanish includes regional wording.
- Selecting a language updates page headings, navigation, generator controls, scanner messages, information sections, FAQs, type cards, authentication labels, accessibility labels and the browser title. All eight non-English base dictionaries contain 616 entries; Mexican Spanish inherits the complete Spanish dictionary with regional overrides. Dictionaries ship with the site and require no translation service or API key.
- The choice is saved in local storage, restored on subsequent pages and reloads, and synchronized across tabs. If storage is blocked, selection still works for the current page. English is the default. Arabic sets the document language and right-to-left direction; technical inputs remain left-to-right.
- User-entered data, QR payloads, decoded scan results, download formats, links and generator settings are preserved. Localization operates on React display text and accessibility attributes, not on the DOM or data models. User-facing barcode validation uses the translated invalid-content message.
- English SVG heading artwork has live translated equivalents. Long translations can wrap, and navigation collapses earlier where needed while retaining the shared header height. Previous backgrounds, direct Scanner/Types links and scanner features are preserved. Product/standard names, sample data, template artwork and illustrative screenshots keep their original content.

Run `npm run test:i18n` for dictionary completeness, interpolation, all 120 page/language renders, saved-preference checks and input/result preservation checks. Validation also includes a production build, TypeScript and static export. Browser interaction and visual QA are unavailable in this environment.

Translation sources are in `app/lib/i18n/messages.json`, locale definitions in `locales.ts`, and Mexican Spanish overrides in `translate.ts`. New components should use the shared `Localized` boundary or `useLanguage().t`; mark user-owned display content with `translate="no"` and supply explicit option values for new controls.

### Site-wide animation and hover polish

Added `app/motion.css` and the shared `MotionEnhancements` component. The existing layout dimensions, navbar heights, backgrounds, generator data and translations are preserved.

- Hero headings and authentication panels enter gently. Information sections, code-type cards, article cards and footer columns use short, staggered entrances as they enter the viewport. Entrances play once per mounted element, including newly selected blog cards.
- Main buttons have hover elevation and a small pressed state. Cards lift subtly; template controls, color swatches and type selectors provide clearer feedback. Article images and tutorial play controls use a restrained zoom.
- Navigation links underline on hover. Menus, language choices, dialogs, FAQ answers and status messages have short entrance effects; expandable controls rotate their chevrons smoothly. Fields and newsletter inputs show clear focus feedback.
- Hover movement applies only to hover-capable pointers. Touch devices retain press feedback. Reduced-motion preferences disable movement, smooth scrolling and decorative loops; preference changes also cancel active scroll animations. Focused content is never held in an entrance animation.
- Scroll effects use IntersectionObserver and the Web Animations API, with cleanup on navigation. Content stays visible when JavaScript or animation APIs are unavailable. No continuous animation was added, and generated QR/barcode images and the camera preview remain stationary.

Validation: production build, TypeScript and static export passed; all 90 localized route renders and existing language/persistence checks passed. Static review confirms the effects do not change section sizing or translation files. Browser interaction and visual QA remain unavailable in this environment.

### Resources dropdown from the supplied design

Replaced the old Resources list with the two-column panel from `Group 1707496371.svg` and its placement screenshot. The desktop panel is 537 px wide, with the reference pointer, rounded white surface, soft shadow, 42 px icon areas, title/description rows and trailing arrows. The four icons are extracted from the original SVG; copy remains live text and supports all ten site languages.

- Blog opens `/blog`; Contact Us opens `/contact`; FAQ opens `/faq`; Mobile App opens `/#mobile-app`. These destinations work from every page with the shared header.
- Contact Us opens `/contact`. The contact page now provides the supplied form design and validation; message delivery requires the endpoint configuration described below.
- Mouse hover or click opens the panel. Outside click, Escape, or leaving an unfocused hover panel closes it. Tab navigation and Arrow Down/Up from the trigger reach the items. Touch uses tap-to-toggle. The trigger exposes its expanded state, and the closed panel is hidden from navigation and assistive technology.
- Tablet navigation contains the panel inline; phones stack the four items. Long menus scroll within the viewport. Arabic mirrors the layout and arrows. Existing navbar heights, direct Scanner/Types links and motion preferences are preserved.

Implementation: `app/components/ResourcesMenu.tsx`, `app/resources-menu.css` and `public/assets/resources/`. Validation includes production build/TypeScript, 90 localized route renders, exported navigation destinations, home anchors and SVG asset rendering. Browser interaction and visual QA remain unavailable in this environment.


### Blog page from the supplied Figma export

Resources → Blog now opens the dedicated `/blog` page built from `Qr code_Blog_page.svg`. Resources stays the shared navigation label and highlights on this route. The Blog entry in its panel exposes the current-page state, and the footer Blog link also opens `/blog`.

- The wave background and six article photos are extracted from the supplied SVG, with its exact image crops, and compressed as local WebP assets. The hero spans the full viewport at every width. All headings and summaries are live, translatable text.
- At 1440 px, the shared navbar is 80 px high, the hero is 269 px high, and the catalog starts 52 px below it. The centered grid is 1204 px wide, with three 384 px cards, 354 × 232 px images, 26 px gaps and a 434 px minimum card height. Cards grow when translations need more space. The grid uses two columns at 1000 px and one at 650 px.
- The catalog contains 18 distinct local article previews: 12 on the first page and six on the second. It retains the reference's image sequence and fills its repeated cards with related preview content. Page numbers reflect the available catalog instead of the mockup's placeholder numbers. These are preview summaries; full article pages and a CMS are not included in this design update.
- Numbered pages and previous/next links update the displayed cards, selected state and URL (`/blog?page=2#blog-articles`). Reloading or using browser Back/Forward restores the page. Keyboard focus moves to the new list, assistive technology receives a page announcement, and modified clicks retain normal link behavior. Invalid page values fall back or clamp to the available catalog.
- All ten languages cover the heading, every preview, pagination and accessibility labels. Arabic mirrors the pagination arrows. Card entrances, photo hover effects and button feedback reuse the existing animation system and honor reduced-motion preferences.
- The shared footer is retained. Its FAQ link opens `/faq`, and Mobile App points to its home-page anchor so it also works from Blog. Navbar sizing, direct Scanner/Types links and the home-page blog section remain shared with the previous release.

Implementation: `app/components/BlogIndex.tsx`, `app/lib/blog.ts`, `app/blog-page.css`, `app/blog/page.tsx`, and `public/assets/blog-page/`. To add content, append a unique preview in `app/lib/blog.ts` and add its title/summary to all base language dictionaries; pagination derives its page count automatically.

Validation: production build, TypeScript and static export; `npm run test:blog` checks catalog uniqueness, URL boundaries, complete pagination, local assets and both pages in all ten languages; `npm run test:i18n` passes all 90 route/language renders and the existing persistence/data-preservation checks. Exported navigation links, 12 initial cards and local image references were also checked. Browser interaction and full-page visual QA remain unverified in this environment.


### Contact Us page from the supplied Figma export

Added `/contact` from `Qr code_Conatct_page.svg` (1440 × 1389). The attachment depicts a Contact Us page. Resources → Contact Us and the footer Contact Us link now open it; the Resources trigger and the matching panel item show the active route. Blog remains available at `/blog`.

- The full-width wave hero uses the same source artwork and crop as Blog; the two exports contain identical background images. The envelope illustration retains its transparency, and the three support icons are extracted as vectors from the contact SVG.
- Desktop measurements follow the reference: shared 80 px navbar, 269 px hero, 42 px gap above the form, 1328 px content width, approximately 934 px form and 352 px support column, a 42 px column gap, 56 px inputs, 148 px message area and a 52 px button. The shared footer begins near the reference's 1035 px position. At 1000 px the support panel moves below the form; at 650 px the fields stack and the submit button spans the card.
- Corrected “Your Massage” to “Your Message” and replaced the hero's implementation note with visitor-facing contact copy. The form labels, helper copy, validation, request states and support panel work in all ten site languages. Arabic follows the site's RTL layout; user-entered content remains untouched by language changes.
- Required fields reject whitespace-only names/messages and malformed email addresses. Limits are 120 characters for names, 254 for emails and 5000 for messages. Errors associate with the relevant input, and submitting an invalid form focuses the first invalid field. Network failure or timeout preserves the visitor's message.
- Existing entrance effects cover the hero, form and support panel. The submit button and support icons include restrained hover feedback; fields have clear focus states. All movement honors reduced-motion settings. Navbar dimensions remain shared.

The supplied design explicitly leaves message delivery for a second phase. No recipient, email service, CRM or backend endpoint has been supplied. By default the page displays that delivery is unavailable, validates the fields, retains the message and makes no network request. It never claims an unconfigured message was sent. No message is saved to browser storage.

To connect delivery, set `NEXT_PUBLIC_CONTACT_ENDPOINT` to your contact API URL before running `npm run build`. This is a public URL, not an API secret. The existing static export does not host an API: use your separately deployed service or a host function, and keep provider credentials on that server. The adapter in `app/lib/contact.ts` posts JSON with `name`, `email` and `message`, with no cookies. A cross-origin service must accept the site's origin and JSON requests. The endpoint must validate input and return a successful HTTP status with `{ "accepted": true }` only after accepting the message. Error responses, missing acceptance, an HTML fallback, and connection errors show unconfirmed delivery rather than success. The UI blocks duplicate submissions, times out after 20 seconds and cancels a pending request on navigation.

Implementation: `app/contact/page.tsx`, `app/components/ContactPageContent.tsx`, `app/lib/contact.ts`, `app/contact-page.css`, and `public/assets/contact/`.

Validation: production build, TypeScript and static export; `npm run test:contact` checks validation boundaries, no requests without configuration, explicit acceptance, network/HTML failure handling, payload preservation and ten localized contact renders; `npm run test:i18n` covers 100 route/language renders and all 585 keys per base locale; the Blog pagination checks continue to pass. Network tests use mocked responses and send no real messages. Browser interaction and visual QA remain unverified in this environment.


### Dedicated FAQ page with QR Code and Barcode tabs

Added `/faq` from both `Qr code_ FAQ_page.svg` and `Barcode_FAQ_page.svg`. The existing FAQ item in Resources and the footer now opens this page alongside Blog and Contact Us. Resources stays the shared navbar label, and its FAQ entry indicates the active route. Scanner and QR & Barcode Types remain direct links.

- The two designs are implemented as categories on one page: **QR Code Basics** and **Barcode Basics**, each with seven questions. The first answer opens when entering a category. Clicking another question opens that answer; clicking it again closes it. Only the current category's open answer is exposed to assistive technology.
- The supplied exports differ by about 11 px in vertical placement. Both tabs use the same centered 1107 px layout so switching category does not move the heading or navbar. Desktop spacing follows the QR export: 80 px above the pale blue section, 40 px heading, 20 px category labels, approximately 80 px closed rows, 18 px gaps, 198 px minimum expanded cards, and 80 px before the shared footer. Expanded cards grow for longer answers and translations. Smaller screens use reduced spacing and wrapping text, with 44 px minimum tab targets on phones.
- `/faq` selects QR Code Basics. `/faq?tab=barcode` selects Barcode Basics after hydration. Switching tabs updates the URL; reload and browser Back/Forward restore the category. Embedded FAQ sections on the home and generator pages retain their local selection and do not change their URLs.
- Tabs support Left/Right, Home and End. Question buttons support Up/Down, Home and End for focus, and native Enter/Space activation. Expanded state, tab selection and panel/answer relationships use ARIA attributes; inactive panels are hidden. Focus outlines remain visible within the cards.
- All questions, answers and labels use the existing ten-language catalog. A complete heading translation also fixes duplicated words in some previously split FAQ headings. Arabic uses the shared right-to-left layout. Existing answer entrances, chevron rotation and hover feedback honor reduced-motion preferences.
- FAQ data now lives once in `app/lib/faq.ts` and is shared with embedded sections. Answers retain the site's existing accurate feature descriptions: this version generates static codes and does not offer account storage, editable dynamic codes or a scan analytics dashboard. The reference's unimplemented service claims were not added as product promises.

Implementation: `app/faq/page.tsx`, `app/faq-page.css`, `app/components/FAQ.tsx`, and `app/lib/faq.ts`.

Validation: clean production build, TypeScript and static export; `npm run test:faq` checks all 14 question transitions, category reset/preservation, URL parsing, keyboard focus destinations, ARIA relationships, Resources destinations and 40 localized embedded/full-page renders. `npm run test:i18n` passes 110 route/language renders and all 586 keys per base locale. Export inspection verifies the new page, initial visible answer, tabs and FAQ links on all main routes. Browser interaction and visual QA remain unverified in this environment.


### Pricing page and navbar destination

Added `/pricing` from `Qr code_pricing_page.svg` (1440 × 2821). Pricing in the shared navbar and footer now opens this page, with the active navbar state. The same shared header preserves its 80 px desktop and 68 px mobile height across routes.

- Three cards follow the reference: Basic at **$9.0/month**, Advanced at **$15.40/month** with the Most Popular ribbon, and Professional at **$9.04/month**, all in USD and billed annually. The Professional amount is lower than Basic and Advanced in the source SVG; it has been retained exactly, not corrected or treated as a verified commercial offer. Update the central `app/lib/pricing.ts` data when final prices are approved.
- The hero uses the background artwork extracted from the supplied SVG, with full-width coverage. Desktop sizing uses an approximately 800 px hero, 40 px title, centered 1080 px card grid, 28 px gaps, 532 px cards and a raised Advanced ribbon. The source's slightly off-center card positions are centered consistently with the site. Cards grow for longer translations and stack at 750 px. Testimonials use the original decorative background and a three-card static layout; other routes retain their existing carousel.
- The two design subtitles contain implementation notes about a frontend/backend handoff. The hero instead uses customer-facing plan copy. The reused testimonial content remains explicitly labeled as samples. The page marks paid plans and premium features as coming soon; it does not imply that dynamic codes, analytics, teams, bulk generation, or white-label services are currently provisioned.
- Each **Get Started** link opens `/contact?plan=basic`, `/contact?plan=advanced`, or `/contact?plan=professional`. Contact Us prefills a localized, editable enquiry for that specific plan, using the saved language. Only recognized plan IDs are accepted. A typed message is not overwritten. Opening a plan link does not make a network request, create an account, charge a payment, or activate a subscription. The existing contact endpoint configuration and explicit delivery acknowledgement are still required to send enquiries.
- The shared QR Code / Barcode FAQ provides working category tabs, collapsible answers and keyboard controls. Pricing reuses the FAQ page's measured card styles while retaining local tab state. Plan labels, descriptions, features, availability note, accessible CTA labels and enquiry text use all ten existing languages (616 keys per base locale). Dollar prices remain USD across languages.
- Card entrances, hover elevation and CTA feedback respect reduced-motion preferences. Keyboard focus remains visible, FAQ ARIA relationships are preserved, and mobile cards, tabs and buttons stay usable without horizontal scrolling.

Implementation: `app/pricing/page.tsx`, `app/components/PricingPlans.tsx`, `app/lib/pricing.ts`, `app/pricing-page.css`, and `public/assets/pricing-page/`, with shared navigation, contact-prefill and testimonial updates.

Validation: clean production build, TypeScript and static export; `npm run test:pricing` checks the reference prices, 30 localized plan enquiries, safe query parsing, navigation and all three CTA destinations, ten pricing renders, FAQ relationships, localization, and preservation of the existing carousel. `npm run test:contact`, `npm run test:faq`, and `npm run test:i18n` pass; the language suite covers 120 route/language renders. Static export inspection checks Pricing links and assets across nine main routes. No real contact messages or payments are sent by tests. Browser interaction and visual QA remain unverified in this environment.
