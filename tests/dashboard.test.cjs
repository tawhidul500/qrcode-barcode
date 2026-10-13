const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
require.extensions['.css']=()=>{};
const {addCode,readCodes,writeCodes}=require('../app/lib/saved-codes.ts');
const image='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="black"/></svg>');
function storage(){const data=new Map();return {data,getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};}
test('saved codes remain isolated by user, deduplicate and survive rename/archive',()=>{
 const local=storage();const code=addCode(local,'alice',{name:'Website QR',kind:'qr',type:'Website',image});assert.equal(readCodes(local,'bob').length,0);assert.equal(readCodes(local,'alice')[0].id,code.id);
 assert.equal(addCode(local,'alice',{name:'Website QR',kind:'qr',type:'Website',image}).id,code.id);assert.equal(readCodes(local,'alice').length,1);
 writeCodes(local,'alice',[{...code,name:'New name',archived:true}]);assert.equal(readCodes(local,'alice')[0].name,'New name');assert(readCodes(local,'alice')[0].archived);
 writeCodes(local,'alice',[]);assert.equal(readCodes(local,'alice').length,0);
});
test('corrupt records, unsafe image URLs, storage denial and capacity are handled',()=>{
 const local=storage();assert.deepEqual(readCodes({getItem:()=>'{broken'},'a'),[]);
 local.setItem('qr-barcode-codes-v1:a',JSON.stringify([{id:'bad',name:'bad',kind:'qr',type:'Text',image:'javascript:alert(1)',createdAt:new Date().toISOString(),archived:false}]));assert.deepEqual(readCodes(local,'a'),[]);
 assert.throws(()=>addCode({getItem:()=>null,setItem(){throw Error('full');}},'a',{name:'A',kind:'qr',type:'Text',image}),/Unable to save/);
 const existing=Array.from({length:50},(_,i)=>({id:String(i),name:'code',kind:'qr',type:'Text',image,archived:true,createdAt:new Date().toISOString()}));writeCodes(local,'a',existing);assert.throws(()=>addCode(local,'a',{name:'new',kind:'qr',type:'Text',image}),/50/);
});
test('dashboard shows real saved codes; search, archive, restore, profile and logout work',async()=>{
 const React=require('react');const {create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
 const auth=require('../app/lib/auth/client.ts');const original=auth.getAuthClient;const local=storage();const user={id:'alice',email:'alice@example.com',created_at:'2026-10-01T00:00:00Z',user_metadata:{full_name:'Alice'}};
 addCode(local,user.id,{name:'My website',kind:'qr',type:'Website',image});let redirected='';global.window={localStorage:local,location:{search:'',replace:value=>{redirected=value;}},confirm:()=>true,addEventListener(){},removeEventListener(){}};global.document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};let signedOut=false;
 auth.getAuthClient=()=>({auth:{mfa:{listFactors:async()=>({data:{totp:[]},error:null})},getUser:async()=>({data:{user},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>{signedOut=true;return {error:null};}}});
 const cloud=require('../app/lib/cloud-codes.ts');const originals={...cloud};let remote=readCodes(local,user.id);cloud.listCloudCodes=async()=>remote;cloud.updateCloudCodes=async(ids,change)=>{remote=remote.map(code=>ids.includes(code.id)?{...code,...change}:code);};cloud.deleteCloudCode=async(id)=>{remote=remote.filter(c=>c.id!==id);};
 const profiles=require('../app/lib/profile-client.ts');const originalProfile=profiles.profileRequest;profiles.profileRequest=async()=>({profile:null,storage:{bytes:0,count:1,maxBytes:256000000,maxCount:50}});
 const management=require('../app/lib/management-client.ts');const oldManagement=management.managementRequest;management.managementRequest=async()=>({folders:[],details:[]});
 const Page=require('../app/components/AccountPage.tsx').default;let renderer;const content=node=>!node?'':typeof node==='string'?node:Array.isArray(node)?node.map(content).join(''):content(node.children);
 const click=async label=>{const button=renderer.root.findAllByType('button').find(node=>content(node.toJSON?node.toJSON():{children:node.children.map(child=>typeof child==='string'?child:'')}).trim()===label);assert(button,'Missing '+label);await act(async()=>button.props.onClick());};
 try{
  await act(async()=>{renderer=create(React.createElement(Page));});assert(content(renderer.toJSON()).includes('My website'));assert(content(renderer.toJSON()).includes('Alice'));assert(!redirected);
  const search=renderer.root.findByProps({'aria-label':'Search your codes'});await act(async()=>search.props.onChange({target:{value:'missing'}}));assert(content(renderer.toJSON()).includes('No matching codes'));await act(async()=>search.props.onChange({target:{value:''}}));
  await click('Archive');assert(remote[0].archived);await click('Archived Codes');assert(content(renderer.toJSON()).includes('My website'));await click('Restore');assert(!remote[0].archived);
  await click('My Profile');assert(content(renderer.toJSON()).includes('alice@example.com'));await click('Sign out');assert(signedOut);assert.equal(redirected,'/login');
 }finally{if(renderer)await act(async()=>renderer.unmount());auth.getAuthClient=original;Object.assign(cloud,originals);profiles.profileRequest=originalProfile;management.managementRequest=oldManagement;}
});
