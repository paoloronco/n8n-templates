import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {render, mediaQc, digest, escapeHtml, runtimeRoot} from './render.mjs';

export function envelope(value, secret, purpose='') {
  const e={timestamp:String(Date.now()),nonce:crypto.randomBytes(12).toString('hex'),payload:Buffer.from(JSON.stringify(value)).toString('base64url')};
  e.signature=crypto.createHmac('sha256',secret).update(purpose+e.timestamp+'\n'+e.nonce+'\n'+e.payload).digest('hex');
  return e;
}

export async function bridge(c, value) {
  const response=await fetch(c.bridgeUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(envelope(value,c.secret)),signal:AbortSignal.timeout(60000)});
  const result=await response.json();
  if(!response.ok||result.ok!==true)throw Error(result.error||'n8n bridge returned an invalid receipt');
  return result;
}

async function atomic(file, value) {
  await fs.mkdir(path.dirname(file),{recursive:true});
  const tmp=file+'.'+crypto.randomBytes(6).toString('hex')+'.tmp';
  await fs.writeFile(tmp,JSON.stringify(value,null,2));await fs.rename(tmp,file);
}

async function upload(c, job, result) {
  const bytes=await fs.readFile(result.output);
  const signed=envelope({id:job.id,lease:job.lease,size:bytes.length,sha256:digest(bytes)},c.secret,'local-video-upload:v1\n');
  const response=await fetch(c.uploadUrl,{method:'POST',headers:{'Content-Type':'video/mp4','x-local-video-envelope':Buffer.from(JSON.stringify(signed)).toString('base64url')},body:bytes,signal:AbortSignal.timeout(300000)});
  const receipt=await response.json();
  if(!response.ok||receipt.ok!==true||receipt.sha256!==result.sha256)throw Error(receipt.error||'Uploaded bytes were not confirmed by n8n');
  return receipt;
}

export async function workOnce(c, report=()=>{}) {
  const claimed=await bridge(c,{action:'pull'}),job=claimed.job;
  if(!job)return null;
  report({busy:true,id:job.id,stage:'rendering'});
  const folder=path.join(path.resolve(c.workDir),'jobs',job.id);
  await atomic(path.join(folder,'job.json'),job);
  let leaseError;
  const renewal=setInterval(()=>bridge(c,{action:'renew',id:job.id,lease:job.lease}).catch(e=>{leaseError=e;}),60000);
  try {
    const result=await render(job,c);
    if(leaseError)throw leaseError;
    report({busy:true,id:job.id,stage:'uploading'});
    await upload(c,job,result);
    await bridge(c,{action:'complete',id:job.id,lease:job.lease,result:{state:'ready',id:job.id,qc:result.qc,copySource:'owner brief',preview:`http://127.0.0.1:${c.port||3850}/?job=${job.id}`}});
    await atomic(path.join(folder,'status.json'),{state:'ready',sha256:result.sha256,qc:result.qc});
    return result;
  } catch(error) {
    await atomic(path.join(folder,'status.json'),{state:'failed',error:error.message,at:new Date().toISOString()});
    // A verified local render is reused if a later upload or bridge call fails.
    await bridge(c,{action:'complete',id:job.id,lease:job.lease,result:{state:'failed',error:error.message.slice(0,400)}}).catch(()=>{});
    throw error;
  } finally {clearInterval(renewal);report({busy:false,id:job.id});}
}

export function galleryHtml(csrf) {
  return `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local Video Production</title>
  <style>:root{font-family:system-ui,sans-serif;color:#eef3f7;background:#101922;color-scheme:dark}*{box-sizing:border-box}body{margin:0}main{max-width:1180px;margin:auto;padding:40px 24px}header{display:flex;justify-content:space-between;align-items:start;gap:24px;border-bottom:1px solid #344450;padding-bottom:28px;margin-bottom:30px}h1{font-size:32px;margin:0 0 10px}h2{font-size:22px}p{color:#b6c5d0;line-height:1.5}label{display:block;font-weight:600;margin-top:18px}input,textarea,select,button{font:inherit;border:1px solid #536474;border-radius:8px;padding:11px;background:#172634;color:#eef3f7}input,textarea,select{display:block;width:100%;margin-top:7px}textarea{min-height:110px}button{cursor:pointer;background:#73e6b1;color:#101922;font-weight:700}button.secondary{background:#253646;color:#eef3f7}button.danger{background:#f1c5b9}button:disabled{opacity:.5;cursor:wait}.grid{display:grid;grid-template-columns:minmax(300px,400px) 1fr;gap:36px}.card{border:1px solid #344450;border-radius:14px;padding:22px;margin:0 0 24px;background:#14212c}.muted{font-size:14px;color:#b6c5d0}.row{display:flex;gap:12px;flex-wrap:wrap;margin-top:14px}.row label{margin:0;display:flex;align-items:center;gap:6px;font-size:14px}.row input{width:auto;margin:0}video{max-height:540px;width:100%;background:#080e14;border-radius:8px}.state{background:#253646;border-radius:20px;padding:5px 10px;font-size:13px}pre{white-space:pre-wrap;font-size:13px;overflow-wrap:anywhere;color:#c5d4df}#notice{position:sticky;top:0;background:#253646;padding:12px;border-radius:8px;display:none}.error{color:#ffb8aa}code{overflow-wrap:anywhere}@media(max-width:800px){.grid{grid-template-columns:1fr}header{display:block}}
  </style><main><header><div><h1>Local Video Production</h1><p>Dal brief alla bozza approvata, con ricevute separate per ogni canale.</p></div><div><span class="state" id="health">Connessione…</span><p class="muted">L'approvazione vale soltanto per il file e i canali mostrati.</p></div></header><div id="notice" role="status"></div><div class="grid"><section><h2>Crea una bozza</h2><form id="create"><label>Titolo<input name="title" maxlength="100" required></label><label>Testo della voce narrante<textarea name="narration" maxlength="1600" required></textarea></label><label>Testo del post<textarea name="caption" maxlength="2200" required></textarea></label><label>Scena 1 — titolo<input name="scene1" maxlength="70" required></label><label>Scena 1 — testo<textarea name="body1" maxlength="160" required></textarea></label><label>Scena 2 — titolo<input name="scene2" maxlength="70" required></label><label>Scena 2 — testo<textarea name="body2" maxlength="160" required></textarea></label><label>Formato<select name="format"><option value="wall_text">Testo animato</option><option value="hook_demo">Hook e passaggi</option><option value="custom_motion">Titoli e forme</option><option value="slideshow">Slideshow con due immagini</option></select></label><label>Immagini delle due scene, in ordine<input type="file" name="assets" accept="image/png,image/jpeg,image/webp" multiple></label><label>Nome o marchio<input name="brand" maxlength="40" value="Local Video" required></label><label>Lingua della voce<select name="language"><option value="it-IT">Italiano</option><option value="en-US">English</option><option value="en-GB">English UK</option></select></label><label>Colore<input type="color" name="accent" value="#73e6b1"></label><div class="row"><label><input name="instagram" type="checkbox" checked> Instagram</label><label><input name="youtube" type="checkbox" checked> YouTube</label></div><div class="row"><label><input name="privateTest" type="checkbox"> Test privato YouTube, senza Instagram</label></div><div class="row"><button>Crea bozza</button></div><p class="muted">La generazione non autorizza la pubblicazione. Prima guarda il video completo e verifica testo e audio.</p></form></section><section><div class="row"><h2>Bozze e pubblicazioni</h2><button class="secondary" id="refresh">Aggiorna</button></div><div id="jobs"></div></section></div></main>
  <script>const csrf=${JSON.stringify(csrf)};const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function api(action,value={}){const r=await fetch('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json','x-csrf-token':csrf},body:JSON.stringify(value)});const j=await r.json();if(!r.ok)throw Error(j.error||'Richiesta non riuscita');return j;}
  function notice(s,error=false){const n=document.querySelector('#notice');n.textContent=s;n.style.display='block';n.className=error?'error':'';}
  function buttons(j){if(j.state==='ready'&&!j.approval)return '<label>Pubblica non prima di<input type="datetime-local" class="publishAt"></label><label>Nome di chi approva<input class="reviewer" maxlength="80" required></label><div class="row"><button data-action="approve">Approva questa versione</button><button class="danger" data-action="reject">Rifiuta</button></div>';let out='';if(j.state==='failed')out+='<button class="secondary" data-retry="render">Riprendi rendering o invio</button>';for(const ch of ['instagram','youtube']){const p=j[ch]||{};if(['failed','reconciliation_required'].includes(p.state))out+='<p class="error">'+ch+': '+esc(typeof p.error==='object'?JSON.stringify(p.error):p.error)+'</p><div class="row"><button class="secondary" data-retry="'+ch+'">Riprendi '+ch+'</button>'+(p.state==='reconciliation_required'?'<input placeholder="ID esistente verificato" class="remote-'+ch+'"><button class="secondary" data-reconcile="'+ch+'">Registra ID per verifica</button>':'')+'</div>';}return out;}
  async function refresh(){try{const data=await api('list');document.querySelector('#health').textContent=data.worker.busy?'Rendering in corso':'Worker attivo';document.querySelector('#jobs').innerHTML=data.jobs.slice().reverse().map(j=>'<article class="card" data-id="'+j.id+'" data-hash="'+esc(j.sha256)+'"><span class="state">'+esc(j.state)+(j.approval?' · approvata':'')+'</span><h2>'+esc(j.request.brief.title)+'</h2><p>'+esc(j.request.brief.caption)+'</p><p class="muted">Canali: '+esc(j.request.channels.join(', '))+(j.request.privateTest?' · YouTube privato':'')+'</p>'+ (j.localMedia?'<video controls preload="metadata" src="/media/'+j.id+'/reel.mp4"></video>':'')+'<p class="muted">Instagram: '+esc(j.instagram.state)+' · YouTube: '+esc(j.youtube.state)+'</p>'+[j.instagram,j.youtube].filter(p=>p.permalink).map(p=>'<p><a href="'+esc(p.permalink)+'" target="_blank" rel="noopener">Apri pubblicazione verificata</a></p>').join('')+(j.result?.error?'<pre class="error">'+esc(j.result.error)+'</pre>':'')+buttons(j)+'<p class="muted"><code>'+j.id+'</code></p></article>').join('')||'<p>Nessuna bozza. Inserisci il primo brief.</p>';}catch(e){notice(e.message,true);document.querySelector('#health').textContent='Connessione da verificare';}}
  document.querySelector('#create').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,button=f.querySelector('button');button.disabled=true;try{const v=Object.fromEntries(new FormData(f));const scenes=[{title:v.scene1,body:v.body1},{title:v.scene2,body:v.body2}];const files=[...f.assets.files];if(files.length>2)throw Error('Scegli al massimo due immagini');for(let i=0;i<files.length;i++){const file=files[i];if(file.size>10*1024*1024)throw Error('Ogni immagine deve essere sotto 10 MiB');const data=new Uint8Array(await file.arrayBuffer());let binary='';for(let k=0;k<data.length;k+=8192)binary+=String.fromCharCode(...data.subarray(k,k+8192));scenes[i].asset=(await api('asset',{name:file.name,data:btoa(binary)})).asset;}const privateTest=f.privateTest.checked,channels=privateTest?['youtube']:['instagram','youtube'].filter(ch=>f[ch].checked);await api('create',{idempotencyKey:crypto.randomUUID(),format:v.format,channels,privateTest,brief:{title:v.title,narration:v.narration,caption:v.caption,scenes,brand:v.brand,accent:v.accent,language:v.language}});notice('Bozza in coda. Nessuna pubblicazione autorizzata.');await refresh();}catch(error){notice(error.message,true);}finally{button.disabled=false;}});
  document.querySelector('#jobs').addEventListener('click',async e=>{const button=e.target.closest('button');if(!button)return;const card=button.closest('article'),id=card.dataset.id;button.disabled=true;try{if(button.dataset.action){const reviewer=card.querySelector('.reviewer').value.trim();if(button.dataset.action==='approve'&&!reviewer)throw Error('Inserisci il nome di chi ha verificato il video');const when=card.querySelector('.publishAt').value;await api('review',{id,sha256:card.dataset.hash,decision:button.dataset.action==='approve'?'approve':'reject',reviewer:reviewer||'reviewer',publishAt:when?new Date(when).toISOString():new Date().toISOString()});notice('Decisione registrata per questa versione.');}else if(button.dataset.retry){await api('retry',{id,channel:button.dataset.retry});notice('Ripresa richiesta: le ricevute esistenti restano conservate.');}else if(button.dataset.reconcile){const channel=button.dataset.reconcile;await api('reconcile',{id,channel,remoteId:card.querySelector('.remote-'+channel).value.trim()});notice('ID registrato: verrà verificato prima di confermare la pubblicazione.');}await refresh();}catch(error){notice(error.message,true);}finally{button.disabled=false;}});
  document.querySelector('#refresh').addEventListener('click',refresh);refresh();</script></html>`;
}

export async function start(c) {
  if(!/^https:\/\//.test(c.bridgeUrl)||!/^https:\/\//.test(c.uploadUrl)||c.secret?.length<32)throw Error('Configure worker.local.json with HTTPS n8n URLs and the matching signing secret');
  const root=path.resolve(c.workDir),port=c.port||3850,csrf=crypto.randomBytes(32).toString('hex');
  await fs.mkdir(path.join(root,'assets'),{recursive:true});
  let worker={busy:false},stopped=false,polling=false;
  async function tick(){if(polling||stopped)return;polling=true;try{await bridge(c,{action:'heartbeat',busy:worker.busy});await workOnce(c,value=>{worker={...value,at:new Date().toISOString()};});worker.error=null;}catch(error){worker.error=error.message;console.error(new Date().toISOString(),error.message);}finally{polling=false;}}
  const server=http.createServer(async(req,res)=>{
    const host='127.0.0.1:'+port;
    const headers={'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self'; img-src 'self'; object-src 'none'; frame-ancestors 'none'"};
    const send=(code,value,type='application/json')=>{res.writeHead(code,{'Content-Type':type,...headers});res.end(type==='application/json'?JSON.stringify(value):value);};
    try{
      if(req.headers.host!==host&&req.headers.host!=='localhost:'+port)return send(403,{error:'Local host required'});
      const url=new URL(req.url,'http://'+host);
      if(req.method==='GET'&&url.pathname==='/')return send(200,galleryHtml(csrf),'text/html; charset=utf-8');
      if(req.method==='GET'&&url.pathname==='/health')return send(200,{ok:true,...worker});
      const match=url.pathname.match(/^\/media\/([a-f0-9]{32})\/(reel\.mp4|cover\.jpg)$/);
      if(req.method==='GET'&&match){const file=path.join(root,'jobs',match[1],match[2]),stat=await fs.stat(file);const type=match[2].endsWith('.mp4')?'video/mp4':'image/jpeg';const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):stat.size-1,stat.size-1);if(start>end)return send(416,{error:'Invalid range'});res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1,...headers});const {createReadStream}=await import('node:fs');createReadStream(file,{start,end}).pipe(res);}else{res.writeHead(200,{'Content-Type':type,'Content-Length':stat.size,'Accept-Ranges':'bytes',...headers});const {createReadStream}=await import('node:fs');createReadStream(file).pipe(res);}return;}
      if(req.method!=='POST'||!url.pathname.startsWith('/api/'))return send(404,{error:'Not found'});
      if(req.headers['x-csrf-token']!==csrf||!['http://'+host,'http://localhost:'+port].includes(req.headers.origin))return send(403,{error:'Same-origin review required'});
      let body=Buffer.alloc(0);for await(const chunk of req){body=Buffer.concat([body,chunk]);if(body.length>15*1024*1024)throw Error('Request too large');}
      const value=JSON.parse(body),action=url.pathname.slice(5);
      if(action==='asset'){
        const ext=String(value.name).split('.').pop().toLowerCase(),data=Buffer.from(value.data,'base64');
        if(!['png','jpg','jpeg','webp'].includes(ext)||data.length>10*1024*1024)throw Error('Use a PNG, JPEG or WebP under 10 MiB');
        const valid=ext==='png'?data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):ext==='webp'?data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP':data[0]===255&&data[1]===216;
        if(!valid)throw Error('Image content does not match its extension');
        const asset=digest(data)+'.'+ext;await fs.writeFile(path.join(root,'assets',asset),data);return send(200,{asset});
      }
      if(!['create','list','review','retry','reconcile'].includes(action))return send(404,{error:'Unsupported action'});
      const result=await bridge(c,{...value,action});
      if(action==='list'){for(const j of result.jobs){j.localMedia=await fs.stat(path.join(root,'jobs',j.id,'reel.mp4')).then(s=>s.isFile()).catch(()=>false);}result.worker=worker;}
      send(200,result);if(action==='create'||action==='retry')setImmediate(tick);
    }catch(error){send(400,{error:error.message.slice(0,500)});}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  const timer=setInterval(tick,c.pollMs||30000);tick();
  console.log('Local Video Production ready at http://127.0.0.1:'+port+'/');
  const stop=()=>{stopped=true;clearInterval(timer);server.close();};
  process.once('SIGINT',stop);process.once('SIGTERM',stop);
  return {server,stop,csrf};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const configFile=process.env.LOCAL_VIDEO_WORKER_CONFIG||path.join(runtimeRoot,'worker.local.json');
  const c=JSON.parse((await fs.readFile(configFile,'utf8')).replace(/^\uFEFF/,''));
  await start(c);
}
