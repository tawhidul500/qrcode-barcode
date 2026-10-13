'use client';
import {createContext,useCallback,useContext,useEffect,useMemo,useState,useRef,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {locales,readLocale,saveLocale,validLocale,languageStorageKey,type Locale} from '../../lib/i18n/locales';
import {translate} from '../../lib/i18n/translate';
import {localizeTree} from '../../lib/i18n/localize-tree';
import LanguagePrompt from './LanguagePrompt';
import {suggestLanguage} from '../../lib/i18n/suggest-language';
import {visitorRegion} from '../../lib/visitor-region';
const LanguageContext=createContext({locale:'en' as Locale,setLocale:(_locale:Locale)=>{},t:(text:string)=>text});
const pageTitles:Record<string,string>={
 '/':'QR & Barcode — Generator',
 '/account':'My Account', '/auth/callback':'Completing sign in', '/forgot-password':'Forgot your password?', '/reset-password':'Set a new password',
 '/qr-code-generator':'Free QR Code Generator — Create & Customize',
 '/barcode-generator':'Free Barcode Generator — Create & Customize',
 '/scanner':'QR Code & Barcode Scanner — Scan Online',
 '/qr-barcode-types':'QR & Barcode Types — Choose Your Code',
 '/privacy-policy':'Privacy Policy',
 '/blog':'QR code articles', '/contact':'Contact Us', '/faq':'Frequently Asked Questions', '/pricing':'Pricing', '/login':'Sign In', '/signup':'Sign Up'
};
export function LanguageProvider({children,initialLocale='en'}:{children:ReactNode;initialLocale?:Locale}){
 const [locale,setLanguage]=useState<Locale>(initialLocale);
 const pathname=usePathname();
 const [suggested,setSuggested]=useState<Locale|null>(null);
 const chosen=useRef(false);
 useEffect(()=>{
  let active=true;
  try{const saved=window.localStorage.getItem(languageStorageKey);if(validLocale(saved)){chosen.current=true;setLanguage(readLocale(window.localStorage));}}catch{}
  if(!chosen.current){
   const browserLanguages=navigator.languages?.length?navigator.languages:[navigator.language];
   visitorRegion().then(region=>suggestLanguage(region.country_code,region.languages,browserLanguages)).catch(()=>suggestLanguage(undefined,'',browserLanguages)).then(next=>{if(active&&!chosen.current&&next!=='en')setSuggested(next);});
  }
  const update=(event:StorageEvent)=>{if(event.key===languageStorageKey){chosen.current=validLocale(event.newValue);setLanguage(validLocale(event.newValue)?event.newValue:'en');setSuggested(null);}};
  window.addEventListener('storage',update);
  return()=>{active=false;window.removeEventListener('storage',update);};
 },[]);
 const setLocale=useCallback((next:Locale)=>{if(!validLocale(next))return;chosen.current=true;setSuggested(null);setLanguage(next);try{saveLocale(window.localStorage,next);}catch{/* Language switching still works when storage is disabled. */}},[]);
 useEffect(()=>{document.documentElement.lang=locale==='en'?'en-US':locale;document.documentElement.dir=locales.find(item=>item.code===locale)!.dir;document.documentElement.dataset.language=locale;},[locale]);
 useEffect(()=>{document.title=translate(pageTitles[(pathname||'/').replace(/\/$/,'')||'/']||'This page could not be found.',locale);},[locale,pathname]);
 const value=useMemo(()=>({locale,setLocale,t:(text:string)=>translate(text,locale)}),[locale,setLocale]);
 return <LanguageContext.Provider value={value}>{children}{suggested&&<LanguagePrompt suggested={suggested} onChoose={setLocale}/>}</LanguageContext.Provider>;
}
export function useLanguage(){return useContext(LanguageContext);}
export function Localized({children}:{children:ReactNode}){const {locale}=useLanguage();return localizeTree(children,locale);}
