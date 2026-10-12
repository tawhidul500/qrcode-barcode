import type {Metadata} from 'next';
import SiteHeader from '../components/SiteHeader';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export const metadata:Metadata={title:'Frequently Asked Questions — QR & Barcode',description:'Find answers about creating, using and scanning QR codes and barcodes.'};
export default function FAQPage(){
 return <div className="homepage faq-page"><SiteHeader active="faq"/><main className="faq-page-main"><FAQ fullPage/></main><Footer/></div>;
}
