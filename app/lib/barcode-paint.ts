export function applyBarcodePaint(svg:string,foreground:string,fgGradient:string[]|null,bgGradient:string[]|null){
 const gradient=(id:string,c:string[])=>`<linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${c[0]}"/><stop offset="100%" stop-color="${c[1]}"/></linearGradient>`;
 svg=svg.replace(/(stroke|fill)="#010203"/gi,`$1="${fgGradient?'url(#barcode-fg)':foreground}"`);
 if(bgGradient)svg=svg.replace(/(<rect\b[^>]*\bfill=")[^"]*(")/, '$1url(#barcode-bg)$2');
 return svg.replace(/(<svg[^>]*>)/,`$1<defs>${fgGradient?gradient('barcode-fg',fgGradient):''}${bgGradient?gradient('barcode-bg',bgGradient):''}</defs>`);
}
