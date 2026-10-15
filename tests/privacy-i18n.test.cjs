const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
let stripTypes;
try{const ts=require('typescript');stripTypes=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;}
catch{stripTypes=require('node:module').stripTypeScriptTypes;}
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const messages=JSON.parse(read('app/lib/i18n/privacy-messages.json'));
// Exercise the actual translation function without installing application dependencies.
const source=read('app/lib/i18n/privacy-translate.ts')
 .replace(/^import .*;\n/gm,'').replace('export function','function');
const translatePrivacy=new Function('messages',stripTypes(source)+';return translatePrivacy;')(messages);
const component=read('app/components/PrivacyPolicyContent.tsx');
const texts=[...component.matchAll(/\bt\(("(?:[^"\\]|\\.)*")\)/g)].map(match=>JSON.parse(match[1]));
const localeSource=read('app/lib/i18n/locales.ts');
const locales=[...localeSource.matchAll(/code:'([^']+)'/g)].map(match=>match[1]);

test('every policy text is translated in every supported non-English locale',()=>{
 assert.ok(texts.length>=45);
 assert.deepEqual(Object.keys(messages).sort(),locales.filter(x=>x!=='en').sort());
 for(const locale of locales){
  for(const text of texts){
   if(locale==='en'){assert.equal(translatePrivacy(text,locale),text);continue;}
   if(!/[A-Za-z]/.test(text))continue; // Shared punctuation only.
   assert.ok(messages[locale][text.trim()]?.trim(),`${locale}: ${text}`);
   assert.notEqual(translatePrivacy(text,locale).trim(),text.trim());
  }
 }
});
test('language changes use current context and preserve whitespace around inline links',()=>{
 assert.match(component,/const \{locale\}=useLanguage\(\)/);
 assert.match(component,/translatePrivacy\(text,locale\)/);
 const title='Privacy Policy';
 for(const locale of [...locales,...locales.slice().reverse()]){
  const result=translatePrivacy(` ${title} `,locale);
  assert.equal(result,` ${locale==='en'?title:messages[locale][title]} `);
 }
 assert.equal(translatePrivacy('gcappexplore1@gmail.com','ar'),'gcappexplore1@gmail.com');
});
test('server metadata, email override, link targets and RTL-safe layout remain intact',()=>{
 const page=read('app/privacy-policy/page.tsx');
 assert.match(page,/export const metadata:Metadata=/);
 assert.match(page,/NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL \|\| 'gcappexplore1@gmail.com'/);
 assert.match(page,/<PrivacyPolicyContent contactEmail=\{contactEmail\} siteOrigin=\{siteURL\(\)\}\/>/);
 assert.ok(component.includes('href={siteOrigin}'));
 assert.ok(component.includes('{new URL(siteOrigin).host}'));
 assert.ok(!component.includes('qrcode-barcode-peach.vercel.app'));
 assert.equal((component.match(/href=\{`mailto:\$\{contactEmail\}`\}/g)||[]).length,3);
 for(const url of ['https://supabase.com/privacy','https://vercel.com/legal/privacy-policy','https://policies.google.com/privacy'])assert.ok(component.includes(`href="${url}"`));
 assert.equal((component.match(/<bdi dir="ltr" translate="no">/g)||[]).length,4);
 assert.match(read('app/privacy-policy/privacy-policy.css'),/padding-inline-start:24px/);
 assert.match(localeSource,/code:'ar'.*dir:'rtl'/);
 assert.match(read('app/components/i18n/LanguageProvider.tsx'),/document.documentElement.dir=/);
 assert.equal((component.match(/<section(?:>| )/g)||[]).length,11);
});
