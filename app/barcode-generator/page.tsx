import type {Metadata} from 'next';
import SitePages from '../components/SitePages';
export const metadata:Metadata={title:'Free Barcode Generator — Create & Customize',description:'Create EAN, UPC, Code128, Code39, ISBN, PDF417 and Data Matrix barcodes. Customize templates, text and colors, then download PNG or SVG.'};
export default function BarcodeGeneratorPage(){return <SitePages barcodePage/>;}
