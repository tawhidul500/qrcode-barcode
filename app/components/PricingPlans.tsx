'use client';
import {useEffect,useState} from 'react';
import {detectCurrency,validRates,convertBDT,formatPrice,type RateTable} from '../lib/pricing-currency';
import {visitorRegion} from '../lib/visitor-region';
import {Check} from 'lucide-react';
import {Localized} from './i18n/LanguageProvider';
import {pricingPlans,pricingContactHref} from '../lib/pricing';

export default function PricingPlans(){
 const [currency,setCurrency]=useState('BDT');
 const [numberLocale,setNumberLocale]=useState('en-BD');
 const [rates,setRates]=useState<RateTable|null>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  setNumberLocale(navigator.language||'en-BD');
  const fallback=detectCurrency(navigator.languages?.length?navigator.languages:[navigator.language]);
  const controller=new AbortController();let active=true;
  const timer=setTimeout(()=>controller.abort(),8000);
  const options={signal:controller.signal,credentials:'omit' as const,referrerPolicy:'no-referrer' as const};
  const locate=async()=>{
   const data=await visitorRegion();
   if(!/^[A-Z]{3}$/.test(data.currency))throw new Error('Invalid currency');
   return data.currency as string;
  };
  const loadRates=async()=>{
   try{const cached:unknown=JSON.parse(localStorage.getItem('qr-pricing-rates')||'null');if(validRates(cached))return cached;}catch{}
   const response=await fetch('https://open.er-api.com/v6/latest/USD',options);
   if(!response.ok)throw new Error('Rates unavailable');
   const data=await response.json();const table={rates:data.rates,fetchedAt:Date.now()};
   if(data.result!=='success'||data.base_code!=='USD'||!validRates(table))throw new Error('Invalid rates');
   try{localStorage.setItem('qr-pricing-rates',JSON.stringify(table));}catch{}
   return table;
  };
  Promise.allSettled([locate(),loadRates()]).then(([location,result])=>{
   if(!active)return;
   setCurrency(location.status==='fulfilled'?location.value:fallback);
   if(result.status==='fulfilled')setRates(result.value);
   setLoading(false);
  }).finally(()=>clearTimeout(timer));
  return()=>{active=false;clearTimeout(timer);controller.abort();};
 },[]);
 const displayCurrency=currency==='BDT'||(rates&&rates.rates[currency])?currency:'BDT';
 const money=(amount:number)=>loading?'…':formatPrice(convertBDT(amount,displayCurrency,rates?.rates||{BDT:1}),displayCurrency,numberLocale);
 return <Localized><section className="pricing-hero" aria-labelledby="pricing-title">
  <header className="pricing-heading">
   <h1 id="pricing-title">Find the right plan for your QR projects</h1>
   <p>Start simple or scale up with more capacity and insights. Save up to 45% with a yearly plan.</p>
  </header>
  <div className="pricing-grid" aria-busy={loading}>
   {pricingPlans.map(plan=><article className={'pricing-card'+(plan.popular?' is-popular':'')} key={plan.id} aria-labelledby={'plan-'+plan.id}>
    {plan.popular&&<div className="pricing-popular">Most Popular</div>}
    <div className="pricing-card-content">
     <h2 id={'plan-'+plan.id}>{plan.name}</h2>
     <p className="pricing-description">{plan.description}</p>
     <p className="pricing-amount"><strong translate="no" dir="ltr">{money(Number(plan.price))}</strong><span>/month</span></p>
     <p className="pricing-billing">{plan.id==='free'?'Free forever':<>Save <bdi translate="no">{money(plan.id==='lite'?5792.17:10856.78)}</bdi> per year</>}</p>
     <ul>{plan.features.map(feature=><li key={feature}><span className="pricing-check" aria-hidden="true"><Check size={11} strokeWidth={3}/></span><span>{feature}</span></li>)}</ul>
     <a className="pricing-cta" href={pricingContactHref(plan)} aria-label={'Get started with '+plan.name} aria-describedby="pricing-availability">Get Started</a>
    </div>
   </article>)}
  </div>
  <p className="pricing-availability" id="pricing-availability">Base prices are in BDT; other currencies are estimates. These are proposed plans; subscriptions and the listed account features are coming soon. Get Started opens a plan enquiry.</p>
  {!loading&&displayCurrency!==currency&&<p className="pricing-availability" role="status">Local rates are temporarily unavailable. Prices are shown in BDT.</p>}
  <p className="pricing-rate-source"><a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">Rates by ExchangeRate-API</a></p>
 </section></Localized>;
}
