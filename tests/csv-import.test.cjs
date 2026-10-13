const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,f);require.extensions['.css']=()=>{};
const {parseImportCSV,csvExample}=require('../app/lib/csv-import.ts');
test('CSV validates URLs, quoted fields, headers and limits',()=>{
 assert.equal(parseImportCSV(csvExample).length,2);
 const rows=parseImportCSV('\uFEFFname,url\r\n"A, B",https://example.com\r\n"Two\nlines",https://example.org\r\n');assert.equal(rows[0].name,'A, B');assert.equal(rows[1].name,'Two\nlines');assert.equal(rows[1].line,3);
 assert(parseImportCSV('name,url\nBad,javascript:alert(1)')[0].error);
 assert(parseImportCSV('name,url\nBad,https://example.com,extra')[0].error);
 assert.throws(()=>parseImportCSV('name,name,url\na,b,https://example.com'));
 assert.throws(()=>parseImportCSV('name,url\n"unclosed,https://example.com'));
 assert.throws(()=>parseImportCSV('name,url\n'+Array.from({length:51},(_,i)=>`Row ${i},https://example.com/${i}`).join('\n')));
 assert.equal(parseImportCSV('name,url\n'+Array.from({length:50},(_,i)=>`Row ${i},https://example.com/${i}`).join('\n')).length,50);
});
test('bulk import saves sequentially and retries the failed row without duplicating successes',async()=>{
 const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
 const cloud=require('../app/lib/cloud-codes.ts'),templates=require('../app/lib/category-template-presets.ts');const oldSave=cloud.createCloudCode,oldLoad=templates.loadCategoryTemplate;let calls=[],fail=true,reloads=0,renderer;const tracking=require('../app/lib/statistics-client.ts'),oldTracking=tracking.createTracking;let trackedCalls=0;tracking.createTracking=async()=>{trackedCalls++;return {id:'tracked-'+trackedCalls,url:'https://app.test/r/'+trackedCalls};};
 templates.loadCategoryTemplate=async()=>{};cloud.createCloudCode=async code=>{calls.push(code);if(code.name==='Second'&&fail)throw new Error('Temporary failure');return code;};
 try{await act(async()=>{renderer=create(React.createElement(require('../app/components/CSVImport.tsx').default,{codes:[],onReload:async()=>{reloads++;}}));});
  const input=renderer.root.findByProps({type:'file'});await act(async()=>input.props.onChange({target:{files:[{name:'links.csv',size:90,text:async()=> 'name,url\nFirst,https://example.com/one\nSecond,https://example.com/two'}],value:'links.csv'}}));
  await act(async()=>renderer.root.findAllByType('select').find(n=>n.props.value==='static').props.onChange({target:{value:'dynamic'}}));
  const button=()=>renderer.root.findAllByType('button').find(b=>b.children.includes('Generate QR Codes')||b.children.includes('Continue Import'));
  await act(async()=>button().props.onClick());assert.deepEqual(calls.map(c=>c.name),['First','Second']);assert.equal(reloads,1);assert.equal(trackedCalls,2);assert(JSON.stringify(renderer.toJSON()).includes('Temporary failure'));
  fail=false;await act(async()=>button().props.onClick());assert.deepEqual(calls.map(c=>c.name),['First','Second','Second']);assert.equal(calls[1].id,calls[2].id);assert.equal(trackedCalls,2);assert.equal(calls[1].trackingId,calls[2].trackingId);assert.equal(calls[0].editor.payload,'https://app.test/r/1');assert.equal(calls[0].editor.value,'https://example.com/one');assert(calls[0].image.startsWith('data:image/svg+xml'));assert.equal(button().props.disabled,true);
 }finally{if(renderer)await act(async()=>renderer.unmount());cloud.createCloudCode=oldSave;templates.loadCategoryTemplate=oldLoad;tracking.createTracking=oldTracking;}
});
