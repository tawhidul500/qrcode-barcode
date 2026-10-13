import {translate} from './i18n/translate';
import type {Locale} from './i18n/locales';

// Proposed plan content adapted from the supplied reference, in BDT per month.
// Subscriptions and account-based plan benefits are not activated by this page.
export const pricingPlans=[
 {id:'free',name:'Free',description:'A simple starting point for everyday QR sharing.',price:'0',billing:'Free forever',popular:false,
  features:['Create up to 10,000 QR codes','Unlimited code scans','QR codes with no expiry','Unlimited trackable QR codes','Unlimited team members','Organize codes in unlimited folders','Ready-to-use QR designs','Scan analytics with 1-year history','100 MB of file storage','Ad-supported QR codes']},
 {id:'lite',name:'Lite',description:'More history and flexibility for growing projects.',price:'751.35',billing:'Save ৳5,792.17 per year',popular:true,
  features:['Create up to 10,000 QR codes','Unlimited code scans','QR codes with no expiry','Unlimited trackable QR codes','Unlimited team members','Organize codes in unlimited folders','Ready-to-use QR designs','Scan analytics with 3-year history','100 MB of file storage','One ad-free QR code in total']},
 {id:'premium',name:'Premium',description:'Higher capacity and connected tools for larger teams.',price:'1070.46',billing:'Save ৳10,856.78 per year',popular:false,
  features:['Create up to 1,000,000 QR codes','Unlimited code scans','QR codes with no expiry','Unlimited trackable QR codes','Unlimited team members','Organize codes in unlimited folders','Ready-to-use QR designs','Email alerts after every scan','Scan analytics with 3-year history','Connect your workflows through the API','500 MB of file storage','Ad-free QR codes and app experience']}
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
