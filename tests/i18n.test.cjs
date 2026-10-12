const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
// Compile the actual application modules; no browser or test-only translations.
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>{
 const source=fs.readFileSync(filename,'utf8');
 module._compile(ts.transpileModule(source,{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
};
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {locales,readLocale,saveLocale,validLocale,languageStorageKey}=require('../app/lib/i18n/locales.ts');
const {translate,normalize}=require('../app/lib/i18n/translate.ts');
const {localizeTree}=require('../app/lib/i18n/localize-tree.tsx');
const {LanguageProvider}=require('../app/components/i18n/LanguageProvider.tsx');
const messages=require('../app/lib/i18n/messages.json');
const h=React.createElement;
const escapeHTML=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
assert.equal(locales.length,10);
assert.equal(new Set(locales.map(x=>x.code)).size,10);
assert.equal(locales.find(x=>x.code==='ar').dir,'rtl');
assert(locales.filter(x=>x.code!=='ar').every(x=>x.dir==='ltr'));
for(const locale of locales)assert(validLocale(locale.code));
for(const bad of [null,'','de','es-mx','__proto__',{},4])assert.equal(validLocale(bad),false);

const canonical=Object.keys(messages.es).sort();
for(const [locale,dictionary]of Object.entries(messages)){
 assert.deepEqual(Object.keys(dictionary).sort(),canonical,locale+' missing translation keys');
 for(const [key,value]of Object.entries(dictionary)){
  assert(value.trim(),locale+': '+key);
  assert.equal((value.match(/\{value\}/g)||[]).length,(key.match(/\{value\}/g)||[]).length,locale+' interpolation '+key);
 }
}
// Storage persistence, invalid preferences, blocked storage and return to English.
const saved=new Map(),storage={getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)};
for(const {code}of locales){saveLocale(storage,code);assert.equal(readLocale(storage),code);}
saved.set(languageStorageKey,'invalid');assert.equal(readLocale(storage),'en');
const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
assert.equal(readLocale(blocked),'en');assert.doesNotThrow(()=>saveLocale(blocked,'ar'));
assert.notEqual(translate('Upload Image','es'),translate('Upload Image','es-MX'));

const samples=['Home','Language','Sign In','QR Code Generator','Barcode Generator','QR & Barcode Types','Enter Content','Download Barcode','Upload Image','Password','Scanning…','This page could not be found.','Create & Customize Your Barcode','Invalid barcode content.'];
let cases=0;
for(const {code}of locales){
 for(const text of samples){const result=translate(text,code);if(code==='en')assert.equal(result,text);else assert.notEqual(result,text,code+': '+text);cases++;}
 for(const literal of ['1234567890','https://example.com','Code128','PNG','#ff0000','Home is my scanned value'])assert.equal(translate(literal,code),literal);
 if(code!=='en'){
  assert(translate('Enter Data E.G. 1234567890',code).includes('1234567890'));
  assert.notEqual(translate('Choose Website QR code',code),'Choose Website QR code');
  assert.notEqual(translate('No QR code or barcode found. Try a sharper image, crop closer to the code, or choose another scan mode.',code),'No QR code or barcode found. Try a sharper image, crop closer to the code, or choose another scan mode.');
  assert(translate('foreground gradient #000000 to #ffffff',code).includes('#ffffff'));
 }
 const onChange=()=>{},onClick=()=>{},ref={current:null};
 const source=h('section',{key:'stable'},[
  h('input',{key:'input',value:'Home',placeholder:'Enter your text',onChange,ref}),
  h('textarea',{key:'textarea',defaultValue:'Home',onChange}),
  h('select',{key:'select',defaultValue:'No password'},h('option',null,'No password')),
  h('a',{key:'link',href:'/scanner?mode=barcode',onClick,'aria-label':'Upload Image'},'Home'),
  h('pre',{key:'result'},'Home'),
  h('code',{key:'code'},'#ff0000'),
  h('span',{key:'user',translate:'no'},'Home'),
  h('span',{key:'protected','data-no-translate':true},'Home')
 ]);
 const out=localizeTree(source,code),[input,textarea,select,link,pre,hex,user,protectedNode]=out.props.children;
 assert.equal(out.key,source.key);
 assert.equal(input.props.value,'Home');assert.equal(input.props.onChange,onChange);assert.equal(input.props.ref,ref);
 assert.equal(input.props.placeholder,translate('Enter your text',code));
 assert.equal(textarea.props.defaultValue,'Home');
 assert.equal(select.props.defaultValue,'No password');
 assert.equal(select.props.children.props.value,'No password');
 assert.equal(select.props.children.props.children,translate('No password',code));
 assert.equal(link.props.href,'/scanner?mode=barcode');assert.equal(link.props.onClick,onClick);
 assert.equal(link.props.children,translate('Home',code));
 for(const node of [pre,user,protectedNode])assert.equal(node.props.children,'Home');
 assert.equal(hex.props.children,'#ff0000');
 const rendered=renderToStaticMarkup(out);assert(rendered.includes('value="Home"'));assert(rendered.includes('<pre>Home</pre>'));
}

// Render every real route under each locale. This exercises all nested boundaries.
const routes=['page','qr-code-generator/page','barcode-generator/page','scanner/page','qr-barcode-types/page','blog/page','contact/page','faq/page','pricing/page','login/page','signup/page','not-found'];
let renderedPages=0;
for(const route of routes){
 const Page=require('../app/'+route+'.tsx').default;
 for(const {code}of locales){
  const html=renderToStaticMarkup(h(LanguageProvider,{initialLocale:code},h(Page)));
  assert(html.length>1000,code+' '+route+' empty page');
  assert(html.includes(escapeHTML(translate('Language',code))),code+' '+route+' missing language selector');
  if(!route.startsWith('login')&&!route.startsWith('signup'))assert(html.includes(escapeHTML(translate('QR & Barcode Types',code))),code+' '+route+' missing localized navigation');
  if(code!=='en')assert(!/>Home</.test(html),code+' '+route+' English navigation leaked');
  if(process.env.I18N_AUDIT_DIR){
   fs.mkdirSync(process.env.I18N_AUDIT_DIR,{recursive:true});
   fs.writeFileSync(path.join(process.env.I18N_AUDIT_DIR,code+'-'+route.replaceAll('/','-')+'.html'),html);
  }
  renderedPages++;
 }
}
console.log('PASS: '+locales.length+' languages, '+canonical.length+' complete translation keys per base locale, '+cases+' UI phrase checks, '+renderedPages+' localized route renders, storage persistence and form/result preservation.');

