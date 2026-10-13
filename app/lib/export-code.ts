export const exportFormats=['PNG','SVG','PDF','EPS','JPG'] as const;
export const exportSizes=['200','500','1000','1500','2000'];
const bytes=(s:string)=>new TextEncoder().encode(s);
export function makePDF(rgb:Uint8Array,width:number,height:number):Uint8Array{
 const chunks:Uint8Array[]=[];let length=0;const offsets=[0];
 const add=(data:string|Uint8Array)=>{const part=typeof data==='string'?bytes(data):data;chunks.push(part);length+=part.length;};
 const object=(id:number,body:string)=>{offsets[id]=length;add(`${id} 0 obj\n${body}\nendobj\n`);};
 add('%PDF-1.4\n');object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 object(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
 offsets[4]=length;add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${rgb.length} >>\nstream\n`);add(rgb);add('\nendstream\nendobj\n');
 const content=`q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;object(5,`<< /Length ${bytes(content).length} >>\nstream\n${content}endstream`);
 const xref=length;add('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)add(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
 const output=new Uint8Array(length);let at=0;for(const chunk of chunks){output.set(chunk,at);at+=chunk.length;}return output;
}
export function makeEPS(rgb:Uint8Array,width:number,height:number):string{
 const lines:string[]=[];for(let i=0;i<rgb.length;i+=36)lines.push(Array.from(rgb.subarray(i,i+36),n=>n.toString(16).padStart(2,'0')).join(''));
 return `%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 ${width} ${height}\n%%LanguageLevel: 2\n%%EndComments\ngsave\n${width} ${height} scale\n/picstr ${width*3} string def\n${width} ${height} 8\n[${width} 0 0 -${height} 0 ${height}]\n{currentfile picstr readhexstring pop} false 3 colorimage\n${lines.join('\n')}\ngrestore\nshowpage\n%%EOF\n`;
}
export async function downloadCode(svg:string,format:string,width:number,name:string){
 if(!exportFormats.includes(format as typeof exportFormats[number])||!Number.isFinite(width)||width<1||width>2000)throw new Error('Invalid export options');
 let blob:Blob;
 if(format==='SVG'){
  const box=svg.match(/viewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)["']/i);const ratio=box?Number(box[2])/Number(box[1]):1;
  svg=svg.replace(/<svg\b[^>]*>/i,tag=>tag.replace(/\s(?:width|height)=["'][^"']*["']/g,'').replace('>',` width="${width}" height="${Math.round(width*ratio)}">`));
  blob=new Blob([svg],{type:'image/svg+xml'});
 }else{
  const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Could not render artwork'));image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=Math.max(1,Math.round(width*image.naturalHeight/image.naturalWidth));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  if(format==='PNG'||format==='JPG')blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error('Export failed')),format==='PNG'?'image/png':'image/jpeg',1));
  else{const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data,rgb=new Uint8Array(canvas.width*canvas.height*3);for(let i=0,j=0;i<rgba.length;i+=4){rgb[j++]=rgba[i];rgb[j++]=rgba[i+1];rgb[j++]=rgba[i+2];}blob=format==='PDF'?new Blob([makePDF(rgb,canvas.width,canvas.height) as Uint8Array<ArrayBuffer>],{type:'application/pdf'}):new Blob([makeEPS(rgb,canvas.width,canvas.height)],{type:'application/postscript'});}
 }
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${name}.${format.toLowerCase()}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
