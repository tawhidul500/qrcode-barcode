const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const server=require('../app/lib/server/codes.ts');const route=require('../app/api/codes/route.ts');
const image='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"/>');
const id='11111111-1111-4111-8111-111111111111';
function req(method,body){return new Request('https://example.com/api/codes',{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}
test('API rejects unauthenticated access for every operation',async()=>{for(const method of ['GET','POST','PATCH','DELETE']){const response=await route[method](req(method,method==='GET'?undefined:{}));assert.equal(response.status,401);}});
test('validates code size, metadata and IDs before persistence',()=>{
 assert.equal(server.validateCode({name:' My code ',kind:'qr',type:'Text',image}).name,'My code');
 assert.throws(()=>server.validateCode({name:'A',kind:'qr',type:'Text',image:'javascript:alert(1)'}));
 assert.throws(()=>server.validateCode({name:'A',kind:'qr',type:'Text',image:image+'x'.repeat(32000000)}));
 assert.throws(()=>server.codeId("' OR 1=1"));
});
test('all SQL operations use the verified owner, bound parameters, and server hash',async()=>{
 const originalAuth=server.authenticate,originalDb=server.database;const owner='22222222-2222-4222-8222-222222222222';const calls=[];
 server.authenticate=async()=>owner;server.database=()=>async(strings,...values)=>{calls.push({sql:strings.join('?'),values});return [{user_id:owner,id,name:'Example',kind:'qr',type:'Text',image,archived:false,created_at:'2026-10-13T00:00:00Z'}];};
 try{
  assert.equal((await route.GET(req('GET'))).status,200);
  assert.equal((await route.POST(req('POST',{id,name:'Example',kind:'qr',type:'Text',image,user_id:'attacker'}))).status,200);
  assert.equal((await route.PATCH(req('PATCH',{ids:[id],name:"' OR 1=1"}))).status,200);
  assert.equal((await route.DELETE(req('DELETE',{id}))).status,200);
  for(const call of calls)assert(call.values.includes(owner));
  assert(calls[1].values.includes(server.imageHash(image)));assert(!calls[1].values.includes('attacker'));assert(!calls[2].sql.includes("' OR 1=1"));
 }finally{server.authenticate=originalAuth;server.database=originalDb;}
});
test('invalid JSON and oversized bodies are rejected',async()=>{
 await assert.rejects(server.jsonBody(new Request('https://example.com',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})),/Invalid JSON/);
 await assert.rejects(server.jsonBody(req('POST',{image:'x'.repeat(4000001)})),/too large/);
});
test('cloud client sends bearer token and surfaces failures without local fallback',async()=>{
 const auth=require('../app/lib/auth/client.ts'),original=auth.getAuthClient,oldFetch=global.fetch;
 const client=require('../app/lib/cloud-codes.ts');auth.getAuthClient=()=>({auth:{getSession:async()=>({data:{session:{access_token:'verified-token'}},error:null})}});
 global.fetch=async(url,options)=>{assert.equal(url,'/api/codes');assert.equal(options.headers.Authorization,'Bearer verified-token');assert.equal(options.cache,'no-store');return Response.json({codes:[{id,image}]});};
 try{assert.equal((await client.listCloudCodes())[0].id,id);global.fetch=async()=>Response.json({error:'Cloud storage is full'},{status:409});await assert.rejects(client.createCloudCode({name:'A',kind:'qr',type:'Text',image}),/full/);}finally{auth.getAuthClient=original;global.fetch=oldFetch;}
});
test('large artwork is compressed in transit and restored byte-for-byte',async()=>{
 const {encodeCodeUpload}=require('../app/lib/code-upload.ts');
 const original={name:'Gift template',kind:'qr',type:'Website',image:image+'x'.repeat(1200000)};
 const packed=await encodeCodeUpload(original);assert(packed.imageGzip);assert(JSON.stringify(packed).length<300000);
 assert.equal(server.validateCode(packed).image,original.image);
 assert.deepEqual(await encodeCodeUpload({image}),{image});
 assert.throws(()=>server.validateCode({...packed,image}));
 assert.throws(()=>server.validateCode({...packed,imageGzip:'not-gzip'}));
});
test('every built-in QR template uploads at every selectable size without losing artwork',async()=>{
 const path=require('node:path');const {renderQR,defaultDesign}=require('../app/lib/qr-design.ts');const {loadCategoryTemplate}=require('../app/lib/category-template-presets.ts');const {encodeCodeUpload}=require('../app/lib/code-upload.ts');const oldFetch=global.fetch;
 global.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(__dirname,'../public',url),'utf8'))});
 let largest=0,largestRequest=0;
 try{for(let templateIndex=0;templateIndex<=120;templateIndex++){
  await loadCategoryTemplate(templateIndex);
  for(const size of [500,1000,2000]){
   const image='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(renderQR('https://example.com',{...defaultDesign,templateIndex},size));
   const packed=await encodeCodeUpload({name:'Template '+templateIndex,kind:'qr',type:'Website',image});
   assert.equal(server.validateCode(packed).image,image,'Template '+templateIndex+' / '+size);
   largest=Math.max(largest,Buffer.byteLength(image));largestRequest=Math.max(largestRequest,Buffer.byteLength(JSON.stringify(packed)));
  }
 }
 console.log('Verified 363 QR template/size combinations; largest image '+largest+' bytes; largest upload '+largestRequest+' bytes.');
 }finally{global.fetch=oldFetch;}
});
test('large dashboard response restores the original image',async()=>{
 const {decodeCodeDownload}=require('../app/lib/code-upload.ts');
 const row={id,name:'Large',kind:'qr',type:'Text',image:image+'x'.repeat(1200000),created_at:'2026-10-13',archived:false};
 const packed=server.transportCode(row);assert(packed.imageGzip);const restored=await decodeCodeDownload(packed);assert.equal(restored.image,row.image);assert.equal(restored.id,id);
});
test('every barcode type and template uploads intact',async()=>{
 const bwip=require('bwip-js');const {barcodeTypes}=require('../app/lib/barcode-types.ts');const {renderBarcodeTemplate}=require('../app/lib/barcode-template-renderer.ts');const {encodeCodeUpload}=require('../app/lib/code-upload.ts');
 let count=0;
 for(const [name,bcid,sample] of barcodeTypes){
  const base=bwip.toSVG({bcid,text:sample,includecheck:bcid==='code93',scale:3,height:30,includetext:true});
  for(let template=0;template<28;template++){
   const svg=renderBarcodeTemplate(base,template,'#ffffff','#111111','Sample',['pdf417','datamatrix'].includes(bcid),12);
   const image='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
   const packed=await encodeCodeUpload({name,kind:'barcode',type:name,image});assert.equal(server.validateCode(packed).image,image);count++;
  }
 }
 console.log('Verified '+count+' barcode type/template combinations.');
});
