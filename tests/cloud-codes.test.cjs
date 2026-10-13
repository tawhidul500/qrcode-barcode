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
 assert.throws(()=>server.validateCode({name:'A',kind:'qr',type:'Text',image:image+'x'.repeat(250000)}));
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
 await assert.rejects(server.jsonBody(req('POST',{image:'x'.repeat(300001)})),/too large/);
});
test('cloud client sends bearer token and surfaces failures without local fallback',async()=>{
 const auth=require('../app/lib/auth/client.ts'),original=auth.getAuthClient,oldFetch=global.fetch;
 const client=require('../app/lib/cloud-codes.ts');auth.getAuthClient=()=>({auth:{getSession:async()=>({data:{session:{access_token:'verified-token'}},error:null})}});
 global.fetch=async(url,options)=>{assert.equal(url,'/api/codes');assert.equal(options.headers.Authorization,'Bearer verified-token');assert.equal(options.cache,'no-store');return Response.json({codes:[{id}]});};
 try{assert.equal((await client.listCloudCodes())[0].id,id);global.fetch=async()=>Response.json({error:'Cloud storage is full'},{status:409});await assert.rejects(client.createCloudCode({name:'A',kind:'qr',type:'Text',image}),/full/);}finally{auth.getAuthClient=original;global.fetch=oldFetch;}
});
