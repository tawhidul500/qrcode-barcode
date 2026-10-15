'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Localized} from './i18n/LanguageProvider';
import {contactLimits,deliverContact,validateContact,type ContactErrors,type ContactValues} from '../lib/contact';
import {pricingInquiry} from '../lib/pricing';
import {readLocale,type Locale} from '../lib/i18n/locales';

const emptyValues:ContactValues={name:'',email:'',message:''};
const endpoint=process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;
const features=[
 {icon:'response',title:'Fast Response',description:'Usually Within 24 Hours'},
 {icon:'support',title:'Expert Support',description:'Get Help From Our Team'},
 {icon:'feedback',title:'Your Feedback Matters',description:'Help Us Build A Better Product'}
] as const;

export default function ContactPageContent(){
 const [values,setValues]=useState<ContactValues>(emptyValues);
 const [errors,setErrors]=useState<ContactErrors>({});
 const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const controller=useRef<AbortController|null>(null);
 useEffect(()=>{
  let locale:Locale='en';
  try{locale=readLocale(window.localStorage);}catch{/* Keep English when storage is unavailable. */}
  const message=pricingInquiry(window.location.search,locale);
  if(message)setValues(previous=>previous.message?previous:{...previous,message});
 },[]);
 useEffect(()=>()=>{controller.current?.abort();controller.current=null;},[]);
 const edit=(field:keyof ContactValues,value:string)=>{
  setValues(previous=>({...previous,[field]:value}));setStatus('');
  setErrors(previous=>({...previous,[field]:undefined}));
 };
 const blur=(field:keyof ContactValues)=>setErrors(previous=>({...previous,[field]:validateContact(values)[field]}));
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(controller.current)return;
  const nextErrors=validateContact(values);setErrors(nextErrors);setStatus('');
  const first=(['name','email','message'] as const).find(field=>nextErrors[field]);
  if(first){(event.currentTarget.elements.namedItem(first) as HTMLElement|null)?.focus();return;}
  if(!endpoint?.trim()){
   setStatus('Message delivery is not available yet. Your message has not been sent.');return;
  }
  const request=new AbortController();controller.current=request;setBusy(true);
  const timeout=setTimeout(()=>request.abort(),20000);
  try{
   const result=await deliverContact(values,endpoint,request.signal);
   if(controller.current!==request)return;
   if(result==='accepted'){
    setStatus('Your message has been received. Thank you for contacting us.');setValues(emptyValues);
   }else{
    setStatus('We could not confirm delivery. Your message is still here; please try again.');
   }
  }finally{
   clearTimeout(timeout);
   if(controller.current===request){controller.current=null;setBusy(false);}
  }
 };
 return <Localized><main>
  <section className="contact-hero" aria-labelledby="contact-title"><div className="blog-heading">
   <h1 id="contact-title">Contact Us</h1>
   <p>Questions, feedback, or help with your QR codes and barcodes? Get in touch with our team.</p>
  </div></section>
  <section className="contact-section" aria-label="Contact and support"><div className="contact-layout">
   <div className="contact-form-card">
    <h2 id="contact-form-heading">Contact Us For Personalized Support</h2>
    <form className="contact-form" method="post" onSubmit={submit} noValidate aria-labelledby="contact-form-heading" aria-busy={busy}>
     <div className="contact-fields">
      <div className="contact-field"><label htmlFor="contact-name">Your Name</label>
       <input id="contact-name" name="name" type="text" autoComplete="name" dir="auto" required maxLength={contactLimits.name} value={values.name} placeholder="Your Name" readOnly={busy} onChange={event=>edit('name',event.target.value)} onBlur={()=>blur('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name?'contact-name-error':undefined}/>
       {errors.name&&<p className="contact-field-error" id="contact-name-error">{errors.name}</p>}
      </div>
      <div className="contact-field"><label htmlFor="contact-email">Your Email</label>
       <input id="contact-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={contactLimits.email} value={values.email} placeholder="Your Email" readOnly={busy} onChange={event=>edit('email',event.target.value)} onBlur={()=>blur('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email?'contact-email-error':undefined}/>
       {errors.email&&<p className="contact-field-error" id="contact-email-error">{errors.email}</p>}
      </div>
     </div>
     <div className="contact-field contact-message"><label htmlFor="contact-message">Your Message</label>
      <textarea id="contact-message" name="message" dir="auto" required maxLength={contactLimits.message} value={values.message} placeholder="Your Message" readOnly={busy} onChange={event=>edit('message',event.target.value)} onBlur={()=>blur('message')} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message?'contact-message-error':undefined}/>
      {errors.message&&<p className="contact-field-error" id="contact-message-error">{errors.message}</p>}
     </div>
     <button className="contact-submit" type="submit" disabled={busy} aria-describedby="contact-status">{busy?'Sending…':'Send Message'}</button>
     <p id="contact-status" className="contact-status" role="status" aria-live="polite" aria-atomic="true">{status||(!endpoint?.trim()?'Message delivery is not available yet.':'')}</p>
     <noscript><p className="contact-field-error">Please enable JavaScript to use this form.</p></noscript>
    </form>
   </div>
   <aside className="contact-support" aria-labelledby="contact-support-heading">
    <img className="contact-illustration" src="/assets/contact/support-illustration.webp" width={800} height={533} alt=""/>
    <h2 id="contact-support-heading">We’re Here To Help</h2>
    <p>Our Support Team Typically Responds Within 24 Hours. We’re Committed To Providing You With The Best Experience With Our QR Code And Barcode Tools.</p>
    <ul>{features.map(feature=><li key={feature.icon}><img src={'/assets/contact/'+feature.icon+'.svg'} width={40} height={40} alt=""/><div><h3>{feature.title}</h3><p>{feature.description}</p></div></li>)}</ul>
   </aside>
  </div></section>
 </main></Localized>;
}
