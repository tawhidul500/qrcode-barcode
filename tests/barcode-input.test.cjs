const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
const React=require('react');
const {create,act}=require('react-test-renderer');
const BarcodeGenerator=require('../app/components/BarcodeGenerator.tsx').default;
const {barcodeTypes}=require('../app/lib/barcode-types.ts');
global.IS_REACT_ACT_ENVIRONMENT=true;

test('all formats require explicit content and clearing content immediately disables every action',async()=>{
 let view;
 await act(async()=>{view=create(React.createElement(BarcodeGenerator));});
 const input=()=>view.root.findByProps({id:'barcode-content'});
 const actions=()=>[
  view.root.findByProps({className:'qr-download'}),
  view.root.findByProps({'aria-label':'Copy barcode content'}),
  view.root.findByProps({'aria-label':'Share barcode content'})
 ];
 const previews=()=>view.root.findAll(node=>node.type==='img'&&String(node.props.alt).startsWith('Generated '));
 const empty=()=>{assert.equal(previews().length,0);for(const button of actions())assert.equal(button.props.disabled,true);};
 try{
  for(let index=0;index<barcodeTypes.length;index++){
   await act(async()=>{view.update(React.createElement(BarcodeGenerator,{selectedType:index}));});
   empty();
   assert.equal(input().props.value,'');
   assert.ok(input().props.placeholder.includes(barcodeTypes[index][2]));
   await act(async()=>{input().props.onChange({target:{value:' \t\n '}});});
   empty();
   await act(async()=>{input().props.onChange({target:{value:barcodeTypes[index][2]}});});
   assert.equal(previews().length,1,barcodeTypes[index][0]+' valid content should render');
   for(const button of actions())assert.equal(button.props.disabled,false);
   await act(async()=>{input().props.onChange({target:{value:''}});});
   empty();
   // Handlers must also guard against programmatic invocation of disabled actions.
   await act(async()=>{for(const button of actions())await button.props.onClick();});
   assert.equal(view.root.findAllByProps({className:'qr-feedback'}).length,0);
  }
  await act(async()=>{view.update(React.createElement(BarcodeGenerator,{selectedType:1}));});
  await act(async()=>{input().props.onChange({target:{value:'not-an-ean'}});});
  empty();assert.equal(input().props['aria-invalid'],true);
 }finally{await act(async()=>view.unmount());}
});

test('valid exports use entered content and switching format clears the old code',async()=>{
 const navigatorDescriptor=Object.getOwnPropertyDescriptor(global,'navigator');
 const documentDescriptor=Object.getOwnPropertyDescriptor(global,'document');
 const copied=[],shared=[],downloaded=[];
 Object.defineProperty(global,'navigator',{configurable:true,value:{clipboard:{writeText:async value=>copied.push(value)},share:async value=>shared.push(value)}});
 Object.defineProperty(global,'document',{configurable:true,value:{createElement:tag=>{assert.equal(tag,'a');const link={click(){downloaded.push({href:this.href,download:this.download});}};return link;}}});
 let view;
 try{
  await act(async()=>{view=create(React.createElement(BarcodeGenerator));});
  await act(async()=>view.root.findByProps({id:'barcode-content'}).props.onChange({target:{value:'  MY-OWN-123  '}}));
  await act(async()=>view.root.findByProps({'aria-label':'Copy barcode content'}).props.onClick());
  await act(async()=>view.root.findByProps({'aria-label':'Share barcode content'}).props.onClick());
  await act(async()=>view.root.findAllByType('select')[0].props.onChange({target:{value:'SVG'}}));
  await act(async()=>view.root.findByProps({className:'qr-download'}).props.onClick());
  assert.deepEqual(copied,['MY-OWN-123']);assert.equal(shared[0].text,'MY-OWN-123');
  assert.equal(downloaded.length,1);assert.equal(downloaded[0].download,'code128-barcode.svg');
  const preview=view.root.find(node=>node.type==='img'&&String(node.props.alt).startsWith('Generated '));
  assert.equal(downloaded[0].href,preview.props.src);
  await act(async()=>view.root.findAll(node=>node.type==='button'&&/^qr-type(?: selected)?$/.test(node.props.className||''))[1].props.onClick());
  assert.equal(view.root.findByProps({id:'barcode-content'}).props.value,'');
  assert.equal(view.root.findByProps({className:'qr-download'}).props.disabled,true);
 }finally{
  if(view)await act(async()=>view.unmount());
  for(const [name,descriptor] of [['navigator',navigatorDescriptor],['document',documentDescriptor]]){
   if(descriptor)Object.defineProperty(global,name,descriptor);else delete global[name];
  }
 }
});
