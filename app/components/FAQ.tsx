'use client';
import {useEffect,useReducer,useRef} from 'react';
import {ChevronDown} from 'lucide-react';
import {Localized,useLanguage} from './i18n/LanguageProvider';
import {createFaqState,faqGroups,faqHref,faqReducer,nextFaqQuestion,resolveFaqTab,type FaqTab} from '../lib/faq';

export default function FAQ({barcodeDefault=false,fullPage=false}:{barcodeDefault?:boolean;fullPage?:boolean}){
 const [{tab,open},dispatch]=useReducer(faqReducer,barcodeDefault?1:0,createFaqState);
 const tabs=useRef<Array<HTMLButtonElement|null>>([]);
 const questions=useRef<Array<Array<HTMLButtonElement|null>>>([[],[]]);
 const {t}=useLanguage();
 const [firstWord,...headingRest]=t('Frequently Asked Questions').split(' ');
 const Heading=fullPage?'h1':'h2';
 useEffect(()=>{
  if(!fullPage)return;
  const sync=()=>dispatch({type:'select',tab:resolveFaqTab(new URLSearchParams(window.location.search).get('tab'))});
  sync();window.addEventListener('popstate',sync);
  return()=>window.removeEventListener('popstate',sync);
 },[fullPage]);
 function select(index:FaqTab){
  if(index===tab)return;
  dispatch({type:'select',tab:index});
  if(fullPage)window.history.pushState(null,'',faqHref(index));
 }
 return <Localized><section className="home-faq" id="faq" aria-labelledby="faq-heading">
  <div className="faq-inner">
   <Heading id="faq-heading" translate="no"><span>{firstWord}</span>{headingRest.length?' '+headingRest.join(' '):''}</Heading>
   <div className="faq-tabs" role="tablist" aria-label="Frequently asked question categories">
    {faqGroups.map((group,index)=><button key={group.label} type="button" role="tab" id={`faq-tab-${index}`} aria-controls={`faq-panel-${index}`} aria-selected={tab===index} tabIndex={tab===index?0:-1} ref={element=>{tabs.current[index]=element;}} onClick={()=>select(index as FaqTab)} onKeyDown={event=>{
     let next:FaqTab;
     if(event.key==='ArrowRight'||event.key==='ArrowLeft')next=(1-index) as FaqTab;
     else if(event.key==='Home')next=0;
     else if(event.key==='End')next=1;
     else return;
     event.preventDefault();select(next);tabs.current[next]?.focus();
    }}>{group.label}</button>)}
   </div>
   {faqGroups.map((group,index)=><div key={group.label} role="tabpanel" id={`faq-panel-${index}`} aria-labelledby={`faq-tab-${index}`} hidden={tab!==index} className="faq-list">
    {group.questions.map(([question,answer],item)=>{
     const expanded=tab===index&&open===item;
     return <article className={`faq-item${expanded?' is-open':''}`} key={question}>
      <h3><button type="button" id={`faq-question-${index}-${item}`} aria-expanded={expanded} aria-controls={`faq-answer-${index}-${item}`} ref={element=>{questions.current[index][item]=element;}}
       onClick={()=>dispatch({type:'toggle',question:item})}
       onKeyDown={event=>{const next=nextFaqQuestion(item,event.key,group.questions.length);if(next!==null){event.preventDefault();questions.current[index][next]?.focus();}}}>
       {question}<ChevronDown size={fullPage?36:20} strokeWidth={2} aria-hidden="true"/>
      </button></h3>
      <div id={`faq-answer-${index}-${item}`} role="region" aria-labelledby={`faq-question-${index}-${item}`} hidden={!expanded} className="faq-answer"><p>{answer}</p></div>
     </article>;
    })}
   </div>)}
  </div>
 </section></Localized>;
}
