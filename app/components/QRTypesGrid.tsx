"use client";
import {useState} from "react";
import QRTypesModal from "./QRTypesModal";
import {qrTypes} from "../lib/qr-types";
const descriptions:Record<string,string>={Website:"Link directly to a website or landing page.",'Wi-Fi':"Share your network without typing the password.",Text:"Share a message that opens when scanned.",Contacts:"Share contact details as a digital contact card.",SMS:"Open a text message to your phone number.",Phone:"Make it easy to call your phone number.",Location:"Help people find a place on the map.",WhatsApp:"Start a WhatsApp conversation with a scan.",Facebook:"Connect people to your Facebook page.",Instagram:"Share your Instagram profile.",Email:"Open an email addressed to you.",Viber:"Start a conversation through Viber.",X:"Link to your X profile or a post.",Spotify:"Share a track, playlist, or artist link.",Product:"Connect customers to your product page.",Vcard:"Create a scannable digital business card."};
export default function QRTypesGrid({onChoose,limit,compact=false,selectedType="Website"}:{selectedType?:string;onChoose:(type:string)=>void;limit?:number;compact?:boolean}){
 const [typesOpen,setTypesOpen]=useState(false);
 const chooseFromPopup=(type:string)=>{setTypesOpen(false);requestAnimationFrame(()=>onChoose(type));};
 return <>{typesOpen&&<QRTypesModal selectedType={selectedType} onChoose={chooseFromPopup} onClose={()=>setTypesOpen(false)}/>}<section className={"qr-types-section"+(compact?" compact-types":"")} id="qr-code-types" aria-labelledby="qr-types-heading"><div className="qr-types-inner">
 <div className="qr-types-heading"><h2 id="qr-types-heading">Create a QR Code For <span>{compact?"Types":"All Types"}</span></h2><p>Create static QR codes for links, messages, contact details, Wi-Fi networks, and more. Choose a type below to get started.</p></div>
 <div className="qr-types-grid">{qrTypes.slice(0,limit).map(([label,icon])=><article className="qr-type-card" key={label}><img src={'/assets/svg/'+icon} alt=""/><h3>{label==='Vcard'?'V card':label==='X'?'x':label}</h3>{!compact&&<p>{descriptions[label]}</p>}<button type="button" aria-label={'Choose '+label+' QR code'} onClick={()=>onChoose(label)}>Choose</button></article>)}</div>
 <button className="qr-types-view-all" type="button" onClick={()=>setTypesOpen(true)} aria-haspopup="dialog" aria-expanded={typesOpen}>View All QR Code</button>
 </div></section></>;
}
