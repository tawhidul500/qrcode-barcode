export type ScanMode = 'auto'|'qr'|'barcode';
export type ScanResult = {text:string;format:string};
export function scanMode(value:string|null):ScanMode {
 return value==='qr'||value==='barcode'?value:'auto';
}
export function safeScanURL(value:string):string|null {
 try {
  const url=new URL(value.trim());
  return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:null;
 } catch {return null;}
}
export function imageFileError(file:{type:string;size:number;name:string}):string|null {
 const supported=file.type?['image/png','image/jpeg','image/webp'].includes(file.type):/\.(png|jpe?g|webp)$/i.test(file.name);
 if(!supported)return 'Choose a PNG, JPG or WebP image.';
 if(file.size>10*1024*1024)return 'Choose an image smaller than 10 MB.';
 if(!file.size)return 'This image is empty. Please choose another file.';
 return null;
}
