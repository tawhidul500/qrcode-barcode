const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const ts=require('typescript');
const Module=require('node:module');
const sharp=require('sharp');
const bwip=require('bwip-js');
const QRCode=require('qrcode');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'scanner-tests-'));
const root=path.resolve(__dirname,'..');
process.env.NODE_PATH=path.join(root,'node_modules');Module._initPaths();
for(const name of ['scanner-utils','scanner-decoder']){
 const text=fs.readFileSync(path.join(root,'app/lib',name+'.ts'),'utf8');
 fs.writeFileSync(path.join(scratch,name+'.js'),ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText);
}
const {decodePixels}=require(path.join(scratch,'scanner-decoder.js'));
require('zxing-wasm/reader').prepareZXingModule({overrides:{wasmBinary:new Uint8Array(fs.readFileSync(path.join(root,'public/assets/scanner/zxing_reader.wasm'))).buffer}});
const {safeScanURL,imageFileError,scanMode}=require(path.join(scratch,'scanner-utils.js'));
async function decode(image,mode='auto',rotation=0){
 const {data,info}=await sharp(image).rotate(rotation).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 return decodePixels(new Uint8ClampedArray(data),info.width,info.height,mode);
}
(async()=>{
 let checked=0;
 const payloads=['https://example.com/scanner?hello=world','WIFI:T:WPA;S:Office;P:secret;;','A plain text scan with <tags> & symbols'];
 for(const text of payloads){const png=await QRCode.toBuffer(text,{width:400,margin:4,errorCorrectionLevel:'H'});for(const mode of ['auto','qr']){assert.equal((await decode(png,mode)).text,text);checked++;}assert.equal(await decode(png,'barcode'),null);}
 const formats=[['code128','SCAN-12345'],['code39','CODE123'],['code93','CODE123'],['ean13','1234567890128'],['ean8','12345670'],['upca','012345678905'],['upce','01234565'],['interleaved2of5','1234567890'],['rationalizedCodabar','A123456A'],['datamatrix','Scan data matrix'],['pdf417','Scan PDF417'],['azteccode','Scan Aztec']];
 for(const [bcid,text] of formats){
  const png=await bwip.toBuffer({bcid,text,includecheck:bcid==='code93',scale:3,height:25,includetext:false,padding:20,backgroundcolor:'ffffff'});
  for(const mode of ['auto','barcode']){const value=await decode(png,mode);assert(value,`${bcid} (${mode}) was not decoded`);const expected=bcid==='upca'?'0'+text:bcid==='upce'?'0012345000065':text;assert.equal(value.text,expected,bcid);checked++;}
  assert.equal(await decode(png,'qr'),null,bcid+' should be filtered in QR mode');
 }
 const invalidCode93=await bwip.toBuffer({bcid:'code93',text:'CODE123',scale:3,height:25,padding:20,backgroundcolor:'ffffff'});assert.equal(await decode(invalidCode93),null,'Reject Code 93 without required checksums');
 const bars=await bwip.toBuffer({bcid:'code128',text:'ROTATED123',scale:3,height:25,padding:20,backgroundcolor:'ffffff'});
 assert.equal((await decode(bars,'auto',90)).text,'ROTATED123');checked++;
 const qr=await QRCode.toBuffer('INVERTED',{width:300,margin:4});const negative=await sharp(qr).negate({alpha:false}).png().toBuffer();assert.equal((await decode(negative,'auto')).text,'INVERTED');checked++;
 const blank=await sharp({create:{width:300,height:300,channels:4,background:'white'}}).png().toBuffer();assert.equal(await decode(blank),null);
 for(const url of ['javascript:alert(1)','data:text/html,<script>alert(1)</script>','file:///tmp/a','https://user:pass@example.com','hello','//example.com'])assert.equal(safeScanURL(url),null);
 assert.equal(safeScanURL('https://example.com/path'),'https://example.com/path');assert.equal(scanMode('wrong'),'auto');assert.equal(scanMode('barcode'),'barcode');
 assert.equal(imageFileError({type:'image/png',name:'test.png',size:100}),null);
 assert(imageFileError({type:'image/svg+xml',name:'test.svg',size:100}));assert(imageFileError({type:'image/png',name:'big.png',size:11*1024*1024}));assert(imageFileError({type:'image/png',name:'empty.png',size:0}));
 console.log(`PASS: ${checked} decode cases, scan-mode isolation, inverted/rotated codes, blank image, safe URL actions and upload validation.`);
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>fs.rmSync(scratch,{recursive:true,force:true}));
