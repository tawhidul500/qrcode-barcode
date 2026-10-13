# Sitemap and crawler setup

The static production build generates `/sitemap.xml` and `/robots.txt` using
Next.js metadata routes marked `force-static`.

Set `SITE_URL` to the canonical production origin before building. It defaults
to `https://qrcode-barcode-peach.vercel.app`. Use an HTTP(S) origin without a
path, query, fragment, or credentials. Rebuild when changing the domain.

The sitemap contains the ten existing public pages. Account, login, signup,
password recovery, and authentication callback pages are excluded and have
`noindex, follow` metadata. Robots permits crawling so search engines can read
those directives. These directives do not replace authentication.

After deployment, check `/robots.txt` and `/sitemap.xml` on your domain and
submit the sitemap URL in your search engine webmaster account if desired.

Run `npm run test:seo` to check real route targets, XML/text serialization,
custom-domain handling, and invalid configuration.
