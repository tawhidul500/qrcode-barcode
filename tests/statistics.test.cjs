const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);require.extensions['.css']=()=>{};
const stats=require('../app/lib/statistics.ts');
test('validates redirects, bounded date filters, device classification and safe CSV',()=>{
 assert.equal(stats.trackingTarget('https://example.com'),'https://example.com/');for(const url of ['javascript:alert(1)','https://user:password@example.com','https://site.test/r/11111111-1111-4111-8111-111111111111'])assert.throws(()=>stats.trackingTarget(url));
 assert.equal(stats.parseStatisticsFilter(new URLSearchParams('from=2026-10-01&to=2026-10-13&country=BD')).country,'BD');for(const query of ['from=2026-02-30','from=2026-10-13&to=2026-10-01','from=2026-01-01&to=2026-10-13','country=bad','device=Bad'])assert.throws(()=>stats.parseStatisticsFilter(new URLSearchParams(query)));
 assert.equal(stats.detectDevice('iPhone Mobile'),'Mobile');assert.equal(stats.detectDevice('iPad'),'Tablet');assert.equal(stats.detectDevice('Windows NT'),'Desktop');assert(stats.isAutomatedVisit('Googlebot',new Headers()));assert(stats.isAutomatedVisit('normal',new Headers({purpose:'prefetch'})));
 assert(stats.statisticsCSV({total:3,uniqueDevices:2,daily:[{label:'=1+1',visits:3,uniqueDevices:2}],countries:[],devices:[]}).includes("'=1+1"));
});
test('statistics and tracking APIs isolate owners and use bound filter values',async()=>{
 const server=require('../app/lib/server/codes.ts'),route=require('../app/api/statistics/route.ts'),tracking=require('../app/api/tracking/route.ts');const oldAuth=server.authenticate,oldDb=server.database;
 assert.equal((await route.GET(new Request('https://app.test/api/statistics'))).status,401);
 const calls=[];server.authenticate=async()=> 'verified-owner';server.database=()=>async(strings,...values)=>{const query=strings.join('?');calls.push({query,values});if(query.includes('WITH filtered'))return [{category:'total',label:'All',visits:3,unique_devices:2},{category:'country',label:'BD',visits:3,unique_devices:2}];return [{id:'11111111-1111-4111-8111-111111111111',title:'Test',target:'https://example.com/',active:true}];};
 try{const result=await route.GET(new Request('https://app.test/api/statistics?from=2026-10-01&to=2026-10-13&country=BD'));const data=await result.json();assert.equal(data.total,3);assert.equal(data.uniqueDevices,2);assert.equal(data.countries[0].label,'BD');
 const post=await tracking.POST(new Request('https://app.test/api/tracking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Test',target:'https://example.com',user_id:'attacker'})}));assert.equal(post.status,200);for(const call of calls)assert(call.values.includes('verified-owner'));assert(!calls.at(-1).values.includes('attacker'));
 }finally{server.authenticate=oldAuth;server.database=oldDb;}
});
test('public tracked URL records only ordinary GET visits, redirects on write failure, and never stores raw IP',async()=>{
 const server=require('../app/lib/server/codes.ts'),route=require('../app/r/[id]/route.ts'),oldDb=server.database;const oldSecret=process.env.ANALYTICS_HASH_SECRET;process.env.ANALYTICS_HASH_SECRET='test-only-secret';const id='11111111-1111-4111-8111-111111111111',calls=[];let fail=false;
 server.database=()=>async(strings,...values)=>{calls.push({query:strings.join('?'),values});if(strings.join('').includes('record_code_visit')){if(fail)throw Error('write unavailable');return [];}return [{id,target:'https://example.com/',active:true}];};
 const params={params:Promise.resolve({id})};
 try{
  const result=await route.GET(new Request('https://app.test/r/'+id,{headers:{'user-agent':'iPhone Mobile','x-forwarded-for':'10.0.0.1'}}),params);assert.equal(result.status,302);assert.equal(result.headers.get('Location'),'https://example.com/');assert(result.headers.get('set-cookie').includes('HttpOnly'));assert.equal(calls[1].values[3],'Mobile');assert.equal(calls[1].values[1].length,64);assert(!calls[1].values.includes('10.0.0.1'));
  calls.length=0;await route.HEAD(new Request('https://app.test/r/'+id,{method:'HEAD'}),params);assert.equal(calls.length,1);
  calls.length=0;await route.GET(new Request('https://app.test/r/'+id,{headers:{'user-agent':'Googlebot'}}),params);assert.equal(calls.length,1);
  fail=true;assert.equal((await route.GET(new Request('https://app.test/r/'+id,{headers:{'user-agent':'Windows NT'}}),params)).status,302);
 }finally{server.database=oldDb;if(oldSecret===undefined)delete process.env.ANALYTICS_HASH_SECRET;else process.env.ANALYTICS_HASH_SECRET=oldSecret;}
});
test('statistics UI applies filters and exports real data',async()=>{
 const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;const client=require('../app/lib/statistics-client.ts'),old=client.loadStatistics;let filter;
 client.loadStatistics=async f=>{filter=f;return {total:7,uniqueDevices:3,daily:[],countries:[],devices:[],codes:[],filter:f};};let renderer;
 try{await act(async()=>{renderer=create(React.createElement(require('../app/components/StatisticsPage.tsx').default));});assert(JSON.stringify(renderer.toJSON()).includes('Estimated Unique Devices'));assert(renderer.root.findAllByType('strong').some(n=>n.children.includes('7')));const selects=renderer.root.findAllByType('select');await act(async()=>selects[1].props.onChange({target:{value:'BD'}}));await act(async()=>renderer.root.findAllByType('form')[0].props.onSubmit({preventDefault(){}}));assert.equal(filter.country,'BD');}finally{if(renderer)await act(async()=>renderer.unmount());client.loadStatistics=old;}
});
test('generator creates a tracked payload while keeping the selected design and export size',async()=>{
 const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
 const auth=require('../app/lib/auth/client.ts'),client=require('../app/lib/statistics-client.ts'),saving=require('../app/lib/save-generated-code.ts');const oldConfigured=auth.authConfigured,oldClient=auth.getAuthClient,exporter=require('../app/lib/export-code.ts'),oldExport=exporter.downloadCode,oldCreate=client.createTracking,oldSave=saving.saveGeneratedCode,oldChange=client.changeTrackedLink;
 let destination='',saved=null,changed=null;const trackedURL='https://app.test/r/11111111-1111-4111-8111-111111111111';
 auth.authConfigured=()=>true;auth.getAuthClient=()=>({auth:{getSession:async()=>({data:{session:{access_token:'token'}}})}});exporter.downloadCode=async()=>{};client.changeTrackedLink=async(id,change)=>{changed={id,...change};};client.createTracking=async(title,target)=>{destination=target;return {id:'id',title,target,url:trackedURL,active:true};};saving.saveGeneratedCode=async code=>{saved=code;return 'Saved';};global.window={location:{search:''}};global.document={addEventListener(){},removeEventListener(){}};
 const {renderQR,defaultDesign}=require('../app/lib/qr-design.ts');let renderer;
 try{
  await act(async()=>{renderer=create(React.createElement(require('../app/components/Generator.tsx').default,{selectedType:'Website',onTypeChange(){}}));});
  await act(async()=>renderer.root.findByProps({id:'qr-content'}).props.onChange({target:{value:'https://example.com'}}));
  const enable=renderer.root.findAllByType('button').find(b=>b.children.includes('Dynamic QR'));assert(enable);await act(async()=>enable.props.onClick());assert.equal(destination,'https://example.com/');
  const preview=renderer.root.findByProps({alt:'Generated Website QR code'});assert.equal(preview.props.src,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(renderQR(trackedURL,defaultDesign,360)));
  const save=renderer.root.findAllByType('button').find(b=>b.children.includes('Download QR Code'));await act(async()=>save.props.onClick());assert.equal(saved.image,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(renderQR(trackedURL,defaultDesign,1000)));
  await act(async()=>renderer.root.findByProps({id:'qr-content'}).props.onChange({target:{value:'https://example.org/new'}}));
  assert.equal(renderer.root.findByProps({alt:'Generated Website QR code'}).props.src,preview.props.src);
  assert.equal(renderer.root.findAllByType('button').find(b=>b.children.includes('Download QR Code')).props.disabled,true);
  const update=renderer.root.findAllByType('button').find(b=>b.children.includes('Update destination'));await act(async()=>update.props.onClick());assert.deepEqual(changed,{id:'id',target:'https://example.org/new'});
  assert.equal(renderer.root.findAllByType('button').find(b=>b.children.includes('Download QR Code')).props.disabled,false);
  auth.getAuthClient=()=>({auth:{getSession:async()=>({data:{session:null}})}});saved=null;await act(async()=>renderer.root.findAllByType('button').find(b=>b.children.includes('Download QR Code')).props.onClick());assert.equal(saved,null);
  auth.getAuthClient=()=>({auth:{getSession:async()=>({data:{session:{access_token:'token'}}})}});saving.saveGeneratedCode=async()=>{throw new Error('Storage full');};await act(async()=>renderer.root.findAllByType('button').find(b=>b.children.includes('Download QR Code')).props.onClick());assert(JSON.stringify(renderer.toJSON()).includes('Downloaded, but automatic save failed: Storage full'));
  assert(!renderer.root.findAllByType('button').some(b=>b.children.includes('Save to My Codes')));
 }finally{if(renderer)await act(async()=>renderer.unmount());auth.authConfigured=oldConfigured;auth.getAuthClient=oldClient;exporter.downloadCode=oldExport;client.createTracking=oldCreate;client.changeTrackedLink=oldChange;saving.saveGeneratedCode=oldSave;}
});
