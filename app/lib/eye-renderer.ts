export const eyeStyles=['square','circle','circle-center','rounded','inner-rounded','bottom-left','top-left','soft-square','wave','concave','leaf','beaded','tilted','slanted','dots'] as const;
export function renderEye(style:string,x:number,y:number,u:number,fg:string,bg:string){
 const rect=(a:number,b:number,w:number,h:number,rad=0,color=fg)=>`<rect x="${a}" y="${b}" width="${w}" height="${h}" rx="${rad}" fill="${color}"/>`;
 const circle=(a:number,b:number,r:number,color=fg)=>`<circle cx="${a}" cy="${b}" r="${r}" fill="${color}"/>`;
 if(style==='circle')return circle(x+3.5*u,y+3.5*u,3.5*u)+circle(x+3.5*u,y+3.5*u,2.5*u,bg)+circle(x+3.5*u,y+3.5*u,1.5*u);
 if(['dots','beaded','tilted'].includes(style)){let s='';for(let r=0;r<7;r++)for(let c=0;c<7;c++)if(r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4)){const cx=x+(c+.5)*u,cy=y+(r+.5)*u;s+=style==='tilted'?`<g transform="rotate(${((r+c)%3-1)*12} ${cx} ${cy})">${rect(cx-u*.46,cy-u*.46,u*.92,u*.92)}</g>`:circle(cx,cy,style==='dots'?u*.48:u*.55);}return s;}
 const radius=['rounded','soft-square','wave','leaf'].includes(style)?(style==='soft-square'?2:1.5)*u:0;
 let s=rect(x,y,7*u,7*u,radius)+rect(x+u,y+u,5*u,5*u,Math.max(0,radius-u*.5),bg);
 s+=style==='circle-center'?circle(x+3.5*u,y+3.5*u,1.5*u):rect(x+2*u,y+2*u,3*u,3*u,['rounded','inner-rounded','soft-square','leaf'].includes(style)?u*.65:0);
 if(style==='bottom-left'||style==='top-left'){s=rect(x,y,7*u,7*u,2*u)+rect(x+(style==='bottom-left'?4:0)*u,y+(style==='bottom-left'?0:4)*u,3*u,3*u)+rect(x+u,y+u,5*u,5*u,1.2*u,bg)+rect(x+2*u,y+2*u,3*u,3*u);}
 if(style==='wave')s=`<g transform="translate(${x} ${y})"><path d="M0 1Q0 0 1 0H6Q7 0 7 1Q6.5 3.5 7 7H1Q0 7 0 6Z M1 1V6H6Q5.6 3.5 6 1Z" fill-rule="evenodd" fill="${fg}" transform="scale(${u})"/>${rect(2*u,2*u,3*u,3*u,u*.6)}</g>`;
 if(style==='concave')s=rect(x,y,7*u,7*u)+rect(x+u,y+u,5*u,5*u,0,bg)+`<path d="M${x+2*u} ${y+2*u}Q${x+3.5*u} ${y+2.4*u} ${x+5*u} ${y+2*u}Q${x+4.6*u} ${y+3.5*u} ${x+5*u} ${y+5*u}Q${x+3.5*u} ${y+4.6*u} ${x+2*u} ${y+5*u}Q${x+2.4*u} ${y+3.5*u} ${x+2*u} ${y+2*u}Z" fill="${fg}"/>`;
 if(style==='slanted')s=`<g transform="translate(${x} ${y}) skewX(-5)">${rect(u*.6,0,6.4*u,7*u,u*.5)}${rect(1.6*u,u,4.4*u,5*u,0,bg)}${rect(2.6*u,2*u,2.4*u,3*u)}</g>`;
 return s;
}
