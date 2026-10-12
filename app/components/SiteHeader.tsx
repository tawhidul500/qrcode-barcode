"use client";
import {Localized} from './i18n/LanguageProvider';
import {useState} from 'react';
import LanguageSelector from './i18n/LanguageSelector';
import ResourcesMenu from './ResourcesMenu';
import AccountControls from './AccountControls';
import {Menu,X} from 'lucide-react';

type Page = 'home'|'qr'|'barcode'|'scanner'|'types'|'blog'|'contact'|'faq'|'pricing';
export default function SiteHeader({active='home'}:{active?:Page}) {
 const [mobile,setMobile]=useState(false);
 const close=()=>setMobile(false);
 return <Localized>{<><header className="home-header"><div className="home-header-inner">
  <a href="/" className="home-brand" aria-label="QR and barcode home"><img src="/assets/svg/Group 42404.svg" alt=""/><span>QR &amp; barcode</span></a>
  <button className="home-menu-toggle" aria-label={mobile?'Close navigation':'Open navigation'} aria-expanded={mobile} aria-controls="main-navigation" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button>
  <nav id="main-navigation" className={'home-navigation'+(mobile?' is-open':'')} aria-label="Main navigation">
   {([['home','/','Home'],['qr','/qr-code-generator','QR Code Generator'],['barcode','/barcode-generator','Barcode Generator']] as const).map(([id,url,label])=><a key={id} href={url} className={'home-nav-link'+(active===id?' is-active':'')} aria-current={active===id?'page':undefined}>{label}</a>)}
   <a href="/scanner" className={'home-nav-link'+(active==='scanner'?' is-active':'')} aria-current={active==='scanner'?'page':undefined} onClick={close}>Scanner</a>
   <a href="/qr-barcode-types" className={'home-nav-link'+(active==='types'?' is-active':'')} aria-current={active==='types'?'page':undefined} onClick={close}>QR &amp; Barcode Types</a>
   <ResourcesMenu active={active==='blog'||active==='contact'||active==='faq'?active:undefined} onNavigate={close}/>
   <a href="/pricing" className={'home-nav-link'+(active==='pricing'?' is-active':'')} aria-current={active==='pricing'?'page':undefined} onClick={close}>Pricing</a>
   <AccountControls/>
  </nav>
  <LanguageSelector/>
 </div></header></>}</Localized>;
}
