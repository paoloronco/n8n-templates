import http from 'node:http';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync, createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { features, layouts, writerRequest, reviewerRequest, validateCopy, parseCompletion, usageCost, MONTHLY_USD, RESERVATION } from './catalog.mjs';
import { renderJob } from './render.mjs';
import { assertRenderSpace, maintainMedia } from './storage.mjs';
import { resolveCreativeCopy } from './message.mjs';
import { createInstagramPublisher, validateInstagramCaption } from './instagram-publisher.mjs';
import { escape } from './templates.mjs';

export function createStudio({root=resolve('data'),assets=resolve('assets'),token=process.env.STUDIO_TOKEN,monthlyUsd=MONTHLY_USD,renderer=renderJob,allowedViewers=(process.env.STUDIO_VIEWERS||'127.0.0.1,::1').split(',')}={}) {
  if(!token||token.length<24)throw new Error('A private studio API token is required');
  mkdirSync(root,{recursive:true});const output=join(root,'jobs');mkdirSync(output,{recursive:true});
  const db=new DatabaseSync(join(root,'studio.sqlite'));db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, month TEXT NOT NULL, held REAL NOT NULL, cost REAL NOT NULL DEFAULT 0, data TEXT NOT NULL)');
  let rendering=false;
  const list=()=>db.prepare('SELECT data FROM jobs ORDER BY rowid DESC').all().map(r=>JSON.parse(r.data));
  const get=id=>{const row=db.prepare('SELECT data FROM jobs WHERE id=?').get(id);if(!row)throw Object.assign(new Error('Unknown job'),{status:404});return JSON.parse(row.data);};
  const save=job=>{job.updatedAt=new Date().toISOString();db.prepare('UPDATE jobs SET held=?,cost=?,data=? WHERE id=?').run(job.held,job.cost,JSON.stringify(job),job.id);return job;};
  const instagram=createInstagramPublisher({db,getJob:get,saveJob:save,output,token,accountId:process.env.STUDIO_INSTAGRAM_ACCOUNT_ID||'',username:process.env.STUDIO_INSTAGRAM_USERNAME||'',publicBase:process.env.STUDIO_INSTAGRAM_MEDIA_BASE||'',publicBases:{post:process.env.STUDIO_INSTAGRAM_POST_MEDIA_BASE,reel:process.env.STUDIO_INSTAGRAM_REEL_MEDIA_BASE}});
  let maintenanceReport;
  const maintenance=()=>{try{maintenanceReport=maintainMedia({db,output});}catch(e){maintenanceReport={errors:[{error:e.message}]};}return maintenanceReport;};
  const maintenanceTimer=setInterval(maintenance,3600000);maintenanceTimer.unref();setImmediate(maintenance);
  const budget=()=>{const month=new Date().toISOString().slice(0,7);const totals=db.prepare('SELECT COALESCE(SUM(held),0) held,COALESCE(SUM(cost),0) cost FROM jobs WHERE month=?').get(month);return {month,limitUsd:monthlyUsd,...totals,estimatedEur:(totals.held+totals.cost)*1.5,eurMonthlyCeiling:5};};
  function reserve(body) {
    if(!['post','reel'].includes(body.kind)||typeof body.requestKey!=='string'||!/^[a-zA-Z0-9:_-]{1,100}$/.test(body.requestKey))throw new Error('Invalid request');
    const prior=db.prepare('SELECT data FROM jobs WHERE request_key=?').get(body.requestKey);
    if(prior){const job=JSON.parse(prior.data);if(job.kind!==body.kind)throw new Error('Idempotency key reused for a different format');return job;}
    maintenance();assertRenderSpace(output);
    const recent=list().filter(j=>!j.previewOnly);const completed=recent.filter(j=>j.kind===body.kind);let feature,layout;
    if(body.featureId){feature=features.find(f=>f.id===body.featureId);if(!feature)throw new Error('Unknown feature');}
    for(let turn=0;turn<features.length*layouts.length;turn++){
      const i=recent.length+turn;const f=feature??features[i%features.length];const l=layouts[(Math.floor(i/features.length)+i)%layouts.length];
      if(!recent.slice(0,12).some(j=>j.kind===body.kind&&j.feature.id===f.id&&j.layout===l)){feature=f;layout=l;break;}
    }
    feature??=features[completed.length%features.length];layout??=layouts[completed.length%layouts.length];
    const b=budget();if(b.held+b.cost+RESERVATION>monthlyUsd)throw Object.assign(new Error('Monthly API budget reached; no provider call authorized'),{status:402});
    if(recent.filter(j=>Date.now()-Date.parse(j.createdAt)<86400000).length>=20)throw Object.assign(new Error('Daily production cap reached'),{status:429});
    const job={id:randomUUID(),requestKey:body.requestKey,kind:body.kind,previewOnly:body.previewOnly===true,feature,layout,angle:['Open with a recognisable everyday frustration and resolve it visually.','Use a specific curiosity hook, then reveal one practical capability.','Build a short before/after story about organising content, without claiming customer outcomes.'][completed.length%3],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),state:'reserved',repairCount:0,postType:completed.length%3===2?'single':'carousel',held:RESERVATION,cost:0,usage:[],files:[],published:false};
    job.writerRequest=writerRequest(job,recent.slice(0,12));
    guidePublicCopy(job.writerRequest);
    db.prepare('INSERT INTO jobs (id,request_key,month,held,cost,data) VALUES (?,?,?,?,?,?)').run(job.id,body.requestKey,b.month,job.held,0,JSON.stringify(job));return job;
  }
  function account(job,stage,raw){
    if(job.usage.some(u=>u.stage===stage||(raw.id&&u.providerId===raw.id)))return false;
    const cost=usageCost(raw);job.cost=Math.round((job.cost+cost)*1e6)/1e6;job.held=Math.round(Math.max(0,job.held-cost)*1e6)/1e6;job.usage.push({stage,providerId:raw.id,model:raw.model,inputTokens:raw.usage.prompt_tokens,outputTokens:raw.usage.completion_tokens,costUsd:cost});save(job);return true;
  }
  function guidePublicCopy(request) {
    request.messages.push({role:'system',content:'All copy is for prospective Example customers. Art direction, rendering, typography, collages and animation are internal production instructions, never product capabilities or caption content. Explain the specific customer problem, a verified capability and a website CTA. Use a concrete situation and a distinct hook structure; do not recycle recent hooks or formulaic Tired of openings. Keep the existing JSON schema.'});
  }
  function revise(job, reason) {
    if(job.repairCount>=1){job.state='rejected';job.error=reason;job.held=0;return save(job);}
    job.repairCount=1;job.state='needs_revision';job.error=reason;
    job.writerRequest=writerRequest(job,list().filter(j=>j.id!==job.id&&!j.previewOnly).slice(0,12));
    guidePublicCopy(job.writerRequest);
    job.writerRequest.messages.push({role:'user',content:JSON.stringify({instruction:'One repair attempt. Correct every listed failure; keep complete short English phrases and verified product capabilities. This creative uses abstract graphics, without a customer case study. Avoid all prohibited hype words, including negated uses.',previousCopy:job.copy||job.candidateCopy,failures:reason.slice(0,1200)})});
    return save(job);
  }
  async function pump(){
    if(rendering)return;const job=list().reverse().find(j=>j.state==='queued');if(!job)return;rendering=true;job.state='rendering';save(job);
    try{job.files=await renderer(job,output,assets);job.state='ready';job.held=0;job.readyAt=new Date().toISOString();}
    catch(e){job.state='failed';job.error=String(e.message).replaceAll(root,'[studio]').slice(-3000);job.held=0;}
    finally{save(job);rendering=false;maintenance();setImmediate(pump);}
  }
  // Restarted renders are not assumed successful; provider reservations survive.
  for(const job of list())if(job.state==='rendering'){job.state='queued';save(job);}
  setImmediate(pump);
  const safe=job=>({id:job.id,kind:job.kind,previewOnly:Boolean(job.previewOnly),state:job.state,feature:job.feature.id,layout:job.layout,hook:job.copy?.hook,designVersion:job.designVersion||1,error:job.error,costUsd:job.cost,reservedUsd:job.held,usage:job.usage,files:job.files,createdAt:job.createdAt,published:Boolean(job.published),instagram:job.instagram,instagramState:instagram.status(job.id).state,previewUrl:`${process.env.STUDIO_PUBLIC_URL||''}/jobs/${job.id}`,downloadUrls:job.files.map(f=>`${process.env.STUDIO_PUBLIC_URL||''}/media/${job.id}/${f}`)});
  function authorized(req){const a=Buffer.from(req.headers.authorization||''),b=Buffer.from('Bearer '+token);return a.length===b.length&&timingSafeEqual(a,b);}
  const json=(res,code,value)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  const galleryStyle=`*{box-sizing:border-box}body{margin:0;background:#f5f7fb;color:#101623;font:16px/1.5 Arial,sans-serif}header{padding:28px max(24px,calc((100vw - 1180px)/2));background:#101623;color:white}header h1{margin:0;font-size:28px}main{max-width:1180px;margin:30px auto;padding:0 24px}.muted{color:#667085}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px}.card{background:white;border:1px solid #d7dee8;border-radius:16px;overflow:hidden;padding:20px}.card img{width:100%;border-radius:8px}a{color:#2454d6}audio{display:block;max-width:100%;margin:20px 0}video{max-width:100%;max-height:78vh;background:#101623}.slides{display:flex;gap:20px;overflow:auto;scroll-snap-type:x mandatory}.slides img{width:min(80vw,420px);scroll-snap-align:start}.badge{padding:4px 10px;border-radius:30px;background:#e9eef6;display:inline-block;font-size:13px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;background:#fff;padding:24px;border-radius:12px}nav{margin:20px 0;display:flex;flex-wrap:wrap;gap:24px}details{margin:16px 0}h2{line-height:1.2}small{display:block}`;
  const html=(res,title,body)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; style-src 'unsafe-inline'; img-src 'self'; media-src 'self'; script-src 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff'});res.end(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · Example</title><style>${galleryStyle}</style></head><body><header><h1>Example Social Studio</h1><span>English media · ${instagram.enabled()?'Instagram publishing enabled':'Instagram publishing disabled'}</span></header><main>${body}</main></body></html>`);};
  async function sendInstagramFile(req,res,file) {
    const size=(await stat(file)).size;
    const type=file.endsWith('.mp4')?'video/mp4':file.endsWith('.jpg')?'image/jpeg':file.endsWith('.json')?'application/json':'text/plain; charset=utf-8';
    res.writeHead(200,{'Content-Type':type,'Content-Length':size,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});
    return createReadStream(file).pipe(res);
  }
  const server=http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'http://studio');
      if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{ok:true,version:1,rendering,publishingEnabled:instagram.enabled()});
      if(url.pathname.startsWith('/v1/')){
        if(!authorized(req))return json(res,401,{error:'Unauthorized'});
    if(req.method==='GET'&&url.pathname==='/v1/instagram/settings')return json(res,200,{enabled:instagram.enabled(),accountId:process.env.STUDIO_INSTAGRAM_ACCOUNT_ID||'',username:process.env.STUDIO_INSTAGRAM_USERNAME||''});
    const igMedia=url.pathname.match(/^\/v1\/instagram\/media\/([a-f0-9-]{36})\/([a-z0-9.-]+)$/);
    if(req.method==='GET'&&igMedia)return await sendInstagramFile(req,res,instagram.publicAsset(igMedia[1],igMedia[2],url.searchParams.get('expires'),url.searchParams.get('sig')));
    const igStatus=url.pathname.match(/^\/v1\/jobs\/([a-f0-9-]{36})\/instagram$/);
    if(req.method==='GET'&&igStatus)return json(res,200,instagram.status(igStatus[1]));
    const igFile=url.pathname.match(/^\/v1\/jobs\/([a-f0-9-]{36})\/files\/([a-z0-9.-]+)$/);
    if(req.method==='GET'&&igFile){const j=get(igFile[1]);if(j.state!=='ready'||!j.files.includes(igFile[2]))throw Object.assign(new Error('Media not available'),{status:404});return await sendInstagramFile(req,res,join(output,j.id,igFile[2]));}
        if(req.method==='GET'&&url.pathname==='/v1/storage')return json(res,200,{...assertRenderSpace(output),maintenance:maintenanceReport});
        if(req.method==='GET'&&url.pathname==='/v1/budget')return json(res,200,budget());
        if(req.method==='GET'&&/^\/v1\/jobs\/[a-f0-9-]{36}$/.test(url.pathname))return json(res,200,safe(get(url.pathname.split('/').pop())));
        if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
        let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>131072)throw Object.assign(new Error('Request too large'),{status:413});}const body=JSON.parse(text);
    if(url.pathname==='/v1/instagram/settings')return json(res,200,instagram.configure(body.enabled));
    const igAction=url.pathname.match(/^\/v1\/jobs\/([a-f0-9-]{36})\/instagram\/(claim|result)$/);
    if(igAction)return json(res,200,igAction[2]==='claim'?instagram.claim(igAction[1],body.executionId,body.dryRun===true):instagram.record(igAction[1],body.executionId,body.stepId,body.response));
        if(url.pathname==='/v1/jobs'){const job=reserve(body);return json(res,200,{...safe(job),writerRequest:job.state==='reserved'?job.writerRequest:undefined,canGenerate:job.state==='reserved'});}
        const match=url.pathname.match(/^\/v1\/jobs\/([a-f0-9-]{36})\/(draft|review|rerender)$/);if(!match)throw Object.assign(new Error('Unknown operation'),{status:404});
        const job=get(match[1]);const stage=match[2];
        if(stage==='rerender'){
          if(!job.review?.approved||!job.copy)throw new Error('Only reviewed copy may be rendered');
          if(!['queued','rendering'].includes(job.state)){assertRenderSpace(output);job.state='queued';delete job.error;delete job.mediaDeletedAt;delete job.cleanupPending;delete job.archivedFiles;delete job.lastGenerationState;save(job);setImmediate(pump);}
          return json(res,200,safe(job));
        }
        if(stage==='draft'){
          if(!['reserved','needs_revision'].includes(job.state))return json(res,200,{...safe(job),reviewerRequest:job.state==='drafted'?reviewerRequest(job):undefined});
          account(job,job.repairCount?'writer-repair':'writer',body);
          try{job.candidateCopy=parseCompletion(body);job.copy=validateCopy(resolveCreativeCopy(job.candidateCopy,job),list().filter(j=>j.id!==job.id&&!j.previewOnly).slice(0,12),job);validateInstagramCaption(job.copy.caption);job.state='drafted';save(job);return json(res,200,{...safe(job),reviewerRequest:reviewerRequest(job)});}
          catch(e){revise(job,e.message);return json(res,200,{...safe(job),writerRequest:job.state==='needs_revision'?job.writerRequest:undefined});}
        }
        if(job.state!=='drafted')return json(res,200,safe(job));
        account(job,job.repairCount?'reviewer-repair':'reviewer',body);
        try{const review=parseCompletion(body);if(typeof review.approved!=='boolean'||!Array.isArray(review.reasons))throw new Error('Invalid editorial review');job.review=review;if(!review.approved){revise(job,review.reasons.join('; '));}else{job.state='queued';delete job.error;}save(job);setImmediate(pump);return json(res,200,{...safe(job),writerRequest:job.state==='needs_revision'?job.writerRequest:undefined});}
        catch(e){job.state='rejected';job.error=e.message;job.held=0;save(job);throw e;}
      }
      const ip=req.socket.remoteAddress?.replace('::ffff:','');
      if(req.method!=='GET'||!allowedViewers.includes(ip))return json(res,403,{error:'Private preview is restricted to the configured owner devices'});
      if(url.pathname==='/'){
        const b=budget();return html(res,'Private drafts',`<p><strong>API this month: $${b.cost.toFixed(4)}</strong> · held $${b.held.toFixed(2)} · conservative budget $${b.limitUsd.toFixed(2)} / month</p><p class="muted">The $3 limit leaves a currency/tax margin under the approved €5 budget. Provider usage, including reasoning output, is recorded per job. Pending/unknown calls retain their reservation.</p><div class="grid">${list().map(j=>`<article class="card"><span class="badge">${escape(j.kind.toUpperCase())} · ${escape(j.state)}${j.designVersion>=2?' · motion graphics'+(j.designVersion>=3&&j.kind==='reel'?' · storytelling':''):''}</span><h2>${escape(j.copy?.hook||j.feature.category)}</h2>${j.state==='ready'?`<a href="/jobs/${j.id}"><img src="/media/${j.id}/${j.kind==='reel'?'cover.jpg':'slide-1.jpg'}" alt="${escape(j.copy.hook)}"></a>`:''}<p>${escape(j.feature.audience)} · ${escape(j.layout)}</p><small>$${j.cost.toFixed(4)} API · ${escape(j.createdAt.slice(0,16).replace('T',' '))} UTC</small><a href="/jobs/${j.id}">Open private draft</a></article>`).join('')}</div>`);
      }
      const jobMatch=url.pathname.match(/^\/jobs\/([a-f0-9-]{36})$/);
      if(jobMatch){const j=get(jobMatch[1]);return html(res,j.copy?.hook||'Draft',`<nav><a href="/">← All drafts</a></nav><span class="badge">${escape(j.state)} · ${escape(j.kind)} · ${j.published?'published on Instagram':'not published'}</span>${j.instagram?.permalink?`<p><a href="${escape(j.instagram.permalink)}" rel="noopener" target="_blank">View on Instagram</a></p>`:''}<h2>${escape(j.copy?.hook||j.feature.category)}</h2>${j.state==='ready'?(j.kind==='reel'?`<video controls playsinline preload="metadata" poster="/media/${j.id}/cover.jpg" src="/media/${j.id}/reel.mp4"><track kind="captions" src="/media/${j.id}/narration.vtt" srclang="en" label="English narration"></video>`:`<div class="slides">${j.files.filter(f=>/^slide-\d+\.mp4$/.test(f)).map(f=>`<video controls playsinline preload="metadata" aria-label="Animated post with embedded music" poster="/media/${j.id}/${f.replace('.mp4','.jpg')}" src="/media/${j.id}/${f}"></video>`).join('')}${j.files.filter(f=>f.endsWith('.jpg')&&!j.files.includes(f.replace('.jpg','.mp4'))).map((f,i)=>`<a href="/media/${j.id}/${f}"><img src="/media/${j.id}/${f}" alt="Slide ${i+1}"></a>`).join('')}</div>`):`<p>${escape(j.state==='archived'?'Local media expired under the retention policy. Any Instagram publication remains available above.':j.error||'Production is in progress. Reload to see the result.')}</p>`}${j.kind==='reel'&&j.state==='ready'&&j.files.includes('voiceover.wav')?`<p>English voiceover · synthetic voice · generated locally · $0 narration API cost</p><audio controls preload="metadata" src="/media/${j.id}/voiceover.wav"></audio>`:''}<h3>Caption</h3><pre>${escape(j.copy?.caption||'')}</pre><p>Evidence: ${escape(j.feature.proof)}</p><details><summary>Usage and editorial review</summary><pre>${escape(JSON.stringify({costUsd:j.cost,reservedUsd:j.held,usage:j.usage,review:j.review},null,2))}</pre></details><nav>${j.files.filter(f=>j.kind==='reel'||!['voiceover.wav','narration.vtt','narration.srt','narration.json'].includes(f)).map(f=>`<a href="/media/${j.id}/${f}" download>${escape(f)}</a>`).join('')}</nav>`);}
      const media=url.pathname.match(/^\/media\/([a-f0-9-]{36})\/([a-z0-9.-]+)$/);if(media){const j=get(media[1]);if(j.state!=='ready'||!j.files.includes(media[2]))throw Object.assign(new Error('Media not available'),{status:404});const file=join(output,j.id,media[2]);const size=(await stat(file)).size;const types={'.jpg':'image/jpeg','.mp4':'video/mp4','.wav':'audio/wav','.vtt':'text/vtt; charset=utf-8','.srt':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json'};const type=types['.'+media[2].split('.').pop()]||'application/octet-stream';const range=req.headers.range;if(range){const m=range.match(/^bytes=(\d+)-(\d*)$/);if(!m)throw Object.assign(new Error('Invalid byte range'),{status:416});const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),size-1):size-1;if(start>end||start>=size)throw Object.assign(new Error('Invalid byte range'),{status:416});res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1,'Accept-Ranges':'bytes'});return createReadStream(file,{start,end}).pipe(res);}res.writeHead(200,{'Content-Type':type,'Content-Length':size,'Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'});return createReadStream(file).pipe(res);}
      json(res,404,{error:'Not found'});
    }catch(e){json(res,e.status||400,{error:e.message});}
  });
  return {server,db,list,get,budget,reserve,close:()=>new Promise(r=>{clearInterval(maintenanceTimer);server.close(()=>{db.close();r();});})};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const studio=createStudio();studio.server.listen(Number(process.env.PORT||3848),'0.0.0.0',()=>console.log('Example studio listening; publication policy is persisted in SQLite'));
}
