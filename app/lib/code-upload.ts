// Compress the exact image for transport; never resize or rasterize the artwork.
export async function encodeCodeUpload<T extends {image:string}>(code:T):Promise<T|Omit<T,'image'> & {imageGzip:string}>{
 if(new TextEncoder().encode(code.image).length<=250000)return code;
 if(typeof CompressionStream==='undefined')throw new Error('Please update your browser to save large templates.');
 const compressed=await new Response(new Blob([code.image]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
 const bytes=new Uint8Array(compressed);let binary='';
 for(let start=0;start<bytes.length;start+=8192)binary+=String.fromCharCode(...bytes.subarray(start,start+8192));
 const {image,...metadata}=code;const imageGzip=btoa(binary);
 if(imageGzip.length>3700000)throw new Error('This image exceeds the upload limit. Try a smaller embedded logo or background.');
 return {...metadata,imageGzip};
}
export async function decodeCodeDownload<T extends {image?:string;imageGzip?:string}>(code:T):Promise<T>{
 if(!code.imageGzip)return code;
 if(typeof DecompressionStream==='undefined')throw new Error('Please update your browser to open large saved templates.');
 const binary=atob(code.imageGzip),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
 const image=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
 const {imageGzip,...metadata}=code;
 return {...metadata,image} as T;
}
