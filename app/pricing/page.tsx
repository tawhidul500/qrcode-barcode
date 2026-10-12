import type {Metadata} from 'next';
import SiteHeader from '../components/SiteHeader';
import PricingPlans from '../components/PricingPlans';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export const metadata:Metadata={title:'Pricing — QR & Barcode',description:'Explore Basic, Advanced, and Professional QR code and barcode plans, compare features, and ask about availability.'};
export default function PricingPage(){
 return <div className="homepage pricing-page"><SiteHeader active="pricing"/><main>
  <PricingPlans/>
  <Testimonials staticLayout/>
  <FAQ/>
 </main><Footer/></div>;
}
