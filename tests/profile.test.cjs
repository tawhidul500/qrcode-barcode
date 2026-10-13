const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
require.extensions['.css']=()=>{};
const {emptyProfile,validateProfile}=require('../app/lib/profile.ts');const profile={...emptyProfile,firstName:'Alice',lastName:'Reader',phones:['+880 1700000000'],companyEmail:'hello@example.com',website:'https://example.com',notifications:{productUpdates:true,tips:false}};
test('profile validation handles optional fields and rejects unsafe or invalid inputs',()=>{
 assert.equal(validateProfile(profile).firstName,'Alice');
 for(const change of [{website:'javascript:alert(1)'},{companyEmail:'bad'},{dateOfBirth:'2026-02-30'},{dateOfBirth:'2999-01-01'},{timezone:'Bad/Zone'},{phones:['<script>']},{language:'unknown'},{notifications:{tips:true}}])assert.throws(()=>validateProfile({...profile,...change}));
 assert.equal(validateProfile({...profile,unknown:'ignored'}).unknown,undefined);
});
test('profile endpoint requires authentication and scopes reads/writes to verified owner',async()=>{
 const server=require('../app/lib/server/codes.ts'),route=require('../app/api/profile/route.ts');const oldAuth=server.authenticate,oldDb=server.database;
 assert.equal((await route.GET(new Request('https://app.test/api/profile'))).status,401);
 const calls=[];server.authenticate=async()=> 'verified-owner';server.database=()=>async(strings,...values)=>{calls.push({sql:strings.join('?'),values});return strings.join('').includes('AS count')?[{count:3,bytes:1024}]:[{profile}];};
 try{
  const result=await route.GET(new Request('https://app.test/api/profile'));assert.equal(result.status,200);const body=await result.json();assert.equal(body.storage.bytes,1024);assert.equal(body.profile.firstName,'Alice');
  const put=await route.PUT(new Request('https://app.test/api/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...profile,user_id:'attacker'})}));assert.equal(put.status,200);
  for(const call of calls)assert(call.values.includes('verified-owner'));assert(!calls.at(-1).values.some(v=>typeof v==='string'&&v.includes('attacker')));
 }finally{server.authenticate=oldAuth;server.database=oldDb;}
});
test('MFA routing distinguishes enrollment from elevated session',async()=>{
 const {needsMfa}=require('../app/lib/auth/flows.ts');
 for(const [currentLevel,nextLevel,expected] of [['aal1','aal1',false],['aal1','aal2',true],['aal2','aal2',false]])assert.equal(await needsMfa({auth:{mfa:{getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel,nextLevel},error:null})}}}),expected);
});
test('profile UI edits information, saves preferences and runs authenticator verification',async()=>{
 const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
 const auth=require('../app/lib/auth/client.ts'),api=require('../app/lib/profile-client.ts'),oldAuth=auth.getAuthClient,oldApi=api.profileRequest;
 const user={id:'alice',email:'alice@example.com',user_metadata:{full_name:'Alice Reader'}};let saved=null,verified='';
 api.profileRequest=async(method,value)=>{if(method==='PUT')saved=value;return {profile:value||profile,storage:{bytes:150000,count:3,maxCount:50,maxBytes:256000000}};};
 auth.getAuthClient=()=>({auth:{updateUser:async values=>({data:{user:{...user,user_metadata:values.data}},error:null}),mfa:{listFactors:async()=>({data:{totp:[],all:[]},error:null}),enroll:async()=>({data:{id:'factor',totp:{qr_code:'data:image/svg+xml,qr',secret:'test-secret'}},error:null}),challengeAndVerify:async({code})=>{verified=code;return {error:null};},unenroll:async()=>({error:null})}}});
 global.window={location:{origin:'https://app.test'}};let renderer;
 const text=node=>typeof node==='string'?node:node?.children?.map(text).join('')||'';
 async function click(label){const button=renderer.root.findAllByType('button').find(b=>b.children.map(text).join('')===label);assert(button,label);await act(async()=>button.props.onClick());}
 try{
  await act(async()=>{renderer=create(React.createElement(require('../app/components/ProfileSettings.tsx').default,{user,onUser(){}}));});
  assert.equal(renderer.root.findAllByType('progress')[0].props.value,150000/256000000*100);
  const first=renderer.root.findAllByType('input').find(i=>i.props.value==='Alice');await act(async()=>first.props.onChange({target:{value:'Alicia'}}));
  await act(async()=>renderer.root.findByType('form').props.onSubmit({preventDefault(){}}));assert.equal(saved.firstName,'Alicia');
  await click('Notifications');const boxes=renderer.root.findAllByProps({type:'checkbox'});await act(async()=>boxes[1].props.onChange({target:{checked:true}}));await act(async()=>renderer.root.findByType('form').props.onSubmit({preventDefault(){}}));assert.equal(saved.notifications.tips,true);
  await click('General Information');await click('Set up authenticator');const otp=renderer.root.findAllByType('input').find(i=>i.props.autoComplete==='one-time-code');await act(async()=>otp.props.onChange({target:{value:'123456'}}));await click('Verify and enable');assert.equal(verified,'123456');assert(JSON.stringify(renderer.toJSON()).includes('Activated'));
 }finally{if(renderer)await act(async()=>renderer.unmount());auth.getAuthClient=oldAuth;api.profileRequest=oldApi;}
});
test('server rejects an authenticated MFA account until its token has aal2',async()=>{
 const server=require('../app/lib/server/codes.ts'),oldFetch=global.fetch,oldUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,oldKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://auth.example.test';process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='test-key';
 const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',email:'reader@example.com',factors:[{id:'factor',status:'verified',factor_type:'totp'}]};
 global.fetch=async()=>Response.json(user);
 const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
 function request(aal){const token=[encode({alg:'HS256',typ:'JWT'}),encode({sub:user.id,aud:'authenticated',role:'authenticated',aal,exp:Math.floor(Date.now()/1000)+3600,iat:Math.floor(Date.now()/1000)}),'mock-signature'].join('.');return new Request('https://app.test/api/profile',{headers:{Authorization:'Bearer '+token}});}
 try{await assert.rejects(server.authenticate(request('aal1')),/two-step/);assert.equal(await server.authenticate(request('aal2')),user.id);}finally{global.fetch=oldFetch;if(oldUrl===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=oldKey;}
});
