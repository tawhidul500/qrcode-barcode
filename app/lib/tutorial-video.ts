// Paste a YouTube watch, share, Shorts, or embed URL here to replace the example.
export const tutorialVideo = {
 youtubeUrl: "",
 title: "How to create your QR code",
 poster: "/assets/updated/scan.svg",
 placeholderSrc: "/assets/tutorial/example.mp4",
};
export function youtubeEmbedUrl(url:string){
 try{
  const parsed=new URL(url);const host=parsed.hostname.toLowerCase().replace(/^www\./,"");
  if(!["youtube.com","m.youtube.com","youtu.be","youtube-nocookie.com"].includes(host))return null;
  const id=host==="youtu.be"?parsed.pathname.split("/")[1]:parsed.searchParams.get("v")||parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
  return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?"https://www.youtube-nocookie.com/embed/"+id:null;
 }catch{return null;}
}
