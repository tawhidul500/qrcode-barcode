const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {suggestLanguage,matchLanguage}=require('../app/lib/i18n/suggest-language.ts');
const {browserRegion}=require('../app/lib/visitor-region.ts');
test('local country takes precedence over browser English',()=>{
 for(const [country,expected] of [['BD','bn'],['AE','ar'],['FR','fr'],['MX','es-MX'],['BR','pt-BR'],['TR','tr'],['US','en']])assert.equal(suggestLanguage(country,'',['en-US']),expected);
});
test('unsupported languages fall back safely',()=>{
 assert.equal(suggestLanguage(undefined,'',['bn-BD','en-US']),'bn');
 assert.equal(suggestLanguage('DE','de-DE',['de-DE']),'en');
 assert.equal(suggestLanguage(undefined,'',['not_a_locale']),'en');
 assert.equal(matchLanguage('es-MX'),'es-MX');assert.equal(matchLanguage('pt-BR'),'pt-BR');assert.equal(matchLanguage('de-DE'),null);
});
test('timezone identifies Bangladesh and UAE even with default English browser',()=>{
 assert.deepEqual(browserRegion(['en-US'],'Asia/Dhaka'),{country_code:'BD',currency:'BDT',languages:'en-US'});
 assert.equal(browserRegion(['en-US'],'Asia/Dubai').currency,'AED');
 assert.equal(browserRegion(['en-US'],'Europe/London').currency,'GBP');
 assert.equal(browserRegion(['fr-FR'],'UTC').country_code,'FR');
 assert.equal(browserRegion(['invalid_locale'],'UTC').country_code,'');
});
test('lookup is shared, handles alternate provider and falls back on failure',async()=>{
 const original=global.fetch;
 const modulePath=require.resolve('../app/lib/visitor-region.ts');
 try{
  let requests=0;global.fetch=async url=>{requests++;if(url.includes('ipapi'))throw Error('blocked');return {ok:true,json:async()=>({success:true,country_code:'AE',currency:{code:'AED'}})};};
  delete require.cache[modulePath];let {visitorRegion}=require(modulePath);
  const [a,b]=await Promise.all([visitorRegion(),visitorRegion()]);
  assert.equal(requests,2);assert.equal(a.country_code,'AE');assert.equal(a.currency,'AED');assert.deepEqual(a,b);
  global.fetch=async()=>({ok:true,json:async()=>({error:true})});delete require.cache[modulePath];({visitorRegion}=require(modulePath));
  assert.equal(typeof (await visitorRegion()).country_code,'string');
 }finally{global.fetch=original;delete require.cache[modulePath];}
});
