import {mkdirSync,writeFileSync} from 'node:fs';
import worker from '../worker/index.js';
const api='https://doodle-lab-ziyu-7k2.tuvu71996.chatgpt.site';
let html=await(await worker.fetch(new Request(api+'/'),{})).text();
html=html.replace("fetch('/api/evolve'", "fetch('"+api+"/api/evolve'").replace("fetch('/api/status'", "fetch('"+api+"/api/status'").replace('href="/license"','href="license.txt"').replace('href="/" aria-label="涂鸦进化室首页"','href="./" aria-label="涂鸦进化室首页"');
mkdirSync('docs',{recursive:true});writeFileSync('docs/index.html',html);writeFileSync('docs/license.txt',await(await worker.fetch(new Request(api+'/license'),{})).text());writeFileSync('docs/.nojekyll','');
console.log('GitHub Pages exported; no credentials included.');
