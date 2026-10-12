const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>{
 module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
};
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {pricingPlans,findPricingPlan,pricingContactHref,pricingInquiry}=require('../app/lib/pricing.ts');
const {locales}=require('../app/lib/i18n/locales.ts');
const {translate}=require('../app/lib/i18n/translate.ts');
const {LanguageProvider}=require('../app/components/i18n/LanguageProvider.tsx');
const PricingPage=require('../app/pricing/page.tsx').default;
const Testimonials=require('../app/components/Testimonials.tsx').default;
const h=React.createElement;
const escape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');

assert.deepEqual(pricingPlans.map(p=>p.price),['9.0','15.40','9.04'],'Preserve the supplied USD prices');
assert.equal(pricingPlans.filter(p=>p.popular).length,1);
assert.equal(pricingPlans.find(p=>p.popular).id,'advanced');
for(const invalid of [null,'','__proto__','unknown','ADVANCED','<script>'])assert.equal(findPricingPlan(invalid),undefined);
for(const query of ['','?plan=unknown','?plan=%3Cscript%3E','?plan=basic%26redirect%3Devil','?other=basic'])assert.equal(pricingInquiry(query,'en'),'');

for(const {code}of locales){
 for(const plan of pricingPlans){
  const url=new URL(pricingContactHref(plan),'https://site.example');
  assert.equal(url.pathname,'/contact');
  assert.equal(url.searchParams.get('plan'),plan.id);
  assert.equal(findPricingPlan(url.searchParams.get('plan')),plan);
  const message=pricingInquiry(url.search,code);
  assert(message.includes(translate(plan.name,code)));
  assert(!message.includes('{value}'));
  assert.equal(message,pricingInquiry(url.search+'&untrusted=%3Cscript%3E',code));
  if(code!=='en')assert.notEqual(message,pricingInquiry(url.search,'en'));
  for(const phrase of [plan.name,plan.description,...plan.features,'Get started with '+plan.name]){
   if(code!=='en'&&!(code==='fr'&&phrase==='Export (PNG, SVG, PDF)'))assert.notEqual(translate(phrase,code),phrase,code+': '+phrase);
  }
 }
 const html=renderToStaticMarkup(h(LanguageProvider,{initialLocale:code},h(PricingPage)));
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.equal((html.match(/class="pricing-card(?: is-popular)?"/g)||[]).length,3);
 assert.equal((html.match(/class="pricing-cta"/g)||[]).length,3);
 assert(html.includes('href="/pricing" class="home-nav-link is-active" aria-current="page"'));
 assert.equal((html.match(/href="\/pricing"/g)||[]).length,2,'Header and footer both link to Pricing');
 assert.equal((html.match(/role="tab"/g)||[]).length,2);
 assert.equal((html.match(/aria-expanded="true"/g)||[]).length,1,'One initial FAQ answer');
 assert.equal((html.match(/class="qr-testimonial-copy"/g)||[]).length,3);
 assert(!html.includes('testimonial-controls'),'Pricing uses static testimonials from the reference');
 for(const plan of pricingPlans){
  assert(html.includes('href="'+pricingContactHref(plan)+'"'));
  assert(html.includes('$'+plan.price));
  assert(html.includes(escape(translate(plan.name,code))));
 }
 for(const phrase of ['Choose the best QR & Bar Code Plan For You','Explore plans for personal projects, growing teams, and businesses.','Most Popular','/month','Billed annually','Get Started','Prices are in USD. Paid plans and premium features are coming soon. Get Started opens a plan enquiry.']){
  assert(html.includes(escape(translate(phrase,code))),code+': missing '+phrase);
  if(code!=='en')assert.notEqual(translate(phrase,code),phrase,code+': untranslated '+phrase);
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size,'IDs remain unique across shared sections');
 // Header language/resource popovers mount on demand; validate the new page's relationships.
 const main=html.match(/<main>([\s\S]*?)<\/main>/)[1];
 for(const match of main.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g))for(const id of match[1].split(' '))assert(ids.includes(id),'Missing ARIA target: '+id);
}
const existingCarousel=renderToStaticMarkup(h(LanguageProvider,null,h(Testimonials)));
assert(existingCarousel.includes('testimonial-controls'));
assert.equal((existingCarousel.match(/class="qr-testimonial-copy"/g)||[]).length,6,'Other pages retain the original carousel');
console.log('PASS: three reference prices, 30 localized plan enquiries, safe query parsing, navigation, CTA destinations, 10 pricing page renders, accessible FAQ, translations and preserved testimonial carousel.');
