import {translate} from './i18n/translate';
import type {Locale} from './i18n/locales';

// Values are transcribed from the supplied pricing design, in USD per month.
// These describe proposed annual plans; this page does not activate subscriptions.
export const pricingPlans=[
 {id:'basic',name:'Basic',description:'Perfect for personal use & small projects',price:'9.0',popular:false,
  features:['50 Dynamic QR Codes','Unlimited Scans','Create QR & Barcode','8 Users','Basic Analytics','Standard Template','Email Support']},
 {id:'advanced',name:'Advanced',description:'Great for businesses and growing teams',price:'15.40',popular:true,
  features:['250 Dynamic QR Codes','Unlimited Scans','Create QR & Barcode','10 Users','Advanced Analytics','Custom Branding & Templates','Bulk QR/Barcode Generation','Export (PNG, SVG, PDF)']},
 {id:'professional',name:'Professional',description:'For large enterprises & high-volume usage',price:'9.04',popular:false,
  features:['1000+ Dynamic QR Codes','Unlimited Scans','Create QR & Barcode','25 Users','Advanced Analytics & Tracking','White Label Solution','Bulk Generation (10K+)','VIP Support']}
] as const;
export type PricingPlan=typeof pricingPlans[number];

export function findPricingPlan(id:string|null):PricingPlan|undefined{
 return pricingPlans.find(plan=>plan.id===id);
}
export function pricingContactHref(plan:PricingPlan):string{
 return '/contact?plan='+encodeURIComponent(plan.id);
}
export function pricingInquiry(search:string,locale:Locale):string{
 const plan=findPricingPlan(new URLSearchParams(search).get('plan'));
 return plan?translate("I'm interested in the {value} plan. Please send me availability and subscription details.".replace('{value}',plan.name),locale):'';
}
