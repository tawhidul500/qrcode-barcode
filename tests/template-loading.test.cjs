const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {loadCategoryTemplate,categoryTemplatePresets,TemplateLoadError}=require('../app/lib/category-template-presets.ts');
const root=path.join(__dirname,'..');
const readAsset=url=>JSON.parse(fs.readFileSync(path.join(root,'public',url),'utf8'));
test('loads only the selected template, deduplicates requests, caches successes and retries failures',async()=>{
 const originalFetch=global.fetch;
 const requests=[];
 try{
  let release;
  global.fetch=url=>{requests.push(url);return new Promise(resolve=>{release=()=>resolve({ok:true,json:async()=>readAsset(url)});});};
  await loadCategoryTemplate(0);
  await loadCategoryTemplate(1);
  assert.equal(requests.length,0,'built-in templates must not fetch category artwork');
  const first=loadCategoryTemplate(21),second=loadCategoryTemplate(21);
  assert.equal(first,second);
  assert.equal(requests.length,1);
  assert.match(requests[0],/^\/assets\/qr-templates\/21\.[a-f0-9]{12}\.json$/);
  assert.deepEqual(Object.keys(categoryTemplatePresets),[]);
  release();await first;
  assert.deepEqual(Object.keys(categoryTemplatePresets),['21']);
  await loadCategoryTemplate(21);assert.equal(requests.length,1);
  global.fetch=async()=>({ok:false});
  await assert.rejects(loadCategoryTemplate(22),TemplateLoadError);
  assert.equal(categoryTemplatePresets[22],undefined);
  global.fetch=async()=>({ok:true,json:async()=>({})});
  await assert.rejects(loadCategoryTemplate(22),TemplateLoadError);
  global.fetch=async url=>({ok:true,json:async()=>readAsset(url)});
  await loadCategoryTemplate(22);
  assert.ok(categoryTemplatePresets[22].art.includes('__DYNAMIC_QR__'));
 }finally{global.fetch=originalFetch;}
});
test('all template assets match their content hashes',()=>{
 const crypto=require('node:crypto');
 const directory=path.join(root,'public/assets/qr-templates');
 const files=fs.readdirSync(directory);
 assert.equal(files.length,100);
 for(const name of files){
  const bytes=fs.readFileSync(path.join(directory,name));
  assert.equal(name.split('.')[1],crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12));
  assert.ok(JSON.parse(bytes).art.includes('__DYNAMIC_QR__'));
 }
});
