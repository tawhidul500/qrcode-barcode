import {renderEye} from './eye-renderer';
import {renderDot} from './dot-renderer';
import {renderLogo} from './logo-renderer';
import {backgroundImages} from './background-images';
import {renderTemplateQR} from './template-renderer';
import {templatePresets} from './template-presets';
import {categoryTemplatePresets,hasCategoryTemplate} from './category-template-presets';
import {uploadedTemplateFiles,uploadedCategoryTemplates,uploadedTemplateColors} from './category-templates';
import QRCode from 'qrcode';
export type Shape='square'|'rounded'|'circle';
export type QRDesign={foreground:string;background:string;eyeColor:string;eyeColorEdited:boolean;dots:Shape|'tilted'|'connected'|'horizontal'|'diamond'|'star'|'cross';dotsEdited:boolean;eyes:string;eyesEdited:boolean;caption:string;captionColor:string;fontSize:number;fontFamily:string;foregroundGradient:string;backgroundGradient:string;backgroundImage:string;foregroundEdited:boolean;backgroundEdited:boolean;frameColor:string;frame:boolean;logo:string;logoText:string;logoFontSize:number;logoTextBackground:string;logoTextColor:string;logoFontFamily:string;templateIndex?:number};
export const defaultDesign:QRDesign={foreground:'#000000',background:'#ffffff',eyeColor:'#000000',eyeColorEdited:false,dots:'square',dotsEdited:false,eyes:'square',eyesEdited:false,caption:'',captionColor:'#ef3998',fontSize:22,fontFamily:'Arial,Helvetica,sans-serif',foregroundGradient:'',backgroundGradient:'',backgroundImage:'',foregroundEdited:false,backgroundEdited:false,frameColor:'#2276ff',frame:false,logo:'',logoText:'',logoFontSize:22,logoTextBackground:'#ffffff',logoTextColor:'#3b82f6',logoFontFamily:'Arial,Helvetica,sans-serif'};
export const templateFiles=['qr-code 03.svg','qr-code 01.svg','qr-code 02.svg','qr-code 03.svg','qr-code 23.svg','qr-code 05.svg','qr-code 06.svg','qr-code 07.svg','qr-code 08.svg','qr-code 10.svg','qr-code 09.svg','qr-code 11.svg','qr-code 12.svg','qr-code 13.svg','qr-code 14.svg','qr-code 15.svg','qr-code 10 (1).svg','qr-code 21.svg','qr-code 22.svg','qr-code 07 (1).svg','qr-code 13 (1).svg',...uploadedTemplateFiles];
const palette=['#000000','#9b31e8','#111111','#111111','#8853ee','#428aff','#111111','#baaa00','#c044c2','#52b52e','#297cff','#a336d6','#111111','#ef4444','#8662ed','#111111','#9e62df','#2677d6','#111111','#ee6faa','#9566d2'];
export function templateDesign(index:number):QRDesign{
 if(uploadedTemplateColors[index])return {...defaultDesign,templateIndex:index,...uploadedTemplateColors[index]};
 const color=palette[index]||palette[0];
 const inverted=[2,12].includes(index);
 return {...defaultDesign,templateIndex:index,foreground:inverted?'#ffffff':index===5?'#1e62d0':index===9?'#278017':[1,3,6,7,8,11,19,20].includes(index)?'#111111':color,background:inverted?'#111111':'#ffffff',eyeColor:inverted?'#ffffff':index===5?'#1e62d0':index===9?'#278017':index===19?'#ef3998':index===20?'#111111':index===7?'#6b6200':index===8?'#111111':index===1?'#111111':color,frameColor:color,eyes:[1,2,8,12].includes(index)?'rounded':'square',dots:[3,11,16,19].includes(index)?'rounded':'square'};
}
// Each slot covers the sample QR while preserving the original surrounding artwork.
const slots:Record<number,[number,number,number]>={1:[.155,.155,.69],2:[.155,.155,.69],3:[.155,.155,.69],4:[.245,.245,.51],5:[.155,.155,.69],6:[.235,.325,.53],7:[.155,.155,.69],8:[.155,.155,.69],9:[.24,.19,.52],10:[.225,.15,.55],11:[.235,.23,.54],12:[.155,.155,.69],13:[.22,.135,.56],14:[.23,.185,.54],15:[.235,.16,.53],16:[.155,.155,.69],17:[.225,.145,.55],18:[.29,.225,.42],19:[.305,.295,.41],20:[.335,.295,.35]};
export const categoryTemplates:Record<string,number[]>={Hot:Array.from({length:21},(_,i)=>i),New:[0,19,20,11,14,16,17,18],Social:[0,8,11,19,10,13],WiFi:[0,6,20,5,17],Event:[0,20,7,9,15,18],Love:[0,19,11,1,14],...uploadedCategoryTemplates};
const xml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
const hex=(s:string,fallback:string)=>/^#[\da-f]{6}$/i.test(s)?s:fallback;
export function renderQR(payload:string,design:QRDesign,width=1000):string{
 const template=design.templateIndex||0;
 if(hasCategoryTemplate(template)&&!categoryTemplatePresets[template])throw new Error('Load the selected category template before rendering.');
 if(templatePresets[template]||categoryTemplatePresets[template])return renderTemplateQR(payload,design,width);
 const qr=QRCode.create(payload,{errorCorrectionLevel:'H'}),n=qr.modules.size,unit=10,margin=40,body=(n+8)*unit,hasCaption=Boolean(design.caption.trim()),height=body+(hasCaption?design.fontSize+32:0),fg=hex(design.foreground,'#000000'),bg=hex(design.background,'#ffffff'),eye=hex(design.eyeColor,fg),frame=hex(design.frameColor,'#2276ff');
 const fgPaint=design.foregroundGradient?'url(#qr-fg)':fg,bgPaint=design.backgroundGradient?'url(#qr-bg)':bg;
 const rect=(x:number,y:number,w:number,h:number,color:string,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}"/>`;
 const inEye=(r:number,c:number)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
 const bits=[`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.round(width*height/body)}" viewBox="0 0 ${body} ${height}">`,rect(0,0,body,height,bgPaint)];
 bits.push(`<defs><linearGradient id="qr-fg" x2="0" y2="1"><stop stop-color="${fg}"/><stop offset="1" stop-color="${hex(design.foregroundGradient,fg)}"/></linearGradient><linearGradient id="qr-bg" x2="0" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="${hex(design.backgroundGradient,bg)}"/></linearGradient></defs>`);
 if(design.backgroundImage)bits.push(`<image href="${backgroundImages[design.backgroundImage]||''}" x="${margin}" y="${margin}" width="${n*unit}" height="${n*unit}" opacity="0.12"/>`);
 if(design.frame)bits.push(`<rect x="5" y="5" width="${body-10}" height="${height-10}" rx="12" fill="none" stroke="${frame}" stroke-width="8"/>`);
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(!qr.modules.get(r,c)||inEye(r,c))continue;const x=margin+c*unit,y=margin+r*unit;const style=qr.modules.isReserved(r,c)?'square':design.dots;bits.push(renderDot(style,x,y,unit,fgPaint,r,c,(rr,cc)=>rr>=0&&cc>=0&&rr<n&&cc<n&&Boolean(qr.modules.get(rr,cc))&&!inEye(rr,cc)));}
 for(const [r,c] of [[0,0],[0,n-7],[n-7,0]])bits.push(renderEye(design.eyes,margin+c*unit,margin+r*unit,unit,design.eyeColorEdited?eye:design.foregroundEdited?fgPaint:eye,bgPaint));
 bits.push(renderLogo(design,margin,margin,n*unit));
 if(hasCaption){bits.push(`<text x="${body/2}" y="${body+design.fontSize+8}" text-anchor="middle" font-family="${xml(design.fontFamily)}" font-size="${Math.min(design.fontSize,body*.85/Math.max(1,design.caption.length)*1.6)}" font-weight="600" fill="${hex(design.captionColor,'#ef3998')}">${xml(design.caption.slice(0,40))}</text>`);}

 return bits.join('')+'</svg>';
}
export function contrastRatio(foreground:string,background:string){const luminance=(s:string)=>{const rgb=[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};const a=luminance(foreground),b=luminance(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
