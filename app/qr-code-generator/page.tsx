import type {Metadata} from "next";
import SitePages from "../components/SitePages";
export const metadata:Metadata={title:"Free QR Code Generator — Create & Customize",description:"Create and customize QR codes for websites, Wi-Fi, text and contact details. Download PNG or SVG."};
export default function QRGeneratorPage(){return <SitePages qrPage/>;}
