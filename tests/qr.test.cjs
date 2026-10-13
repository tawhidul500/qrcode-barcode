const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>{
 module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
};
const {buildPayload,emptyContact}=require('../app/lib/qr-content.ts');
const {renderQR,defaultDesign}=require('../app/lib/qr-design.ts');
const wifi={ssid:'',password:'',security:'WPA'};
test('blank content cannot generate sample codes',()=>{
 for(const type of ['Website','Text','Phone','Email','Wi-Fi','Contacts'])assert.throws(()=>buildPayload(type,'',wifi,emptyContact));
});
test('invalid destinations, email and phone numbers are rejected',()=>{
 for(const [type,value] of [['Website','javascript:alert(1)'],['Instagram','profile-name'],['Email','bad@'],['Phone','abc'],['WhatsApp','123']])assert.throws(()=>buildPayload(type,value,wifi,emptyContact));
});
test('phone and Wi-Fi payloads use normalized and escaped values',()=>{
 assert.equal(buildPayload('Phone','+880 1700-000000',wifi,emptyContact),'tel:+8801700000000');
 assert.equal(buildPayload('Wi-Fi','',{ssid:'Office;WiFi',password:'ignored',security:'nopass'},emptyContact),'WIFI:T:nopass;S:Office\\;WiFi;P:;;');
});
test('structured vCards escape content and validate optional fields',()=>{
 const card=buildPayload('Contacts','',wifi,{...emptyContact,name:'Alice; Smith',phone:'+8801700000000'});
 assert.ok(card.includes('FN:Alice\\; Smith\r\nTEL:+8801700000000'));
 assert.throws(()=>buildPayload('Vcard','',wifi,{...emptyContact,name:'Alice',email:'bad'}));
});
test('captions escape SVG markup and custom logos remain in templates',async()=>{
 const design={...defaultDesign,caption:'<script>&',foreground:'#123456',foregroundEdited:true,logo:'data:image/png;base64,AA=='};
 const svg=renderQR('https://example.com',design);
 assert.ok(svg.includes('&lt;script&gt;&amp;'));assert.ok(!svg.includes('<script>'));
 const templated=renderQR('https://example.com',{...design,templateIndex:1},1000);
 assert.ok(templated.includes('#123456'));assert.ok(templated.includes(design.logo));assert.ok(templated.includes('&lt;script&gt;'));
});

test('generator rejects blank inputs in the rendered UI for every content type',()=>{
 const React=require('react');
 const {renderToStaticMarkup}=require('react-dom/server');
 const Generator=require('../app/components/Generator.tsx').default;
 for(const type of ['Website','Text','Phone','Email','Wi-Fi','Contacts','Vcard']){
  const html=renderToStaticMarkup(React.createElement(Generator,{selectedType:type,onTypeChange:()=>{}}));
  assert.match(html,/disabled=""[^>]*>Download QR Code/);
  assert.match(html,/aria-label="Share QR content" disabled=""/);
  assert.match(html,/aria-label="Copy QR content" disabled=""/);
  assert.ok(!html.includes('alt="Generated '));
  if(['Contacts','Vcard'].includes(type))assert.ok(html.includes('Full name (required)'));
 }
});
test('protected Wi-Fi requires a password and all URL types reject unsafe schemes',()=>{
 assert.throws(()=>buildPayload('Wi-Fi','',{ssid:'Office',password:'',security:'WPA'},emptyContact));
 for(const type of ['Website','Facebook','Instagram','X','Spotify','Product','Location']){
  assert.throws(()=>buildPayload(type,'javascript:alert(1)',wifi,emptyContact));
  assert.equal(buildPayload(type,'https://example.com',wifi,emptyContact),'https://example.com/');
 }
});

test('eye palette changes only eye color and survives later foreground edits',()=>{
 const React=require('react');
 const Controls=require('../app/components/ColorControls.tsx').default;
 let design={...defaultDesign,eyes:'rounded',caption:'Keep me',foreground:'#073477'};
 function find(node,label){
  if(!React.isValidElement(node))return;
  if(node.props['aria-label']===label)return node;
  for(const child of React.Children.toArray(node.props.children)){const match=find(child,label);if(match)return match;}
 }
 function control(label){const result=find(Controls({design,onChange:next=>{design=next;}}),label);assert(result,label);return result;}
 const initial={...design};
 control('eye color #a600dc').props.onClick();
 assert.deepEqual(design,{...initial,eyeColor:'#a600dc',eyeColorEdited:true});
 control('foreground color #073477').props.onClick();
 assert.equal(design.eyeColor,'#a600dc');
 control('foreground gradient #ef008b to #3366ff').props.onClick();
 assert.equal(design.eyeColor,'#a600dc');
 control('Custom eye color').props.onChange({target:{value:'#223344'}});
 assert.equal(design.eyeColor,'#223344');
 assert.equal(design.eyes,'rounded');
 control('Reset eye color').props.onClick();
 assert.equal(design.eyeColorEdited,false);
 assert.equal(design.eyeColor,design.foreground);
});

test('independent eye color preserves shapes, foreground gradients and template artwork',async()=>{
 const {eyeStyles}=require('../app/lib/eye-renderer.ts');
 const {templateDesign}=require('../app/lib/qr-design.ts');
 const {templatePresets}=require('../app/lib/template-presets.ts');
 const {categoryTemplatePresets,loadCategoryTemplate}=require('../app/lib/category-template-presets.ts');
 const originalFetch=global.fetch;
 try{
  global.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../public',url),'utf8'))});
  for(let index=21;index<=120;index++)await loadCategoryTemplate(index);
 }finally{global.fetch=originalFetch;}
 const color='#123abc';
 const stripPaint=svg=>svg.replace(/\b(?:fill|stroke)="[^"]*"/g,'');
 for(const eyes of eyeStyles){
  const design={...defaultDesign,eyes,eyesEdited:true,foreground:'#073477',foregroundEdited:true,foregroundGradient:'#223344'};
  const before=renderQR('Eye color test',design),after=renderQR('Eye color test',{...design,eyeColor:color,eyeColorEdited:true});
  assert(after.includes(`fill="${color}"`));
  assert(after.includes('fill="url(#qr-fg)"'));
  assert.equal(stripPaint(after),stripPaint(before),eyes+' geometry changed');
 }
 for(const [index,preset] of Object.entries({...templatePresets,...categoryTemplatePresets})){
  const design=templateDesign(Number(index));
  const before=renderQR('Eye color test',design),after=renderQR('Eye color test',{...design,eyeColor:color,eyeColorEdited:true});
  assert.equal(stripPaint(after),stripPaint(before),'Template '+index+' geometry changed');
  const expected=[0,1,2].reduce((count,i)=>count+(preset.eyes[i]?(preset.eyes[i].match(/\b(?:fill|stroke)="(?!none"|transparent")[^"]*"/g)||[]).length:33),0);
  assert.equal((after.match(/(?:fill|stroke)="#123abc"/g)||[]).length,expected,'Template '+index+' recolored outside its eyes or missed an eye');
 }
});

test('QR codes with custom eyes remain scannable with independent foreground colors',async()=>{
 const sharp=require('sharp');
 const {readBarcodes,prepareZXingModule}=require('zxing-wasm/reader');
 const path=require('node:path');
 prepareZXingModule({overrides:{wasmBinary:new Uint8Array(fs.readFileSync(path.join(__dirname,'../public/assets/scanner/zxing_reader.wasm'))).buffer}});
 for(const eyes of ['square','rounded','circle']){
  const payload='https://example.com/eye-color';
  const svg=renderQR(payload,{...defaultDesign,eyes,eyeColor:'#073477',eyeColorEdited:true,foreground:'#301050',foregroundEdited:true},600);
  const {data,info}=await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const decoded=await readBarcodes({data:new Uint8ClampedArray(data),width:info.width,height:info.height,colorSpace:'srgb'},{formats:['QRCode'],tryHarder:true});
  assert(decoded.some(result=>result.isValid&&result.text===payload),eyes+' did not decode');
 }
});
