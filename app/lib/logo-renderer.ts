import type {QRDesign} from './qr-design';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export function renderLogo(d:QRDesign,left:number,top:number,side:number){
 if(!d.logo&&!d.logoText.trim())return '';
 const size=side*.22,x=left+(side-size)/2,y=top+(side-size)/2;
 const fit=Math.min(1,.34/(36/300*Math.max(1,d.logoText.length)*.6)),font=d.logoFontSize*side/300*fit;
 const textWidth=Math.min(side*.34,Math.max(side*.08,font*d.logoText.length*.6)),boxWidth=d.logoText.trim()?textWidth+side*.025:size+side*.02,boxHeight=d.logoText.trim()?font*1.5+side*.02:size+side*.02;
 const image=/^data:image\/(png|svg\+xml);base64,[a-z\d+/=]+$/i.test(d.logo)?`<image href="${d.logo}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`:'';
 const text=d.logoText.trim()?`<text x="${left+side/2}" y="${top+side/2}" text-anchor="middle" dominant-baseline="central" font-family="${escape(d.logoFontFamily)}" font-size="${font}" font-weight="600" fill="${escape(d.logoTextColor)}">${escape(d.logoText)}</text>`:'';
 return `<rect x="${left+(side-boxWidth)/2}" y="${top+(side-boxHeight)/2}" width="${boxWidth}" height="${boxHeight}" rx="${side*.015}" fill="${escape(d.logoText.trim()?d.logoTextBackground:'white')}"/>${image}${text}`;
}
