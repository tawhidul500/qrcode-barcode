"use client";
import {Localized} from './i18n/LanguageProvider';
import SiteHeader from './SiteHeader';
import ScannerPanel from './ScannerPanel';
import AppBanner from './AppBanner';
import FAQ from './FAQ';
import Footer from './Footer';
export default function ScannerPage(){
 return <Localized>{<div className="homepage scanner-page"><SiteHeader active="scanner"/><main>
  <section className="scanner-hero" aria-labelledby="scanner-title"><div className="scanner-heading"><h1 id="scanner-title">Scan <span>QR Code or Barcode</span><br/>In your Browser</h1><p>Easily create, organize, and analyze your<br/>QR code &amp; Barcode in one place</p></div><ScannerPanel/></section>
  <section className="scanner-information" aria-label="About QR and barcode scanning">
   <article className="scanner-info-row"><div className="scanner-info-copy"><h2>What is a QR Code Scanner?</h2><p>A QR Code scanner reads both black and white square patterns and instantly takes you to useful information. QR Codes enable brands to connect offline to online, and bridge the physical and digital worlds. Our tool quickly scans and decodes QR Codes, providing you with immediate access to the information they contain.</p><a className="scanner-learn-more" href="#faq">Learn More</a></div><div className="scanner-info-art"><div className="scanner-photo-frame"><img src="/assets/scanner/qr-scanner.webp" width="1552" height="1013" loading="lazy" alt="A woman holding a phone with a QR code"/></div></div></article>
   <article className="scanner-info-row scanner-info-row--reverse"><div className="scanner-info-copy"><h2>What is a Barcode Scanner?</h2><p>A barcode scanner reads the bars and spaces on a label and converts them into numbers or text. Barcodes help identify products, track inventory, and organize everyday operations. Upload a clear image or use your camera to decode a barcode and see the information it contains.</p><a className="scanner-learn-more" href="#faq">Learn More</a></div><div className="scanner-info-art"><div className="scanner-photo-frame"><img src="/assets/scanner/barcode-scanner.webp" width="1536" height="1024" loading="lazy" alt="A handheld barcode scanner reading a shipping label on a box"/></div></div></article>
  </section>
  <AppBanner scannerDesign/><FAQ/>
 </main><Footer/></div>}</Localized>;
}
