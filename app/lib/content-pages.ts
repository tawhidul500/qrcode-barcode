import {fileTypes,hostedTypes,type ContentFields} from './qr-type-details';
const utcTime=(value:string)=>Date.parse(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value||'')?value+'Z':value);
export const contentSignature=(fields:ContentFields)=>JSON.stringify(Object.fromEntries(Object.entries(fields).filter(([k])=>!['password','clearPassword'].includes(k)).sort(([a],[b])=>a.localeCompare(b))));
export function publicURL(value:string){if(typeof value!=='string'||value.length>2048)throw new Error('Use links of up to 2,048 characters.');let url:URL;try{url=new URL(value);}catch{throw new Error('Enter complete HTTP(S) links.');}if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('Use HTTP(S) links without embedded credentials.');return url.href;}
export function splitLines(value:string,columns=2){const rows=value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(line=>line.split('|').map(s=>s.trim()));if(rows.length>50||rows.some(r=>r.length<columns))throw new Error('Use up to 50 correctly formatted rows.');return rows;}
export function validateContent(type:string,input:unknown,owner:string):ContentFields{
 if(type==='Custom URL'&&input&&typeof input==='object'&&!Array.isArray(input)){const mode=(input as ContentFields).routeMode;const alias:Record<string,string>={geo:'Geo Targeting',time:'Time Targeting',split:'Traffic Split',app:'Smart App'};if(alias[mode])return validateContent(alias[mode],input,owner);}
 if(![...hostedTypes,...fileTypes].includes(type))throw new Error('Unsupported hosted content type.');
 if(!input||typeof input!=='object'||Array.isArray(input)||JSON.stringify(input).length>220000)throw new Error('Content is too large.');
 const fields:ContentFields={};for(const [k,v] of Object.entries(input)){if(!/^[a-zA-Z][\w]{0,40}$/.test(k)||typeof v!=='string'||v.length>200000)throw new Error('Invalid content field.');if(!['password','clearPassword'].includes(k))fields[k]=v;}
 if(!fields.title?.trim()||fields.title.length>80)throw new Error('Enter a title of up to 80 characters.');
 for(const k of ['imageURL','actionURL','ios','android','target','fallback'])if(fields[k])fields[k]=publicURL(fields[k]);
 if(fields.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))throw new Error('Enter a valid email.');
 if(fields.expires&&(!/^\d{4}-\d{2}-\d{2}$/.test(fields.expires)||!Number.isFinite(Date.parse(fields.expires))||new Date(fields.expires).toISOString().slice(0,10)!==fields.expires))throw new Error('Choose a valid expiry date.');
 if(fileTypes.includes(type)){if(!fields.filePath?.startsWith(owner+'/')||fields.filePath.includes('..')||fields.filePath.length>300)throw new Error('Upload a file to your account first.');if(!fields.fileName||fields.fileName.length>150)throw new Error('Invalid file name.');fields.fileName=fields.fileName.replace(/[\r\n\0\/\\]/g,'_');}
 if(['Link List','Playlist','All-in-one Payment'].includes(type)&&!fields.links?.trim())throw new Error('Add at least one link.');
 if(fields.links)for(const row of splitLines(fields.links)){if(!row[0])throw new Error('Give every link a label.');publicURL(row.slice(1).join('|'));}
 if(type==='Smart App'&&(!fields.fallback||(!fields.ios&&!fields.android)))throw new Error('Add an app link and a fallback website.');
 if(type==='Geo Targeting'){if(!fields.fallback)throw new Error('Add a default destination.');for(const [country,url] of splitLines(fields.rules||'')){if(!/^[A-Z]{2}$/i.test(country))throw new Error('Use two-letter country codes, such as BD.');publicURL(url);}}
 if(type==='Time Targeting'){if(!fields.target||!fields.fallback||!Number.isFinite(utcTime(fields.start))||!Number.isFinite(utcTime(fields.end))||utcTime(fields.end)<=utcTime(fields.start))throw new Error('Add valid start/end UTC times and both destinations.');fields.start=new Date(utcTime(fields.start)).toISOString();fields.end=new Date(utcTime(fields.end)).toISOString();}
 if(type==='Traffic Split'){const rows=splitLines(fields.rules||'');if(!rows.length)throw new Error('Add weighted destinations.');for(const [weight,url] of rows){if(!/^\d+$/.test(weight)||Number(weight)<1||Number(weight)>10000)throw new Error('Use integer weights from 1 to 10,000.');publicURL(url);}}
 if(type==='Custom URL'&&fields.routeMode==='language'){if(!fields.fallback)throw new Error('Add a default destination.');for(const [language,url] of splitLines(fields.rules||'')){if(!/^[a-z]{2}(?:-[a-z]{2})?$/i.test(language))throw new Error('Use language codes such as en or bn-BD.');publicURL(url);}}
 if(type==='Custom URL'&&fields.routeMode==='count'){if(!/^\d+$/.test(fields.countLimit||'')||Number(fields.countLimit)<1||Number(fields.countLimit)>1000000||!fields.target||!fields.fallback)throw new Error('Add a visit limit and both destinations.');}
 if(type==='Custom URL'&&!['language','count'].includes(fields.routeMode)&&!fields.target)throw new Error('Add a destination.');
 if(type==='Coupon'&&!fields.code?.trim())throw new Error('Enter the coupon code.');
 if(['Menu','Invoice'].includes(type)){const rows=splitLines(fields.items||'',type==='Invoice'?3:2);if(!rows.length)throw new Error('Add at least one item.');if(type==='Invoice'&&rows.some(r=>!/^\d{1,9}(\.\d{1,2})?$/.test(r[1])||Number(r[1])<=0||!/^\d{1,9}(\.\d{1,2})?$/.test(r[2])))throw new Error('Invoice quantities and prices must be positive numbers with up to two decimals.');}
 if(type==='Email Action'&&(!fields.recipient||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.recipient)))throw new Error('Enter a valid email recipient.');
 if(['SMS Action','WhatsApp Action'].includes(type)&&!/^\+?\d{6,15}$/.test((fields.recipient||'').replace(/[\s().-]/g,'')))throw new Error('Enter a phone number with country code.');
 if(type.endsWith(' Action')&&(fields.message||'').length>5000)throw new Error('Use a message of up to 5,000 characters.');
 if(type==='Formatted Text'){if(!fields.text?.trim()||fields.text.length>100000)throw new Error('Enter up to 100,000 characters.');if(fields.richDoc){const nodes=JSON.parse(fields.richDoc);validateRichNodes(nodes);}}
 return fields;
}
export type RichNode={text?:string;tag?:string;children?:RichNode[];style?:Record<string,string>;href?:string};
const richTags=['p','div','br','h1','h2','h3','span','b','strong','i','em','u','s','strike','ul','ol','li','a'];
export function validateRichNodes(nodes:unknown,depth=0,budget={count:0}):asserts nodes is RichNode[]{
 if(!Array.isArray(nodes)||depth>20)throw new Error('Text formatting is too complex.');
 for(const n of nodes){if(++budget.count>5000||!n||typeof n!=='object')throw new Error('Text formatting is too complex.');if(n.text!==undefined){if(typeof n.text!=='string'||n.text.length>100000)throw new Error('Invalid formatted text.');continue;}if(!richTags.includes(n.tag))throw new Error('Unsupported text formatting.');if(n.href)publicURL(n.href);if(n.style){for(const [key,value] of Object.entries(n.style)){if(!['color','backgroundColor','fontFamily','fontSize','fontWeight','fontStyle','textDecoration','textAlign'].includes(key)||typeof value!=='string'||value.length>100||/[<>;{}]|url\(|expression/i.test(value))throw new Error('Invalid text style.');}}validateRichNodes(n.children||[],depth+1,budget);}
}
export function contentRedirect(type:string,fields:ContentFields,agent:string,country:string,now=Date.now(),random=Math.random,visits=0,language=''):string|null{
 if(type==='Custom URL'&&fields.routeMode){const alias:Record<string,string>={geo:'Geo Targeting',time:'Time Targeting',split:'Traffic Split',app:'Smart App'};if(alias[fields.routeMode])return contentRedirect(alias[fields.routeMode],fields,agent,country,now,random,visits,language);if(fields.routeMode==='count')return visits<=Number(fields.countLimit)?fields.target:fields.fallback;if(fields.routeMode==='language'){const locales=language.split(',').map(part=>{const [tag,...params]=part.trim().split(';');const weight=params.find(p=>p.trim().startsWith('q='))?.trim().slice(2);return {tag:tag.toLowerCase(),weight:weight===undefined?1:Number(weight)};}).filter(l=>Number.isFinite(l.weight)&&l.weight>0&&l.weight<=1).sort((a,b)=>b.weight-a.weight),rows=splitLines(fields.rules||'');for(const locale of locales){const found=rows.find(r=>r[0].toLowerCase()===locale.tag)||rows.find(r=>r[0].toLowerCase()===locale.tag.split('-')[0]);if(found)return found[1];}return fields.fallback;}}
 if(type==='Smart App')return /iphone|ipad|ipod/i.test(agent)?fields.ios||fields.fallback:/android/i.test(agent)?fields.android||fields.fallback:fields.fallback;
 if(type==='Geo Targeting')return splitLines(fields.rules||'').find(r=>r[0].toUpperCase()===country.toUpperCase())?.[1]||fields.fallback;
 if(type==='Time Targeting')return now>=utcTime(fields.start)&&now<=utcTime(fields.end)?fields.target:fields.fallback;
 if(type==='Traffic Split'){const rows=splitLines(fields.rules),total=rows.reduce((s,r)=>s+Number(r[0]),0);let pick=random()*total;for(const [weight,url] of rows){pick-=Number(weight);if(pick<0)return url;}return rows.at(-1)![1];}
 if(type==='Custom URL')return fields.target;return null;
}
