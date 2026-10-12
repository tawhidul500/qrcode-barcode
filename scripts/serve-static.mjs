import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('out');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.woff2':'font/woff2','.wasm':'application/wasm','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const path=resolve(root,'.'+pathname);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  let file;
  for(const candidate of [path,path+'.html',resolve(path,'index.html')]){
   try{if((await stat(candidate)).isFile()){file=candidate;break;}}catch{}
  }
  if(!file){res.writeHead(404,{'Content-Type':'text/html'});res.end(await readFile(resolve(root,'404.html')));return;}
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.writeHead(400);res.end('Bad request');}
}).listen(Number(process.env.PORT||3000),()=>console.log('Static preview: http://localhost:'+(process.env.PORT||3000)));
