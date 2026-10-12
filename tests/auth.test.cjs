const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
const {createClient}=require('@supabase/supabase-js');
const {safeNext,callbackURL,passwordError,authError,submitCredentials,startSocial,requestReset,exchangeCallback}=require('../app/lib/auth/flows.ts');
const storage=new Map();
const requests=[];
const user={id:'00000000-0000-0000-0000-000000000001',aud:'authenticated',role:'authenticated',email:'reader@example.com',app_metadata:{provider:'email'},user_metadata:{full_name:'Reader'},created_at:new Date().toISOString()};
const session={access_token:'test-access-token',refresh_token:'test-refresh-token',expires_in:3600,token_type:'bearer',user};
let mode='ok';
const client=createClient('https://auth.example.test','public-test-key',{auth:{flowType:'pkce',detectSessionInUrl:false,persistSession:true,autoRefreshToken:false,storage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}},global:{fetch:async(url,options)=>{
 const path=new URL(url),body=options?.body?JSON.parse(options.body):null;
 requests.push({url:path,body,method:options?.method,headers:options?.headers});
 if(mode==='reject')return new Response(JSON.stringify({code:'invalid_credentials',msg:'Invalid login credentials'}),{status:400,headers:{'Content-Type':'application/json'}});
 let response={};
 if(path.pathname.endsWith('/signup'))response={user,session:null};
 if(path.pathname.endsWith('/token'))response=session;
 if(path.pathname.endsWith('/user'))response=user;
 if(path.pathname.endsWith('/logout'))return new Response(null,{status:204});
 return new Response(JSON.stringify(response),{status:200,headers:{'Content-Type':'application/json'}});
}}});
(async()=>{
 for(const value of [null,'https://evil.test','//evil.test','/\\evil.test','/auth/callback','/reset-password','javascript:alert(1)','/account?next=evil'])assert.equal(safeNext(value),'/account');
 assert.equal(safeNext('/scanner'),'/scanner');
 assert.equal(callbackURL('https://app.test',true),'https://app.test/auth/callback?next=/reset-password');
 assert(passwordError('short','short'));assert(passwordError('long enough password','different'));assert(passwordError('x'.repeat(129),'x'.repeat(129)));assert.equal(passwordError('long enough password','long enough password'),null);
 assert.equal(authError({code:'invalid_credentials'}),'The email or password is incorrect.');
 assert(!authError({message:'secret provider details'}).includes('secret'));
 let result=await submitCredentials(client,{email:' reader@example.com ',password:'long enough password',name:' Reader ',signup:true},'https://app.test');
 assert.equal(result.error,null);assert.equal(result.data.session,null);
 const signup=requests.at(-1);assert.equal(signup.body.email,'reader@example.com');assert.equal(signup.body.data.full_name,'Reader');assert.equal(signup.url.searchParams.get('redirect_to'),'https://app.test/auth/callback');assert.equal(signup.body.code_challenge_method,'s256');assert(signup.body.code_challenge);
 mode='reject';result=await submitCredentials(client,{email:'reader@example.com',password:'wrong password',name:'',signup:false},'https://app.test');assert(result.error);assert.equal(result.data.session,null);
 mode='ok';result=await submitCredentials(client,{email:'reader@example.com',password:'long enough password',name:'',signup:false},'https://app.test');assert.equal(result.error,null);assert(result.data.session);assert.equal(requests.at(-1).url.searchParams.get('grant_type'),'password');
 assert((await client.auth.getSession()).data.session);
 assert.equal((await client.auth.getUser()).data.user.email,user.email);
 await requestReset(client,' reader@example.com ','https://app.test');
 const recovery=requests.at(-1);assert.equal(recovery.body.email,user.email);assert.equal(recovery.url.searchParams.get('redirect_to'),'https://app.test/auth/callback?next=/reset-password');assert.equal(recovery.body.code_challenge_method,'s256');
 for(const provider of ['google','facebook','apple']){
  const {data,error}=await startSocial(client,provider,'https://app.test');assert.equal(error,null);
  const url=new URL(data.url);assert.equal(url.searchParams.get('provider'),provider);assert.equal(url.searchParams.get('redirect_to'),'https://app.test/auth/callback');assert.equal(url.searchParams.get('code_challenge_method'),'s256');assert(url.searchParams.get('code_challenge'));
 }
 const first=exchangeCallback(client,'test-once-code');const second=exchangeCallback(client,'test-once-code');assert.equal(first,second);assert.equal((await first).error,null);assert.equal(requests.filter(r=>r.body?.auth_code==='test-once-code').length,1);
 assert.equal((await client.auth.updateUser({password:'replacement password'})).error,null);assert(requests.some(r=>r.method==='PUT'&&r.body?.password==='replacement password'));
 await client.auth.signOut({scope:'global'});assert.equal((await client.auth.getSession()).data.session,null);
 assert(!JSON.stringify([...storage]).includes('replacement password'));assert(!JSON.stringify([...storage]).includes('long enough password'));
 console.log('PASS: actual Supabase SDK with mocked HTTP: signup/confirmation, failed and successful login, stored session, verified user, recovery redirect, all OAuth providers with PKCE, single-use callback, password update, logout, redirect allowlist and password validation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
