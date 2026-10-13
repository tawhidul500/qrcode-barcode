'use client';
import {useEffect,useRef} from 'react';
// Tall cards scroll naturally until their bottom fits; short cards pin below the header.
export function stickyPreviewTop(viewport:number,height:number){return Math.min(88,viewport-height-16);}
export default function useStickyPreview(){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{const element=ref.current;if(!element)return;
  const measure=()=>element.style.setProperty('--preview-sticky-top',`${stickyPreviewTop(window.innerHeight,element.getBoundingClientRect().height)}px`);
  measure();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);observer?.observe(element);window.addEventListener('resize',measure);
  return()=>{observer?.disconnect();window.removeEventListener('resize',measure);};
 },[]);return ref;
}
