const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
const React=require('react');const {create,act}=require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT=true;
const Module=require('module');const originalLoad=Module._load;
Module._load=function(name,...args){if(name==='next/navigation')return {usePathname:()=>'/pricing'};return originalLoad.call(this,name,...args);};
const {convertBDT,formatPrice}=require('../app/lib/pricing-currency.ts');
const {backupRates,readRates,refreshRates}=require('../app/lib/pricing-rates.ts');
const {languageStorageKey,languageChoiceKey}=require('../app/lib/i18n/locales.ts');
const h=React.createElement;
const text=node=>!node?'':typeof node==='string'?node:Array.isArray(node)?node.map(text).join(''):text(node.children);
function environment(timezone,values={},blocked=false){
 const data=new Map(Object.entries(values));
 Object.defineProperty(global,'navigator',{configurable:true,value:{languages:['en-US'],language:'en-US'}});
 const storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
 global.window={addEventListener(){},removeEventListener(){},get localStorage(){if(blocked)throw Error('storage disabled');return storage;}};
 global.document={documentElement:{dataset:{}},body:{style:{overflow:''}},activeElement:{focus(){}}};
 const Original=Intl.DateTimeFormat;
 Intl.DateTimeFormat=function(...args){const result=new Original(...args);result.resolvedOptions=()=>({timeZone:timezone});return result;};
 return {data,restore:()=>{Intl.DateTimeFormat=Original;}};
}
function components(){
 for(const file of ['../app/lib/visitor-region.ts','../app/components/i18n/LanguageProvider.tsx','../app/components/PricingPlans.tsx'])delete require.cache[require.resolve(file)];
 return {Provider:require('../app/components/i18n/LanguageProvider.tsx').LanguageProvider,Pricing:require('../app/components/PricingPlans.tsx').default};
}
const nodeMock=element=>element.type==='dialog'?{open:false,showModal(){this.open=true;},close(){this.open=false;}}:null;
test('blocked APIs: Bangladesh popup appears for old English preference; dismiss keeps English',async()=>{
 const env=environment('Asia/Dhaka',{[languageStorageKey]:'en'});const fetch=global.fetch;global.fetch=async()=>{throw Error('offline');};let renderer;
 try{
  const {Provider,Pricing}=components();await act(async()=>{renderer=create(h(Provider,null,h(Pricing)),{createNodeMock:nodeMock});});
  assert.equal(renderer.root.findAllByType('dialog').length,1);
  assert(text(renderer.toJSON()).includes('বাংলা'));
  assert(text(renderer.toJSON()).includes('751.35'));assert(!text(renderer.toJSON()).includes('…'));
  const close=renderer.root.findAllByType('button').find(button=>button.props['aria-label']==='Close and continue in English');
  await act(async()=>close.props.onClick());assert.equal(document.documentElement.lang,'en-US');
  assert.equal(renderer.root.findAllByType('dialog').length,0);assert.equal(env.data.get(languageChoiceKey),'chosen');
  await act(async()=>renderer.unmount());
  await act(async()=>{renderer=create(h(Provider,null,h(Pricing)),{createNodeMock:nodeMock});});
  assert.equal(renderer.root.findAllByType('dialog').length,0);
 }finally{if(renderer)await act(async()=>renderer.unmount());global.fetch=fetch;env.restore();}
});
test('offline UAE with disabled storage: automatic AED pricing and Arabic choice work',async()=>{
 const env=environment('Asia/Dubai',{},true);const fetch=global.fetch;global.fetch=async()=>{throw Error('blocked');};let renderer;
 try{
  const {Provider,Pricing}=components();await act(async()=>{renderer=create(h(Provider,null,h(Pricing)),{createNodeMock:nodeMock});});
  const prices=renderer.root.findAllByType('strong').map(node=>node.children.join(''));
  assert.equal(prices[1],formatPrice(convertBDT(751.35,'AED',backupRates.rates),'AED','en-US'));
  const choose=renderer.root.findAllByType('button').find(node=>node.props.lang==='ar');await act(async()=>choose.props.onClick());
  assert.equal(document.documentElement.lang,'ar');assert.equal(document.documentElement.dir,'rtl');
  assert.equal(renderer.root.findAllByType('dialog').length,0);
 }finally{if(renderer)await act(async()=>renderer.unmount());global.fetch=fetch;env.restore();}
});
test('Bengali choice translates pricing and Escape dismisses to English',async()=>{
 const env=environment('Asia/Dhaka');const fetch=global.fetch;global.fetch=async()=>{throw Error('offline');};let renderer;
 try{
  const {Provider,Pricing}=components();await act(async()=>{renderer=create(h(Provider,null,h(Pricing)),{createNodeMock:nodeMock});});
  const choose=renderer.root.findAllByType('button').find(node=>node.props.lang==='bn');await act(async()=>choose.props.onClick());
  assert.equal(document.documentElement.lang,'bn');assert(text(renderer.toJSON()).includes('আপনার QR প্রকল্পের জন্য উপযুক্ত প্ল্যান বেছে নিন'));
  assert(text(renderer.toJSON()).includes('সীমাহীন ট্র্যাকযোগ্য QR কোড'));
  await act(async()=>renderer.unmount());env.data.clear();
  await act(async()=>{renderer=create(h(Provider,null,h(Pricing)),{createNodeMock:nodeMock});});
  let prevented=false;await act(async()=>renderer.root.findByType('dialog').props.onCancel({preventDefault(){prevented=true;}}));
  assert(prevented);assert.equal(document.documentElement.lang,'en-US');assert.equal(renderer.root.findAllByType('dialog').length,0);
 }finally{if(renderer)await act(async()=>renderer.unmount());global.fetch=fetch;env.restore();}
});
test('real geo result overrides timezone and locale for pricing and language',async()=>{
 const env=environment('Asia/Dhaka');const fetch=global.fetch;
 global.fetch=async url=>url.includes('ipapi')?{ok:true,json:async()=>({country_code:'FR',currency:'EUR',languages:'fr-FR'})}:Promise.reject(Error('blocked'));let renderer;
 try{
  const {Provider,Pricing}=components();await act(async()=>{renderer=create(h(Provider,null,h(Pricing)),{createNodeMock:nodeMock});});
  assert(renderer.root.findAllByType('button').some(node=>node.props.lang==='fr'));
  const prices=renderer.root.findAllByType('strong').map(node=>node.children.join(''));
  assert.equal(prices[1],formatPrice(convertBDT(751.35,'EUR',backupRates.rates),'EUR','en-US'));
 }finally{if(renderer)await act(async()=>renderer.unmount());global.fetch=fetch;env.restore();}
});
test('invalid cached rates are ignored; backup covers popular currencies',()=>{
 assert.equal(readRates({getItem:()=>'{bad'}),backupRates);
 assert.equal(readRates({getItem:()=>JSON.stringify({fetchedAt:Date.now(),rates:{BDT:0}})}),backupRates);
 for(const currency of ['BDT','USD','AED','EUR','GBP','PKR','INR'])assert(convertBDT(751.35,currency,backupRates.rates)>0);
});
test('expired cache can refresh from independent rate service',async()=>{
 const fetch=global.fetch;const now=Date.now;Date.now=()=>now()+172800000;
 const storage={getItem:()=>null,setItem(){}};global.fetch=async url=>{
  if(url.includes('open.er-api'))throw Error('blocked');
  return {ok:true,json:async()=>({date:new Date(Date.now()-3600000).toISOString().slice(0,10),usd:{usd:1,bdt:120,aed:3.6725,eur:0.9}})};
 };
 try{const rates=await refreshRates(storage,new AbortController().signal);assert.equal(rates.rates.AED,3.6725);assert.equal(rates.rates.BDT,120);}finally{global.fetch=fetch;Date.now=now;}
});
