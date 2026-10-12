import type {Metadata} from 'next';
import SiteHeader from '../components/SiteHeader';
import ContactPageContent from '../components/ContactPageContent';
import Footer from '../components/Footer';

export const metadata:Metadata={title:'Contact Us — QR & Barcode',description:'Get help with QR codes and barcodes, ask a question, or share your feedback with our team.'};
export default function ContactPage(){
 return <div className="homepage contact-page"><SiteHeader active="contact"/><ContactPageContent/><Footer/></div>;
}
