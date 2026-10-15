export type Contact = {name:string;phone:string;email:string;organization:string;website:string;jobTitle?:string;address?:string;city?:string;region?:string;postcode?:string;country?:string};
export const emptyContact:Contact={name:'',phone:'',email:'',organization:'',website:''};
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function phoneNumber(value:string){
 const compact=value.replace(/[\s().-]/g,'');
 if(!/^\+?\d{6,15}$/.test(compact))throw new Error('Enter a phone number with 6–15 digits, including the country code.');
 return compact;
}
function website(value:string){
 let url:URL;
 try{url=new URL(value);}catch{throw new Error('Enter a complete website URL starting with https:// or http://.');}
 if(!['http:','https:'].includes(url.protocol)||!url.hostname||url.username||url.password)throw new Error('Use an HTTP or HTTPS URL without embedded login credentials.');
 return url.href;
}
const escapeWifi=(value:string)=>value.replace(/([\\;,:"])/g,'\\$1');
const escapeVcard=(value:string)=>value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
export function buildPayload(type:string,value:string,wifi:{ssid:string;password:string;security:string},contact:Contact,fields:Record<string,string>={}):string{
 const raw=value.trim();
 if(type==='Wi-Fi'){
  if(!wifi.ssid.trim())throw new Error('Enter your Wi-Fi network name.');
  if(wifi.security!=='nopass'&&!wifi.password)throw new Error('Enter your Wi-Fi password or choose No password.');
  return `WIFI:T:${wifi.security};S:${escapeWifi(wifi.ssid)};P:${wifi.security==='nopass'?'':escapeWifi(wifi.password)};${fields.hidden==='true'?'H:true;':''};`;
 }
 if(type==='Contacts'||type==='Vcard'){
  if(!contact.name.trim())throw new Error('Enter the contact’s name.');
  if(contact.email&&!emailPattern.test(contact.email.trim()))throw new Error('Enter a valid contact email address.');
  const lines=['BEGIN:VCARD','VERSION:3.0',`FN:${escapeVcard(contact.name.trim())}`,`N:${escapeVcard(contact.name.trim())};;;;`];
  if(contact.phone.trim())lines.push(`TEL:${phoneNumber(contact.phone.trim())}`);
  if(contact.email.trim())lines.push(`EMAIL:${escapeVcard(contact.email.trim())}`);
  if(contact.organization.trim())lines.push(`ORG:${escapeVcard(contact.organization.trim())}`);
  if(contact.jobTitle?.trim())lines.push(`TITLE:${escapeVcard(contact.jobTitle.trim())}`);
  if([contact.address,contact.city,contact.region,contact.postcode,contact.country].some(Boolean))lines.push('ADR:;;'+[contact.address,contact.city,contact.region,contact.postcode,contact.country].map(v=>escapeVcard(v||'')).join(';'));
  if(contact.website.trim())lines.push(`URL:${website(contact.website.trim())}`);
  return [...lines,'END:VCARD'].join('\r\n');
 }
 if(['Event','Calendar'].includes(type)&&fields.eventTitle){const start=new Date(fields.start),end=new Date(fields.end);if(!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||end<=start)throw new Error('Choose valid start and end times, with end after start.');const stamp=(d:Date)=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//QR Barcode//Event//EN','BEGIN:VEVENT','UID:'+stamp(start)+'.'+encodeURIComponent(fields.eventTitle)+'@qr-barcode','DTSTAMP:'+stamp(start),'DTSTART:'+stamp(start),'DTEND:'+stamp(end),'SUMMARY:'+escapeVcard(fields.eventTitle),'LOCATION:'+escapeVcard(fields.eventLocation||''),'DESCRIPTION:'+escapeVcard(fields.eventDescription||''),'END:VEVENT','END:VCALENDAR'].join('\r\n');}
 if(type==='Location'&&(fields.latitude||fields.longitude)){const lat=Number(fields.latitude),lng=Number(fields.longitude);if(!fields.latitude||!fields.longitude||!Number.isFinite(lat)||!Number.isFinite(lng)||lat < -90||lat>90||lng < -180||lng>180)throw new Error('Enter valid latitude and longitude.');return 'https://www.google.com/maps?q='+encodeURIComponent(lat+','+lng);}
 if(type==='Location'&&raw&&!/^https?:\/\//i.test(raw)&&/^[a-z][a-z0-9+.-]*:/i.test(raw))throw new Error('Use an address or an HTTP(S) map URL.');
 if(type==='Location'&&raw&&!/^https?:\/\//i.test(raw))return 'https://www.google.com/maps?q='+encodeURIComponent(raw);
 if(type==='UPI'&&raw&&!/^https?:\/\//i.test(raw)){if(!/^[A-Za-z0-9._-]{2,128}@[A-Za-z0-9.-]{2,50}$/.test(raw)||!fields.payeeName?.trim())throw new Error('Enter a valid UPI ID and payee name.');const q=new URLSearchParams({pa:raw,pn:fields.payeeName,cu:'INR'});if(fields.amount){if(!/^\d+(\.\d{1,2})?$/.test(fields.amount)||Number(fields.amount)<=0)throw new Error('Enter a positive INR amount with up to two decimals.');q.set('am',fields.amount);}if(fields.message)q.set('tn',fields.message);return 'upi://pay?'+q.toString();}
 if(type==='Crypto Payment'&&raw&&!/^https?:\/\//i.test(raw)){if(fields.asset==='ethereum'){if(!/^0x[0-9a-f]{40}$/i.test(raw))throw new Error('Enter an Ethereum address.');let suffix='';if(fields.amount){if(!/^\d+(\.\d{1,18})?$/.test(fields.amount))throw new Error('Enter a valid ETH amount.');const [whole,fraction='']=fields.amount.split('.');const wei=BigInt(whole)*BigInt('1000000000000000000')+BigInt(fraction.padEnd(18,'0'));suffix='?value='+wei;}return 'ethereum:'+raw+suffix;}if(!/^(?:[13][1-9A-HJ-NP-Za-km-z]{25,34}|bc1[a-z0-9]{25,90})$/.test(raw))throw new Error('Enter a Bitcoin address or a public checkout URL.');if(fields.amount&&!/^\d+(\.\d{1,8})?$/.test(fields.amount))throw new Error('Enter a BTC amount with up to eight decimals.');return 'bitcoin:'+raw+(fields.amount?'?amount='+fields.amount:'');}
 if(type==='Product'&&fields.productMode==='gtin'){if(!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(raw))throw new Error('Enter an 8, 12, 13 or 14 digit GTIN.');let sum=0;for(let i=raw.length-2,weight=3;i>=0;i--,weight=weight===3?1:3)sum+=Number(raw[i])*weight;if((10-sum%10)%10!==Number(raw.at(-1)))throw new Error('GTIN check digit is invalid.');return 'https://id.gs1.org/01/'+raw.padStart(14,'0');}
 if(!raw)throw new Error('Enter your content to generate a QR code.');
 if(type==='GA/UTM Link'){const url=new URL(website(raw));for(const k of ['source','medium','campaign','term','content'])if(fields[k])url.searchParams.set('utm_'+k,fields[k]);return url.href;}
 if(type==='Email'){
  if(!emailPattern.test(raw))throw new Error('Enter a valid email address.');
  const query=new URLSearchParams();if(fields.subject)query.set('subject',fields.subject);if(fields.message)query.set('body',fields.message);return `mailto:${encodeURIComponent(raw)}`+(query.size?'?'+query.toString().replace(/\+/g,'%20'):'');
 }
 if(['Phone','SMS','WhatsApp','Viber'].includes(type)){
  const phone=phoneNumber(raw);
  if(type==='Phone')return `tel:${phone}`;
  if(type==='SMS')return `sms:${phone}`+(fields.message?'?body='+encodeURIComponent(fields.message):'');
  if(type==='WhatsApp')return `https://wa.me/${phone.replace(/^\+/,'')}`+(fields.message?'?text='+encodeURIComponent(fields.message):'');
  return `viber://chat?number=${encodeURIComponent(phone)}`;
 }
 if(type==='Text')return raw;
 return website(raw);
}
