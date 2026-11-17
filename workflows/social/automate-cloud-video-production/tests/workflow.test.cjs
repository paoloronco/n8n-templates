const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=__dirname;
const w=JSON.parse(fs.readFileSync(path.join(root,'../automate-cloud-video-production.json'),'utf8'));
const nodes=new Map(w.nodes.map(n=>[n.name,n]));
const sandbox={Buffer,Date,JSON,Intl,module:{exports:{}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'shared-core.js'),'utf8')+'\nmodule.exports={validateWorkflowBrief,assertDeliveryApproval,destinationSnapshot,slotKey,reserveSlot,initDelivery,deliveryTransition,reconcileDelivery,bindWorkflowDecision,authorizeMedia,checkedRendererUrl};',sandbox);
const f=sandbox.module.exports;
const cfg={renderer:'heygen',rendererBaseUrl:'https://api.heygen.com',publicN8nBaseUrl:'https://automation.example.com',publishingEnabled:true,instagramAccountId:'123456789',instagramUsername:'studio_demo',youtubeChannelId:'UC'+'a'.repeat(22),defaultBrand:'Example Studio',defaultTargets:{instagram:false,youtube:true},timezone:'Europe/Rome',hours:[10,12,15,18,21]};
const now=Date.parse('2026-11-17T09:00:00Z'),hash='a'.repeat(64);
const brief={format:'wall_text',brief:{title:'One approved file',narration:'Review the complete video before publishing it.',caption:'A controlled publishing test.',scenes:[{title:'Review',body:'Watch the original.'},{title:'Approve',body:'Approve its exact version.'}]},targets:{instagram:false,youtube:true},privateTest:true};
function reviewed(options={}){
 const request=f.validateWorkflowBrief({...brief,...options},cfg,now-1000);
 const row={id:1,jobId:'video-100',phase:'review',requestJson:JSON.stringify(request),contextJson:JSON.stringify({jobId:'video-100',stage:'review',reviewExpires:now+86400000}),token:'b'.repeat(128),renderId:'hfr_example',sha256:hash,error:''};
 return f.bindWorkflowDecision(row,{token:row.token,sha256:hash,decision:'approve',reviewed:'yes',reviewer:'Test reviewer'},cfg,now);
}
function step(row,response){return f.deliveryTransition(row,cfg,now,'test-execution',response);}
function start(row=reviewed()){return step(f.initDelivery(row,cfg,now,'test-execution','c'.repeat(128)));}
const c=row=>JSON.parse(row.contextJson),action=row=>row._deliveryAction;
function atUpload(){let row=start();row=step(row,{items:[{id:cfg.youtubeChannelId}]});row=step(row,{data:{status:'completed',video_url:'https://media.example.com/original.mp4'}});return step(row,{sha256:hash,qc:{width:1080,height:1920,duration:18}});}
const processed=id=>({items:[{id,snippet:{channelId:cfg.youtubeChannelId},status:{uploadStatus:'processed',privacyStatus:'private'},processingDetails:{processingStatus:'succeeded',fileDetailsAvailability:'available'},fileDetails:{durationMs:'18000',videoStreams:[{widthPixels:1080,heightPixels:1920}],audioStreams:[{channelCount:2}]}}]});

test('portable cloud workflow compiles, resolves its graph and has no VM runtime nodes',()=>{
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 for(const n of w.nodes){assert.ok(!/ssh|executeCommand|readWriteFile/i.test(n.type),n.name);assert.ok(!n.disabled,n.name);if(n.parameters.jsCode)assert.doesNotThrow(()=>new AsyncFunction(n.parameters.jsCode),n.name);for(const credential of Object.values(n.credentials||{}))assert.equal(credential.id,null);}
 for(const [name,channels] of Object.entries(w.connections)){assert.ok(nodes.has(name));for(const groups of Object.values(channels))for(const group of groups)for(const t of group)assert.ok(nodes.has(t.node),name+' -> '+t.node);}
 const configRun=new Function('$input',nodes.get('Apply video configuration').parameters.jsCode);
 const value=configRun({first:()=>({json:{}})})[0].json.config;
 assert.equal(value.renderer,'heygen');assert.equal(value.rendererBaseUrl,'https://api.heygen.com');assert.equal(value.publishingEnabled,false);assert.equal(value.allowExistingApiCredits,false);
 assert.equal(w.active,false);assert.ok(!/Start the included local worker|127\.0\.0\.1:3850|n8n\.prhomelab|brand\\": \\"OrbitPage/.test(JSON.stringify(w)));
 assert.equal(w.nodes.filter(n=>n.type==='n8n-nodes-base.manualTrigger').length,1,'n8n drops additional Manual Triggers during import');
 assert.equal(nodes.get('Create one cloud example').type,'n8n-nodes-base.noOp');
 const hooks=w.nodes.filter(n=>['n8n-nodes-base.webhook','n8n-nodes-base.formTrigger','n8n-nodes-base.form'].includes(n.type));
 for(const n of hooks)assert.ok(typeof n.webhookId==='string'&&n.webhookId.length>0,n.name+' must register after CLI import');
 assert.equal(new Set(hooks.map(n=>n.webhookId)).size,hooks.length);
 assert.equal(nodes.get('Submit a video brief').parameters.path,'video-intake');assert.equal(nodes.get('Recover an existing job').parameters.path,'video-recovery');assert.equal(w.nodes.filter(n=>n.type==='n8n-nodes-base.formTrigger').length,0);
});
test('malformed public requests cannot enter storage setup',()=>{
 for(const [entry,validator,intent] of [['Review a cloud draft','Validate review link','review'],['Receive draft decision','Validate draft decision','decision'],['Serve reviewed video media','Validate media request','media']]){
  assert.equal(w.connections[entry].main[0][0].node,validator);
  const result=new Function('$json',nodes.get(validator).parameters.jsCode)({})[0].json;
  assert.equal(result._intent,intent);assert.equal(result.valid,false);
  assert.equal(w.connections[validator].main[0][0].node,'Apply video configuration');
 }
});

test('protected native forms route GET to HTML and POST to the shared pipeline',()=>{
 const prepare=nodes.get('Prepare protected video form').parameters.jsCode;
 for(const [name,path] of [['Submit a video brief','video-intake'],['Recover an existing job','video-recovery']]){
  const node=nodes.get(name);assert.equal(node.parameters.authentication,'basicAuth');assert.deepEqual(node.parameters.httpMethod,['GET','POST']);
  assert.equal(w.connections[name].main[0][0].node,'Prepare protected video form');
  const html=new Function('$input',prepare)({first:()=>({json:{webhookUrl:'https://automation.example.com/webhook/'+path}})})[0].json.html;
  assert.match(html,/method="post"/);assert.ok(html.includes('action="https://automation.example.com/webhook/'+path+'"'));
  assert.ok(html.includes(path==='video-intake'?'name="Brief JSON"':'name="Review token"'));
 }
 const json=new Function('$input',nodes.get('Apply video configuration').parameters.jsCode)({first:()=>({json:{webhookUrl:'https://automation.example.com/webhook/video-intake',body:{'Brief JSON':JSON.stringify(brief)}}})})[0].json;
 assert.equal(json._intent,'create');assert.equal(json.fromForm,true);
 const token='b'.repeat(64);
 const recovery=new Function('$input',nodes.get('Validate recovery request').parameters.jsCode)({first:()=>({json:{body:{'Job ID':'video-100','Review token':token}}})})[0].json;
 assert.equal(recovery.jobId,'video-100');assert.equal(recovery.token,token);
});
test('private YouTube tests reject Instagram selection',()=>{
 assert.throws(()=>f.validateWorkflowBrief({...brief,targets:{instagram:true,youtube:true}},cfg,now),/must select YouTube only/);
});
test('approval binds bytes, complete brief, identities, privacy and due time',()=>{
 const row=reviewed();assert.doesNotThrow(()=>f.assertDeliveryApproval(row,cfg,now));
 for(const mutation of [r=>r.sha256='f'.repeat(64),r=>{const j=JSON.parse(r.requestJson);j.brief.caption='Changed';r.requestJson=JSON.stringify(j);}]){const bad=structuredClone(row);mutation(bad);assert.throws(()=>f.assertDeliveryApproval(bad,cfg,now),/approved/);}
 assert.throws(()=>f.assertDeliveryApproval(row,{...cfg,youtubeChannelId:'UC'+'z'.repeat(22)},now),/differs/);
 assert.throws(()=>f.assertDeliveryApproval(reviewed({publishAt:new Date(now+86400000).toISOString()}),cfg,now),/not due/);
});
test('one slot cannot be assigned to different jobs, including a fresh concurrent read',()=>{
 const key=f.slotKey(cfg,now,'a',false);assert.equal(key,'2026-11-17-10');
 const first=f.reserveSlot({id:9,contextJson:'{"claims":{}}'},'video-100',key,now);
 assert.equal(f.reserveSlot(first,'video-101',key,now),null);
 assert.ok(f.reserveSlot(first,'video-100',key,now));
 assert.equal(f.slotKey(cfg,Date.parse('2026-11-17T08:00:00Z'),'a',false),null);
});
test('YouTube-only delivery never plans an Instagram call and accepts the successful final poll',()=>{
 let row=atUpload();assert.equal(action(row).kind,'youtube');row=step(row,{id:'AbCdEf01234'});
 for(let i=0;i<20;i++){row=step(row,{items:[{id:'AbCdEf01234',snippet:{channelId:cfg.youtubeChannelId},status:{uploadStatus:'uploaded'},processingDetails:{fileDetailsAvailability:'processing'}}]});assert.equal(action(row).kind,'wait');row=step(row,{});}
 row=step(row,processed('AbCdEf01234'));assert.equal(c(row).delivery.state,'published');assert.equal(c(row).delivery.instagram.state,'skipped');
});
test('an uncertain YouTube upload requires its existing ID and never uploads again',()=>{
 const uncertain=step(atUpload(),{error:{message:'Acknowledgement lost'}});
 assert.equal(c(uncertain).delivery.state,'reconciliation_required');assert.ok(c(uncertain).delivery.pendingWrite);
 assert.throws(()=>f.reconcileDelivery(uncertain,{},cfg,now),/existing ID/);
 const recovered=f.reconcileDelivery(uncertain,{youtubeVideoId:'AbCdEf01234'},cfg,now);
 let row=start(recovered);assert.equal(c(row).delivery.stage,'yt_channel');row=step(row,{items:[{id:cfg.youtubeChannelId}]});assert.equal(c(row).delivery.stage,'yt_verify');assert.equal(action(row).kind,'read');
 row=step(row,processed('AbCdEf01234'));assert.equal(c(row).delivery.state,'published');
});
test('wrong remote visibility retains the recorded YouTube ID for recovery',()=>{
 let row=step(atUpload(),{id:'AbCdEf01234'}),data=processed('AbCdEf01234');data.items[0].status.privacyStatus='public';row=step(row,data);
 assert.equal(c(row).delivery.state,'delivery_failed');assert.equal(c(row).delivery.youtube.videoId,'AbCdEf01234');assert.match(c(row).delivery.error,/visibility/);
});
test('a changed original MP4 cannot reach the upload action',()=>{
 let row=start();row=step(row,{items:[{id:cfg.youtubeChannelId}]});row=step(row,{data:{status:'completed',video_url:'https://media.example.com/original.mp4'}});row=step(row,{sha256:'f'.repeat(64),qc:{width:1080,height:1920,duration:18}});
 assert.equal(action(row).kind,'receipt');assert.equal(c(row).delivery.state,'delivery_failed');assert.ok(!c(row).delivery.pendingWrite);
});
test('uncertain Instagram container creation cannot be repeated without reconciliation',()=>{
 let row=start(reviewed({privateTest:false,targets:{instagram:true,youtube:true}}));row=step(row,{data:[{id:cfg.instagramAccountId,username:cfg.instagramUsername}]});row=step(row,{data:[{quota_usage:0,config:{quota_total:50}}]});assert.equal(action(row).method,'POST');
 row=step(row,{error:{message:'Connection dropped'}});assert.equal(c(row).delivery.state,'reconciliation_required');assert.throws(()=>f.reconcileDelivery(row,{},cfg,now),/existing ID/);
 row=f.reconcileDelivery(row,{instagramContainerId:'987654321'},cfg,now);row=start(row);assert.equal(action(row).method,'GET');assert.equal(action(row).node,'987654321');
});
test('publishing and private review capabilities are distinct and expire',()=>{
 const row=f.initDelivery(reviewed({privateTest:false,targets:{instagram:true,youtube:false}}),cfg,now,'test-execution','c'.repeat(128)),ctx=c(row);
 assert.doesNotThrow(()=>f.authorizeMedia(row,{scope:'review',token:row.token,expires:ctx.reviewExpires},now,cfg));
 assert.throws(()=>f.authorizeMedia(row,{scope:'publish',token:row.token,expires:ctx.delivery.mediaExpires},now,cfg),/denied/);
 assert.doesNotThrow(()=>f.authorizeMedia(row,{scope:'publish',token:ctx.delivery.mediaToken,expires:ctx.delivery.mediaExpires},now,cfg));
 assert.throws(()=>f.authorizeMedia(row,{scope:'publish',token:ctx.delivery.mediaToken,expires:ctx.delivery.mediaExpires},ctx.delivery.mediaExpires+1,cfg),/expired/);
});
test('local provider media stays on the configured adapter origin',()=>{
 const local={...cfg,renderer:'local',rendererBaseUrl:'http://127.0.0.1:3863'};
 assert.equal(f.checkedRendererUrl('http://127.0.0.1:3863/media/a.mp4',local,'video'),'http://127.0.0.1:3863/media/a.mp4');
 assert.throws(()=>f.checkedRendererUrl('http://127.0.0.1:9999/media/a.mp4',local,'video'),/must stay/);
});

test('both selected channels finish and preserve independent receipts',()=>{
 let row=start(reviewed({privateTest:false,targets:{instagram:true,youtube:true}}));
 row=step(row,{data:[{id:cfg.instagramAccountId,username:cfg.instagramUsername}]});
 row=step(row,{data:[{quota_usage:0,config:{quota_total:50}}]});
 row=step(row,{id:'987654321'});row=step(row,{status_code:'FINISHED'});
 row=step(row,{id:'12345678901'});
 row=step(row,{id:'12345678901',caption:brief.brief.caption,media_product_type:'REELS',permalink:'https://www.instagram.com/reel/Example123/'});
 assert.equal(c(row).delivery.instagram.state,'published');assert.equal(c(row).delivery.stage,'yt_channel');
 row=step(row,{error:{message:'Temporary YouTube read error'}});
 assert.equal(c(row).delivery.instagram.mediaId,'12345678901');
 row=start(f.reconcileDelivery(row,{},cfg,now));assert.equal(c(row).delivery.stage,'yt_channel');
 row=step(row,{items:[{id:cfg.youtubeChannelId}]});
 row=step(row,{data:{status:'completed',video_url:'https://media.example.com/original.mp4'}});
 row=step(row,{sha256:hash,qc:{width:1080,height:1920,duration:18}});
 row=step(row,{id:'AbCdEf01234'});const data=processed('AbCdEf01234');data.items[0].status.privacyStatus='public';row=step(row,data);
 assert.equal(c(row).delivery.state,'published');assert.equal(c(row).delivery.instagram.mediaId,'12345678901');assert.equal(c(row).delivery.youtube.videoId,'AbCdEf01234');
});

function renderPlan(config,policy=config,context={}){
 const request=f.validateWorkflowBrief(brief,config,now);
 const row={id:1,jobId:'video-100',phase:'account',requestJson:JSON.stringify(request),contextJson:JSON.stringify({jobId:'video-100',stage:'account',fromForm:false,...context})};
 return new Function('$input','$execution','$',nodes.get('Plan next step').parameters.jsCode)({first:()=>({json:row})},{id:'test-execution'},()=>({first:()=>({json:{config:policy}})}))[0].json;
}
test('cloud spending gate uses the current policy and reserves its cap before any API call',()=>{
 const enabled={...cfg,allowExistingApiCredits:true};
 let row=renderPlan(enabled);assert.equal(row._action.kind,'permit');assert.equal(c(row).resumeAfterPermit,'account');
 row=renderPlan(enabled,{...enabled,allowExistingApiCredits:false});assert.equal(row.phase,'failed');assert.equal(row._action.kind,'receipt');
 row=renderPlan({...enabled,renderer:'local',rendererBaseUrl:'http://127.0.0.1:3863',allowExistingApiCredits:false});assert.equal(row._action.kind,'read');assert.match(row._action.url,/127\.0\.0\.1:3863/);
});
test('a renderer profile change stops credential transmission for existing jobs',()=>{
 const row=renderPlan({...cfg,allowExistingApiCredits:true},{...cfg,renderer:'local',rendererBaseUrl:'http://127.0.0.1:3863'});
 assert.equal(row.phase,'failed');assert.equal(row._action.kind,'receipt');assert.match(row.error,/profile/);
 assert.throws(()=>f.assertDeliveryApproval(reviewed(),{...cfg,rendererBaseUrl:'https://another.example.com'},now),/profile/);
});
test('cloud-render cap exhaustion becomes a recoverable checkpoint rather than an uncaught exception',()=>{
 const code=nodes.get('Reserve one free render').parameters.jsCode;
 const job={jobId:'video-100',contextJson:'{"stage":"permit"}'};
 const row=new Function('$input','$',code)({first:()=>({json:{id:4,contextJson:'{"jobs":["video-1","video-2","video-3"]}'}})},name=>({first:()=>({json:{config:{maxCloudRenders:3}}}),item:{json:job}}))[0].json;
 assert.equal(row.jobId,job.jobId);assert.match(row._response.error.message,/limit/);
 assert.equal(w.connections['Generation permit available?'].main[1][0].node,'Plan next step');
});
test('invalid MP4 bytes produce a durable delivery failure before upload',()=>{
 const base=atUpload();const ctx=c(base);ctx.delivery.stage='yt_download';delete ctx.delivery.pendingWrite;base.contextJson=JSON.stringify(ctx);
 const result=new Function('$input','$',nodes.get('Validate delivery MP4').parameters.jsCode)({first:()=>({json:{fileBase64:Buffer.from('broken').toString('base64'),sha256:hash}})},()=>({item:{json:base}}))[0].json;
 assert.ok(result._deliveryResponse.error);const failed=step(base,result._deliveryResponse);assert.equal(c(failed).delivery.state,'delivery_failed');assert.ok(!c(failed).delivery.pendingWrite);
});
test('expired approval recovery retains uncertain uploads and requires a new decision',()=>{
 let row=step(atUpload(),{error:{message:'Acknowledgement lost'}}),ctx=c(row);ctx.approval.validUntil=Date.now()-1;row.contextJson=JSON.stringify(ctx);
 const token=row.token,code=nodes.get('Resume without duplicate generation').parameters.jsCode;
 const renewed=new Function('$input','$',code)({first:()=>({json:row})},name=>({item:{json:{token}},first:()=>({json:{config:cfg}})}))[0].json;
 const rctx=c(renewed);assert.equal(renewed.phase,'review');assert.ok(!rctx.approval);assert.ok(rctx.delivery.pendingWrite);assert.equal(rctx.delivery.pendingWrite.stage,'yt_upload');
 const approved=f.bindWorkflowDecision(renewed,{token,sha256:hash,decision:'approve',reviewed:'yes',reviewer:'Technical reviewer'},cfg,Date.now());
 assert.throws(()=>f.initDelivery(approved,cfg,Date.now(),'new-execution','c'.repeat(64)),/uncertain/);
});

test('a recoverable Instagram claim refreshes an expired media capability',()=>{
 let row=f.initDelivery(reviewed({privateTest:false,targets:{instagram:true,youtube:false}}),cfg,now,'test-execution','c'.repeat(64));
 const ctx=c(row);ctx.delivery.owner='';ctx.delivery.leaseUntil=0;ctx.delivery.mediaExpires=now-1;ctx.delivery.stage='ig_create';row.contextJson=JSON.stringify(ctx);
 row=f.initDelivery(row,cfg,now,'new-execution','d'.repeat(64));assert.equal(c(row).delivery.mediaToken,'d'.repeat(64));assert.ok(c(row).delivery.mediaExpires>now);
});

test('a paused job returns recovery details before a render or review link exists',()=>{
 const row={jobId:'video-123',contextJson:JSON.stringify({stage:'failed',error:'Download unavailable'}),token:'f'.repeat(64),sha256:''};
 const receipt=new Function('$input','$',nodes.get('Cloud production receipt').parameters.jsCode)({first:()=>({json:row})},()=>({first:()=>({json:{config:cfg}})}))[0].json;
 assert.equal(receipt.reviewUrl,null);assert.equal(receipt.recoveryToken,row.token);assert.match(receipt.html,/Open recovery form/);assert.ok(receipt.html.includes(row.token));
});

test('Instagram selects the approved identity among multiple managed accounts and requests quota fields',()=>{
 let row=start(reviewed({privateTest:false,targets:{instagram:true,youtube:false}}));
 row=step(row,{data:[{id:'987654321',username:'another_account'},{id:cfg.instagramAccountId,username:cfg.instagramUsername}]});
 assert.equal(c(row).delivery.stage,'ig_quota');assert.equal(action(row).query.fields,'config,quota_usage');
});

test('render reconciliation preserves known IDs and requires a recorded submission',()=>{
 const row=reviewed(),token=row.token,code=nodes.get('Resume without duplicate generation').parameters.jsCode;
 const run=(context,renderId)=>new Function('$input','$',code)({first:()=>({json:{...row,renderId:context.renderId||'',contextJson:JSON.stringify({jobId:row.jobId,stage:'failed',failedStage:'submit',...context})}})},()=>({item:{json:{token,renderId}},first:()=>({json:{config:cfg}})}))[0].json;
 assert.throws(()=>run({renderId:'hfr_known_123'},'hfr_other_456'),/immutable/);
 assert.throws(()=>run({},'hfr_other_456'),/recorded submission/);
 const recovered=run({renderRequestedAt:now,assetId:'asst_known',projectHash:hash,duration:18},'hfr_existing_123');assert.equal(c(recovered).renderId,'hfr_existing_123');assert.equal(recovered.phase,'poll');
});


test('binary removed by native Crypto is restored from the hash-checked download',()=>{
 const bytes=fs.readFileSync(path.join(root,'../technical-preview.mp4'));
 const sha=require('node:crypto').createHash('sha256').update(bytes).digest('hex');
 const binary={data:{id:'filesystem-v2:existing-original',mimeType:'video/mp4'}};
 const row={...reviewed(),sha256:sha};
 const json={fileBase64:bytes.toString('base64'),sha256:sha};
 const result=new Function('$input','$',nodes.get('Verify approved media hash').parameters.jsCode)({first:()=>({json})},name=>({first:()=>name==='Read authorized original bytes'?{binary}:{json:row}}))[0];
 assert.equal(result.json.verified,true);assert.equal(result.binary,binary);
 const delivery=new Function('$input','$',nodes.get('Validate delivery MP4').parameters.jsCode)({first:()=>({json})},name=>({item:name==='Download approved original'?{binary}:{json:row}}))[0];
 assert.equal(delivery.binary,binary);assert.equal(delivery.json._deliveryResponse.sha256,sha);
});
