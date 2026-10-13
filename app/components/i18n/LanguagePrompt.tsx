'use client';
import {useEffect,useRef} from 'react';
import {locales,type Locale} from '../../lib/i18n/locales';
const localButtons:Record<Locale,string>={en:'Continue in English',ar:'المتابعة بالعربية',es:'Continuar en español','es-MX':'Continuar en español','fr':'Continuer en français',id:'Lanjutkan dalam Bahasa Indonesia','pt-BR':'Continuar em português',tr:'Türkçe devam et',bn:'বাংলায় চালিয়ে যান',ru:'Продолжить на русском'};
export default function LanguagePrompt({suggested,onChoose}:{suggested:Locale;onChoose:(locale:Locale)=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const language=locales.find(item=>item.code===suggested)!;
 useEffect(()=>{const element=dialog.current;if(!element)return;const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';if(!element.open)element.showModal();return()=>{element.close();document.body.style.overflow=overflow;previous?.focus();};},[]);
 return <dialog ref={dialog} className="language-welcome" aria-labelledby="language-welcome-title" aria-describedby="language-welcome-description" lang="en" dir="ltr" translate="no" onCancel={event=>{event.preventDefault();onChoose('en');}} onClick={event=>{if(event.target===event.currentTarget){const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)onChoose('en');}}}>
  <button type="button" className="language-welcome-close" aria-label="Close and continue in English" onClick={()=>onChoose('en')}>×</button>
  <h2 id="language-welcome-title">Choose your language</h2>
  <p id="language-welcome-description">Would you like to browse in <span lang={suggested} dir="auto">{language.name}</span> or English?</p>
  <div className="language-welcome-actions"><button type="button" lang={suggested} dir={language.dir} onClick={()=>onChoose(suggested)}>{localButtons[suggested]}</button><button type="button" onClick={()=>onChoose('en')}>Continue in English</button></div>
  <p className="language-welcome-hint">You can change your language anytime in the menu.</p>
 </dialog>;
}
