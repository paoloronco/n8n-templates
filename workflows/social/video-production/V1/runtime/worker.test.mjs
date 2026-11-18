import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {envelope, galleryHtml, bridge, start} from './worker.mjs';
import {composition,sceneComposition} from './render.mjs';

test('signed envelopes bind the payload, nonce, timestamp and purpose',()=>{
  const key='unit-test-secret'.repeat(3),a=envelope({action:'list'},key),b=envelope({action:'list'},key);
  assert.notEqual(a.nonce,b.nonce);
  assert.match(a.timestamp,/^\d{13}$/);
  assert.deepEqual(JSON.parse(Buffer.from(a.payload,'base64url')),{action:'list'});
  assert.equal(a.signature,crypto.createHmac('sha256',key).update(a.timestamp+'\n'+a.nonce+'\n'+a.payload).digest('hex'));
  assert.notEqual(a.signature,crypto.createHmac('sha256',key).update('local-video-upload:v1\n'+a.timestamp+'\n'+a.nonce+'\n'+a.payload).digest('hex'));
});

test('user text stays literal in the generated composition',()=>{
  const request={format:'wall_text',brief:{title:'<script>bad()</script>',brand:'A & B',accent:'#555555',language:'it-IT',scenes:[{title:'<img src=x onerror=bad()>',body:'Actual user text'}]}};
  const html=composition(request,6)+sceneComposition(request,6,0);
  assert.ok(html.includes('&lt;img src=x onerror=bad()&gt;'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('<script>bad()'));
  assert.ok(html.includes('data-width="1080"'));
  assert.ok(html.includes('id="narration"'));
});

test('a bridge failure is never treated as an empty successful queue',async()=>{
  const old=globalThis.fetch;
  globalThis.fetch=async()=>new Response(JSON.stringify({ok:false,error:'helper unavailable'}),{status:502});
  try{await assert.rejects(bridge({bridgeUrl:'https://example.invalid',secret:'x'.repeat(32)},{action:'pull'}),/helper unavailable/);}finally{globalThis.fetch=old;}
});

test('review gallery rejects cross-origin writes and path traversal',async()=>{
  const folder=await fs.mkdtemp(path.join(os.tmpdir(),'video-gallery-'));
  const portServer=net.createServer();portServer.listen(0,'127.0.0.1');await once(portServer,'listening');const port=portServer.address().port;await new Promise(resolve=>portServer.close(resolve));
  const old=globalThis.fetch;
  globalThis.fetch=async(url,options)=>String(url).startsWith('https://example.invalid')?new Response(JSON.stringify({ok:true,job:null,jobs:[]})):old(url,options);
  const app=await start({bridgeUrl:'https://example.invalid/bridge',uploadUrl:'https://example.invalid/upload',secret:'x'.repeat(32),workDir:folder,port,pollMs:60000});
  try{
    const base='http://127.0.0.1:'+port;
    const page=await (await old(base)).text();assert.ok(page.includes('Approve this version'));assert.ok(!page.includes('x'.repeat(32)));
    assert.equal((await old(base+'/api/review',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://attacker.invalid','x-csrf-token':app.csrf},body:'{}'})).status,403);
    assert.equal((await old(base+'/api/review',{method:'POST',headers:{'Content-Type':'application/json','Origin':base},body:'{}'})).status,403);
    assert.equal((await old(base+'/api/list',{method:'POST',headers:{'Content-Type':'application/json','Origin':base,'x-csrf-token':app.csrf},body:'{}'})).status,200);
    assert.equal((await old(base+'/media/../../config.local.json')).status,404);
    assert.equal((await old(base+'/api/asset',{method:'POST',headers:{'Content-Type':'application/json','Origin':base,'x-csrf-token':app.csrf},body:JSON.stringify({name:'bad.png',data:Buffer.from('<script>bad()</script>').toString('base64')})})).status,400);
  }finally{app.stop();globalThis.fetch=old;await fs.rm(folder,{recursive:true,force:true});}
});
