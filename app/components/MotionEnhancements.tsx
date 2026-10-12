'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

const revealTargets=[
 '.how-grid>li','.steps-row','.introduction-card','.qr-type-card',
 '.code-types-group-heading','.code-type-card','.blog-heading','.blog-card',
 '.scanner-info-row','.app-banner-copy','.qr-testimonials>header',
 '.faq-inner>h2','.faq-inner>h1','.footer-about','.footer-links>nav','.footer-newsletter',
 '.contact-form-card','.contact-support','.pricing-card'
].join(',');

/** Finite scroll entrances only. Content never depends on JS to become visible. */
export default function MotionEnhancements(){
 const pathname=usePathname();
 useEffect(()=>{
  if(!window.matchMedia)return;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let dispose=()=>{};
  const start=()=>{
   dispose();
   if(preference.matches||!window.IntersectionObserver||!window.MutationObserver||!Element.prototype.animate)return;
   const seen=new WeakSet<Element>();
   const animations=new Map<Element,Animation>();
   const cancel=()=>{animations.forEach(animation=>animation.cancel());animations.clear();};
   const observer=new IntersectionObserver(entries=>{
    if(document.hidden)return;
    let order=0;
    for(const entry of entries){
     if(!entry.isIntersecting)continue;
     observer.unobserve(entry.target);
     if(entry.target.contains(document.activeElement))continue;
     const animation=entry.target.animate(
      [{opacity:0,translate:'0 14px'},{opacity:1,translate:'0 0'}],
      {duration:500,delay:Math.min(order++,3)*55,easing:'cubic-bezier(.2,.7,.25,1)',fill:'backwards'}
     );
     animations.set(entry.target,animation);
     animation.onfinish=()=>animations.delete(entry.target);
    }
   },{threshold:0.06});
   const register=(element:Element)=>{
    if(seen.has(element))return;
    seen.add(element);observer.observe(element);
   };
   const collect=(element:Element)=>{
    if(element.matches(revealTargets))register(element);
    element.querySelectorAll(revealTargets).forEach(register);
   };
   collect(document.body);
   // Register new blog cards or other content introduced by existing controls.
   const mutations=new MutationObserver(records=>{
    for(const record of records){
     for(const node of record.removedNodes)if(node instanceof Element){
      observer.unobserve(node);node.querySelectorAll(revealTargets).forEach(element=>observer.unobserve(element));
     }
     for(const node of record.addedNodes)if(node instanceof Element)collect(node);
    }
    for(const [element,animation] of animations)if(!element.isConnected){animation.cancel();animations.delete(element);}
   });
   mutations.observe(document.body,{childList:true,subtree:true});
   const focus=(event:FocusEvent)=>{
    for(const [element,animation] of animations)if(event.target instanceof Node&&element.contains(event.target)){
     animation.cancel();animations.delete(element);
    }
   };
   document.addEventListener('focusin',focus);
   document.addEventListener('visibilitychange',cancel);
   dispose=()=>{observer.disconnect();mutations.disconnect();cancel();document.removeEventListener('focusin',focus);document.removeEventListener('visibilitychange',cancel);};
  };
  start();
  preference.addEventListener('change',start);
  return()=>{dispose();preference.removeEventListener('change',start);};
 },[pathname]);
 return null;
}

