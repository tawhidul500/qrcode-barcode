import messages from './messages.json';
import type {Locale} from './locales';
export type Dictionary = Record<string,string>;
const dictionaries:Record<string,Dictionary>={...messages,'es-MX':{
 ...messages.es,
 'Upload Image':'Cargar imagen',
 'Upload logo':'Cargar logotipo',
 'Enter your email':'Ingresa tu correo electrónico',
 'Enter Your Email':'Ingresa tu correo electrónico',
 'Enter Your Name':'Ingresa tu nombre',
 'Enter Your Password':'Ingresa tu contraseña',
 'Enter your text':'Ingresa tu texto',
 'Choose A {value} image':'Selecciona una imagen de {value}',
 'Enter Data E.G. {value}':'Ingresa datos, p. ej., {value}',
 'Enter Your {value} Content:':'Ingresa el contenido de {value}:',
 'Enter Your {value}:':'Ingresa tu {value}:',
 'Enter Your Website Link:':'Ingresa el enlace de tu sitio web:',
 'Enter Your Text:':'Ingresa tu texto:',
 'Choose':'Seleccionar'
}};
export function normalize(text:string){return text.replace(/\s+/g,' ').trim().toLowerCase();}
const indexed:Record<string,Dictionary>=Object.fromEntries(Object.entries(dictionaries).map(([locale,entries])=>[locale,Object.fromEntries(Object.entries(entries).map(([key,value])=>[normalize(key),value]))]));
function escape(value:string){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
const patterns=Object.keys(dictionaries.es||{}).filter(key=>key.includes('{value}')).sort((a,b)=>b.replaceAll('{value}','').length-a.replaceAll('{value}','').length).map(key=>({key,regex:new RegExp('^'+key.split('{value}').map(escape).join('(.+?)')+'$','i')}));
export function translate(text:string,locale:Locale):string{
 if(locale==='en'||!text.trim())return text;
 const dictionary=indexed[locale]||{};
 const core=text.replace(/\s+/g,' ').trim();
 let result=Object.hasOwn(dictionary,normalize(core))?dictionary[normalize(core)]:undefined;
 if(!result){for(const {key,regex} of patterns){const match=core.match(regex);if(match){let index=0;result=dictionary[normalize(key)].replaceAll('{value}',()=>translate(match[++index],locale));break;}}}
 // Numeric sizes and stable standard/product names intentionally remain unchanged.
 if(!result)return text;
 return text.match(/^\s*/)?.[0]+result+text.match(/\s*$/)?.[0];
}
