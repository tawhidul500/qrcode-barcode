const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {stripTypeScriptTypes}=require('node:module');
const root=path.resolve(__dirname,'..');
const compile=file=>stripTypeScriptTypes(fs.readFileSync(path.join(root,file),'utf8').replace(/^import .*;\n/gm,'').replaceAll('export ',''));
const {validLocale}=new Function(compile('app/lib/i18n/locales.ts')+';return {validLocale};')();
const {suggestLanguage,matchLanguage}=new Function('validLocale',compile('app/lib/i18n/suggest-language.ts')+';return {suggestLanguage,matchLanguage};')(validLocale);
test('local country takes precedence over browser English',()=>{
 for(const [country,expected] of [['BD','bn'],['AE','ar'],['FR','fr'],['MX','es-MX'],['BR','pt-BR'],['TR','tr'],['US','en']])assert.equal(suggestLanguage(country,'',['en-US']),expected);
});
test('lookup failures and unsupported languages fall back safely',()=>{
 assert.equal(suggestLanguage(undefined,'',['bn-BD','en-US']),'bn');
 assert.equal(suggestLanguage('DE','de-DE',['de-DE']),'en');
 assert.equal(suggestLanguage(undefined,'',['not_a_locale']),'en');
 assert.equal(matchLanguage('es-MX'),'es-MX');
 assert.equal(matchLanguage('pt-BR'),'pt-BR');
 assert.equal(matchLanguage('de-DE'),null);
});
test('language and pricing share a single lookup',async()=>{
 let requests=0;
 const fakeFetch=async()=>{requests++;return {ok:true,json:async()=>({country_code:'BD',currency:'BDT',languages:'bn-BD,en'})};};
 const {visitorRegion}=new Function('fetch',compile('app/lib/visitor-region.ts')+';return {visitorRegion};')(fakeFetch);
 const [a,b]=await Promise.all([visitorRegion(),visitorRegion()]);
 assert.equal(requests,1);assert.equal(a.country_code,'BD');assert.equal(a.currency,'BDT');assert.deepEqual(a,b);
});
test('invalid country responses reject for browser-language fallback',async()=>{
 const fakeFetch=async()=>({ok:true,json:async()=>({error:true})});
 const {visitorRegion}=new Function('fetch',compile('app/lib/visitor-region.ts')+';return {visitorRegion};')(fakeFetch);
 await assert.rejects(visitorRegion());
});
