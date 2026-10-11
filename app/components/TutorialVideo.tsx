"use client";
import {useState} from "react";
import {Play} from "lucide-react";
import {tutorialVideo,youtubeEmbedUrl} from "../lib/tutorial-video";
export default function TutorialVideo({barcode=false}:{barcode?:boolean}){
 const [playing,setPlaying]=useState(false);const embed=youtubeEmbedUrl(tutorialVideo.youtubeUrl);
 return <div className="qr-tutorial" aria-label={(barcode?'How to create your barcode':tutorialVideo.title)}>{!playing?<button className="qr-tutorial-poster" aria-label={"Play "+(barcode?'How to create your barcode':tutorialVideo.title)} onClick={()=>setPlaying(true)}><img src={(barcode?'/assets/updated/barcode-tutorial.svg':tutorialVideo.poster)} alt="QR code scanning tutorial preview"/><span className="qr-tutorial-play"><Play size={22} fill="currentColor"/></span></button>:embed?<iframe src={embed+"?autoplay=1&rel=0"} title={(barcode?'How to create your barcode':tutorialVideo.title)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>:<video src={tutorialVideo.placeholderSrc} poster={(barcode?'/assets/updated/barcode-tutorial.svg':tutorialVideo.poster)} controls autoPlay playsInline aria-label="Example placeholder video"/>}</div>;
}
