import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),C=require('./src/core.js');
const workflowPath=fs.existsSync(new URL('./workflow.json',import.meta.url))?'./workflow.json':'./release/workflow.json';
const workflow=JSON.parse(fs.readFileSync(new URL(workflowPath,import.meta.url),'utf8'));
const N=Object.fromEntries(workflow.nodes.map(n=>[n.name,n]));
const now='2026-11-20T10:00:00.000Z';
const base={action:'preview',generationEnabled:true,publishingEnabled:false,jobsTable:'v3_test_journal',sourceUrl:'https://example.com/update',titleSelector:'article h1',bodySelector:'article .social-fact',brand:'Example',language:'English',ctaUrl:'https://example.com/update',format:'carousel',campaignRevision:'1',imageUrl:'',musicUrl:'',model:'gpt-5-mini',maxMonthlyAiUsd:3,inputUsdPerMillion:0.25,outputUsdPerMillion:2,maxMonthlyRenderRequests:8,senderEmail:'sender@example.com',approverEmail:'reviewer@example.com',approvalHours:24,instagramAccountId:'1234567890',instagramUsername:'example'};
const selected={title:'A clearer product page',facts:['The editor can arrange sections and display a public product page.','Teams can review the selected content before publication.','A source link accompanies the final social caption.']};
function source(config={}){return C.sourceSnapshot(C.configure({...base,...config},'execution-a',now),selected);}
function ledger(){return {id:1,jobKey:'__ledger',contextJson:JSON.stringify({rev:0,owner:'',jobKey:'',month:'',aiReservedUsd:0,renderReserved:0})};}
function draft(){return {caption:'Keep your product story clear and ready to review.',slides:[{headline:'A clearer page',body:'Arrange sections for a public product page.',factIds:['f1']},{headline:'Review before publishing',body:'Teams can review selected content before publication.',factIds:['f2']},{headline:'Keep the source close',body:'The final social caption includes a source link.',factIds:['f3']},{headline:'Explore the update',body:'Learn more on the source page.',factIds:[]}]};}
function ai(value,status='completed'){return {id:'response-fixture',model:'gpt-5-mini',status,output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}],usage:{input_tokens:100,output_tokens:80}};}
function render(id,index,format='carousel'){return {id,status:'succeeded',url:`https://cdn.creatomate.com/renders/${id}.mp4`,snapshot_url:`https://cdn.creatomate.com/snapshots/${id}.jpg`,output_format:'mp4',width:1080,height:1350,frame_rate:24,duration:format==='carousel'?5.5:16.5,file_size:120000+index};}
function ready(config={}){
  let j=source(config);j=C.reserve(j,ledger(),now).job;j=C.acceptDraft(j,ai(draft()));j=C.acceptReview(j,ai({approved:true,reasons:[]}));
  for(let i=0;i<(j.config.format==='carousel'?4:1);i++){const id='aaaaaaaa-aaaa-aaaa-aaaa-'+String(i).padStart(12,'0');j=C.acceptRender(j,{id,status:'planned'});j=C.pollRender(j,render(id,i,j.config.format));}
  return j;
}
const codeRuns=[];
function runCode(name,input,store={},execution='fixture-execution'){
  const arr=Array.isArray(input)?input:[input];const rows=arr.map(json=>({json:C.clone(json)}));
  const $=key=>{assert.ok(store[key],`Missing fixture for ${key}`);const a=Array.isArray(store[key])?store[key]:[store[key]];return {first:()=>({json:C.clone(a[0])}),last:()=>({json:C.clone(a.at(-1))}),all:()=>a.map(json=>({json:C.clone(json)}))};};
  const sandbox={ $,$input:{first:()=>rows[0],all:()=>rows},$execution:{id:execution},Date,JSON,Math,Number,String,Array,Object,Set,RegExp,Boolean,Error,encodeURIComponent,unescape,module:undefined,fetch:undefined,require:undefined,Buffer:undefined,URL:undefined};
  const result=vm.runInNewContext('(function(){'+N[name].parameters.jsCode+'})()',sandbox,{timeout:1000});codeRuns.push(name);return JSON.parse(JSON.stringify(result)).map(i=>i.json);
}
test('workflow is inactive, schedule disabled, and has no production account bindings',()=>{assert.equal(workflow.active,false);assert.equal(N['Check configured source daily'].disabled,true);assert.equal(workflow.settings.errorWorkflow,undefined);for(const n of workflow.nodes)assert.equal(n.credentials,undefined);assert.doesNotMatch(JSON.stringify(workflow),/orbitpage-social|social-studio:3848|0990f8e7d2507d6c|UCLOJy|prhomelab|paolo\.ronco|I9R1vIy4/);});
test('all graph references and node names are valid',()=>{assert.equal(new Set(workflow.nodes.map(n=>n.name)).size,workflow.nodes.length);for(const [from,c] of Object.entries(workflow.connections)){assert.ok(N[from]);for(const out of c.main)for(const edge of out)assert.ok(N[edge.node],edge.node);}for(const n of workflow.nodes)for(const match of JSON.stringify(n.parameters).matchAll(/\$\('([^']+)'\)/g))assert.ok(N[match[1]],match[1]);});
test('every executable node is reachable from a trigger',()=>{const found=new Set;function visit(name){if(found.has(name))return;found.add(name);for(const output of workflow.connections[name]?.main||[])for(const e of output)visit(e.node);}visit('Set up or run V3');visit('Check configured source daily');for(const n of workflow.nodes.filter(n=>!n.type.endsWith('stickyNote')))assert.ok(found.has(n.name),n.name);});
test('every embedded Code node compiles without modules or filesystem',()=>{for(const n of workflow.nodes.filter(n=>n.type.endsWith('.code')))new vm.Script('(function(){'+n.parameters.jsCode+'})()');});
test('setup route has no network or email nodes',()=>{assert.equal(N['Configure V3 only'].parameters.jsCode.includes('"generationEnabled": false'),true);const setupNodes=['Create dedicated editorial table','Read setup ledger','Ledger already initialized?','Initialize new budget ledger','Insert initial ledger once','Setup receipt'];for(const name of setupNodes)assert.ok(!/httpRequest|emailSend|openAi|facebookGraphApi/.test(N[name].type));const [c]=runCode('Configure V3 only',{});assert.equal(c.action,'setup');});
test('SHA256 matches Node crypto for ASCII and Unicode',()=>{for(const s of ['','test','caffè ☕','a'.repeat(2048)])assert.equal(C.sha256(s),crypto.createHash('sha256').update(s).digest('hex'));});
test('generation stays off by default and needs configured rates',()=>{assert.throws(()=>C.configure({...base,generationEnabled:false},'x',now),/disabled/);assert.throws(()=>C.configure({...base,inputUsdPerMillion:0},'x',now),/prices/);assert.throws(()=>C.configure({...base,action:'publish'},'x',now),/Publication is disabled/);});
test('source extraction rejects missing facts and excessive source content',()=>{assert.throws(()=>C.sourceSnapshot(base,{title:'Title',facts:[]}),/No useful/);assert.throws(()=>C.sourceSnapshot(base,{title:'Title',facts:['a'.repeat(11000)]}),/10,000/);});
test('fingerprint ignores extraction whitespace but detects selected facts and output settings',()=>{const a=source(),b=C.sourceSnapshot(a.config,{title:' A  clearer product page ',facts:selected.facts.map(f=>' '+f+' ')});assert.equal(a.sourceHash,b.sourceHash);assert.notEqual(a.sourceHash,source({format:'single'}).sourceHash);assert.notEqual(a.sourceHash,C.sourceSnapshot(a.config,{...selected,facts:[...selected.facts,'A newly verified feature is available.']}).sourceHash);});
test('duplicate revision is skipped and an approved preview can be reused without new generation',()=>{const a=ready();a.status='preview_approved';const s=source({action:'publish',publishingEnabled:true,generationEnabled:false});const resumed=C.chooseJob(s,C.rowFor(a));assert.equal(resumed.route,'resume');const reserved=C.reserve(resumed,ledger(),now);assert.equal(reserved.job.status,'ready');assert.equal(reserved.next.includes('"renderReserved":0'),true);assert.equal(C.chooseJob(source(),C.rowFor(a)).route,'skip');a.status='published';assert.equal(C.chooseJob(s,C.rowFor(a)).route,'skip');});
test('reservation enforces AI and renderer budgets and refuses concurrent owners',()=>{assert.throws(()=>C.reserve(source({maxMonthlyAiUsd:0.00001}),ledger(),now),/OpenAI reservation/);assert.throws(()=>C.reserve(source({maxMonthlyRenderRequests:1}),ledger(),now),/render-request/);const a=C.reserve(source(),ledger(),now);assert.throws(()=>C.reserve(source(),{contextJson:a.next},now),/holds the journal lock/);assert.equal(JSON.parse(a.next).renderReserved,4);assert.equal(a.previous,ledger().contextJson);});
test('new publish requests cannot generate when generation is off',()=>{const s=source({action:'publish',publishingEnabled:true,generationEnabled:false});assert.throws(()=>C.reserve(s,ledger(),now),/generationEnabled/);});
test('writer prompt treats source as data and requests strict bounded JSON',()=>{const request=C.requestFor(source());assert.equal(request.response_format.json_schema.strict,true);assert.match(request.messages[0].content,/untrusted data/);assert.equal(request.max_completion_tokens,1800);});
test('drafts require known references and reject invented numbers and URLs',()=>{let d=draft();d.slides[0].factIds=['f999'];assert.throws(()=>C.acceptDraft(source(),ai(d)),/known fact/);d=draft();d.caption='Save 90%';assert.throws(()=>C.acceptDraft(source(),ai(d)),/number absent/);d=draft();d.caption='See https://other.example.com';assert.throws(()=>C.acceptDraft(source(),ai(d)),/unapproved URL/);});
test('incomplete/refused/malformed OpenAI results stop without rendering',()=>{assert.throws(()=>C.acceptDraft(source(),ai(draft(),'incomplete')),/incomplete/);assert.throws(()=>C.aiJson({status:'completed',output:[{content:[{type:'refusal'}]}]}),/refused/);assert.throws(()=>C.aiJson({status:'completed',output:[{content:[{type:'output_text',text:'not json'}]}]}));});
test('review permits exactly one correction then records rejection',()=>{let j=C.acceptDraft(source(),ai(draft()));j=C.acceptReview(j,ai({approved:false,reasons:['Improve grammar.']}));assert.equal(j.status,'correction');assert.equal(j.corrections,1);j=C.acceptReview(j,ai({approved:false,reasons:['Still incorrect.']}));assert.equal(j.status,'editorial_rejected');assert.equal(j.corrections,1);});
test('RenderScript has supported output geometry, scene count and optional licensed audio',()=>{const j=ready();const p=C.composition(j,0);assert.equal(p.duration,5.5);assert.equal(p.height,1350);assert.equal(p.frame_rate,24);const s=ready({format:'single',musicUrl:'https://example.com/licensed.mp3'});const single=C.composition(s,0);assert.equal(single.duration,16.5);assert.equal(single.elements.filter(e=>e.type==='audio').length,1);assert.equal(single.elements.filter(e=>e.type==='text').length,16);});
test('render creation supports object or array response and preserves receipt IDs',()=>{const j=C.acceptRender(source(),[{id:'aaaaaaaa-aaaa-aaaa-aaaa-000000000000',status:'planned'}]);assert.equal(j.renders.length,1);assert.throws(()=>C.acceptRender(source(),{}),/no usable receipt/);});
test('render polling rejects wrong IDs, dimensions and provider warnings',()=>{const j=C.acceptRender(source(),{id:'aaaaaaaa-aaaa-aaaa-aaaa-000000000000',status:'planned'});assert.throws(()=>C.pollRender(C.clone(j),render('wrong-id',0)),/ID mismatch/);const r=render(j.renders[0].id,0);assert.throws(()=>C.pollRender(C.clone(j),{...r,width:720}),/dimensions/);assert.throws(()=>C.pollRender(C.clone(j),{...r,warnings:['Unknown parameter']}),/ignored or invalid/);});
test('known render failure is a recorded terminal state and poll loops are bounded',()=>{const j=C.acceptRender(source(),{id:'aaaaaaaa-aaaa-aaaa-aaaa-000000000000',status:'planned'});assert.equal(C.pollRender(C.clone(j),{id:j.renders[0].id,status:'failed',error_message:'No credit'}).status,'render_failed');j.renders[0].polls=90;assert.throws(()=>C.pollRender(j,{id:j.renders[0].id,status:'rendering'}),/poll limit/);});
test('human email includes all ordered render links, caption and escaped source text',()=>{const j=ready();j.title='<img src=x onerror=alert(1)>';const a=C.prepareApproval(j,now);for(const r of j.renders)assert.ok(a.reviewHtml.includes(r.url));assert.ok(a.reviewHtml.includes('&lt;img'));assert.equal(a.status,'awaiting_approval');});
test('approval rejects changes to caption, destination, source or render IDs',()=>{const j=C.prepareApproval(ready(),now);for(const mutate of [x=>x.caption+='changed',x=>x.config.instagramAccountId='9999999',x=>x.sourceHash='other',x=>x.renders[0].id='different']){const current=C.clone(j);mutate(current);assert.throws(()=>C.approvalDecision(C.clone(j),{data:{approved:true}},C.rowFor(current),now),/changed/);}});
test('reject and expiry never authorize publication; preview approval remains private',()=>{const j=C.prepareApproval(ready(),now),row=C.rowFor(j);assert.equal(C.approvalDecision(C.clone(j),{data:{approved:false}},row,now).status,'approval_rejected');assert.equal(C.approvalDecision(C.clone(j),{data:{approved:true}},row,'2026-11-22T00:00:00.000Z').status,'approval_expired');assert.equal(C.approvalDecision(C.clone(j),{data:{approved:true}},row,now).status,'preview_approved');});
test('render URL refresh must preserve reviewed IDs and metadata',()=>{const j=ready();const rs=j.renders.map((r,i)=>render(r.id,i));rs[0].url='https://cdn.creatomate.com/refreshed.mp4';assert.equal(C.refreshRenders(C.clone(j),rs).renders[0].url,rs[0].url);rs[0].file_size++;assert.throws(()=>C.refreshRenders(C.clone(j),rs),/differs/);});
test('Meta cannot start without exact approval, publish flag and matching authenticated identity',()=>{assert.throws(()=>C.beginMeta(ready(),{id:base.instagramAccountId,username:base.instagramUsername}),/approval/);const j=C.prepareApproval(ready({action:'publish',publishingEnabled:true}),now);const approved=C.approvalDecision(j,{data:{approved:true}},C.rowFor(j),now);assert.throws(()=>C.beginMeta(C.clone(approved),{id:'555555555',username:'other'}),/differs/);});
test('complete carousel publication simulation preserves children order and actual receipt',()=>{const j=C.prepareApproval(ready({action:'publish',publishingEnabled:true}),now);let s=C.approvalDecision(j,{data:{approved:true}},C.rowFor(j),now);s=C.beginMeta(s,{id:base.instagramAccountId,username:base.instagramUsername});const writes=[];for(let step=0;step<25&&s.status!=='published';step++){writes.push(C.clone(s.action));const stage=s.meta.stage;let response=stage==='child_create'||stage==='parent_create'?{id:String(100000+s.meta.index+(stage==='parent_create'?100:0))}:stage==='publish'?{id:'999999999'}:stage==='receipt'?{id:'999999999',permalink:'https://www.instagram.com/p/fixture/'}:{id:s.meta.containerId,status_code:'FINISHED'};s=C.acceptMeta(s,response);}assert.equal(s.status,'published');assert.equal(s.instagramId,'999999999');assert.equal(writes.filter(a=>a.edge==='media_publish').length,1);const parent=writes.find(a=>a.query.media_type==='CAROUSEL');assert.equal(parent.query.children,'100000,100001,100002,100003');assert.equal(writes.filter(a=>a.query.is_carousel_item).length,4);});
test('single publication simulation uses one video container and one publish',()=>{const j=C.prepareApproval(ready({format:'single',action:'publish',publishingEnabled:true}),now);let s=C.beginMeta(C.approvalDecision(j,{approved:true},C.rowFor(j),now),{id:base.instagramAccountId,username:base.instagramUsername});assert.equal(s.action.query.media_type,'REELS');assert.equal(s.action.query.share_to_feed,true);s=C.acceptMeta(s,{id:'111111111'});s=C.acceptMeta(s,{status_code:'FINISHED'});assert.equal(s.action.edge,'media_publish');s=C.acceptMeta(s,{id:'222222222'});s=C.acceptMeta(s,{id:'222222222',permalink:'https://www.instagram.com/reel/fixture/'});assert.equal(s.status,'published');});
test('Meta failure and ambiguous responses cannot be automatically retried',()=>{const j=ready({action:'publish',publishingEnabled:true});j.status='approved';let s=C.beginMeta(j,{id:base.instagramAccountId,username:base.instagramUsername});assert.throws(()=>C.acceptMeta(C.clone(s),{}),/no container ID/);s=C.acceptMeta(s,{id:'111111111'});assert.throws(()=>C.acceptMeta(C.clone(s),{status_code:'ERROR'}),/failed/);for(const n of workflow.nodes.filter(n=>/httpRequest|openAi|facebookGraphApi/.test(n.type)))assert.notEqual(n.retryOnFail,true);});
test('lock can only release for known terminal outcomes and matching owner',()=>{const r=C.reserve(source(),ledger(),now);assert.throws(()=>C.releaseLedger(r.job,{contextJson:r.next}),/terminal/);r.job.status='editorial_rejected';const released=C.releaseLedger(r.job,{contextJson:r.next});assert.equal(JSON.parse(released.next).owner,'');assert.throws(()=>C.releaseLedger({...r.job,executionId:'other'},{contextJson:r.next}),/owner mismatch/);});
test('actual embedded nodes execute source, lock, writer/reviewer, render and approval transforms without network globals',()=>{
 const c=C.configure(base,'fixture-execution',now),s=runCode('Fingerprint selected facts',selected,{'Configure V3 only':c})[0];
 const chosen=runCode('Choose new job or reuse preview',{}, {'Fingerprint selected facts':s})[0];
 const reserved=runCode('Reserve bounded budget and claim',ledger(),{'Choose new job or reuse preview':chosen})[0];
 const owned=runCode('Verify durable lock ownership',{contextJson:reserved.next},{'Reserve bounded budget and claim':reserved})[0];
 const writer=runCode('Prepare writer request',C.rowFor(owned))[0];
 const written=runCode('Validate draft and fact references',ai(draft()),{'Prepare writer request':writer})[0];
 const reviewer=runCode('Prepare independent review',C.rowFor(written))[0];
 const reviewed=runCode('Apply one-correction rule',ai({approved:true,reasons:[]}),{'Prepare independent review':reviewer})[0];
 const composed=runCode('Build next Creatomate composition',C.rowFor(reviewed))[0];
 const receipt=runCode('Keep render receipt before polling',{id:'aaaaaaaa-aaaa-aaaa-aaaa-000000000000',status:'planned'},{'Build next Creatomate composition':composed})[0];
 const polled=runCode('Check render result and dimensions',render(receipt.renders[0].id,0),{'Prepare existing render poll':receipt})[0];assert.equal(polled.status,'next_render');
 const approval=runCode('Build exact approval package',C.rowFor(ready()))[0];
 const decision=runCode('Validate approval hash and expiry',C.rowFor(approval),{'Hold human response':{job:approval,approvalResponse:{data:{approved:true}}}})[0];assert.equal(decision.status,'preview_approved');
});
test('all native paid nodes have durable intent predecessors and approval dominates publication',()=>{for(const [node,predecessor] of [['Write grounded social copy','Checkpoint writer intent'],['Review facts and grammar','Checkpoint reviewer intent'],['Create Creatomate render','Checkpoint render intent']])assert.ok(workflow.connections[predecessor].main.flat().some(e=>e.node===node));const incoming=Object.entries(workflow.connections).filter(([_,c])=>c.main.flat().some(e=>e.node==='Refresh only reviewed render IDs'));assert.deepEqual(incoming.map(x=>x[0]),['Approved for real publication?']);assert.equal(N['Approve or reject exact videos'].parameters.operation,'sendAndWait');});
test('selected facts are not silently truncated or dropped',()=>{assert.throws(()=>C.sourceSnapshot(base,{title:'Title',facts:['a'.repeat(601)]}),/never silently truncated/);assert.throws(()=>C.sourceSnapshot(base,{title:'Title',facts:Array.from({length:13},(_,i)=>'A selected source fact '+i+' with useful words.')}),/never silently truncated/);});

// Run the emitted graph itself with in-memory native-node/provider adapters.
// There are no sockets or credentials in this harness. HTML extraction/CAS were
// separately exercised by real native nodes in the isolated n8n acceptance run.
function graphFixture(config={},options={},priorRows){
  const store={},rows=priorRows?C.clone(priorRows):[{id:1,jobKey:'__ledger',contextJson:ledger().contextJson}];
  const count={ai:0,renders:0,email:0,metaPosts:0,publishPosts:0},trace=[],polls={};
  function env(input){const items=input.map(json=>({json:C.clone(json)}));return {$json:items[0]?.json,$input:{first:()=>items[0],all:()=>items},$execution:{id:'graph-fixture'},$:name=>{assert.ok(store[name],`No output for ${name}`);const a=store[name];return {first:()=>({json:C.clone(a[0])}),last:()=>({json:C.clone(a.at(-1))}),all:()=>a.map(json=>({json:C.clone(json)}))};},Date,JSON,Math,Number,String,Array,Object,Set,RegExp,Boolean,Error,encodeURIComponent,unescape};}
  function evaluate(value,input){if(typeof value==='string'&&value.startsWith('={{'))return vm.runInNewContext('('+value.slice(3,-2).trim()+')',env(input),{timeout:1000});return value;}
  let name='Set up or run V3',input=[{}],last;
  for(let step=0;name&&step<700;step++){
    const n=N[name];trace.push(name);let output,branch=0;
    if(name==='Configure V3 only')output=[C.configure({...base,...config},'graph-fixture',new Date().toISOString())];
    else if(n.type.endsWith('.code'))output=runCode(name,input,store,'graph-fixture');
    else if(n.type.endsWith('.manualTrigger')||n.type.endsWith('.wait'))output=input;
    else if(n.type.endsWith('.if')){branch=evaluate(n.parameters.conditions.conditions[0].leftValue,input)?0:1;output=input;}
    else if(n.type.endsWith('.html'))output=[C.clone(selected)];
    else if(n.type.endsWith('.dataTable')){
      const p=n.parameters;
      if(p.resource==='table')output=[{id:'fixture-table'}];
      else{
        const conditions=p.filters?.conditions||[];const matching=rows.filter(row=>conditions.every(f=>row[f.keyName]===evaluate(f.keyValue,input)));
        if(p.operation==='get')output=C.clone(matching);
        else{const mapped=Object.fromEntries(Object.entries(p.columns.value).map(([k,v])=>[k,evaluate(v,input)]));if(p.operation==='insert'){const r={id:rows.length+1,...mapped};rows.push(r);output=[C.clone(r)];}else{for(const r of matching)Object.assign(r,mapped);output=C.clone(matching);}}
        if(!output.length&&n.alwaysOutputData)output=[{}];
      }
    }else if(n.type.includes('openAi')){
      count.ai++;
      output=[name==='Write grounded social copy'?ai(draft()):ai({approved:!(options.correctOnce&&count.ai===2),reasons:options.correctOnce&&count.ai===2?['Improve grammar.']:[]})];
    }else if(n.type.endsWith('.httpRequest')){
      if(name==='Read configured source')output=[{data:'<article>Fixture provided to native HTML adapter</article>'}];
      else if(name==='Create Creatomate render'){const request=evaluate(n.parameters.jsonBody,input);assert.equal(request.width,1080);const id='bbbbbbbb-bbbb-bbbb-bbbb-'+String(count.renders++).padStart(12,'0');output=[{id,status:'planned'}];}
      else if(name==='Read same Creatomate render'){const url=evaluate(n.parameters.url,input),id=url.split('/').at(-1),j=store['Prepare existing render poll'].at(-1);polls[id]=(polls[id]||0)+1;output=[polls[id]===1?{id,status:'rendering'}:render(id,j.renderIndex,j.config.format)];}
      else if(name==='Refresh existing originals')output=input.map(i=>render(i.renderId,i.index,i.job.config.format));
      else throw new Error('Unrecognized HTTP adapter '+name);
    }else if(n.type.endsWith('.emailSend')){count.email++;output=[{data:{approved:options.approve!==false}}];}
    else if(n.type.endsWith('.facebookGraphApi')){
      if(name==='Verify authenticated Instagram destination'){const j=C.jobFromRow(input[0]);output=[{id:j.config.instagramAccountId,username:j.config.instagramUsername}];}
      else{const j=C.jobFromRow(store['Checkpoint Meta intent'].at(-1)),stage=j.meta.stage;
        if(j.action.method==='POST')count.metaPosts++;
        if(stage==='child_create'||stage==='parent_create')output=[{id:String(100000+j.meta.index+(stage==='parent_create'?100:0))}];
        else if(stage==='publish'){count.publishPosts++;output=[{id:'999999999'}];}
        else if(stage==='receipt')output=[{id:'999999999',permalink:'https://www.instagram.com/p/fixture/'}];
        else{const key='meta-'+j.meta.containerId;polls[key]=(polls[key]||0)+1;output=[{id:j.meta.containerId,status_code:polls[key]===1?'IN_PROGRESS':'FINISHED'}];}
      }
    }else throw new Error('No native fixture adapter for '+n.type);
    assert.ok(Array.isArray(output)&&output.length,'Fixture node stopped unexpectedly: '+name);store[name]=C.clone(output);last=output;
    const next=workflow.connections[name]?.main?.[branch]||[];assert.ok(next.length<=1,'Fixture runner requires a single branch');name=next[0]?.node;input=output;
  }
  assert.equal(name,undefined,'Graph exceeded bounded fixture steps');return {count,trace,result:last[0],rows};
}
test('emitted graph completes carousel preview with one correction and no Meta writes',()=>{const r=graphFixture({}, {correctOnce:true});assert.equal(r.result.status,'preview_approved');assert.deepEqual(r.count,{ai:4,renders:4,email:1,metaPosts:0,publishPosts:0});assert.equal(JSON.parse(r.rows.find(x=>x.jobKey==='__ledger').contextJson).owner,'');});
test('emitted graph completes single-video publication through native-node adapters',()=>{const r=graphFixture({format:'single',action:'publish',publishingEnabled:true});assert.equal(r.result.status,'published');assert.equal(r.result.permalink,'https://www.instagram.com/p/fixture/');assert.deepEqual(r.count,{ai:2,renders:1,email:1,metaPosts:2,publishPosts:1});});
test('emitted graph rejection never enters Meta and the same source is not regenerated',()=>{const first=graphFixture({}, {approve:false});assert.equal(first.result.status,'approval_rejected');assert.equal(first.count.metaPosts,0);const second=graphFixture({}, {},first.rows);assert.equal(second.result.status,'approval_rejected');assert.deepEqual(second.count,{ai:0,renders:0,email:0,metaPosts:0,publishPosts:0});});
test('emitted graph reuses approved carousel preview for publication with generation disabled',()=>{const first=graphFixture();const next=graphFixture({action:'publish',publishingEnabled:true,generationEnabled:false},{},first.rows);assert.equal(next.result.status,'published');assert.deepEqual(next.count,{ai:0,renders:0,email:1,metaPosts:6,publishPosts:1});assert.equal(next.result.renders.length,4);});
