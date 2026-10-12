/** Local article previews. Pagination is derived from this catalog, not mock page numbers. */
export const blogArticles=[
 {id:'scan-qr-online',image:'scan',title:'How to Scan a QR Code Online',description:'Once you find a QR code — whether on a product, a poster, a payment gateway, or for tourist information — you can use your device’s camera to instantly scan it. Simply point your camera at the QR code to be scanned, and you’re done.'},
 {id:'why-qr-matters',image:'matter',title:'Why QR Codes Matter',description:'Don’t let your codes fail! Master the art of contrast, quiet zones, and sizing to ensure your QR codes and barcodes scan perfectly every single time.'},
 {id:'qr-industries',image:'industries',title:'QR Codes Across Industries',description:'Which one is right for your project? We compare speed, capacity, and use cases.'},
 {id:'custom-qr-generators',image:'custom',title:'Custom QR Code Generators',description:'A complete breakdown of 1D and 2D data formats. Learn which technology offers the best speed, security, and data capacity for your specific business needs.'},
 {id:'mastering-barcodes',image:'barcodes',title:'Mastering Barcodes',description:'A deep dive into how 1D barcodes work and why they remain the standard for retail. A deep dive into how 1D barcodes work and why they remain the standard for retail.'},
 {id:'customer-engagement',image:'engagement',title:'Transforming Customer Engagement',description:'Discover how modern brands use customized QR codes to bridge the gap between physical products and digital experiences through interactive marketing.'},
 {id:'static-qr-codes',image:'scan',title:'Static QR Codes Explained',description:'Static QR codes do not have a built-in expiration date. A code containing a link will remain useful while the destination is available. Changes to passwords, contact details, or linked pages can affect what happens when it is scanned.'},
 {id:'reliable-code-design',image:'matter',title:'Design Codes That Scan Reliably',description:'Test your exported barcode with the intended scanner before printing. Keep adequate contrast, a clear margin around the code and sufficient print size. Decorative templates and colors can affect readability.'},
 {id:'business-qr-codes',image:'industries',title:'QR Codes for Your Business',description:'Connect customers and colleagues to your business information. Share a review page, attendance form, digital contact card or hosted invoice through a personalized QR code.'},
 {id:'choose-barcode-format',image:'custom',title:'Choosing a Barcode Format',description:'Choose a barcode format for product numbers, labels, inventory or other data. Enter your content in the generator, customize the appearance, and download your barcode in PNG or SVG format.'},
 {id:'inventory-barcodes',image:'barcodes',title:'Barcodes for Inventory Management',description:'Yes. Generate labels for identifiers used by your inventory system. This page creates images; it does not store or track your inventory.'},
 {id:'print-to-website',image:'engagement',title:'From Print to Your Website',description:'Connect a printed code to your link list, business page, event, menu or special offer. Choose the kind of page you want to share and add its existing link in the QR code generator.'},
 {id:'qr-code-analytics',image:'scan',title:'QR Code Analytics: What to Know',description:'This generator does not count scans or provide a tracking dashboard. A static QR code containing a website link can send visitors to a page where you manage your own website analytics.'},
 {id:'understand-qr-generators',image:'matter',title:'Understanding QR Code Generators',description:'A QR code generator turns information into a scannable code. Enter your content, customize the design, and download your QR code. This generator creates static QR codes: to change the stored content, create a new code.'},
 {id:'barcode-scanners',image:'industries',title:'How Barcode Scanners Work',description:'A barcode scanner reads the bars and spaces on a label and converts them into numbers or text. Barcodes help identify products, track inventory, and organize everyday operations. Upload a clear image or use your camera to decode a barcode and see the information it contains.'},
 {id:'first-barcode',image:'custom',title:'Create Your First Barcode',description:'Create barcodes for your products, inventory and business. Choose the format that matches your data, customize the design, and download your code.'},
 {id:'choose-qr-type',image:'barcodes',title:'Finding the Right QR Code Type',description:'Choose the right code for your website, business or everyday needs. Explore QR code categories and barcode formats below, then open the generator to enter your content and customize your code.'},
 {id:'payment-qr-codes',image:'engagement',title:'QR Codes for Payments',description:'Share your existing payment destination with a QR code. Add your PayPal, cryptocurrency or payment-page details, customize the code, and check the destination before sharing it.'}
] as const;

export const blogPageSize=12;
export const blogPageCount=Math.ceil(blogArticles.length/blogPageSize);
export function resolveBlogPage(value:string|null):number{
 if(!value||!/^\d+$/.test(value))return 1;
 const page=Number(value);
 return Number.isSafeInteger(page)?Math.min(blogPageCount,Math.max(1,page)):1;
}
export function articlesForPage(page:number){
 const safePage=resolveBlogPage(String(page));
 return blogArticles.slice((safePage-1)*blogPageSize,safePage*blogPageSize);
}
export function blogPageHref(page:number){
 const safePage=resolveBlogPage(String(page));
 return (safePage===1?'/blog':'/blog?page='+safePage)+'#blog-articles';
}
