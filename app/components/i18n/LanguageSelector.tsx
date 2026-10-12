'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Check,ChevronDown,Globe} from 'lucide-react';
import {locales} from '../../lib/i18n/locales';
import {useLanguage} from './LanguageProvider';
function Flag({country}:{country:string}){
 const id=useId();
 return <svg className="language-flag" viewBox="0 0 30 30" aria-hidden="true"><defs><clipPath id={id}><circle cx="15" cy="15" r="15"/></clipPath></defs><g clipPath={`url(#${id})`}>
 {country==='us'?<><path fill="#fff" d="M0 0h30v30H0z"/>{[0,4.6,9.2,13.8,18.4,23,27.6].map(y=><path key={y} fill="#d80027" d={`M0 ${y}h30v2.3H0z`}/>)}<path fill="#0052b4" d="M0 0h15v16H0z"/>{[4,9,14].map(y=>[3,8,13].map(x=><circle key={x+'-'+y} cx={x} cy={y-2} r=".8" fill="white"/>))}</>:null}
 {country==='sa'?<><path fill="#6da544" d="M0 0h30v30H0z"/><text x="15" y="17" textAnchor="middle" fill="white" fontSize="10" fontFamily="Arial">عربي</text><path d="M8 21h14" stroke="white" strokeWidth="1.5"/></>:null}
 {country==='es'?<><path fill="#d80027" d="M0 0h30v30H0z"/><path fill="#ffda44" d="M0 8h30v14H0z"/></>:null}
 {country==='mx'||country==='fr'?<><path fill={country==='mx'?'#6da544':'#0052b4'} d="M0 0h10v30H0z"/><path fill="#f5f5f5" d="M10 0h10v30H10z"/><path fill="#d80027" d="M20 0h10v30H20z"/>{country==='mx'&&<><path d="M12 16q3 7 6 0" fill="#6da544"/><path d="M12 14h6l-2 3h-2z" fill="#ff9811"/></>}</>:null}
 {country==='id'?<><path fill="#d80027" d="M0 0h30v15H0z"/><path fill="#f5f5f5" d="M0 15h30v15H0z"/></>:null}
 {country==='br'?<><path fill="#6da544" d="M0 0h30v30H0z"/><path fill="#ffda44" d="m15 5 12 10-12 10L3 15z"/><circle cx="15" cy="15" r="6" fill="#0052b4"/><path d="M9 13q6-1 12 5" fill="none" stroke="white" strokeWidth="2"/></>:null}
 {country==='tr'?<><path fill="#d80027" d="M0 0h30v30H0z"/><circle cx="12" cy="15" r="7" fill="white"/><circle cx="14" cy="15" r="5.6" fill="#d80027"/><path d="m22 11 1 3 3 .2-2.4 2 1 3-2.6-1.8-2.6 1.8 1-3-2.4-2 3-.2z" fill="white"/></>:null}
 {country==='bd'?<><path fill="#496e2d" d="M0 0h30v30H0z"/><circle cx="14" cy="15" r="7" fill="#d80027"/></>:null}
 {country==='ru'?<><path fill="#f5f5f5" d="M0 0h30v10H0z"/><path fill="#0052b4" d="M0 10h30v10H0z"/><path fill="#d80027" d="M0 20h30v10H0z"/></>:null}
 </g></svg>;
}
export default function LanguageSelector({footer=false}:{footer?:boolean}){
 const {locale,setLocale,t}=useLanguage();const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),items=useRef<(HTMLButtonElement|null)[]>([]);const id=useId();
 const selected=locales.find(item=>item.code===locale)!;
 useEffect(()=>{if(!open)return;items.current[locales.findIndex(item=>item.code===locale)]?.focus();const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[open,locale]);
 return <div ref={root} className={'language-selector'+(footer?' language-selector--footer':'')} translate="no" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setOpen(false);}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.current?.focus();}}}>
  <button ref={trigger} type="button" className="language-trigger" aria-label={t('Language')} aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)} onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true);}}}><Globe size={19}/><span>{footer?selected.name:selected.short}</span><ChevronDown size={12}/></button>
  {open&&<div className="language-menu" id={id} role="menu" aria-label={t('Language')} dir="ltr">{locales.map((item,index)=><button key={item.code} ref={element=>{items.current[index]=element;}} type="button" role="menuitemradio" aria-checked={locale===item.code} className={'language-option'+(locale===item.code?' is-selected':'')} tabIndex={locale===item.code?0:-1} onClick={()=>{setLocale(item.code);setOpen(false);trigger.current?.focus();}} onKeyDown={event=>{let next=index;if(event.key==='ArrowDown')next=(index+1)%locales.length;else if(event.key==='ArrowUp')next=(index+locales.length-1)%locales.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=locales.length-1;else return;event.preventDefault();items.current[next]?.focus();}}><Flag country={item.flag}/><span lang={item.code} dir="auto">{item.name}</span>{locale===item.code&&<Check size={21} strokeWidth={3}/>}</button>)}</div>}
 </div>;
}
