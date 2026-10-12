const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>{
 module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
};
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {faqGroups,createFaqState,faqReducer,resolveFaqTab,faqHref,nextFaqQuestion}=require('../app/lib/faq.ts');
const {locales}=require('../app/lib/i18n/locales.ts');
const {translate}=require('../app/lib/i18n/translate.ts');
const {LanguageProvider}=require('../app/components/i18n/LanguageProvider.tsx');
const FAQ=require('../app/components/FAQ.tsx').default;
const SiteHeader=require('../app/components/SiteHeader.tsx').default;
const h=React.createElement;

assert.equal(faqGroups.length,2);
assert(faqGroups.every(group=>group.questions.length===7));
assert.equal(new Set(faqGroups.flatMap(group=>group.questions.map(([question])=>question))).size,14);
assert.equal(resolveFaqTab('barcode'),1);
for(const value of [null,'','qr','other','1','__proto__'])assert.equal(resolveFaqTab(value),0);
for(let tab=0;tab<2;tab++){
 assert.equal(resolveFaqTab(new URL(faqHref(tab),'https://example.test').searchParams.get('tab')),tab);
 let state=createFaqState(tab);
 assert.deepEqual(state,{tab,open:0});
 state=faqReducer(state,{type:'toggle',question:0});assert.equal(state.open,null);
 for(let question=0;question<7;question++){
  state=faqReducer(state,{type:'toggle',question});assert.equal(state.open,question);
  state=faqReducer(state,{type:'toggle',question});assert.equal(state.open,null);
 }
 state=faqReducer(state,{type:'toggle',question:5});
 assert.strictEqual(faqReducer(state,{type:'select',tab}),state,'Selecting active category preserves its answer');
 for(const question of [-1,7,1.5,NaN])assert.strictEqual(faqReducer(state,{type:'toggle',question}),state);
 assert.deepEqual(faqReducer(state,{type:'select',tab:1-tab}),{tab:1-tab,open:0});
}
assert.equal(nextFaqQuestion(6,'ArrowDown',7),0);
assert.equal(nextFaqQuestion(0,'ArrowUp',7),6);
assert.equal(nextFaqQuestion(4,'Home',7),0);
assert.equal(nextFaqQuestion(4,'End',7),6);
assert.equal(nextFaqQuestion(4,'Enter',7),null);
assert.equal(nextFaqQuestion(4,' ',7),null);
assert.equal(nextFaqQuestion(0,'ArrowDown',0),null);

let renders=0;
for(const {code} of locales){
 for(const barcodeDefault of [false,true])for(const fullPage of [false,true]){
  const html=renderToStaticMarkup(h(LanguageProvider,{initialLocale:code},h(FAQ,{barcodeDefault,fullPage})));
  const tab=barcodeDefault?1:0;
  assert.equal((html.match(/role="tab"/g)||[]).length,2);
  assert.equal((html.match(/role="tabpanel"/g)||[]).length,2);
  assert.equal((html.match(/aria-selected="true"/g)||[]).length,1);
  assert.equal((html.match(/aria-expanded="true"/g)||[]).length,1);
  assert.equal((html.match(/role="region"/g)||[]).length,14);
  const panels=[...html.matchAll(/<div[^>]*role="tabpanel"[^>]*>/g)].map(match=>match[0]);
  assert(!panels[tab].includes('hidden=""'));
  assert(panels[1-tab].includes('hidden=""'));
  assert(html.includes('id="faq-question-'+tab+'-0" aria-expanded="true"'));
  assert(html.includes('<'+(fullPage?'h1':'h2')+' id="faq-heading"'));
  const heading=html.match(/<h[12] id="faq-heading"[^>]*>([\s\S]*?)<\/h[12]>/)[1].replace(/<[^>]*>/g,'');
  assert.equal(heading,translate('Frequently Asked Questions',code),'Complete translated heading without duplicate words');
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const [,target] of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g))assert(ids.includes(target),'Missing ARIA target '+target);
  for(const group of faqGroups)for(const [question,answer] of group.questions){
   if(code!=='en'){
    assert.notEqual(translate(question,code),question,code+': '+question);
    assert.notEqual(translate(answer,code),answer,code+': '+question+' answer');
   }
  }
  renders++;
 }
}
for(const active of ['faq','blog','contact']){
 const html=renderToStaticMarkup(h(LanguageProvider,null,h(SiteHeader,{active})));
 assert(html.includes('href="/'+active+'" aria-current="page"'));
 assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
 for(const route of ['faq','blog','contact'])assert(html.includes('href="/'+route+'"'));
}
console.log('PASS: 14 FAQs, category/accordion transitions, URL restoration, keyboard navigation, ARIA relationships, shared Resources links and '+renders+' localized FAQ renders.');
