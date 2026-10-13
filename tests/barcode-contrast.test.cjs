const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
const {barcodeContrastRatio:ratio,minimumBarcodeContrast:minimum}=require('../app/lib/barcode-contrast.ts');
test('solid colors reject identical and low contrast paints while preserving readable colors',()=>{
 assert.equal(ratio('#000000','#ffffff'),21);
 assert.equal(ratio('#ffffff','#ffffff'),1);
 assert.equal(ratio('#123456','#123456'),1);
 assert.ok(ratio('#eeeeee','#ffffff')<minimum);
 assert.ok(ratio('#111111','#ffffff')>=minimum);
 assert.ok(ratio('#073477','#ffffff')>=minimum);
 assert.equal(ratio('bad','#ffffff'),1);
});
test('checks both gradients, overlapping ranges and interior luminance minima',()=>{
 assert.ok(ratio('#000000','#ffffff',['#000000','#eeeeee'])<minimum);
 assert.ok(ratio('#000000','#ffffff',null,['#ffffff','#111111'])<minimum);
 assert.equal(ratio('#000000','#ffffff',['#000000','#ffffff'],['#ffffff','#000000']),1);
 assert.ok(ratio('#000000','#ffffff',['#000000','#222222'],['#eeeeee','#ffffff'])>=minimum);
 // Each foreground endpoint passes, but a darker interior color does not.
 assert.ok(ratio('#ff0000','#333333')>=minimum);
 assert.ok(ratio('#00ff00','#333333')>=minimum);
 assert.ok(ratio('#ff0000','#333333',['#ff0000','#00ff00'])<minimum);
 assert.equal(ratio('#000000','#ffffff',['#000000']),1);
 // Active gradient stops take precedence over inactive solid swatch values.
 assert.equal(ratio('#ffffff','#ffffff',['#000000','#000000']),21);
});
test('generator blocks PNG/SVG download handlers and recovers immediately after fixing colors',async()=>{
 const React=require('react');
 const {create,act}=require('react-test-renderer');
 const Generator=require('../app/components/BarcodeGenerator.tsx').default;
 const Colors=require('../app/components/BarcodeColorControls.tsx').default;
 global.IS_REACT_ACT_ENVIRONMENT=true;
 const savedDocument=Object.getOwnPropertyDescriptor(global,'document');
 const savedImage=Object.getOwnPropertyDescriptor(global,'Image');
 let exportAttempts=0,view;
 Object.defineProperty(global,'document',{configurable:true,value:{createElement(){exportAttempts++;throw new Error('Export should be blocked');}}});
 Object.defineProperty(global,'Image',{configurable:true,value:class{constructor(){exportAttempts++;throw new Error('Export should be blocked');}}});
 try{
  await act(async()=>{view=create(React.createElement(Generator));});
  await act(async()=>view.root.findByProps({id:'barcode-content'}).props.onChange({target:{value:'USER123'}}));
  await act(async()=>view.root.findByProps({'aria-controls':'barcode-design-Color'}).props.onClick());
  const download=()=>view.root.findByProps({className:'qr-download'});
  const colors=()=>view.root.findByType(Colors);
  const blocked=async()=>{
   assert.equal(download().props.disabled,true);
   assert.equal(download().props['aria-describedby'],'barcode-contrast-warning');
   assert.equal(view.root.findByProps({id:'barcode-contrast-warning'}).props.role,'status');
   for(const format of ['PNG','SVG']){
    await act(async()=>view.root.findAllByType('select')[0].props.onChange({target:{value:format}}));
    await act(async()=>download().props.onClick());
   }
   assert.equal(exportAttempts,0);
  };
  assert.equal(download().props.disabled,false);
  await act(async()=>colors().props.onForeground({color:'#ffffff',gradient:null}));
  await blocked();
  assert.equal(view.root.findByProps({'aria-label':'Copy barcode content'}).props.disabled,false);
  await act(async()=>colors().props.onForeground({color:'#000000',gradient:['#000000','#ffffff']}));
  await blocked();
  await act(async()=>colors().props.onForeground({color:'#000000',gradient:null}));
  await act(async()=>colors().props.onBackground({color:'#ffffff',gradient:['#ffffff','#000000']}));
  await blocked();
  await act(async()=>colors().props.onBackground({color:'#ffffff',gradient:null}));
  assert.equal(download().props.disabled,false);
  assert.equal(view.root.findAllByProps({id:'barcode-contrast-warning'}).length,0);
 }finally{
  if(view)await act(async()=>view.unmount());
  for(const [name,descriptor] of [['document',savedDocument],['Image',savedImage]]){
   if(descriptor)Object.defineProperty(global,name,descriptor);else delete global[name];
  }
 }
});
