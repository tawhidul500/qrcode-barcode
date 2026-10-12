import {Localized} from '../components/i18n/LanguageProvider';
import type {CSSProperties} from 'react';
import type {Metadata} from 'next';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import {qrTypes} from '../lib/qr-types';
import {barcodeTypes} from '../lib/barcode-types';
import {codeTypeGroups,codeTypeLabels} from '../lib/code-type-catalog';
import {catalogIconSizes} from '../lib/catalog-icon-sizes';

export const metadata:Metadata = {
 title:'QR & Barcode Types — Choose Your Code',
 description:'Explore QR code types for websites, Wi-Fi, contacts, social media, documents and more, plus 15 barcode options. Choose a type to open the generator.'
};

function TypeCard({name,icon,barcode=false}:{name:string;icon:string;barcode?:boolean}) {
 const label=codeTypeLabels[name]||name;
 return <Localized>{<article className="code-type-card">
  <div className="code-type-icon"><img src={icon} alt="" width="80" height="80" loading="lazy" style={{'--icon-size':`${catalogIconSizes[icon]||80}px`} as CSSProperties}/></div>
  <h3>{label}</h3>
  <a className="code-type-choose" href={`${barcode?'/barcode-generator':'/qr-code-generator'}?type=${encodeURIComponent(name)}`} aria-label={`Choose ${label} ${barcode?'barcode':'QR code'}`}>Choose</a>
 </article>}</Localized>;
}

export default function CodeTypesPage() {
 return <Localized>{<div className="homepage code-types-page">
  <SiteHeader active="types"/>
  <main>
   <section className="code-types-hero" aria-labelledby="code-types-title">
    <h1 id="code-types-title">Create a QR Code &amp; Barcode For <span>Types</span></h1>
    <p>Choose the right code for your website, business or everyday needs. Explore QR code categories and barcode formats below, then open the generator to enter your content and customize your code.</p>
   </section>
   <div className="code-types-catalog">
    {codeTypeGroups.map(group=><section className={`code-types-group code-types-group--${group.id}`} id={group.id} aria-labelledby={`types-${group.id}`} key={group.id}>
     <div className="code-types-group-heading"><h2 id={`types-${group.id}`}>{group.title}</h2><p>{group.description}</p></div>
     <div className="code-types-grid">{group.types.map(name=><TypeCard key={name} name={name} icon={'/assets/svg/'+qrTypes.find(([type])=>type===name)![1]}/>)}</div>
    </section>)}
    <section className="code-types-group code-types-group--barcode" id="barcode-types" aria-labelledby="types-barcode">
     <div className="code-types-group-heading"><h2 id="types-barcode">Create a Barcode For <span>Types</span></h2><p>Choose a barcode format for product numbers, labels, inventory or other data. Enter your content in the generator, customize the appearance, and download your barcode in PNG or SVG format.</p></div>
     <div className="code-types-grid">{barcodeTypes.map(([name],index)=><TypeCard key={name} name={name} barcode icon={`/assets/updated/barcode-icon-${index}.svg`}/>)}</div>
    </section>
   </div>
  </main>
  <Footer/>
 </div>}</Localized>;
}
