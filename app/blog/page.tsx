import type {Metadata} from 'next';
import SiteHeader from "../components/SiteHeader";
import Footer from '../components/Footer';
import BlogIndex from '../components/BlogIndex';

export const metadata:Metadata={title:'QR Code Articles — QR & Barcode',description:'Articles, guides, and practical tips for creating and scanning QR codes and barcodes.'};

export default function BlogPage(){
 return <div className="homepage blog-page"><SiteHeader active="blog"/><BlogIndex/><Footer/></div>;
}
