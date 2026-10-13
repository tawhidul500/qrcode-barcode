import {validLocale,type Locale} from './i18n/locales';
export type AccountProfile={firstName:string;lastName:string;phones:string[];dateOfBirth:string;companyName:string;companyCategory:string;companyEmail:string;address:string;website:string;taxId:string;language:Locale;timezone:string;notifications:{productUpdates:boolean;tips:boolean}};
export const emptyProfile:AccountProfile={firstName:'',lastName:'',phones:[''],dateOfBirth:'',companyName:'',companyCategory:'',companyEmail:'',address:'',website:'',taxId:'',language:'en',timezone:'Asia/Dhaka',notifications:{productUpdates:false,tips:false}};
export function validateProfile(value:unknown):AccountProfile{
 if(!value||typeof value!=='object')throw new Error('Invalid profile.');
 const input=value as Record<string,unknown>,result={...emptyProfile} as AccountProfile;
 for(const [field,max] of Object.entries({firstName:80,lastName:80,companyName:160,companyCategory:80,companyEmail:254,address:500,website:2048,taxId:100,dateOfBirth:10,timezone:100})){
  const v=input[field];if(typeof v!=='string'||v.length>max)throw new Error('Invalid '+field+'.');
  (result as unknown as Record<string,unknown>)[field]=v.trim();
 }
 if(result.dateOfBirth){const date=new Date(result.dateOfBirth+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(result.dateOfBirth)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==result.dateOfBirth||date.getTime()>Date.now())throw new Error('Enter a valid date of birth.');}
 if(result.companyEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.companyEmail))throw new Error('Enter a valid company email.');
 if(result.website){try{const url=new URL(result.website);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error();}catch{throw new Error('Use a website starting with https:// or http://.');}}
 try{new Intl.DateTimeFormat('en',{timeZone:result.timezone});}catch{throw new Error('Select a valid time zone.');}
 if(!validLocale(input.language))throw new Error('Select a supported language.');result.language=input.language;
 if(!Array.isArray(input.phones)||input.phones.length>5||input.phones.some(v=>typeof v!=='string'||v.length>40||! /^[+\d\s().-]*$/.test(v)))throw new Error('Enter up to five valid contact phone numbers.');result.phones=input.phones.map(v=>v.trim());
 const prefs=input.notifications as Record<string,unknown>|undefined;
 if(!prefs||typeof prefs.productUpdates!=='boolean'||typeof prefs.tips!=='boolean')throw new Error('Invalid notification preferences.');result.notifications={productUpdates:prefs.productUpdates,tips:prefs.tips};return result;
}
