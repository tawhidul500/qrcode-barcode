"use client";
import {Localized} from './i18n/LanguageProvider';
import HomeHero from "./HomeHero";
import HowItWorks from "./HowItWorks";
import Blog from "./Blog";
import FAQ from "./FAQ";
import Footer from "./Footer";
import AppBanner from "./AppBanner";
import Generator from "./Generator";
import BarcodeGenerator from "./BarcodeGenerator";
import BarcodePageSections from "./BarcodePageSections";
import ThreeSteps from "./ThreeSteps";
import IntroductionCards from "./IntroductionCards";
import QRTypesGrid from "./QRTypesGrid";
import Testimonials from "./Testimonials";
import {useEffect,useState} from "react";
import {barcodeTypes} from "../lib/barcode-types";
import SiteHeader from "./SiteHeader";
export default function SitePages({qrPage=false,barcodePage=false}:{qrPage?:boolean;barcodePage?:boolean}){
 const [barcodeType,setBarcodeType]=useState(0);
 const [selectedType,setSelectedType]=useState('Website');
 useEffect(()=>{
  if(!barcodePage)return;
  const requested=new URLSearchParams(window.location.search).get('type');
  const index=barcodeTypes.findIndex(([name])=>name===requested);
  if(index>=0)setBarcodeType(index);
 },[barcodePage]);
 return <Localized>{<div className={"homepage"+(qrPage?" qr-generator-page":"")+(barcodePage?" barcode-generator-page":"")}><SiteHeader active={barcodePage?"barcode":qrPage?"qr":"home"}/><main className="home-stage">{barcodePage?<><BarcodeGenerator standalone selectedType={barcodeType} onTypeChange={setBarcodeType}/><BarcodePageSections selectedType={barcodeType} onChoose={index=>{setBarcodeType(index);document.getElementById('barcode-generator')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});requestAnimationFrame(()=>document.getElementById('barcode-content')?.focus({preventScroll:true}));}}/><AppBanner barcodeOnly/><Testimonials/><FAQ barcodeDefault/><Blog barcodeDefault/></>:<>{!qrPage&&<HomeHero/>}<Generator selectedType={selectedType} onTypeChange={setSelectedType} standalone={qrPage}/>{qrPage?<><ThreeSteps/><IntroductionCards/><QRTypesGrid selectedType={selectedType} limit={16} compact onChoose={type=>{setSelectedType(type);document.getElementById("generator")?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});requestAnimationFrame(()=>document.getElementById(type==="Wi-Fi"?"wifi-name":"qr-content")?.focus({preventScroll:true}));}}/></>:<><BarcodeGenerator/><HowItWorks/></>}<AppBanner qrOnly={qrPage}/>{qrPage&&<Testimonials/>}<FAQ/><Blog/></>}</main><Footer/></div>}</Localized>;
}
