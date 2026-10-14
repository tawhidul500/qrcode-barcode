"use client";
import {downloadCode,exportFormats,exportSizes} from '../lib/export-code';
import {getCloudCode} from '../lib/cloud-codes';
import type {SavedCode} from '../lib/saved-codes';
import {createTracking,loadStatistics,changeTrackedLink} from '../lib/statistics-client';
import {defaultStatisticsFilter} from '../lib/statistics';
import './statistics-page.css';
import {saveGeneratedCode} from '../lib/save-generated-code';
import useStickyPreview from './useStickyPreview';
import {authConfigured,getAuthClient} from '../lib/auth/client';
import {Localized} from './i18n/LanguageProvider';
import {useEffect,useRef,useState} from "react";
import QRContentFields from './QRContentFields';
import {editorHTMLFromRich} from './RichTextInput';
import {fileTypes,isHostedType,nativeHostingType,type ContentFields} from '../lib/qr-type-details';
import {contentRequest,cleanContentFields,type PublishedContent} from '../lib/content-client';
import {contentSignature} from '../lib/content-pages';
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
 const previewRef=useStickyPreview(),exportRunning=useRef(false);const [exportBusy,setExportBusy]=useState(false);
 const [editing,setEditing]=useState<SavedCode|null>(null);
 const [tracked,setTracked]=useState<{id:string;source:string;url:string;title:string;active:boolean}|null>(null),[trackingTitle,setTrackingTitle]=useState(''),[trackingBusy,setTrackingBusy]=useState(false);
 const trackingRunning=useRef(false);
 useEffect(()=>{const id=new URLSearchParams(window.location.search).get('tracked');if(!id)return;let live=true;loadStatistics(defaultStatisticsFilter()).then(result=>{const code=result.codes.find(c=>c.id===id);if(live&&code){setValue(code.target);setTrackingTitle(code.title);setTracked({id:code.id,source:code.target,url:code.url,title:code.title,active:code.active});}}).catch(()=>{if(live)setMessage('Unable to load this tracked link. Please sign in again.');});return()=>{live=false;};},[]);
 useEffect(()=>{const requested=new URLSearchParams(window.location.search).get('type');if(requested&&qrTypes.some(([name])=>name===requested))onTypeChange(requested);},[onTypeChange]);
 useEffect(()=>{const id=new URLSearchParams(window.location.search).get('content');if(!id)return;let live=true;contentRequest('GET',undefined,id).then(result=>{if(!live)return;const page=result.page;const selected=page.type==='Formatted Text'?'Text':page.type.endsWith(' Action')?page.type.replace(' Action',''):page.type;onTypeChange(selected);setTimeout(()=>{if(!live)return;const data={...page.data};if(page.type==='Formatted Text')data.textMode='hosted';if(page.type.endsWith(' Action'))data.actionMode='hosted';setFields(data);setValue(data.text||data.recipient||'');if(data.richDoc)setRichText(editorHTMLFromRich(data.richDoc));setPublished({id:page.id,url:result.url,signature:contentSignature(data),type:page.type});},0);}).catch(e=>{if(live)setMessage(e instanceof Error?e.message:'Unable to load content.');});return()=>{live=false;};},[]);
 const [typesOpen,setTypesOpen]=useState(false);
 const [richText,setRichText]=useState(''),[fields,setFields]=useState<ContentFields>({}),[published,setPublished]=useState<PublishedContent|null>(null),[contentBusy,setContentBusy]=useState(false);
 const [value,setValue]=useState(''),[ssid,setSsid]=useState(''),[password,setPassword]=useState(''),[security,setSecurity]=useState('WPA'),[format,setFormat]=useState('PNG'),[size,setSize]=useState('1000'),[message,setMessage]=useState(''),[contentOpen,setContentOpen]=useState(true),[designOpen,setDesignOpen]=useState(true);
 const [contact,setContact]=useState<Contact>({...emptyContact});
 const [design,setDesign]=useState({...defaultDesign});
 const [rendered,setRendered]=useState<{payload:string;design:QRDesign;uri:string}|null>(null);
 const [templateError,setTemplateError]=useState(''),[retry,setRetry]=useState(0);
 const list=useRef<HTMLDivElement>(null);
 useEffect(()=>{const id=new URLSearchParams(window.location.search).get('edit');if(!id)return;let live=true;
 getCloudCode(id).then(async code=>{if(!live)return;const editor=code.editor;if(!editor||editor.kind!=='qr'){setMessage('This older code has no editable source. Enter its content to create a new code.');return;}
 setEditing(code);onTypeChange(String(editor.type));
 setTimeout(async()=>{if(!live)return;setValue(String(editor.value||''));setRichText(String(editor.richText||''));const restoredFields=(editor.fields||{}) as ContentFields;if(!editor.hosted&&isHostedType(String(editor.type))&&/^https?:\/\//i.test(String(editor.value||'')))restoredFields.contentMode='link';if(editor.type==='Product'&&!restoredFields.productMode&&/^\d{8,14}$/.test(String(editor.value||'')))restoredFields.productMode='gtin';setFields(restoredFields);if(editor.hosted){const hosted=editor.hosted as PublishedContent;setPublished(hosted);try{const current=await contentRequest('GET',undefined,hosted.id);if(live){setFields(current.page.data);setPublished({...hosted,signature:contentSignature(current.page.data)});if(current.page.type==='Formatted Text'){setValue(current.page.data.text||'');if(current.page.data.richDoc)setRichText(editorHTMLFromRich(current.page.data.richDoc));}else if(current.page.type.endsWith(' Action'))setValue(current.page.data.recipient||'');}}catch{if(live)setMessage('Unable to load current hosted content. Check the database setup or sign in again.');}}setSsid(String(editor.ssid||''));setPassword(String(editor.password||''));setSecurity(String(editor.security||'WPA'));setContact({...emptyContact,...editor.contact as Contact});setDesign({...defaultDesign,...editor.design as QRDesign});setSize(String(editor.size||1000));if(code.trackingId){try{const result=await loadStatistics(defaultStatisticsFilter());const track=result.codes.find(c=>c.id===code.trackingId);if(live&&track){setValue(track.target);setTracked({id:track.id,source:track.target,url:track.url,title:track.title,active:track.active});}}catch(e){if(live)setMessage(e instanceof Error?e.message:'Unable to restore tracking settings.');}}},0);
 }).catch(e=>{if(live)setMessage(e instanceof Error?e.message:'Unable to edit this code.');});return()=>{live=false;};
 },[]);

 useEffect(()=>{setValue('');setRichText('');setFields({});setPublished(null);setContentOpen(true);setTracked(null);},[selectedType]);
 const needsHosting=isHostedType(nativeHostingType(type,fields))||(fileTypes.includes(type)&&Boolean(fields.filePath));
 const hostedDirty=needsHosting&&(!published||published.signature!==contentSignature(['Email','SMS','WhatsApp'].includes(type)&&fields.actionMode==='hosted'?{...fields,recipient:value}:fields)||Boolean(fields.password)||fields.clearPassword==='true');
 let payload='',validationError='';
 try{if(needsHosting){if(hostedDirty)throw new Error('Publish your page or updates to generate this QR.');payload=published!.url;}else payload=buildPayload(type,value,{ssid,password,security},contact,fields);}catch(error){validationError=error instanceof Error?error.message:'Check your content.';}
 const showPlaceholder=!payload&&!value.trim()&&!ssid.trim()&&!Object.values(contact).some(Boolean)&&!Object.values(fields).some(Boolean);
 const sourcePayload=payload;
 const trackingActive=Boolean(tracked);
 const destinationChanged=Boolean(tracked&&tracked.source!==sourcePayload);
 if(trackingActive)payload=tracked!.url;
 async function enableTracking(){if(trackingRunning.current||!/^https?:\/\//i.test(sourcePayload))return;trackingRunning.current=true;setTrackingBusy(true);try{if(tracked){await changeTrackedLink(tracked.id,{target:sourcePayload});setTracked({...tracked,source:sourcePayload});setMessage('Destination updated. Your existing dynamic QR code stays the same.');}else{const code=await createTracking(trackingTitle.trim()||type+' QR Code',sourcePayload);setTracked({id:code.id,source:sourcePayload,url:code.url,title:code.title,active:code.active});setMessage('Dynamic QR enabled. Download it to automatically save it and manage its destination and statistics.');}}catch(e){setMessage(e instanceof Error?e.message:'Unable to create or update your dynamic QR.');}finally{trackingRunning.current=false;setTrackingBusy(false);}}

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
 async function download(){if(!payload||!preview||lowContrast||destinationChanged||trackingBusy||hostedDirty||contentBusy||exportRunning.current)return;exportRunning.current=true;setExportBusy(true);setMessage('');try{await downloadCode(renderQR(payload,design,Number(size)),format,Number(size),`${type.toLowerCase()}-qr-code`);try{if(authConfigured()){const {data,error}=await getAuthClient().auth.getSession();if(error)throw error;if(data.session){await saveCode();setMessage('Downloaded and saved to your account.');}}}catch(e){setMessage('Downloaded, but automatic save failed: '+(e instanceof Error?e.message:'Please try again.'));}}catch{setMessage('Unable to export this QR code. Please try again.');}finally{exportRunning.current=false;setExportBusy(false);}}
 async function share(){if(!payload||hostedDirty||contentBusy)return;try{if(navigator.share)await navigator.share({title:'My QR code content',text:payload});else{await navigator.clipboard.writeText(payload);setMessage('QR content copied.');}}catch{setMessage('Sharing was cancelled or unavailable.');}}
 async function saveCode(){await saveGeneratedCode({id:editing?.id,name:editing?.name||(trackingActive?tracked!.title:type+' QR Code'),kind:'qr',type,trackingId:trackingActive?tracked!.id:null,folderId:editing?.folderId,editor:{kind:'qr',type,value,fields:cleanContentFields(fields),hosted:needsHosting?published:null,richText:type==='Text'?richText:'',ssid:type==='Wi-Fi'?ssid:'',password:type==='Wi-Fi'?password:'',security,contact:['Contacts','Vcard'].includes(type)?contact:{...emptyContact},design,size:Number(size),payload},image:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(renderQR(payload,design,Number(size)))});}
 return <Localized>{<section className="generator-hero" id="generator">{typesOpen&&<QRTypesModal selectedType={type} onChoose={onTypeChange} onClose={()=>setTypesOpen(false)}/>}<div className="generator-heading">{standalone?<h1><span className="reference-accessible-text">Create &amp; Customize Your QR Code</span><img className="reference-title-art" src="/assets/qr-page/title.svg" alt="" aria-hidden="true"/></h1>:<h2>Create &amp; Customize Your QR Code</h2>}<p>{standalone?<><span className="reference-accessible-text">Easily create, organize, and analyze your QR codes in one place</span><img className="reference-subtitle-art" src="/assets/qr-page/subtitle.svg" alt="" aria-hidden="true"/></>:"Easily create, organize, and analyze your QR codes in one place"}</p></div>
 <div className="generator-surface">{editing&&<p className="qr-feedback">Editing {editing.name}. Downloading updates this saved record automatically. Existing static printed codes keep their original content.</p>}<div className="generator-panel"><aside className="qr-types" aria-label="QR code types"><div className="qr-type-list" ref={list}>{qrTypes.map(([label,icon])=><button key={label} className={'qr-type'+(type===label?' selected':'')} aria-pressed={type===label} onClick={()=>{onTypeChange(label);setValue('');}}><img src={'/assets/svg/'+icon} alt=""/><span>{label==='Vcard'?'V card':label}</span></button>)}</div><button className="all-types" onClick={()=>setTypesOpen(true)} aria-haspopup="dialog" aria-expanded={typesOpen}>All Code Types</button></aside>
 <div className="qr-editor"><button className="qr-section-title" onClick={()=>setContentOpen(!contentOpen)} aria-expanded={contentOpen}>Enter Content<ChevronDown size={16} className={contentOpen?'turned':''}/></button>{contentOpen&&<div className="qr-content"><QRContentFields type={type} value={value} onValue={setValue} fields={fields} onFields={next=>{if(next.textMode!==fields.textMode||next.actionMode!==fields.actionMode)setTracked(null);setFields(next);}} contact={contact} onContact={setContact} wifi={{ssid,password,security}} onWifi={w=>{setSsid(w.ssid);setPassword(w.password);setSecurity(w.security);}} richText={richText} onRichText={setRichText} published={published} onPublished={setPublished} onMessage={setMessage} onBusy={setContentBusy}/></div>}
 <button className="qr-section-title" onClick={()=>setDesignOpen(!designOpen)} aria-expanded={designOpen}>Design Your QR Code<ChevronDown size={16} className={designOpen?'turned':''}/></button>
 {designOpen&&<DesignControls design={design} onChange={setDesign} onMessage={setMessage}/>}
 </div><aside ref={previewRef} className="qr-preview-column" aria-label="QR preview and download"><TutorialVideo/><div className="qr-preview">{payload&&preview?<img src={preview} alt={`Generated ${type} QR code`}/>:showPlaceholder?<img className="code-preview-placeholder" src="/assets/qr-preview-placeholder.svg" alt="Sample QR code preview — enter your content to create your own"/>:<p role="status">{validationError||templateError||message||'Generating QR code…'}</p>}</div>{templateError&&<button type="button" onClick={()=>setRetry(value=>value+1)}>Retry template</button>}<div className="qr-save-hint"><ShieldCheck size={20}/><span>{payload&&preview?'Your QR Code is ready to test':'Enter valid content to create a QR code'}</span></div>{authConfigured()&&(['Website','Facebook','Instagram','X','Spotify','Product','Location'].includes(type)||/^https?:\/\//i.test(sourcePayload)||trackingActive)&&<div className="qr-tracking-options"><label>QR Code Mode</label><div className="qr-mode-buttons"><button type="button" aria-pressed={!trackingActive} disabled={trackingBusy} onClick={()=>setTracked(null)}>{needsHosting?'Direct page QR':'Static QR'}</button><button type="button" aria-pressed={trackingActive} disabled={trackingBusy||trackingActive||!/^https?:\/\//i.test(sourcePayload)} onClick={enableTracking}>{trackingBusy&&!trackingActive?'Creating…':needsHosting?'Track page visits':'Dynamic QR'}</button></div><p>{trackingActive?'Change the destination later without printing a new QR. Scan statistics are included.':'Static QR stores your link directly. Choose Dynamic QR to edit the destination later (sign in required).'}</p><label htmlFor="tracking-title">QR title</label><input id="tracking-title" disabled={trackingActive||trackingBusy} maxLength={80} placeholder={type+' QR Code'} value={trackingTitle} onChange={e=>setTrackingTitle(e.target.value)}/>{trackingActive&&<><p>{tracked?.active?'Dynamic QR is active. Download to save automatically, then use Edit Content to change its destination.':'This dynamic QR is paused. Resume it in Statistics.'}</p>{destinationChanged&&<><p role="status">Save the updated destination before downloading or saving this QR.</p><button disabled={trackingBusy||!/^https?:\/\//i.test(sourcePayload)} onClick={enableTracking}>{trackingBusy?'Updating…':'Update destination'}</button></>}<a href="/account?view=qr">Manage my dynamic QR codes</a></>}</div>}<div className="qr-export-options"><label>Format<select value={format} onChange={e=>setFormat(e.target.value)}>{exportFormats.map(f=><option key={f}>{f}</option>)}</select></label><label>Size<select value={size} onChange={e=>setSize(e.target.value)}>{exportSizes.map(n=><option key={n} value={n}>{n}×{n} px</option>)}</select></label></div><div className="qr-export-actions"><button className="qr-download" disabled={!payload||!preview||lowContrast||destinationChanged||trackingBusy||exportBusy||hostedDirty||contentBusy} onClick={download}>{exportBusy?'Downloading…':'Download QR Code'}</button><button className="qr-icon-button" aria-label="Share QR content" disabled={!payload} onClick={share}><Share2 size={21}/></button><button className="qr-icon-button" aria-label="Copy QR content" disabled={!payload} onClick={async()=>{if(!payload)return;try{await navigator.clipboard.writeText(payload);setMessage('QR content copied.');}catch{setMessage('Clipboard unavailable.');}}}><Copy size={21}/></button></div>{lowContrast&&<p className="qr-contrast-warning" role="status">Choose darker QR and eye colors against the background to enable download.</p>}{message&&<div className="qr-feedback" role="status">{message}<button aria-label="Dismiss message" onClick={()=>setMessage('')}>×</button></div>}</aside></div></div></section>}</Localized>;
}
