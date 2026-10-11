"use client";
import {useRef, useState} from 'react';
import {ChevronDown} from 'lucide-react';

const groups = [
 {label:'QR Code Basics', questions:[
  ['What Is A QR Code Generator?', 'A QR code generator turns information into a scannable code. Enter your content, customize the design, and download your QR code. This generator creates static QR codes: to change the stored content, create a new code.'],
  ['Are QR Codes Free?', 'You can create and download QR codes using this generator for free. No subscription is required to create a static QR code.'],
  ['Can I Use The Generated QR Codes For Commercial Purposes?', 'Yes. You can use your generated QR codes on packaging, business cards, signs, and other commercial materials. Make sure you have permission to use any linked content or logo, and test the finished code before printing.'],
  ['What Kind Of Information Can Be Stored In A QR Code?', 'QR codes can contain website links, text, Wi-Fi details, contact information, email addresses, phone numbers, locations, and links to social profiles. Select the matching type in the generator to enter your information.'],
  ['Is It Possible To Count The QR Codes Scans (Tracking, Analytics, Measuring)?', 'This generator does not count scans or provide a tracking dashboard. A static QR code containing a website link can send visitors to a page where you manage your own website analytics.'],
  ['How Long Are QR Codes Valid For? Do They Expire?', 'Static QR codes do not have a built-in expiration date. A code containing a link will remain useful while the destination is available. Changes to passwords, contact details, or linked pages can affect what happens when it is scanned.'],
  ['How Do I Manage QR Codes With A QR Code Generator?', 'Save your downloaded codes and a record of their content. To change information stored in a static code, generate and download a replacement. Account-based code management is not available in this version.']
 ]},
 {label:'Barcode Basics', questions:[
  ['Which Format Should I Use?', 'Choose EAN or UPC for retail product numbers, Code39 or Code128 for inventory, ITF-14 for shipping cartons, and PDF417 or Data Matrix when a compatible system needs a two-dimensional format.'],
  ['Do I Need To Register My Barcode With GS1 For Commercial Use?', 'A generated barcode image does not register or assign a retail product identifier. Check the requirements of your retailer and identifier issuer before using it commercially.'],
  ['What Is The Difference Between UPC, EAN, And Code128?', 'UPC and EAN encode standardized numeric product identifiers. Code128 can encode letters, numbers and other characters for general identification and inventory.'],
  ['Can I Generate Barcodes For Free Or Do I Need To Buy Them?', 'You can create and download barcode images here for free. Obtaining an assigned retail product identifier is a separate process.'],
  ['Which Barcode Type Should I Use For Retail Products?', 'Use the format required by your retailer, commonly EAN-13 or UPC-A, with a valid assigned product number.'],
  ['Will These Barcodes Scan Properly?', 'Test your exported barcode with the intended scanner before printing. Keep adequate contrast, a clear margin around the code and sufficient print size. Decorative templates and colors can affect readability.'],
  ['Can I Use Barcode Generators For Inventory Management?', 'Yes. Generate labels for identifiers used by your inventory system. This page creates images; it does not store or track your inventory.']
 ]}
] as const;

export default function FAQ({barcodeDefault=false}:{barcodeDefault?:boolean}){
 const [tab,setTab]=useState(barcodeDefault?1:0), [open,setOpen]=useState<number|null>(0);
 const tabs=useRef<Array<HTMLButtonElement|null>>([]);
 function select(index:number){setTab(index);setOpen(0);}
 return <section className="home-faq" id="faq" aria-labelledby="faq-heading">
  <div className="faq-inner">
   <h2 id="faq-heading"><span>Frequently</span> Asked Questions</h2>
   <div className="faq-tabs" role="tablist" aria-label="Frequently asked question categories">
    {groups.map((group,index)=><button key={group.label} type="button" role="tab" id={`faq-tab-${index}`} aria-controls={`faq-panel-${index}`} aria-selected={tab===index} tabIndex={tab===index?0:-1} ref={element=>{tabs.current[index]=element;}} onClick={()=>select(index)} onKeyDown={event=>{
     let next:number;
     if(event.key==='ArrowRight'||event.key==='ArrowLeft')next=1-index;
     else if(event.key==='Home')next=0;
     else if(event.key==='End')next=1;
     else return;
     event.preventDefault();select(next);tabs.current[next]?.focus();
    }}>{group.label}</button>)}
   </div>
   {groups.map((group,index)=><div key={group.label} role="tabpanel" id={`faq-panel-${index}`} aria-labelledby={`faq-tab-${index}`} hidden={tab!==index} className="faq-list">
    {group.questions.map(([question,answer],item)=><article className={`faq-item${open===item?' is-open':''}`} key={question}>
     <h3><button type="button" id={`faq-question-${index}-${item}`} aria-expanded={open===item} aria-controls={`faq-answer-${index}-${item}`} onClick={()=>setOpen(open===item?null:item)}>{question}<ChevronDown size={20} aria-hidden="true"/></button></h3>
     <div id={`faq-answer-${index}-${item}`} role="region" aria-labelledby={`faq-question-${index}-${item}`} hidden={open!==item} className="faq-answer"><p>{answer}</p></div>
    </article>)}
   </div>)}
  </div>
 </section>;
}
