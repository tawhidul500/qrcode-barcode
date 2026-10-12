import {barcodeTemplatePresets} from './barcode-template-presets';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export function renderBarcodeTemplate(barcode:string,template:number,background:string,foreground:string,caption:string,matrix=false,headingSize=12){
 const preset=barcodeTemplatePresets[template]||barcodeTemplatePresets[0];
 const [x,y,w,h]=preset.slot;
 const nested=barcode.replace('<svg ',`<svg x="0" y="0" width="${preset.rotation?h:w}" height="${preset.rotation?w:h}" preserveAspectRatio="${matrix?'xMidYMid meet':'none'}" `);
 const transform=preset.rotation?`translate(${x+w} ${y}) rotate(90)`:`translate(${x} ${y})`;
 // The general style has no surrounding illustration. Trim the thumbnail's
 // extra canvas so the live code and its quiet zones fill the preview card.
 const art=template===0?preset.art.replace(/viewBox="[^"]+"/,`viewBox="${x-1} ${y-1} ${w+2} ${h+2}"`).replace(/width="[^"]+" height="[^"]+"/,`width="${w+2}" height="${h+2}"`):preset.art;
 let svg=art.replace('__DYNAMIC_BARCODE__',`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${background}"/><g transform="${transform}">${nested}</g>`);
 if(caption){const match=svg.match(/viewBox="([\d.-]+) ([\d.-]+) ([\d.]+) ([\d.]+)"/);if(match){const [,vx,vy,vw,vh]=match;const labelSize=headingSize*0.6;const extra=labelSize+8;svg=svg.replace(match[0],`viewBox="${vx} ${Number(vy)-extra} ${vw} ${Number(vh)+extra}"`).replace(/height="[\d.]+"/,`height="${Number(vh)+extra}"`).replace(/<\/svg>$/,`<rect x="${vx}" y="${Number(vy)-extra}" width="${vw}" height="${extra}" fill="${background}"/><text x="${Number(vx)+Number(vw)/2}" y="${Number(vy)-4}" font-family="Arial" font-size="${labelSize}" text-anchor="middle" fill="${foreground}">${escape(caption)}</text></svg>`);}}
 return svg;
}
