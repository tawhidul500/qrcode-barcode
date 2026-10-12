import {Children,cloneElement,Fragment,isValidElement,type ReactNode,type ReactElement} from 'react';
import {translate} from './translate';
import type {Locale} from './locales';
const textAttributes=['title','alt','placeholder','aria-label','aria-description','aria-roledescription'];
function optionText(node:ReactNode):string{return Children.toArray(node).map(child=>typeof child==='string'||typeof child==='number'?String(child):'').join('');}
/** Translate React's display tree only: never mutate the DOM, event handlers,
 * generator identifiers, form values, URLs, uploaded content or decoded data. */
export function localizeTree(node:ReactNode,locale:Locale):ReactNode{
 if(typeof node==='string')return translate(node,locale);
 if(Array.isArray(node))return node.map((child,index)=>{
  const localized=localizeTree(child,locale);
  // Cloned static JSX siblings need stable keys as well as mapped lists.
  return isValidElement(localized)&&localized.key===null?cloneElement(localized,{key:'i18n-'+index}):localized;
 });
 if(!isValidElement(node))return node;
 const element=node as ReactElement<Record<string,unknown>>;
 const props=element.props;
 if(props.translate==='no'||props['data-no-translate']||['pre','code','script','style','svg'].includes(String(element.type)))return node;
 // Each application component owns its own boundary. Its data props stay original.
 if(typeof element.type!=='string'&&element.type!==Fragment)return node;
 const updated:Record<string,unknown>={};
 for(const key of textAttributes)if(typeof props[key]==='string')updated[key]=translate(props[key],locale);
 if(element.type==='option'&&props.value===undefined)updated.value=optionText(props.children as ReactNode);
 if(props.children!==undefined&&element.type!=='textarea')updated.children=localizeTree(props.children as ReactNode,locale);
 return cloneElement(element,updated);
}
