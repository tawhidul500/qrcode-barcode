"use client";
import {useState} from "react";
import {Play} from "lucide-react";
import {tutorialVideo,youtubeEmbedUrl} from "../lib/tutorial-video";
export default function TutorialVideo(){
 const [playing,setPlaying]=useState(false);const embed=youtubeEmbedUrl(tutorialVideo.youtubeUrl);
 return <div className="qr-tutorial" aria-label={tutorialVideo.title}>{!playing?<button className="qr-tutorial-poster" aria-label={"Play "+tutorialVideo.title} onClick={()=>setPlaying(true)}><img src={tutorialVideo.poster} alt="QR code scanning tutorial preview"/><span className="qr-tutorial-play"><Play size={22} fill="currentColor"/></span></button>:embed?<iframe src={embed+"?autoplay=1&rel=0"} title={tutorialVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>:<video src={tutorialVideo.placeholderSrc} poster={tutorialVideo.poster} controls autoPlay playsInline aria-label="Example placeholder video"/>}</div>;
}
