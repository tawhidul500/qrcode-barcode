"use client";
import {Localized} from './i18n/LanguageProvider';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Barcode,Camera,CheckCircle2,Copy,Download,ExternalLink,ImagePlus,LoaderCircle,QrCode,ScanLine,UploadCloud,X} from 'lucide-react';
import {imageFileError,safeScanURL,scanMode,type ScanMode,type ScanResult} from '../lib/scanner-utils';

const modes=[{id:'auto',label:'Auto QR+ Barcode',Icon:ScanLine},{id:'qr',label:'QR Code',Icon:QrCode},{id:'barcode',label:'Barcode',Icon:Barcode}] as const;
export default function ScannerPanel(){
 const [mode,setMode]=useState<ScanMode>('auto'),[dragging,setDragging]=useState(false),[busy,setBusy]=useState(false),[camera,setCamera]=useState(false),[cameraReady,setCameraReady]=useState(false);
 const [result,setResult]=useState<ScanResult|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[imageURL,setImageURL]=useState('');
 const input=useRef<HTMLInputElement>(null),video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),operation=useRef(0),imageObjectURL=useRef(''),resultHeading=useRef<HTMLHeadingElement>(null);
 const stopResources=useCallback(()=>{if(timer.current)clearTimeout(timer.current);timer.current=null;stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;if(video.current)video.current.srcObject=null;},[]);
 const clearImage=useCallback(()=>{if(imageObjectURL.current)URL.revokeObjectURL(imageObjectURL.current);imageObjectURL.current='';setImageURL('');},[]);
 const cancel=useCallback(()=>{operation.current++;stopResources();setCamera(false);setCameraReady(false);setBusy(false);},[stopResources]);
 useEffect(()=>{setMode(scanMode(new URLSearchParams(window.location.search).get('mode')));return()=>{operation.current++;stopResources();if(imageObjectURL.current)URL.revokeObjectURL(imageObjectURL.current);};},[stopResources]);
 useEffect(()=>{if(result)resultHeading.current?.focus({preventScroll:true});},[result]);
 useEffect(()=>{const hidden=()=>{if(document.hidden){cancel();}};document.addEventListener('visibilitychange',hidden);return()=>document.removeEventListener('visibilitychange',hidden);},[cancel]);
 function chooseMode(next:ScanMode){cancel();clearImage();setMode(next);setResult(null);setError('');setNotice('');const url=new URL(window.location.href);if(next==='auto')url.searchParams.delete('mode');else url.searchParams.set('mode',next);window.history.replaceState(null,'',url);}
 function reset(){cancel();clearImage();setResult(null);setError('');setNotice('');input.current?.focus();}
 async function scanFile(file:File|undefined){
  if(!file)return;
  cancel();clearImage();setResult(null);setNotice('');setError('');
  const invalid=imageFileError(file);if(invalid){setError(invalid);return;}
  const current=operation.current;setBusy(true);
  const url=URL.createObjectURL(file);imageObjectURL.current=url;setImageURL(url);
  try{
   const image=new Image();
   await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('This file could not be opened. Choose a valid PNG, JPG or WebP image.'));image.src=url;});
   if(current!==operation.current)return;
   if(image.naturalWidth*image.naturalHeight>32000000)throw new Error('This image is too large. Resize it below 32 megapixels and try again.');
   const {decodePixels}=await import('../lib/scanner-decoder');
   if(current!==operation.current)return;
   const canvas=document.createElement('canvas');
   const scale=Math.min(1,2048/Math.max(image.naturalWidth,image.naturalHeight));
   canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
   const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)throw new Error('Your browser could not open the image reader.');
   context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
   const pixels=context.getImageData(0,0,canvas.width,canvas.height);
   const decoded=await decodePixels(pixels.data,pixels.width,pixels.height,mode);
   if(current!==operation.current)return;
   if(decoded)setResult(decoded);else setError(`No ${mode==='qr'?'QR code':mode==='barcode'?'barcode':'QR code or barcode'} found. Try a sharper image, crop closer to the code, or choose another scan mode.`);
  }catch(cause){if(current===operation.current)setError(cause instanceof Error?cause.message:'Unable to scan this image. Please try another file.');}
  finally{if(current===operation.current)setBusy(false);}
 }
 async function startCamera(){
  cancel();clearImage();setResult(null);setError('');setNotice('');
  if(!window.isSecureContext){setError('Camera access requires HTTPS or localhost. You can still upload an image.');return;}
  if(!navigator.mediaDevices?.getUserMedia){setError('Camera scanning is unavailable in this browser. Please upload an image.');return;}
  const current=operation.current;setCamera(true);setBusy(true);
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
   if(current!==operation.current){media.getTracks().forEach(track=>track.stop());return;}
   stream.current=media;
   const element=video.current;if(!element)throw new Error('Camera preview could not start.');
   element.srcObject=media;await element.play();
   const {decodePixels}=await import('../lib/scanner-decoder');
   if(current!==operation.current)return;
   setCameraReady(true);setBusy(false);
   const canvas=document.createElement('canvas'),context=canvas.getContext('2d',{willReadFrequently:true});
   if(!context)throw new Error('Your browser could not open the camera reader.');
   const scan=async()=>{
    if(current!==operation.current)return;
    if(element.readyState>=2&&element.videoWidth){
     const scale=Math.min(1,1280/element.videoWidth);canvas.width=Math.round(element.videoWidth*scale);canvas.height=Math.round(element.videoHeight*scale);
     context.drawImage(element,0,0,canvas.width,canvas.height);
     try{const pixels=context.getImageData(0,0,canvas.width,canvas.height),decoded=await decodePixels(pixels.data,pixels.width,pixels.height,mode,false);
      if(current!==operation.current)return;
      if(decoded){cancel();setResult(decoded);return;}
     }catch{if(current!==operation.current)return;cancel();setError('Camera scanning stopped. Please restart the camera or upload an image.');return;}
    }
    if(current===operation.current)timer.current=setTimeout(scan,450);
   };
   timer.current=setTimeout(scan,200);
  }catch(cause){
   if(current!==operation.current)return;
   cancel();
   const name=(cause as Error)?.name;
   setError(name==='NotAllowedError'?'Camera permission was denied. Allow camera access in your browser settings or upload an image.':name==='NotFoundError'?'No camera was found on this device. Please upload an image.':name==='NotReadableError'?'The camera is in use by another app. Close it and try again.':'Unable to start the camera. Check its permissions or upload an image.');
  }
 }
 const link=result?safeScanURL(result.text):null;
 const typeLabel=mode==='qr'?'QR Code':mode==='barcode'?'Barcode':'QR or Barcode';
 return <Localized>{<div className="scanner-card" id="scanner">
  <div className="scanner-tabs" role="tablist" aria-label="Scanner mode">{modes.map(({id,label,Icon},index)=><button key={id} type="button" role="tab" id={'scan-tab-'+id} aria-selected={mode===id} aria-controls="scanner-panel" tabIndex={mode===id?0:-1} onClick={()=>chooseMode(id)} onKeyDown={event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%3;else if(event.key==='ArrowLeft')next=(index+2)%3;else if(event.key==='Home')next=0;else if(event.key==='End')next=2;else return;event.preventDefault();chooseMode(modes[next].id);document.getElementById('scan-tab-'+modes[next].id)?.focus();}}><Icon aria-hidden="true" size={28}/><span>{label}</span></button>)}</div>
  <div id="scanner-panel" role="tabpanel" aria-labelledby={'scan-tab-'+mode}>
   <p className="scanner-support">{mode==='qr'?'Scan website links, text, Wi-Fi details, contact information and more from a QR code.':<>Barcode support includes Code 128, Code 39, Code 93, EAN-8/13, UPC-A/E, ITF,<br className="scanner-desktop-break"/> Codabar and other formats supported by the browser/decoder.</>}</p>
   <input className="scanner-file-input" ref={input} id="scan-image" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload a QR code or barcode image" onChange={event=>{scanFile(event.target.files?.[0]);event.target.value='';}}/>
   <div className={'scanner-dropzone'+(dragging?' is-dragging':'')+(camera?' has-camera':'')} onClick={event=>{if(!camera&&!busy&&!(event.target as HTMLElement).closest('button'))input.current?.click();}} onDragOver={event=>{event.preventDefault();if(!camera)setDragging(true);}} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setDragging(false);}} onDrop={event=>{event.preventDefault();setDragging(false);scanFile(event.dataTransfer.files[0]);}}>
    <video ref={video} className="scanner-video" hidden={!camera} playsInline muted autoPlay aria-label="Live camera scanner preview"/>
    {camera?<><div className="scanner-camera-guide" aria-hidden="true"/><p className="scanner-camera-status">{cameraReady?'Hold a code steady inside the frame':'Waiting for camera permission…'}</p></>:<>
     {imageURL?<img className="scanner-upload-preview" src={imageURL} alt="Selected image for scanning"/>:<span className="scanner-upload-symbol"><UploadCloud size={43} strokeWidth={1.7} aria-hidden="true"/></span>}
     <h2>{busy?'Reading your image…':imageURL?'Scan another image':`Choose A ${typeLabel} image`}</h2>
     <p>Drag and drop an image here, or click to upload.<br/>PNG, JPG, WEBP, or a screenshot.</p>
     <button type="button" className="scanner-upload-button" disabled={busy} onClick={()=>input.current?.click()}>{busy?<LoaderCircle className="scanner-spinner" size={24}/>:<ImagePlus size={24}/>}<span>{busy?'Scanning…':'Upload Image'}</span></button>
    </>}
   </div>
   <button type="button" className="scanner-camera-button" disabled={busy&&!camera} onClick={camera?cancel:startCamera}>{camera?<X size={29}/>:<Camera size={29}/>}<span>{camera?'Stop Camera':'Use Camera'}</span></button>
   {error&&<div className="scanner-message scanner-error" role="alert">{error}</div>}
   {result&&<section className="scanner-result" aria-labelledby="scan-result-title"><div className="scanner-result-heading"><CheckCircle2 size={24}/><h2 id="scan-result-title" ref={resultHeading} tabIndex={-1}>Code scanned successfully</h2><span>{result.format}</span></div><pre>{result.text}</pre><div className="scanner-result-actions"><button onClick={async()=>{try{await navigator.clipboard.writeText(result.text);setNotice('Result copied.');}catch{setNotice('Copy is unavailable. Select the result text and copy it manually.');}}}><Copy size={17}/>Copy result</button>{link&&<a href={link} target="_blank" rel="noopener noreferrer"><ExternalLink size={17}/>Open link</a>}<button onClick={()=>{const url=URL.createObjectURL(new Blob([result.text],{type:'text/plain;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='scan-result.txt';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}><Download size={17}/>Save text</button><button onClick={reset}>Scan again</button></div><p className="scanner-result-note">Check the result before opening a link. Images and camera frames are processed on your device.</p></section>}
   {notice&&<p className="scanner-message" role="status">{notice}</p>}
  </div>
 </div>}</Localized>;
}
