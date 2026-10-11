"use client";
import HomeHero from "./HomeHero";
import HowItWorks from "./HowItWorks";
import Blog from "./Blog";
import FAQ from "./FAQ";
import Footer from "./Footer";
import AppBanner from "./AppBanner";
import Generator from "./Generator";
import BarcodeGenerator from "./BarcodeGenerator";
import ThreeSteps from "./ThreeSteps";
import IntroductionCards from "./IntroductionCards";
import QRTypesGrid from "./QRTypesGrid";
import Testimonials from "./Testimonials";
import {useState} from "react";
import {ChevronDown, Globe, Menu, X} from "lucide-react";
const menus=[{label:"Scanner",items:["QR Code Scanner","Barcode Scanner"]},{label:"QR Code All Types",items:["Website","Wi-Fi","Text","Contacts","Email","WhatsApp"]},{label:"Resources",items:["Blog","FAQ","Help Center"]}];
export default function SitePages({qrPage=false}:{qrPage?:boolean}){
 const [selectedType,setSelectedType]=useState('Website');
 const [mobile,setMobile]=useState(false),[notice,setNotice]=useState("");
 return <div className={"homepage"+(qrPage?" qr-generator-page":"")}><header className="home-header"><div className="home-header-inner">
 <a href="/" className="home-brand" aria-label="QR and barcode home"><img src="/assets/svg/Group 42404.svg" alt=""/><span>QR &amp; barcode</span></a>
 <button className="home-menu-toggle" aria-label={mobile?"Close navigation":"Open navigation"} aria-expanded={mobile} onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button>
 <nav className={"home-navigation"+(mobile?" is-open":"")} aria-label="Main navigation">
 <a href="/" className={"home-nav-link"+(!qrPage?" is-active":"")} aria-current={!qrPage?"page":undefined}>Home</a><a href="/qr-code-generator" className={"home-nav-link"+(qrPage?" is-active":"")} aria-current={qrPage?"page":undefined} onClick={()=>setMobile(false)}>QR Code Generator</a>
 <a className="home-nav-link" href="/#barcode-generator" onClick={()=>setMobile(false)}>Barcode Generator</a>
 {menus.map(menu=><details className="home-dropdown" key={menu.label}><summary>{menu.label}<ChevronDown size={12}/></summary><div className="home-dropdown-panel">{menu.items.map(item=><button key={item} onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");if(item==="FAQ"||item==="Blog"){setMobile(false);document.getElementById(item==="FAQ"?"faq":"blog")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}else if(["Website","Wi-Fi","Text","Contacts","Email","WhatsApp"].includes(item)){setSelectedType(item);setMobile(false);document.getElementById("generator")?.scrollIntoView({behavior:"smooth"});}else setNotice(item+" will be added later.");}}>{item}</button>)}</div></details>)}
 <button className="home-nav-link" onClick={()=>setNotice("Pricing will be added later.")}>Pricing</button>
 <div className="home-account"><a className="home-sign-in" href="/login">Sign In</a><a className="home-sign-up" href="/signup">Sign Up</a></div>
 <details className="home-dropdown home-language"><summary><Globe size={19}/>EN<ChevronDown size={12}/></summary><div className="home-dropdown-panel"><button onClick={e=>e.currentTarget.closest("details")?.removeAttribute("open")}>English</button><button onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");setNotice("Bangla translation will be added later.");}}>বাংলা</button></div></details>
 </nav></div></header><main className="home-stage">{!qrPage&&<HomeHero/>}<Generator selectedType={selectedType} onTypeChange={setSelectedType} standalone={qrPage}/>{qrPage?<><ThreeSteps/><IntroductionCards/><QRTypesGrid selectedType={selectedType} limit={16} compact onChoose={type=>{setSelectedType(type);document.getElementById("generator")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});requestAnimationFrame(()=>document.getElementById(type==="Wi-Fi"?"wifi-name":"qr-content")?.focus({preventScroll:true}));}}/></>:<><BarcodeGenerator/><HowItWorks/></>}<AppBanner qrOnly={qrPage}/>{qrPage&&<Testimonials/>}<FAQ/><Blog/></main><Footer/>
 {notice&&<div className="home-toast" role="status">{notice}<button aria-label="Dismiss notification" onClick={()=>setNotice("")}><X size={18}/></button></div>}</div>;
}
