"use client";
import {Localized} from './i18n/LanguageProvider';
import {useEffect,useRef,useState} from "react";
import QRTypesModal from "./QRTypesModal";
import TutorialVideo from "./TutorialVideo";
import DesignControls from "./DesignControls";
import {renderQR,defaultDesign,contrastRatio} from "../lib/qr-design";
import {ChevronDown,Share2,Copy,ShieldCheck} from "lucide-react";
import {buildPayload,emptyContact,type Contact} from "../lib/qr-content";
import {loadCategoryTemplate,TemplateLoadError} from '../lib/category-template-presets';
import type {QRDesign} from '../lib/qr-design';
import {qrTypes} from "../lib/qr-types";
const defaults:Record<string,string>={Website:'https://example.com',Text:'Hello!',Facebook:'https://facebook.com',Instagram:'https://instagram.com',X:'https://x.com',Spotify:'https://open.spotify.com',Product:'https://example.com/product',Location:'https://maps.google.com/?q=Dhaka',Phone:'+8801700000000',WhatsApp:'8801700000000',Viber:'+8801700000000',Email:'hello@example.com',SMS:'+8801700000000',Contacts:'BEGIN:VCARD\nVERSION:3.0\nFN:Your Name\nEND:VCARD',Vcard:'BEGIN:VCARD\nVERSION:3.0\nFN:Your Name\nEND:VCARD'};
export default function Generator({selectedType,onTypeChange,standalone=false}:{selectedType:string;onTypeChange:(type:string)=>void;standalone?:boolean}){
 const type=selectedType;
 useEffect(()=>{const requested=new URLSearchParams(window.location.search).get('type');if(requested&&qrTypes.some(([name])=>name===requested))onTypeChange(requested);},[onTypeChange]);
 const [typesOpen,setTypesOpen]=useState(false);
 const [value,setValue]=useState(''),[ssid,setSsid]=useState(''),[password,setPassword]=useState(''),[security,setSecurity]=useState('WPA'),[format,setFormat]=useState('PNG'),[size,setSize]=useState('1000'),[message,setMessage]=useState(''),[contentOpen,setContentOpen]=useState(true),[designOpen,setDesignOpen]=useState(true);
 const [contact,setContact]=useState<Contact>({...emptyContact});
 const [design,setDesign]=useState({...defaultDesign});
 const [rendered,setRendered]=useState<{payload:string;design:QRDesign;uri:string}|null>(null);
 const [templateError,setTemplateError]=useState(''),[retry,setRetry]=useState(0);
 const list=useRef<HTMLDivElement>(null);
 useEffect(()=>{setValue('');setContentOpen(true);},[selectedType]);
 let payload='',validationError='';
 try{payload=buildPayload(type,value,{ssid,password,security},contact);}catch(error){validationError=error instanceof Error?error.message:'Check your content.';}
 // A completed render is usable only for the current content and design.
 const preview=rendered?.payload===payload&&rendered.design===design?rendered.uri:'';
 useEffect(()=>{
  let active=true;
  setTemplateError('');setMessage('');
  if(!payload){setRendered(null);return;}
  async function updatePreview(){
   try{
    await loadCategoryTemplate(design.templateIndex);
    if(!active)return;
    const svg=renderQR(payload,design,360);
    setRendered({payload,design,uri:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
   }catch(error){
    if(!active)return;
    setRendered(null);
    if(error instanceof TemplateLoadError)setTemplateError(error.message);
    else setMessage('This content is too long. Please shorten it.');
   }
  }
  void updatePreview();
  return ()=>{active=false;};
 },[payload,design,retry]);
 const renderedEyeColor=design.eyeColorEdited?design.eyeColor:design.foregroundEdited?design.foreground:design.eyeColor;
 const lowContrast=contrastRatio(design.foreground,design.background)<3||contrastRatio(renderedEyeColor,design.background)<3||(Boolean(design.foregroundGradient)&&contrastRatio(design.foregroundGradient,design.background)<3)||(Boolean(design.backgroundGradient)&&(contrastRatio(design.foreground,design.backgroundGradient)<3||contrastRatio(renderedEyeColor,design.backgroundGradient)<3));
 async function download(){if(!payload||!preview)return;try{const svg=renderQR(payload,design,Number(size));let data='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);if(format==='PNG'){const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Could not render'));image.src=data;});const canvas=document.createElement('canvas');canvas.width=Number(size);canvas.height=Math.round(Number(size)*image.naturalHeight/image.naturalWidth);const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(image,0,0,canvas.width,canvas.height);data=canvas.toDataURL('image/png');}const link=document.createElement('a');link.href=data;link.download=`${type.toLowerCase()}-qr-code.${format.toLowerCase()}`;link.click();}catch{setMessage('Unable to generate this code. Please try shorter content.');}}
 async function share(){if(!payload)return;try{if(navigator.share)await navigator.share({title:'My QR code content',text:payload});else{await navigator.clipboard.writeText(payload);setMessage('QR content copied.');}}catch{setMessage('Sharing was cancelled or unavailable.');}}
 return <Localized>{<section className="generator-hero" id="generator">{typesOpen&&<QRTypesModal selectedType={type} onChoose={onTypeChange} onClose={()=>setTypesOpen(false)}/>}<div className="generator-heading">{standalone?<h1><span className="reference-accessible-text">Create &amp; Customize Your QR Code</span><img className="reference-title-art" src="/assets/qr-page/title.svg" alt="" aria-hidden="true"/></h1>:<h2>Create &amp; Customize Your QR Code</h2>}<p>{standalone?<><span className="reference-accessible-text">Easily create, organize, and analyze your QR codes in one place</span><img className="reference-subtitle-art" src="/assets/qr-page/subtitle.svg" alt="" aria-hidden="true"/></>:"Easily create, organize, and analyze your QR codes in one place"}</p></div>
 <div className="generator-surface"><div className="generator-panel"><aside className="qr-types" aria-label="QR code types"><div className="qr-type-list" ref={list}>{qrTypes.map(([label,icon])=><button key={label} className={'qr-type'+(type===label?' selected':'')} aria-pressed={type===label} onClick={()=>{onTypeChange(label);setValue('');}}><img src={'/assets/svg/'+icon} alt=""/><span>{label==='Vcard'?'V card':label}</span></button>)}</div><button className="all-types" onClick={()=>setTypesOpen(true)} aria-haspopup="dialog" aria-expanded={typesOpen}>All Code Types</button></aside>
 <div className="qr-editor"><button className="qr-section-title" onClick={()=>setContentOpen(!contentOpen)} aria-expanded={contentOpen}>Enter Content<ChevronDown size={16} className={contentOpen?'turned':''}/></button>{contentOpen&&<div className="qr-content">{type==='Wi-Fi'?<><label htmlFor="wifi-name">Network name</label><input id="wifi-name" value={ssid} onChange={e=>setSsid(e.target.value)} placeholder="Your Wi-Fi network"/><label htmlFor="wifi-password">Password</label><input id="wifi-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Network password" type="password"/><label htmlFor="wifi-security">Security</label><select id="wifi-security" value={security} onChange={e=>setSecurity(e.target.value)}><option>WPA</option><option>WEP</option><option value="nopass">No password</option></select></>:['Contacts','Vcard'].includes(type)?<>{(['name','phone','email','organization','website'] as const).map((field,index)=><div key={field}><label htmlFor={index===0?'qr-content':`contact-${field}`}>{field==='name'?'Full name (required)':field.charAt(0).toUpperCase()+field.slice(1)}</label><input id={index===0?'qr-content':`contact-${field}`} type={field==='email'?'email':'text'} value={contact[field]} onChange={event=>setContact({...contact,[field]:event.target.value})}/></div>)}</>:<><label htmlFor="qr-content">{type==='Website'?'Enter Your Website Link:':type==='Text'?'Enter Your Text:':`Enter Your ${type} Content:`}</label>{type==='Text'?<textarea id="qr-content" value={value} onChange={e=>setValue(e.target.value)} placeholder={defaults[type]||'https://example.com'}/>:<input id="qr-content" value={value} onChange={e=>setValue(e.target.value)} placeholder={defaults[type]||'https://example.com'} type={type==='Email'?'email':'text'}/>}</>}</div>}
 <button className="qr-section-title" onClick={()=>setDesignOpen(!designOpen)} aria-expanded={designOpen}>Design Your QR Code<ChevronDown size={16} className={designOpen?'turned':''}/></button>
 {designOpen&&<DesignControls design={design} onChange={setDesign} onMessage={setMessage}/>}
 </div><aside className="qr-preview-column" aria-label="QR preview and download"><TutorialVideo/><div className="qr-preview">{payload&&preview?<img src={preview} alt={`Generated ${type} QR code`}/>:<p role="status">{validationError||templateError||message||'Generating QR code…'}</p>}</div>{templateError&&<button type="button" onClick={()=>setRetry(value=>value+1)}>Retry template</button>}<div className="qr-save-hint"><ShieldCheck size={20}/><span>{payload&&preview?'Your QR Code is ready to test':'Enter valid content to create a QR code'}</span></div><div className="qr-export-options"><label>Format<select value={format} onChange={e=>setFormat(e.target.value)}><option>PNG</option><option>SVG</option></select></label><label>Size<select value={size} onChange={e=>setSize(e.target.value)} disabled={format==='SVG'}>{['500','1000','2000'].map(n=><option key={n} value={n}>{n} px wide</option>)}</select></label></div><div className="qr-export-actions"><button className="qr-download" disabled={!payload||!preview||lowContrast} onClick={download}>Download QR Code</button><button className="qr-icon-button" aria-label="Share QR content" disabled={!payload} onClick={share}><Share2 size={21}/></button><button className="qr-icon-button" aria-label="Copy QR content" disabled={!payload} onClick={async()=>{if(!payload)return;try{await navigator.clipboard.writeText(payload);setMessage('QR content copied.');}catch{setMessage('Clipboard unavailable.');}}}><Copy size={21}/></button></div>{lowContrast&&<p className="qr-contrast-warning" role="status">Choose darker QR and eye colors against the background to enable download.</p>}{message&&<div className="qr-feedback" role="status">{message}<button aria-label="Dismiss message" onClick={()=>setMessage('')}>×</button></div>}</aside></div></div></section>}</Localized>;
}
