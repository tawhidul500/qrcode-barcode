export const faqGroups = [
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

export type FaqTab=0|1;
export type FaqState={tab:FaqTab;open:number|null};
export type FaqAction={type:'select';tab:FaqTab}|{type:'toggle';question:number};
export function createFaqState(tab:FaqTab):FaqState{return {tab,open:0};}
export function resolveFaqTab(value:string|null):FaqTab{return value==='barcode'?1:0;}
export function faqHref(tab:FaqTab){return tab===1?'/faq?tab=barcode':'/faq';}
export function faqReducer(state:FaqState,action:FaqAction):FaqState{
 if(action.type==='select')return state.tab===action.tab?state:createFaqState(action.tab);
 if(!Number.isInteger(action.question)||action.question<0||action.question>=faqGroups[state.tab].questions.length)return state;
 return {...state,open:state.open===action.question?null:action.question};
}
export function nextFaqQuestion(index:number,key:string,count:number):number|null{
 if(count<1)return null;
 if(key==='ArrowDown')return (index+1)%count;
 if(key==='ArrowUp')return (index+count-1)%count;
 if(key==='Home')return 0;
 if(key==='End')return count-1;
 return null;
}
