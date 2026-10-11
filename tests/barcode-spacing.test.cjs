const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const bwip = require('bwip-js');
const sharp = require('sharp');
const source = fs.readFileSync(path.join(__dirname, '../app/components/BarcodeGenerator.tsx'), 'utf8');
const entries = [...source.split(' as const;')[0].matchAll(/\['([^']+)','([^']+)','([^']+)'\]/g)].map(m => m.slice(1));
assert.equal(entries.length, 15);
const offset = source.match(/textyoffset:([^,]+),/)[1];
const getOffset = new Function('fontSize', `return ${offset}`);
(async () => {
 let checked = 0, textless = 0;
 for (const [name, bcid, text] of entries) for (const fontSize of [8, 12, 24]) for (const height of [10, 25, 60]) {
  const svg = bwip.toSVG({bcid, text, scale:3, height, includetext:true, textsize:fontSize, textyoffset:getOffset(fontSize), textcolor:'0000ff', barcolor:'ff0000', backgroundcolor:'ffffff', padding:12});
  const {data, info} = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let barBottom = -1, barTop = info.height; const textRows = new Set();
  for (let y=0; y<info.height; y++) for (let x=0; x<info.width; x++) {
   const i=(y*info.width+x)*4;
   if (data[i+3]<128) continue;
   if (data[i]>180 && data[i+1]<80 && data[i+2]<80) {barBottom=Math.max(barBottom,y);barTop=Math.min(barTop,y);}
   if (data[i+2]>180 && data[i]<80 && data[i+1]<80) textRows.add(y);
  }
  assert(barBottom>=0, `${name}: missing bars`);
  if(textRows.size) for (const y of textRows) assert(y<barTop-2 || y>barBottom+2, `${name}, font ${fontSize}, height ${height}: text overlaps bars at row ${y}`);
  else textless++;
  checked++;
 }
 console.log(`PASS: ${checked} barcode/font/height combinations; ${textless} matrix cases without native details text.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
