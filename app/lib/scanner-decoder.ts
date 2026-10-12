import {prepareZXingModule,readBarcodes,type ReadInputBarcodeFormat} from 'zxing-wasm/reader';
import type {ScanMode,ScanResult} from './scanner-utils';
// Serve the matching WASM binary from this site; no public CDN or image upload.
prepareZXingModule({overrides:{locateFile:(path,prefix)=>path.endsWith('.wasm')?'/assets/scanner/zxing_reader.wasm':prefix+path}});
const barcodeFormats:ReadInputBarcodeFormat[]=['AllLinear','DataMatrix','PDF417','Aztec','MaxiCode'];
/** Shared by uploaded images and camera frames. Pixels stay on this device. */
export async function decodePixels(pixels:Uint8ClampedArray,width:number,height:number,mode:ScanMode,thorough=true):Promise<ScanResult|null>{
 if(!width||!height||pixels.length!==width*height*4)throw new Error('Invalid image pixels.');
 const data=new Uint8ClampedArray(pixels);
 // Transparent pixels should be treated as white, not black.
 for(let i=0;i<data.length;i+=4){const alpha=data[i+3]/255;for(let c=0;c<3;c++)data[i+c]=data[i+c]*alpha+255*(1-alpha);data[i+3]=255;}
 const formats:ReadInputBarcodeFormat[]=mode==='qr'?['QRCode','MicroQRCode','RMQRCode']:mode==='barcode'?barcodeFormats:[];
 const results=await readBarcodes({data,width,height,colorSpace:'srgb'},{formats,tryHarder:thorough,tryRotate:true,tryInvert:true,maxNumberOfSymbols:1,returnErrors:false});
 const result=results.find(item=>item.isValid);
 return result?{text:result.text,format:result.format}:null;
}
