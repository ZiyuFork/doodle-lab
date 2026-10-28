import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import worker from '../worker/index.js';
const origin='https://doodle.test';
const page=await worker.fetch(new Request(origin),{});
assert.equal(page.status,200);
const html=await page.text();
const client=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new Function(client);
assert.match(html,/涂鸦进化室/);
assert.match(html,/一键顺线 \+ 上色/);
assert.doesNotMatch(html,/躺平小猫|给这只小猫|一只不想上班的小猫/);
assert.match(await (await worker.fetch(new Request(origin+'/license'),{})).text(),/Attribution Requirement/);
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
const scope=vm.createContext({});
vm.runInContext(client.split('// DRAWING_ENGINE_START')[1].split('// DRAWING_ENGINE_END')[0]+'\nthis.engine={makeSketch,smoothPath,labelRegions};',scope);
const {makeSketch,smoothPath,labelRegions}=scope.engine;
const kinds=['cat','house','monster','fish','flower','rocket','bird','teacup'];
for(const kind of kinds){const a=makeSketch(kind,42),b=makeSketch(kind,43);assert.equal(a.sketch.kind,kind);assert(a.strokes.length>2);assert(a.sketch.prompt.includes(a.sketch.subject));assert(a.sketch.suggestions.every(x=>x.includes(a.sketch.subject)));assert.notEqual(JSON.stringify(a.strokes),JSON.stringify(b.strokes));assert(a.strokes.flatMap(s=>s.points).every(([x,y])=>x>=0&&x<=800&&y>=0&&y<=800));if(kind!=='cat')assert(!a.sketch.prompt.includes('小猫'))}
assert.equal(JSON.stringify(makeSketch('fish',42)),JSON.stringify(makeSketch('fish',42)));
const calls=[];smoothPath({moveTo:(...x)=>calls.push(['move',...x]),lineTo:(...x)=>calls.push(['line',...x]),quadraticCurveTo:(...x)=>calls.push(['curve',...x])},[[0,0],[4,8],[10,8],[15,10]]);assert(calls.some(x=>x[0]==='curve'));assert.deepEqual(calls.at(-1),['line',15,10]);
// A closed outline must produce an enclosed fill region and preserve the border-connected background.
const w=20,h=20,pixels=new Uint8ClampedArray(w*h*4);for(let x=5;x<=14;x++){pixels[(5*w+x)*4+3]=255;pixels[(14*w+x)*4+3]=255}for(let y=5;y<=14;y++){pixels[(y*w+5)*4+3]=255;pixels[(y*w+14)*4+3]=255}
const regions=labelRegions(pixels,w,h);assert.equal(regions.regions.filter(r=>!r.touches).length,1);assert.equal(regions.regions.find(r=>!r.touches).area,64);assert.equal(regions.regions.find(r=>r.touches).area,300);
assert.deepEqual(await (await worker.fetch(new Request(origin+'/api/status'),{})).json(),{provider:'deepseek',ready:false});
assert.deepEqual(await (await worker.fetch(new Request(origin+'/api/status'),{DEEPSEEK_API_KEY:'test-only'})).json(),{provider:'deepseek',ready:true});
const req=(body,headers={})=>new Request(origin+'/api/evolve',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','oai-authenticated-user-id':'test-user',...headers},body:JSON.stringify(body)});
const valid={image:'data:image/png;base64,aGVsbG8=',prompt:'我的火箭想去火星',subject:'小火箭',style:'doodle',strength:50};
const env={DEEPSEEK_API_KEY:'test-only'};
assert.equal((await worker.fetch(req(valid,{Origin:'https://other.test'}),{})).status,403);
assert.equal((await worker.fetch(req(valid,{'oai-authenticated-user-id':''}),{})).status,503);
assert.equal((await worker.fetch(req(valid),{})).status,503);
assert.equal((await worker.fetch(req({...valid,style:'bad'}),env)).status,400);
assert.equal((await worker.fetch(req({...valid,strength:100}),env)).status,400);
assert.equal((await worker.fetch(req({...valid,subject:'x'.repeat(81)}),env)).status,400);
const plan={title:'去火星',prompt:'小火箭飞向火星',background:'#fffaf0',palette:['#d4b483','#8eacb4'],fills:[{x:400,y:400,color:'#d4b483'}]};
const originalFetch=globalThis.fetch;
try {
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.deepseek.com/chat/completions');const b=JSON.parse(options.body);assert.equal(b.messages[1].content[1].image_url.url,valid.image);assert.match(b.messages[1].content[0].text,/小火箭/);assert.match(b.messages[1].content[0].text,/火星/);assert.equal(b.model,'deepseek-flash');assert.equal(b.response_format.type,'json_object');return Response.json({choices:[{message:{content:JSON.stringify(plan)}}]})};
 const success=await worker.fetch(req(valid),env);assert.equal(success.status,200);assert.deepEqual((await success.json()).plan,plan);
 globalThis.fetch=async()=>Response.json({choices:[{message:{content:JSON.stringify({...plan,palette:['url(javascript:bad)']})}}]});
 assert.equal((await worker.fetch(req(valid),env)).status,502);
 globalThis.fetch=async()=>Response.json({choices:[{message:{content:JSON.stringify({...plan,fills:[{x:-1,y:0,color:'#ffffff'}]})}}]});
 assert.equal((await worker.fetch(req(valid),env)).status,502);
 globalThis.fetch=async()=>Response.json({choices:[{message:{content:'broken'}}]});assert.equal((await worker.fetch(req(valid),env)).status,502);
 globalThis.fetch=async()=>Response.json({error:'private provider details'},{status:429});
 const limited=await worker.fetch(req(valid),env);assert.equal(limited.status,429);assert.doesNotMatch(await limited.text(),/private provider/);
 globalThis.fetch=async()=>{throw Error('secret details')};assert.equal((await worker.fetch(req(valid),env)).status,504);
} finally {globalThis.fetch=originalFetch}
assert.equal((await worker.fetch(new Request(origin+'/missing'),{})).status,404);
assert.match(readFileSync(new URL('../LICENSE',import.meta.url),'utf8'),/Copyright \(c\) 2026 yang0/);
console.log('PASS: 8 varied sketches and matching prompts; curve smoothing; enclosed-region coloring; script syntax; copyright; DeepSeek request format; secret-free status; auth/origin/input validation; schema validation and provider errors. All API responses mocked, no real API charges.');

const options=await worker.fetch(new Request(origin+'/api/evolve',{method:'OPTIONS',headers:{Origin:'https://ziyufork.github.io'}}),{});assert.equal(options.status,204);assert.equal(options.headers.get('Access-Control-Allow-Origin'),'https://ziyufork.github.io');
