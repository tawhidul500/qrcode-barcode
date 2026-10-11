"use client";
import {useState} from 'react';
import {ArrowUp, ChevronDown} from 'lucide-react';
const columns=[
 {title:'Product',items:[['QR CODE GENERATOR','/qr-code-generator'],['Barcode Generator','/#barcode-generator'],['QR CODE Scan',''],['Barcode Scan',''],['QR Code all Types','/qr-code-generator'],['Barcode all Types','']]},
 {title:'Legal',items:[['Pricing',''],['FAQ','#faq'],['Blog','#blog'],['Contact Us',''],['Mobile App','#mobile-app']]},
 {title:'Company',items:[['Privacy Policy',''],['Terms & Conditions',''],['Help Center','']]}
];
export default function Footer(){
 const [message,setMessage]=useState('');
 const unavailable=(label:string)=>setMessage(`${label} is not available yet.`);
 return <footer className="home-footer" id="footer"><div className="footer-main">
  <div className="footer-about"><a className="footer-brand" href="/" aria-label="QR Code home"><img src="/assets/svg/Group 42404.svg" alt=""/><span>QR Code</span></a><p>Generate your QR codes with ease. Create codes for websites, contact details, Wi-Fi, and more.</p><h2>Download Our App</h2><p>Make life simpler with easy tools to create and scan QR codes.</p><div className="footer-badges">{[['googleplay','Google Play'],['appstore','App Store']].map(([asset,label])=><button type="button" key={asset} aria-label={`Download on ${label}`} onClick={()=>unavailable(`${label} download`)}><img src={`/assets/updated/${asset}.svg`} alt={label}/></button>)}</div></div>
  <div className="footer-links">{columns.map(column=><nav key={column.title} aria-label={`Footer ${column.title}`}><h2>{column.title}</h2><ul>{column.items.map(([label,href])=><li key={label}>{href?<a href={href}>{label}</a>:<button type="button" onClick={()=>unavailable(label)}>{label}</button>}</li>)}</ul></nav>)}</div>
  <div className="footer-newsletter"><h2>Our Newsletter</h2><p>Subscribe to our newsletter to receive our latest news and special offers.</p><form className="footer-subscribe" onSubmit={event=>{event.preventDefault();setMessage('Newsletter signup is not connected yet. Your email has not been sent or saved.');}}><label className="footer-sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Enter your email" autoComplete="email" required/><button type="submit">Subscribe</button></form><div className="footer-socials">{[['facebook','Facebook'],['instagram','Instagram'],['linkedin','LinkedIn']].map(([asset,label])=><button type="button" key={asset} aria-label={label} onClick={()=>unavailable(`${label} page`)}><img src={'/assets/svg/'+({facebook:'Group 36405.svg',instagram:'Group 1707496278.svg',linkedin:'Group 1707496532.svg'}[asset])} alt=""/></button>)}</div>{message&&<div className="footer-status" role="status">{message}</div>}</div>
  <button className="footer-back-top" type="button" aria-label="Back to top" onClick={()=>{window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});document.querySelector<HTMLAnchorElement>('.home-brand')?.focus({preventScroll:true});}}><ArrowUp size={30} aria-hidden="true"/></button>
 </div><div className="footer-bottom"><div className="footer-bottom-inner"><p>Copyright © 2025 All Rights Reserved</p><div className="footer-language"><label className="footer-sr-only" htmlFor="footer-language">Language</label><select id="footer-language" defaultValue="en"><option value="en">English</option></select><ChevronDown size={14} aria-hidden="true"/></div></div></div></footer>;
}
