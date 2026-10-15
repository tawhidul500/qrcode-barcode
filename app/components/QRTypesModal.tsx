'use client';
import {Localized} from './i18n/LanguageProvider';
import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
import {qrTypes} from '../lib/qr-types';
const groups:[string,string[]][]=[
 ['Popular',['Website','Wi-Fi','Text','Contacts','SMS','Phone','Location','WhatsApp','Facebook','Instagram','Email','Viber','X','Spotify','Product','Vcard','PDF']],
 ['Landing Page',['Link List','Mini Website','Coupon','Smart App','Event','Playlist','Business Page','Menu','Feedback']],
 ['Social Media',['Facebook','Instagram','Telegram','Viber','X','TikTok','LinkedIn','Snapchat','YouTube','Reddit','Discord','Pinterest']],
 ['Document',['Any File','Office 365','PCR/Certificate','Word/DOCX','Google Docs','Google Sheets']],
 ['Contact',['Contacts','SMS','Phone','Location']],
 ['Media',['Video','MP3 / Audio','Image','PNG']],
 ['Payments',['PayPal','Crypto Payment','Payment link','Stripe']],
 ['Smart Tools',['GA/UTM Link','Geo Targeting','Time Targeting','Traffic Split']],
 ['Business',['Review','Attendance','Vcard','Invoice']],
 ['Apps',['App store','Google Play','Galaxy Store','Huawei Gallery']]
];
export default function QRTypesModal({selectedType,onChoose,onClose}:{selectedType:string;onChoose:(type:string)=>void;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=dialog.current!;const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;el.showModal();document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=overflow;previous?.focus({preventScroll:true});};},[]);
 const section=([title,types]:[string,string[]])=><section className="qr-picker-group" key={title} aria-label={title}><h3>{title}</h3><div className="qr-picker-grid">{types.map(type=><button type="button" key={type} className="qr-picker-card" aria-pressed={selectedType===type} onClick={()=>{onChoose(type);onClose();}}><img src={'/assets/svg/'+qrTypes.find(([label])=>label===type)![1]} alt=""/><span>{type==='Vcard'?'V card':type}</span></button>)}</div></section>;
 return <Localized>{<dialog ref={dialog} className="qr-picker" aria-labelledby="qr-picker-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}><header className="qr-picker-header"><h2 id="qr-picker-title">Choose All Types Of QR Codes</h2><button type="button" className="qr-picker-close" aria-label="Close QR code types" onClick={onClose} autoFocus><X size={24}/></button></header><div className="qr-picker-scroll"><div className="qr-picker-initial">{groups.slice(0,2).map(section)}</div><div className="qr-picker-more">{groups.slice(2).map(section)}</div></div></dialog>}</Localized>;
}
