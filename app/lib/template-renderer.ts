import {renderEye} from './eye-renderer';
import {renderDot} from './dot-renderer';
import {renderLogo} from './logo-renderer';
import {backgroundImages} from './background-images';
import QRCode from 'qrcode';
import {templatePresets} from './template-presets';
import {categoryTemplatePresets} from './category-template-presets';
import type {QRDesign} from './qr-design';
// Keep the supplied artwork; regenerate data and finder patterns above its clipping groups.
export function renderTemplateQR(payload:string,design:QRDesign,width:number):string {
 const preset=categoryTemplatePresets[design.templateIndex||0]||templatePresets[design.templateIndex||0];
 if(!preset)throw new Error('Unknown template');
 const matrix=QRCode.create(payload,{errorCorrectionLevel:'H'}),n=matrix.modules.size;
 const [slotLeft,slotTop,slotSide]=preset.bounds,unit=slotSide/(n+8),left=slotLeft+4*unit,top=slotTop+4*unit,side=n*unit;
 const fg=design.foregroundGradient?'url(#custom-fg)':design.foreground;
 const fill=fg;
 const eyeColor=/^#[\da-f]{6}$/i.test(design.eyeColor)?design.eyeColor:'#000000';
 const eyePaint=design.eyeColorEdited?eyeColor:design.foregroundEdited?fg:design.eyeColor;
 const bgPaint=design.backgroundGradient?'url(#custom-bg)':design.background;
 const pieces:string[]=[`<rect x="${slotLeft}" y="${slotTop}" width="${slotSide}" height="${slotSide}" fill="${bgPaint}"/>`];
 const finder=(r:number,c:number)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
 for(let r=0;r<n;r++)for(let c=0;c<n;c++) {
  if(!matrix.modules.get(r,c)||finder(r,c))continue;
  const x=left+c*unit,y=top+r*unit;
  if(matrix.modules.isReserved(r,c))pieces.push(`<rect x="${x}" y="${y}" width="${unit}" height="${unit}" fill="${fill}"/>`);
  else pieces.push(renderDot(design.dots,x,y,unit,fill,r,c,(rr,cc)=>rr>=0&&cc>=0&&rr<n&&cc<n&&Boolean(matrix.modules.get(rr,cc))&&!finder(rr,cc)));

 }
 for(const [r,c] of [[0,0],[0,n-7],[n-7,0]]){
  const x=left+c*unit,y=top+r*unit;
  pieces.push(`<rect x="${x-unit}" y="${y-unit}" width="${9*unit}" height="${9*unit}" fill="${bgPaint}"/>`);
  pieces.push(renderEye(design.eyes,x,y,unit,eyePaint,bgPaint));
 }

 if(design.backgroundImage)pieces.splice(1,0,`<image href="${backgroundImages[design.backgroundImage]||''}" x="${left}" y="${top}" width="${side}" height="${side}" opacity="0.12"/>`);
 let svg=preset.art.replace('__DYNAMIC_QR__','').replace(/<\/svg>\s*$/,pieces.join('')+'</svg>');
 svg=svg.replace(/<svg([^>]*)>/,`<svg$1><defs><linearGradient id="custom-fg" x2="0" y2="1"><stop stop-color="${design.foreground}"/><stop offset="1" stop-color="${design.foregroundGradient||design.foreground}"/></linearGradient><linearGradient id="custom-bg" x2="0" y2="1"><stop stop-color="${design.background}"/><stop offset="1" stop-color="${design.backgroundGradient||design.background}"/></linearGradient></defs>`);
 svg=svg.replace(/<\/svg>\s*$/,renderLogo(design,left,top,side)+'</svg>');
 if(design.caption.trim()) {
  const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
  const view=svg.match(/viewBox="([^"]+)"/);
  if(view){const [vx,vy,vw,vh]=view[1].split(/\s+/).map(Number),font=design.fontSize*vw/360,extra=font+vw*.06;
   svg=svg.replace(view[0],`viewBox="${vx} ${vy} ${vw} ${vh+extra}"`).replace(/<\/svg>\s*$/,`<text x="${vx+vw/2}" y="${vy+vh+font}" text-anchor="middle" font-family="${escape(design.fontFamily)}" font-size="${font}" font-weight="600" fill="${escape(design.captionColor)}">${escape(design.caption.slice(0,40))}</text></svg>`);
  }
 }
 return svg.replace(/(<svg[^>]*?)width="[^"]+" height="[^"]+"/,`$1width="${width}" height="${Math.round(width*(design.caption.trim()?1+(design.fontSize+21.6)/360:1))}"`);
}
