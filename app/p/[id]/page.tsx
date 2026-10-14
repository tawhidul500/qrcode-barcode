import {cookies,headers} from 'next/headers';
import {notFound,redirect} from 'next/navigation';
import {createElement,type CSSProperties} from 'react';
import {getContentPage,pageExpired,canViewContent,pageCookieName,contentVisit} from '../../lib/server/content-pages';
import {contentRedirect,splitLines,validateRichNodes,type RichNode} from '../../lib/content-pages';
import {buildPayload,emptyContact} from '../../lib/qr-content';
import {fileTypes} from '../../lib/qr-type-details';
import './public-content.css';
export const dynamic='force-dynamic';export const runtime='nodejs';
export const metadata={title:'Shared QR content',robots:{index:false,follow:false}};
function rich(nodes:RichNode[]):React.ReactNode[]{return nodes.map((n,i)=>n.text!==undefined?n.text:createElement(n.tag||'span',{key:i,style:n.style as CSSProperties,href:n.href,rel:n.href?'noopener noreferrer':undefined},...rich(n.children||[])));}
export default async function ContentPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;let page;try{page=await getContentPage(id);}catch{notFound();}if(!page)notFound();
 if(!page.active||pageExpired(page))return <main className="public-content"><h1>Content unavailable</h1><p>This page has been unpublished or has expired.</p></main>;
 const jar=await cookies();if(!canViewContent(page,jar.get(pageCookieName(id))?.value))return <main className="public-content"><h1>Password protected</h1><p>Enter the password supplied by the QR owner.</p><form method="post" action={'/p/'+id+'/unlock'}><label>Password<input type="password" name="password" required maxLength={128} autoComplete="off"/></label><button>Open content</button></form></main>;
 const requestHeaders=await headers();let visits=Number(page.visits||0);if(page.type==='Custom URL'&&page.data.routeMode==='count'&&!/bot|crawler|spider|preview/i.test(requestHeaders.get('user-agent')||'')&&!requestHeaders.get('next-router-prefetch'))visits=await contentVisit(page);const destination=contentRedirect(page.type,page.data,requestHeaders.get('user-agent')||'',requestHeaders.get('x-vercel-ip-country')||'',Date.now(),Math.random,visits,requestHeaders.get('accept-language')||'');if(destination)redirect(destination);
 const d=page.data,rows=d.items?splitLines(d.items,page.type==='Invoice'?3:2):[],links=d.links?splitLines(d.links):[];let formatted:RichNode[]=[];if(d.richDoc){try{formatted=JSON.parse(d.richDoc);validateRichNodes(formatted);}catch{formatted=[];}}
 return <main className="public-content"><header><span className="public-content-kind">{page.type}</span><h1>{d.title}</h1>{d.description&&<p className="public-description">{d.description}</p>}</header>
  {d.imageURL&&<img className="public-cover" src={d.imageURL} alt="" referrerPolicy="no-referrer"/>}
  {page.type==='Formatted Text'&&<article className="public-rich">{formatted.length?rich(formatted):<p>{d.text}</p>}</article>}
  {fileTypes.includes(page.type)&&<section><p>{d.fileName}</p>{['Image','PNG','Logo','Shaped'].includes(page.type)&&<img className="public-cover" src={'/p/'+id+'/file?inline=1'} alt={d.title}/>} {page.type==='PDF'&&<iframe title="PDF preview" sandbox="" src={'/p/'+id+'/file?inline=1'} style={{width:'100%',height:480,border:'1px solid #d4e3f8'}}/>} {page.type==='Video'&&<video controls preload="metadata" src={'/p/'+id+'/file?inline=1'}/>} {page.type==='MP3 / Audio'&&<audio controls preload="metadata" src={'/p/'+id+'/file?inline=1'}/>}<a className="public-button" href={'/p/'+id+'/file'}>Download file</a></section>}
  {page.type.endsWith(' Action')&&<section><p>{d.recipient}</p><p>{d.message}</p><a className="public-button" href={buildPayload(page.type.replace(' Action',''),d.recipient,{ssid:'',password:'',security:'WPA'},emptyContact,d)}>Open {page.type.replace(' Action','')} app</a></section>}
  {page.type==='Coupon'&&<section><h2>Coupon code</h2><p className="public-coupon">{d.code}</p>{d.expires&&<p>Valid through {d.expires} (UTC).</p>}</section>}
  {page.type==='Business Page'&&<section>{d.address&&<p>{d.address}</p>}{d.phone&&<p>{d.phone}</p>}{d.email&&<a href={'mailto:'+encodeURIComponent(d.email)}>{d.email}</a>}</section>}
  {page.type==='Invoice'&&<section><p>{d.business} {d.customer&&'→ '+d.customer}</p><p>Reference: {d.reference}</p></section>}
  {rows.length>0&&<table><thead><tr><th>{page.type==='Invoice'?'Item':'Menu item'}</th><th>{page.type==='Invoice'?'Quantity':'Price'}</th><th>{page.type==='Invoice'?'Unit price':'Description'}</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table>}
  {page.type==='Invoice'&&<p className="public-total">Total: {d.currency||''} {rows.reduce((s,r)=>s+Number(r[1])*Number(r[2]),0).toFixed(2)}</p>}
  {links.length>0&&<nav aria-label="Shared links">{links.map((r,i)=><a className="public-button secondary" key={i} href={r.slice(1).join('|')} rel="noopener noreferrer">{r[0]}</a>)}</nav>}
  {d.actionURL&&<a className="public-button" href={d.actionURL} rel="noopener noreferrer">{page.type==='Invoice'?'Open payment page':page.type==='Coupon'?'View offer':'Visit website'}</a>}
  <footer>Created with QR &amp; barcode</footer>
 </main>;
}
