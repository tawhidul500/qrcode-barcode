'use client';
import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {locales,readLocale,saveLocale,validLocale,languageStorageKey,type Locale} from '../../lib/i18n/locales';
import {translate} from '../../lib/i18n/translate';
import {localizeTree} from '../../lib/i18n/localize-tree';
const LanguageContext=createContext({locale:'en' as Locale,setLocale:(_locale:Locale)=>{},t:(text:string)=>text});
const pageTitles:Record<string,string>={
 '/':'QR & Barcode — Generator',
 '/account':'My Account', '/auth/callback':'Completing sign in', '/forgot-password':'Forgot your password?', '/reset-password':'Set a new password',
 '/qr-code-generator':'Free QR Code Generator — Create & Customize',
 '/barcode-generator':'Free Barcode Generator — Create & Customize',
 '/scanner':'QR Code & Barcode Scanner — Scan Online',
 '/qr-barcode-types':'QR & Barcode Types — Choose Your Code',
 '/blog':'QR code articles', '/contact':'Contact Us', '/faq':'Frequently Asked Questions', '/pricing':'Pricing', '/login':'Sign In', '/signup':'Sign Up'
};
export function LanguageProvider({children,initialLocale='en'}:{children:ReactNode;initialLocale?:Locale}){
 const [locale,setLanguage]=useState<Locale>(initialLocale);
 const pathname=usePathname();
 useEffect(()=>{try{setLanguage(readLocale(window.localStorage));}catch{/* Storage may be blocked. */}const update=(event:StorageEvent)=>{if(event.key===languageStorageKey)setLanguage(validLocale(event.newValue)?event.newValue:'en');};window.addEventListener('storage',update);return()=>window.removeEventListener('storage',update);},[]);
 const setLocale=useCallback((next:Locale)=>{if(!validLocale(next))return;setLanguage(next);try{saveLocale(window.localStorage,next);}catch{/* Storage may be blocked. */}},[]);
 useEffect(()=>{document.documentElement.lang=locale==='en'?'en-US':locale;document.documentElement.dir=locales.find(item=>item.code===locale)!.dir;document.documentElement.dataset.language=locale;},[locale]);
 useEffect(()=>{document.title=translate(pageTitles[(pathname||'/').replace(/\/$/,'')||'/']||'This page could not be found.',locale);},[locale,pathname]);
 const value=useMemo(()=>({locale,setLocale,t:(text:string)=>translate(text,locale)}),[locale,setLocale]);
 return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){return useContext(LanguageContext);}
export function Localized({children}:{children:ReactNode}){const {locale}=useLanguage();return localizeTree(children,locale);}
