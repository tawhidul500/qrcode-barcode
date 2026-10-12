import type {Metadata} from 'next';
import ScannerPage from '../components/ScannerPage';
export const metadata:Metadata={title:'QR Code & Barcode Scanner — Scan Online',description:'Scan QR codes and barcodes from an image or your camera. Read code contents privately in your browser.'};
export default function Page(){return <ScannerPage/>;}
