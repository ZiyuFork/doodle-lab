import http from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const path=new URL('../worker/index.js',import.meta.url);
http.createServer(async(req,res)=>{
 try {
  const chunks=[];for await(const c of req)chunks.push(c);
  const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(chunks.length?{body:Buffer.concat(chunks),duplex:'half'}:{})});
  const {default:worker}=await import(pathToFileURL(path.pathname).href+'?v='+statSync(path).mtimeMs);
  const response=await worker.fetch(request,{});
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Preview error')}
}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Doodle Lab preview ready'));
