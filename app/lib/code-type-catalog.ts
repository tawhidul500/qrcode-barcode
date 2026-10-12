/** Order and group membership follow the supplied all-types Figma export. */
export const codeTypeGroups = [
 {id:'popular', title:'Popular', description:'Start with the essentials. Share your website, Wi-Fi network, contact details, messages or social profiles with a QR code, then choose a design and download it from the generator.', types:['Website','Wi-Fi','Text','Contacts','SMS','Phone','Location','WhatsApp','Facebook','Instagram','Email','Viber','X','Spotify','Product','Vcard']},
 {id:'landing-page', title:'Landing Page', description:'Connect a printed code to your link list, business page, event, menu or special offer. Choose the kind of page you want to share and add its existing link in the QR code generator.', types:['Link List','Mini Website','Coupon','Smart App','Event','Playlist','Business Page','Menu']},
 {id:'social-media', title:'Social Media', description:'Help people find your social profiles and content with a scan. Choose a platform, add your profile or content link, and create a QR code for your business cards, packaging or signs.', types:['Facebook','Instagram','Telegram','Viber','X','TikTok','LinkedIn','Snapchat','YouTube','Reddit','Pinterest','Discord']},
 {id:'document', title:'Document', description:'Make your documents easy to reach. Link to a hosted file, certificate, Word document, Google Doc or spreadsheet, and check that the sharing permissions allow your audience to open it.', types:['Any File','Office 365','PCR/Certificate','Word/DOCX','Google Docs','Google Sheets']},
 {id:'contact', title:'Contact', description:'Give people a simple way to get in touch. Share contact details, open a text message or phone call, or point to a location with a QR code they can scan using their phone.', types:['Contacts','SMS','Phone','Location']},
 {id:'media', title:'Media', description:'Bring your printed materials to life with a link to video, audio or images. Add a publicly accessible media link in the generator and create a QR code that opens it when scanned.', types:['Video','MP3 / Audio','Image','PNG']},
 {id:'payments', title:'Payments', description:'Share your existing payment destination with a QR code. Add your PayPal, cryptocurrency or payment-page details, customize the code, and check the destination before sharing it.', types:['PayPal','Crypto Payment','Payment link','Stripe']},
 {id:'smart-tools', title:'Smart Tools', description:'Create a QR code for your campaign or routing link. Configure tracking parameters, location rules, timed destinations or traffic splitting with your link service, then add that link here.', types:['GA/UTM Link','Geo Targeting','Time Targeting','Traffic Split']},
 {id:'business', title:'Business', description:'Connect customers and colleagues to your business information. Share a review page, attendance form, digital contact card or hosted invoice through a personalized QR code.', types:['Review','Attendance','Vcard','Invoice']},
 {id:'apps', title:'Apps', description:'Make your app easier to discover. Choose the app marketplace, paste your app listing link into the generator, and create a QR code for your website, posters or printed materials.', types:['App store','Google Play','Galaxy Store','Huawei Gallery']}
] as const;

export const codeTypeLabels:Record<string,string> = {
 Vcard:'V Card', 'MP3 / Audio':'MP3 / Audio', Barcode:'General Types', code93:'Code93'
};
