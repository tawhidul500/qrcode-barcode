export type Contact = {name:string;phone:string;email:string;organization:string;website:string};
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
export function buildPayload(type:string,value:string,wifi:{ssid:string;password:string;security:string},contact:Contact):string{
 const raw=value.trim();
 if(type==='Wi-Fi'){
  if(!wifi.ssid.trim())throw new Error('Enter your Wi-Fi network name.');
  if(wifi.security!=='nopass'&&!wifi.password)throw new Error('Enter your Wi-Fi password or choose No password.');
  return `WIFI:T:${wifi.security};S:${escapeWifi(wifi.ssid)};P:${wifi.security==='nopass'?'':escapeWifi(wifi.password)};;`;
 }
 if(type==='Contacts'||type==='Vcard'){
  if(!contact.name.trim())throw new Error('Enter the contact’s name.');
  if(contact.email&&!emailPattern.test(contact.email.trim()))throw new Error('Enter a valid contact email address.');
  const lines=['BEGIN:VCARD','VERSION:3.0',`FN:${escapeVcard(contact.name.trim())}`];
  if(contact.phone.trim())lines.push(`TEL:${phoneNumber(contact.phone.trim())}`);
  if(contact.email.trim())lines.push(`EMAIL:${escapeVcard(contact.email.trim())}`);
  if(contact.organization.trim())lines.push(`ORG:${escapeVcard(contact.organization.trim())}`);
  if(contact.website.trim())lines.push(`URL:${website(contact.website.trim())}`);
  return [...lines,'END:VCARD'].join('\r\n');
 }
 if(!raw)throw new Error('Enter your content to generate a QR code.');
 if(['Website','Facebook','Instagram','X','Spotify','Product','Location'].includes(type))return website(raw);
 if(type==='Email'){
  if(!emailPattern.test(raw))throw new Error('Enter a valid email address.');
  return `mailto:${encodeURIComponent(raw)}`;
 }
 if(['Phone','SMS','WhatsApp','Viber'].includes(type)){
  const phone=phoneNumber(raw);
  if(type==='Phone')return `tel:${phone}`;
  if(type==='SMS')return `sms:${phone}`;
  if(type==='WhatsApp')return `https://wa.me/${phone.replace(/^\+/,'')}`;
  return `viber://chat?number=${encodeURIComponent(phone)}`;
 }
 return raw;
}
