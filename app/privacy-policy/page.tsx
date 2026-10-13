import type {Metadata} from 'next';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import './privacy-policy.css';
import {siteURL} from '../lib/site-url';

export const metadata:Metadata={title:'Privacy Policy — QR & Barcode',description:'How QR & Barcode handles account information, Google sign-in, browser storage, and your privacy requests.'};
const contactEmail=process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL || 'gcappexplore1@gmail.com';
export default function PrivacyPolicyPage(){
 return <div className="homepage privacy-page"><SiteHeader/><PrivacyPolicyContent contactEmail={contactEmail} siteOrigin={siteURL()}/><Footer/></div>;
}
