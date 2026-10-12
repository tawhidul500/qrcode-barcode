const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>{
 module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
};
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {blogArticles,blogPageSize,blogPageCount,resolveBlogPage,articlesForPage,blogPageHref}=require('../app/lib/blog.ts');
const {locales}=require('../app/lib/i18n/locales.ts');
const {translate}=require('../app/lib/i18n/translate.ts');
const {LanguageProvider}=require('../app/components/i18n/LanguageProvider.tsx');
const BlogIndex=require('../app/components/BlogIndex.tsx').default;
const h=React.createElement;
assert.equal(new Set(blogArticles.map(article=>article.id)).size,blogArticles.length);
assert.equal(new Set(blogArticles.map(article=>article.title)).size,blogArticles.length);
for(const value of [null,'','0','-2','2.5','abc','Infinity','1e2','9999999999999999999999'])assert.equal(resolveBlogPage(value),1);
assert.equal(resolveBlogPage('999'),blogPageCount);
assert.equal(resolveBlogPage('2'),2);
const ids=[];
for(let page=1;page<=blogPageCount;page++){
 const articles=articlesForPage(page);
 assert(articles.length>0&&articles.length<=blogPageSize);
 ids.push(...articles.map(article=>article.id));
 const url=new URL(blogPageHref(page),'https://example.test');
 assert.equal(resolveBlogPage(url.searchParams.get('page')),page);
 assert.equal(url.hash,'#blog-articles');
 for(const locale of locales){
  const html=renderToStaticMarkup(h(LanguageProvider,{initialLocale:locale.code},h(BlogIndex,{initialPage:page})));
  assert.equal((html.match(/<article /g)||[]).length,articles.length);
  assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
  assert.equal(html.includes('rel="prev"'),page>1);
  assert.equal(html.includes('rel="next"'),page<blogPageCount);
  for(const article of articles)assert(html.includes('id="article-'+article.id+'"'));
  if(locale.code!=='en'){
   for(const article of articles){
    assert.notEqual(translate(article.title,locale.code),article.title,locale.code+' title: '+article.id);
    assert.notEqual(translate(article.description,locale.code),article.description,locale.code+' summary: '+article.id);
   }
   for(const text of ['QR code articles','Blog articles','Blog pagination','Article page '+page,'Previous article page','Next article page'])assert.notEqual(translate(text,locale.code),text);
  }
 }
}
assert.deepEqual(ids,blogArticles.map(article=>article.id),'Every article appears once across pagination');
for(const article of blogArticles)assert(fs.existsSync('public/assets/blog-page/'+article.image+'.webp'));
console.log('PASS: '+blogArticles.length+' unique previews, URL boundaries, complete pagination, real assets and both pages rendered in all '+locales.length+' languages.');
