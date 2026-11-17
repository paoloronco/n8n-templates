const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const w=JSON.parse(fs.readFileSync(path.join(__dirname,'../automate-cloud-video-production.json'),'utf8'));
const nodes=new Map(w.nodes.map(n=>[n.name,n])),AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const execute=async(name,input,refs={})=>new AsyncFunction('$input','$','$execution',nodes.get(name).parameters.jsCode)({first:()=>input,all:()=>[input]},name=>({first:()=>refs[name],item:refs[name]}),{id:'100',mode:'test'});
const baseCfg=new Function('$input',nodes.get('Apply video configuration').parameters.jsCode)({first:()=>({json:{}})})[0].json.config;
const cfg={...baseCfg,publicN8nBaseUrl:'https://automation.example.com',dropboxEnabled:true};
const bytes=require('./media-fixtures.cjs').syntheticMp4(),wav=require('./media-fixtures.cjs').syntheticWav(),hash=crypto.createHash('sha256').update(bytes).digest('hex');
const example=JSON.parse(fs.readFileSync(path.join(__dirname,'../example-brief.json'),'utf8'));
const request={...example,config:cfg,publishAt:new Date(Date.now()-1000).toISOString()};
const context={jobId:'video-100',stage:'video',renderId:'hfr_fixture_100',duration:18,audioQc:{duration:18,rmsDb:-24,peakDb:-8},fromForm:false};
const original={id:1,jobId:context.jobId,phase:'video',requestJson:JSON.stringify(request),contextJson:JSON.stringify(context),renderId:context.renderId,sha256:'',token:'b'.repeat(128),_response:{sha256:hash,size:bytes.length,qc:{width:1080,height:1920,duration:18}}};
const input=()=>({json:structuredClone(original),binary:{data:{data:'filesystem-v2:fixture',fileName:'render.mp4',mimeType:'video/mp4'}}});
const refs={'Apply video configuration':{json:{config:cfg}}};
const archivePredicate=new Function('$json','$','return '+nodes.get('Archive completed video?').parameters.conditions.conditions[0].leftValue.slice(3,-3));
const $=name=>({first:()=>refs[name]});

test('public defaults cannot spend API credits or publish and contain no account bindings',()=>{
 assert.equal(baseCfg.allowExistingApiCredits,false);assert.equal(baseCfg.publishingEnabled,false);assert.equal(baseCfg.requireVideoApproval,false);assert.equal(w.active,false);
 assert.equal(baseCfg.maxCloudRenders,1);assert.equal(baseCfg.dropboxFolder,'/Video Archive');assert.equal(baseCfg.timezone,'UTC');
 for(const n of w.nodes){assert.ok(!n.disabled);for(const c of Object.values(n.credentials||{}))assert.equal(c.id,null);if(n.type==='n8n-nodes-base.crypto'&&!n.parameters.action)assert.equal(n.parameters.type,'SHA256');}
 assert.equal(w.id,undefined);assert.equal(w.meta,undefined);assert.deepEqual(w.pinData,{});
});
test('no-credit policy stops every pre-render stage before dispatching a provider request',async()=>{
 for(const stage of ['account','voices','speech','audio','images','build','upload','put','complete','submit']){
  const row={...original,renderId:'',contextJson:JSON.stringify({jobId:original.jobId,stage,fromForm:false})};
  const planned=(await execute('Plan next step',{json:row},refs))[0].json;
  assert.equal(planned.phase,'failed',stage);assert.equal(planned._action.kind,'receipt',stage);assert.match(planned.error,/spending is authorized/,stage);
 }
});
test('only a verified final video enters Dropbox and an existing receipt skips the upload',()=>{
 assert.equal(archivePredicate(original,$),true);
 for(const stage of ['audio','images','build'])assert.equal(archivePredicate({...original,contextJson:JSON.stringify({...context,stage})},$),false);
 assert.equal(archivePredicate({...original,_response:{error:{message:'invalid'}}},$),false);
 const dest=cfg.dropboxFolder+'/'+original.jobId+'-'+hash.slice(0,16)+'.mp4';
 assert.equal(archivePredicate({...original,contextJson:JSON.stringify({...context,dropbox:{state:'uploaded',sha256:hash,path:dest}})},$),false);
});
test('Dropbox keeps the exact original binary descriptor and rejects unsafe paths',async()=>{
 const a=(await execute('Prepare Dropbox MP4',input(),refs))[0],b=(await execute('Prepare Dropbox MP4',input(),refs))[0];
 assert.equal(a.json._dropboxUpload.path,b.json._dropboxUpload.path);assert.equal(a.binary.data.data,input().binary.data.data);
 for(const folder of ['relative','/a/../b','/a\\b'])await assert.rejects(execute('Prepare Dropbox MP4',input(),{'Apply video configuration':{json:{config:{...cfg,dropboxFolder:folder}}}}));
 await assert.rejects(execute('Prepare Dropbox MP4',{json:original},refs));
});
test('successful archive becomes automatic authorization with an atomic checkpoint',async()=>{
 const prepared=(await execute('Prepare Dropbox MP4',input(),refs))[0];
 const recorded=(await execute('Record Dropbox archive',{json:{id:'id:fixture',path_display:prepared.json._dropboxUpload.path,size:bytes.length,content_hash:'c'.repeat(64),rev:'fixture'}},{'Prepare Dropbox MP4':prepared}))[0];
 const planned=(await execute('Plan next step',recorded,refs))[0].json,c=JSON.parse(planned.contextJson);
 assert.equal(planned._previous,original.contextJson);assert.equal(planned.phase,'approved');assert.equal(c.approval.mode,'automatic');assert.equal(c.dropbox.sha256,hash);assert.equal(c.renderId,context.renderId);
 const receipt=(await execute('Cloud production receipt',{json:planned},refs))[0].json;
 assert.equal(receipt.dropbox.id,'id:fixture');
});
test('failed archive preserves the existing render for recovery and cannot publish',async()=>{
 const prepared=(await execute('Prepare Dropbox MP4',input(),refs))[0];
 const recorded=(await execute('Record Dropbox archive',{json:{error:{message:'offline fixture'}}},{'Prepare Dropbox MP4':prepared}))[0];
 const planned=(await execute('Plan next step',recorded,refs))[0].json,c=JSON.parse(planned.contextJson);
 assert.equal(planned.phase,'failed');assert.equal(c.failedStage,'video');assert.equal(c.renderId,context.renderId);assert.equal(c.dropbox.state,'failed');assert.equal(planned._action.kind,'receipt');
 const bypass=(await execute('Plan next step',{json:original},refs))[0].json;assert.equal(bypass.phase,'failed');
});
test('disabled optional archive still authorizes a valid video without a human decision',async()=>{
 const off={...cfg,dropboxEnabled:false},row={...original,requestJson:JSON.stringify({...request,config:off})};
 const planned=(await execute('Plan next step',{json:row},{'Apply video configuration':{json:{config:off}}}))[0].json;
 assert.equal(planned.phase,'approved');assert.equal(JSON.parse(planned.contextJson).approval.mode,'automatic');
});
test('cloud narration and metadata validation preserve the final original binary',async()=>{
 const validated=(await execute('Read cloud response',{json:{fileBase64:bytes.toString('base64'),sha256:hash}},{'Save checkpoint':{json:original},'Download cloud media':input()}))[0];
 assert.equal(validated.json._response.sha256,hash);assert.equal(validated.binary.data.data,input().binary.data.data);
 const bad=(await execute('Read cloud response',{json:{fileBase64:Buffer.from('invalid').toString('base64'),sha256:hash}},{'Save checkpoint':{json:original}}))[0];assert.ok(bad.json._response.error);
});
test('self-contained public project uses the neutral composition and bundled assets',async()=>{
 const row={...original,contextJson:JSON.stringify({...context,stage:'build',audioQc:{duration:18},narrationBase64:wav.toString('base64'),images:[]})};
 const project=(await execute('Build self-contained project',{json:row}))[0];
 const files=Object.values(project.binary),names=files.map(x=>x.fileName);
 for(const name of ['index.html','compositions/scene-0.html','compositions/scene-1.html','compositions/scene-2.html','assets/narration.wav','assets/gsap.min.js','assets/Inter-700.woff2','assets/Inter-400.woff2'])assert.ok(names.includes(name),name);
 const html=files.filter(x=>x.mimeType==='text/html').map(x=>Buffer.from(x.data,'base64').toString('utf8')).join('\n');
 assert.match(html,/data-hold class="scene-inner"/);assert.match(html,/data-fps="30"/);assert.match(html,/Three steps to a clear message/);
 // An optional output directory is used only for offline composition audits.
 if(process.env.VIDEO_VALIDATION_PROJECT)for(const file of files){const dest=path.join(process.env.VIDEO_VALIDATION_PROJECT,file.fileName);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,Buffer.from(file.data,'base64'));}
});
