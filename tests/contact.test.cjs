const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>{
 module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
};
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {validateContact,deliverContact}=require('../app/lib/contact.ts');
const {locales}=require('../app/lib/i18n/locales.ts');
const {translate}=require('../app/lib/i18n/translate.ts');
const {LanguageProvider}=require('../app/components/i18n/LanguageProvider.tsx');
const ContactPage=require('../app/contact/page.tsx').default;
const h=React.createElement;
const values={name:'  Ayesha Rahman  ',email:'  ayesha+qr@example.com  ',message:'  QR scan question\nPlease help with my label.  '};
assert.deepEqual(validateContact(values),{});
assert.deepEqual(validateContact({name:'علي',email:'ali@example.com',message:'مرحبا'}),{});
assert.equal(Object.keys(validateContact({name:' \t ',email:'invalid',message:'\n'})).length,3);
assert(validateContact({...values,name:'a'.repeat(121)}).name);
assert(validateContact({...values,email:'a'.repeat(255)+'@example.com'}).email);
assert(validateContact({...values,message:'a'.repeat(5001)}).message);
assert.deepEqual(validateContact({...values,name:'a'.repeat(120),message:'a'.repeat(5000)}),{});
for(const email of ['a@','@example.com','a b@example.com','a@b','a@example..com\nInjected'])assert(validateContact({...values,email}).email);

// Mock all delivery: verification never sends a real message or contacts a service.
(async()=>{
 const originalFetch=global.fetch;let calls=0;
 try{
  global.fetch=async()=>{calls++;throw Error('unexpected request');};
  assert.equal(await deliverContact(values,undefined),'unavailable');
  assert.equal(await deliverContact(values,' '),'unavailable');
  assert.equal(calls,0,'Unconfigured contact must not send data');
  assert.equal(await deliverContact({...values,email:''},'/api/contact'),'unconfirmed');
  assert.equal(calls,0,'Invalid submissions must not send data');
  const controller=new AbortController();
  global.fetch=async(url,options)=>{
   calls++;assert.equal(url,'/api/contact');assert.equal(options.method,'POST');
   assert.equal(options.credentials,'omit');assert.equal(options.signal,controller.signal);
   assert.deepEqual(JSON.parse(options.body),{name:'Ayesha Rahman',email:'ayesha+qr@example.com',message:'QR scan question\nPlease help with my label.'});
   return {ok:true,json:async()=>({accepted:true})};
  };
  assert.equal(await deliverContact(values,'/api/contact',controller.signal),'accepted');
  assert.equal(calls,1);
  assert.equal(values.name,'  Ayesha Rahman  ','Input data must not be mutated');
  for(const response of [
   {ok:false,json:async()=>({accepted:true})},
   {ok:true,json:async()=>({accepted:false})},
   {ok:true,json:async()=>({accepted:'true'})},
   {ok:true,json:async()=>({success:true})},
   {ok:true,json:async()=>null},
   {ok:true,json:async()=>{throw Error('Static host returned HTML');}}
  ]){global.fetch=async()=>response;assert.equal(await deliverContact(values,'/api/contact'),'unconfirmed');}
  global.fetch=async()=>{throw Error('Network unavailable');};
  assert.equal(await deliverContact(values,'/api/contact'),'unconfirmed');
 }finally{global.fetch=originalFetch;}
 for(const {code} of locales){
  const html=renderToStaticMarkup(h(LanguageProvider,{initialLocale:code},h(ContactPage)));
  assert(html.includes('href="/contact" aria-current="page"'));
  assert(/<form[^>]*class="contact-form"[^>]*method="post"/.test(html));
  assert.equal((html.match(/<h1 /g)||[]).length,1);
  for(const field of ['name','email','message']){
   assert(html.includes('id="contact-'+field+'"'));
   assert(html.includes('for="contact-'+field+'"'));
   assert(html.includes('name="'+field+'"'));
  }
  assert(html.includes('role="status" aria-live="polite"'));
  for(const phrase of ['Contact Us For Personalized Support','Your Name','Your Email','Your Message','Send Message','Message delivery is not available yet.','Please enter your name.','Name must be 120 characters or fewer.','Please enter a valid email address.','Please enter your message.','Message must be 5000 characters or fewer.','We could not confirm delivery. Your message is still here; please try again.']){
   if(code!=='en')assert.notEqual(translate(phrase,code),phrase,code+': '+phrase);
  }
 }
 console.log('PASS: contact validation, no unconfigured or invalid network requests, explicit acceptance contract, network/HTML failures, payload preservation and 10 localized contact renders.');
})().catch(error=>{console.error(error);process.exitCode=1;});
