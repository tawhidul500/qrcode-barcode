'use client';
import {Localized} from './i18n/LanguageProvider';
import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
export default function BarcodeTypesModal({types,selectedType,onChoose,onClose}:{types:readonly (readonly [string,string,string])[];selectedType:number;onChoose:(index:number)=>void;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=dialog.current!;const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;el.showModal();document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=overflow;previous?.focus();};},[]);
 return <Localized>{<dialog ref={dialog} className="qr-picker barcode-types-modal" aria-labelledby="barcode-picker-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}><header className="qr-picker-header"><h2 id="barcode-picker-title">Choose All Types Of Barcodes</h2><button type="button" className="qr-picker-close" aria-label="Close barcode types" onClick={onClose} autoFocus><X size={24}/></button></header><div className="qr-picker-scroll"><div className="qr-picker-initial"><section className="qr-picker-group" aria-label="Popular Barcode"><h3>Popular Barcode</h3><div className="qr-picker-grid">{types.map(([name],i)=><button type="button" key={name} className="qr-picker-card" aria-pressed={selectedType===i} onClick={()=>{onChoose(i);onClose();}}><img src={`/assets/updated/barcode-icon-${i}.svg`} alt=""/><span>{name}</span></button>)}</div></section></div></div></dialog>}</Localized>;
}
