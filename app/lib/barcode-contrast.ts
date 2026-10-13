// Match the QR generator's existing 3:1 export safeguard. This is a basic
// contrast check, not a guarantee that every printer/scanner can read a code.
export const minimumBarcodeContrast=3;
type RGB=[number,number,number];
function rgb(color:string):RGB|null {
 if(!/^#[\da-f]{6}$/i.test(color))return null;
 return [1,3,5].map(index=>parseInt(color.slice(index,index+2),16)/255) as RGB;
}
function luminance(channels:RGB):number {
 const linear=channels.map(value=>value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4);
 return linear[0]*0.2126+linear[1]*0.7152+linear[2]*0.0722;
}
function luminanceRange(color:string,gradient:string[]|null):[number,number]|null {
 if(gradient&&gradient.length!==2)return null;
 const start=rgb(gradient?gradient[0]:color),end=rgb(gradient?gradient[1]:color);
 if(!start||!end)return null;
 const at=(position:number)=>luminance(start.map((value,index)=>value+(end[index]-value)*position) as RGB);
 const first=at(0),last=at(1);
 // SVG's default sRGB interpolation has convex luminance: its maximum is at
 // an endpoint, but its minimum can be inside a multicolor gradient.
 let low=0,high=1;
 for(let step=0;step<48;step++){
  const left=low+(high-low)/3,right=high-(high-low)/3;
  if(at(left)<at(right))high=right;else low=left;
 }
 return [Math.min(first,last,at((low+high)/2)),Math.max(first,last)];
}
export function barcodeContrastRatio(foreground:string,background:string,fgGradient:string[]|null=null,bgGradient:string[]|null=null):number {
 const fg=luminanceRange(foreground,fgGradient),bg=luminanceRange(background,bgGradient);
 if(!fg||!bg)return 1;
 // Compare the full ranges: foreground/background gradients use different SVG
 // bounding boxes, so checking matching stops alone can miss poor contrast.
 if(fg[1]<bg[0])return (bg[0]+0.05)/(fg[1]+0.05);
 if(bg[1]<fg[0])return (fg[0]+0.05)/(bg[1]+0.05);
 return 1;
}
