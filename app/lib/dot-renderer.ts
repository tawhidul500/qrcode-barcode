export const dotStyles=['square','circle','tilted','connected','horizontal','diamond','star','cross'] as const;
export function renderDot(style:string,x:number,y:number,u:number,fill:string,r:number,c:number,has:(r:number,c:number)=>boolean){
 const rect=(a:number,b:number,w:number,h:number,rad=0)=>`<rect x="${a}" y="${b}" width="${w}" height="${h}" rx="${rad}" fill="${fill}"/>`;
 const cx=x+u/2,cy=y+u/2;
 if(style==='circle')return `<circle cx="${cx}" cy="${cy}" r="${u*.35}" fill="${fill}"/>`;
 if(style==='tilted')return `<g transform="rotate(${((r*13+c*7)%5-2)*7} ${cx} ${cy})">${rect(x+u*.08,y+u*.08,u*.84,u*.84)}</g>`;
 if(style==='diamond')return `<path d="M${cx} ${y}L${x+u} ${cy}L${cx} ${y+u}L${x} ${cy}Z" fill="${fill}"/>`;
 if(style==='connected')return rect(x+u*.12,y+u*.12,u*.76,u*.76,u*.3)+(has(r,c+1)?rect(cx,y+u*.25,u*.65,u*.5):'')+(has(r+1,c)?rect(x+u*.25,cy,u*.5,u*.65):'');
 if(style==='horizontal')return rect(x+u*.07,y+u*.25,u*.86,u*.5,u*.25)+(has(r,c+1)?rect(cx,y+u*.25,u*.6,u*.5):'');
 if(style==='cross')return rect(x+u*.33,y+u*.1,u*.34,u*.8)+rect(x+u*.1,y+u*.33,u*.8,u*.34);
 if(style==='star')return `<path d="M${cx} ${y+u*.08}L${x+u*.62} ${y+u*.38}L${x+u*.92} ${cy}L${x+u*.62} ${y+u*.62}L${cx} ${y+u*.92}L${x+u*.38} ${y+u*.62}L${x+u*.08} ${cy}L${x+u*.38} ${y+u*.38}Z" fill="${fill}"/>`;
 return rect(x,y,u,u,style==='rounded'?u*.3:0);
}
