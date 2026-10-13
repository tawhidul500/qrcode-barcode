const defaultSiteURL = 'https://qrcode-barcode-peach.vercel.app';

/** The canonical production origin, supplied at build time for static export. */
export function siteURL(): string {
  const url = new URL(process.env.SITE_URL || defaultSiteURL);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTP(S) origin without a path, credentials, query, or fragment.');
  }
  return url.origin;
}
