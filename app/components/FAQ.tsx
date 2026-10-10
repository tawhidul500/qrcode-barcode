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
  ['What Is A Barcode?', 'A barcode represents information in a pattern that a scanner can read. Traditional one-dimensional barcodes use bars and spaces to encode identifiers such as product or inventory numbers.'],
  ['What Is The Difference Between A Barcode And A QR Code?', 'Traditional barcodes store information along one dimension. QR codes store information across a two-dimensional grid and can hold content such as links, text, and contact details.'],
  ['What Information Can Be Stored In A Barcode?', 'The supported information depends on the barcode format. Some formats accept numbers only; others can include letters and symbols. The encoded value is often an identifier used to look up a record.'],
  ['Can I Use Barcodes For Commercial Purposes?', 'Barcodes are commonly used for inventory and product identification. Retail product identifiers may need to meet your retailer’s requirements and be assigned through the relevant issuing organization. Generating an image alone does not assign a retail identifier.'],
  ['How Do I Scan A Barcode?', 'Use a compatible barcode scanner or a camera app that supports the format. Keep the whole code visible, in focus, and well lit.'],
  ['Do Barcodes Expire?', 'The printed pattern has no built-in expiration date. Whether its value remains useful depends on the records and systems that use it.'],
  ['Can I Generate A Barcode On This Website?', 'Barcode generation is planned for a later update. The current generator creates QR codes.']
 ]}
] as const;

export default function FAQ(){
 const [tab,setTab]=useState(0), [open,setOpen]=useState<number|null>(0);
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
