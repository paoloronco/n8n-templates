const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const workflowFile=['workflow.json','../workflow.json','../workflow.json'].map(p=>path.join(__dirname,p)).find(p=>fs.existsSync(p));
assert.ok(workflowFile,'The companion workflow JSON is required');
const w=JSON.parse(fs.readFileSync(workflowFile,'utf8'));
const nodes=new Map(w.nodes.map(n=>[n.name,n]));
const run=(name,vars={})=>new Function(...Object.keys(vars),nodes.get(name).parameters.jsCode)(...Object.values(vars));

test('all code compiles and graph targets exist',()=>{
  for(const n of w.nodes)if(n.parameters.jsCode)assert.doesNotThrow(()=>new Function(n.parameters.jsCode),n.name);
  for(const [name,connection]of Object.entries(w.connections))for(const group of connection.main)for(const target of group)assert.ok(nodes.has(target.node),name+' -> '+target.node);
  for(const n of w.nodes)for(const c of Object.values(n.credentials||{})){
    assert.equal(c.id,null,'Credential placeholders must not bind an account');
    assert.match(c.name,/^Select your /);
  }
  assert.equal(w.active,false);assert.equal(w.settings.timezone,'Europe/Rome');
  assert.ok(w.nodes.every(n=>!n.credentials||Object.values(n.credentials).every(c=>c.id===null)));
});

test('runtime example endpoints and publishing hours match the imported workflow',()=>{
  const backend=JSON.parse(fs.readFileSync(path.join(__dirname,'config.example.json'),'utf8'));
  const worker=JSON.parse(fs.readFileSync(path.join(__dirname,'worker.example.json'),'utf8'));
  for(const [url,name] of [[worker.bridgeUrl,'PC pulls signed jobs'],[worker.uploadUrl,'Receive a rendered production video'],[backend.mediaBase,'Instagram fetches signed video']]){
    assert.equal(url.split('/webhook/')[1],nodes.get(name).parameters.path);
  }
  assert.equal(backend.enabled,false);
  assert.equal(backend.timezone,w.settings.timezone);
  assert.equal(nodes.get('One reel at each time slot').parameters.rule.interval[0].expression,`0 ${backend.hours.join(',')} * * *`);
});

test('missing or invalid queue timestamps fail instead of bypassing timeout',()=>{
  for(const createdAt of [undefined,'bad-date'])assert.throws(()=>run('Validate job ID',{$input:{all:()=>[{json:{id:'a'.repeat(32),createdAt}}]}}),/timestamp/);
  assert.equal(run('Validate job ID',{$input:{all:()=>[{json:{id:'a'.repeat(32),createdAt:new Date().toISOString()}}]}}).length,1);
});

test('manual n8n test executions bypass the clock slot, production executions do not',()=>{
  for(const [mode,manual] of [['test',true],['production',false]]){
    const value=run('Claim this publishing slot',{$execution:{id:'integration',mode}})[0].json;
    assert.equal(JSON.parse(Buffer.from(value.payload,'base64url')).manual,manual);
  }
});

test('SSH bridge errors produce explicit non-success responses',()=>{
  let r=run('Read bridge response',{$json:{code:2,stdout:'',stderr:'fixture'}})[0].json;
  assert.equal(r.ok,false);assert.equal(r.httpStatus,502);
  r=run('Read bridge response',{$json:{code:0,stdout:JSON.stringify({ok:true,job:null})}})[0].json;
  assert.equal(r.ok,true);assert.equal(r.httpStatus,200);assert.equal(r.job,null);
});

test('authorized media paths accept the exact configured MP4 only',()=>{
  const stdout=JSON.stringify({ok:true,path:'/var/lib/local-video-production/media/'+'a'.repeat(32)+'/reel.mp4'});
  assert.doesNotThrow(()=>run('Read the authorized media path',{$json:{code:0,stdout}}));
  assert.throws(()=>run('Read the authorized media path',{$json:{code:0,stdout:JSON.stringify({ok:true,path:'/etc/passwd'})}}));
});

const context={videoId:'AbCdEf01234',channelId:'test-channel',media:{width:1080,height:1920},privateTest:false};
const video={id:context.videoId,snippet:{channelId:context.channelId},status:{uploadStatus:'processed',privacyStatus:'public'},processingDetails:{fileDetailsAvailability:'available',processingStatus:'succeeded'},fileDetails:{durationMs:'15000',videoStreams:[{widthPixels:1080,heightPixels:1920}],audioStreams:[{channelCount:2}]}};
const verify=(v,index=0)=>run('Validate YouTube video and audio',{$:()=>({first:()=>({json:context})}),$json:{items:[v]},$runIndex:index})[0].json;
test('a video completed on the final poll succeeds',()=>{assert.equal(verify(video,20).processed,true);});
test('wrong visibility or missing audio enters durable recovery',()=>{
  const privateVideo=structuredClone(video);privateVideo.status.privacyStatus='private';assert.match(verify(privateVideo).verificationError,/visibility/);
  const silent=structuredClone(video);silent.fileDetails.audioStreams=[];assert.match(verify(silent).verificationError,/audio/);
});
test('dry-run does not assert audio evidence that is absent',()=>{assert.throws(()=>run('YouTube dry-run',{$json:{kind:'reel',dryRun:true}}),/verified local MP4/);});
