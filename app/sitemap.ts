import type {MetadataRoute} from 'next';
import {siteURL} from './lib/site-url';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteURL();
  return [
    '/',
    '/qr-code-generator',
    '/barcode-generator',
    '/scanner',
    '/qr-barcode-types',
    '/pricing',
    '/faq',
    '/blog',
    '/contact',
    '/privacy-policy',
  ].map(path => ({url: new URL(path, origin).href}));
}
