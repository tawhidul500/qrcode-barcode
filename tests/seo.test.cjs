const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  }).outputText, filename);
};
const sitemap = require('../app/sitemap.ts');
const robots = require('../app/robots.ts');
const {siteURL} = require('../app/lib/site-url.ts');
const {resolveSitemap, resolveRobots} = require('next/dist/build/webpack/loaders/metadata/resolve-route-data');

test('sitemap lists existing public routes and excludes account/authentication routes', () => {
  const entries = sitemap.default();
  const urls = entries.map(entry => entry.url);
  assert.equal(new Set(urls).size, 10);
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    assert(fs.existsSync(path.join(__dirname, '../app', pathname, 'page.tsx')));
    assert(!/^\/(account|login|signup|forgot-password|reset-password|auth)(\/|$)/.test(pathname));
  }
  const xml = resolveSitemap(entries);
  assert.match(xml, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.equal((xml.match(/<loc>/g) || []).length, 10);
  assert.equal(sitemap.dynamic, 'force-static');
  assert.equal(robots.dynamic, 'force-static');
});

test('robots allows crawling and points to the same production sitemap', () => {
  const text = resolveRobots(robots.default());
  assert(text.includes('User-Agent: *\nAllow: /\n'));
  assert(text.includes(`Sitemap: ${siteURL()}/sitemap.xml`));
});

test('custom origins apply to both files and invalid configuration fails clearly', () => {
  const previous = process.env.SITE_URL;
  try {
    process.env.SITE_URL = 'https://codes.example.com/';
    assert(sitemap.default().every(entry => new URL(entry.url).origin === 'https://codes.example.com'));
    assert.equal(robots.default().sitemap, 'https://codes.example.com/sitemap.xml');
    for (const value of ['invalid', 'ftp://example.com', 'https://example.com/path', 'https://user:pass@example.com', 'https://example.com/?query=1']) {
      process.env.SITE_URL = value;
      assert.throws(() => siteURL());
    }
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});
