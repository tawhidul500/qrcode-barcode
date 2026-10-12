'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {Localized} from './i18n/LanguageProvider';

const resources=[
 {name:'Blog',icon:'blog',href:'/blog',description:'Explore Guides, Tips, And Latest Updates About QR Codes, Barcodes, And Digital Tools.'},
 {name:'Contact Us',icon:'contact',href:'/contact',description:'Get In Touch With Our Support Team For Questions, Feedback, Or Assistance.'},
 {name:'Mobile App',icon:'mobile',href:'/#mobile-app',description:'Create, Scan, And Manage QR Codes Anytime With Our Powerful Mobile Application.'},
 {name:'FAQ',icon:'faq',href:'/faq',description:'Find Quick Answers To Common Questions About QR Codes, Barcodes, And Our Services.'}
] as const;

export default function ResourcesMenu({active,onNavigate}:{active?:'blog'|'contact'|'faq';onNavigate:()=>void}){
 const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const hoverOpened=useRef(false);
 const id=useId();
 const clearTimer=()=>{if(timer.current!==null){clearTimeout(timer.current);timer.current=null;}};
 const close=(restoreFocus=false)=>{clearTimer();hoverOpened.current=false;setOpen(false);if(restoreFocus)trigger.current?.focus();};
 useEffect(()=>()=>{if(timer.current!==null)clearTimeout(timer.current);},[]);
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node)){setOpen(false);hoverOpened.current=false;}};
  document.addEventListener('pointerdown',outside);
  return()=>document.removeEventListener('pointerdown',outside);
 },[open]);
 const focusItem=(last=false)=>requestAnimationFrame(()=>{
  const items=root.current?.querySelectorAll<HTMLAnchorElement|HTMLButtonElement>('.resources-item');
  if(items?.length)items[last?items.length-1:0].focus();
 });
 return <Localized><div ref={root} className={'resources-menu'+(open?' is-open':'')}
  onPointerEnter={event=>{
   clearTimer();
   if(event.pointerType==='mouse'&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    if(!open)hoverOpened.current=true;
    setOpen(true);
   }
  }}
  onPointerLeave={event=>{
   if(event.pointerType!=='mouse')return;
   clearTimer();
   timer.current=setTimeout(()=>{
    if(!root.current?.contains(document.activeElement)){setOpen(false);hoverOpened.current=false;}
   },180);
  }}
  onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))close();}}
  onKeyDown={event=>{if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();close(true);}}}>
  <button ref={trigger} type="button" className={'home-nav-link resources-trigger'+(active?' is-active':'')} aria-expanded={open} aria-controls={id}
   onClick={()=>{clearTimer();if(hoverOpened.current){hoverOpened.current=false;setOpen(true);}else setOpen(!open);}}
   onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();hoverOpened.current=false;setOpen(true);focusItem(event.key==='ArrowUp');}}}>
   Resources<ChevronDown size={12} aria-hidden="true"/>
  </button>
  <div id={id} className="resources-panel" hidden={!open}><div className="resources-grid">
   {resources.map(item=>{
    const content=<><img className="resources-icon" src={'/assets/resources/'+item.icon+'.svg'} width={42} height={42} alt="" aria-hidden="true"/><span className="resources-copy"><span className="resources-title">{item.name}</span><span className="resources-description">{item.description}</span></span><svg className="resources-arrow" viewBox="0 0 14 20" width="14" height="20" fill="none" aria-hidden="true"><path d="m3 2.5 7.5 7.5L3 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>;
    return <a key={item.icon} className="resources-item" href={item.href} aria-current={active===item.icon?'page':undefined} onClick={()=>{close();onNavigate();}}>{content}</a>;
   })}
  </div></div>
 </div></Localized>;
}

