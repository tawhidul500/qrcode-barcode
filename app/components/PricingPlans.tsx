'use client';
import {Check} from 'lucide-react';
import {Localized} from './i18n/LanguageProvider';
import {pricingPlans,pricingContactHref} from '../lib/pricing';

export default function PricingPlans(){
 return <Localized><section className="pricing-hero" aria-labelledby="pricing-title">
  <header className="pricing-heading">
   <h1 id="pricing-title">Choose the best QR & Bar Code Plan For You</h1>
   <p>Explore plans for personal projects, growing teams, and businesses.</p>
  </header>
  <div className="pricing-grid">
   {pricingPlans.map(plan=><article className={'pricing-card'+(plan.popular?' is-popular':'')} key={plan.id} aria-labelledby={'plan-'+plan.id}>
    {plan.popular&&<div className="pricing-popular">Most Popular</div>}
    <div className="pricing-card-content">
     <h2 id={'plan-'+plan.id}>{plan.name}</h2>
     <p className="pricing-description">{plan.description}</p>
     <p className="pricing-amount"><strong translate="no" dir="ltr">${plan.price}</strong><span>/month</span></p>
     <p className="pricing-billing">Billed annually</p>
     <ul>{plan.features.map(feature=><li key={feature}><span className="pricing-check" aria-hidden="true"><Check size={11} strokeWidth={3}/></span><span>{feature}</span></li>)}</ul>
     <a className="pricing-cta" href={pricingContactHref(plan)} aria-label={'Get started with '+plan.name} aria-describedby="pricing-availability">Get Started</a>
    </div>
   </article>)}
  </div>
  <p className="pricing-availability" id="pricing-availability">Prices are in USD. Paid plans and premium features are coming soon. Get Started opens a plan enquiry.</p>
 </section></Localized>;
}
