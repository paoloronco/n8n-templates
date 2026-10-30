import test from 'node:test';
import assert from 'node:assert/strict';
import * as bio from './smart-bio.mjs';
import { buildWorkflow } from './workflow.mjs';

const channelId='UC'+'a'.repeat(22);
const now='2026-10-30T12:00:00.000Z';
const config=bio.validateConfiguration({YOUTUBE_CHANNEL_ID:channelId,MODE:'EMAIL_APPROVAL',REGISTRY_TABLE_ID:'test-registry',FROM_EMAIL:'sender@example.com',APPROVAL_EMAIL:'owner@example.com'});
const video={id:'aaaaaaaaaaa',title:'A public video',description:'A description',url:'https://www.youtube.com/watch?v=aaaaaaaaaaa',publishedAt:'2026-10-29T10:00:00Z'};
const work={action:'video',config,video,key:channelId+':'+video.id,startedAt:now,expiresAt:'2026-11-01T12:00:00.000Z'};
const baseline={key:channelId+':baseline',payload:JSON.stringify({ids:[video.id]})};
const existing={id:'owner-link',type:'link',title:'Keep me',description:'',url:'https://example.com',position:0,isActive:true,status:'live',clickCount:12};
const spec={paths:{'/links':{put:{parameters:[{$ref:'#/components/parameters/LinkPublish'}]}}},components:{parameters:{LinkPublish:{name:'publish',in:'query',schema:{enum:['0','1']}}}}};

test('configuration rejects arbitrary URLs, modes and recipients',()=>{
  for(const patch of [{YOUTUBE_CHANNEL_ID:'https://localhost'},{MODE:'auto'},{APPROVAL_EMAIL:'a@example.com,b@example.com'},{APPROVAL_TIMEOUT_HOURS:0},{MANUAL_VIDEO_ID:'../bad'}])
    assert.throws(()=>bio.validateConfiguration({YOUTUBE_CHANNEL_ID:channelId,MODE:'EMAIL_APPROVAL',REGISTRY_TABLE_ID:'test-registry',FROM_EMAIL:'sender@example.com',APPROVAL_EMAIL:'owner@example.com',...patch}));
  assert.equal(bio.validateConfiguration({YOUTUBE_CHANNEL_ID:channelId,MODE:'AUTOMATIC',REGISTRY_TABLE_ID:'test-registry'}).mode,'AUTOMATIC');
});

test('older servers cannot accidentally publish an approval draft',()=>{
  assert.throws(()=>bio.requireDraftCapability({paths:{}},config),/does not advertise/);
  assert.equal(bio.requireDraftCapability(spec,config),config);
});

test('feed parsing validates ownership, normalizes one entry and deduplicates IDs',()=>{
  const entry={'yt:videoId':video.id,'yt:channelId':channelId,title:'A <title>',published:video.publishedAt,'media:group':{'media:description':'Text'}};
  assert.equal(bio.feedVideos({feed:{'yt:channelId':channelId,entry}},channelId)[0].url,video.url);
  assert.equal(bio.feedVideos({feed:{'yt:channelId':channelId,entry:[entry,entry]}},channelId).length,1);
  assert.equal(bio.feedVideos({feed:{'yt:channelId':channelId.slice(2),entry:{...entry,'yt:channelId':channelId.slice(2)}}},channelId).length,1);
  assert.throws(()=>bio.feedVideos({feed:{'yt:channelId':'wrong',entry}},channelId));
  assert.throws(()=>bio.feedVideos({feed:{'yt:channelId':channelId,entry:{...entry,published:'invalid'}}},channelId));
  assert.deepEqual(bio.feedVideos({feed:{'yt:channelId':channelId}},channelId),[]);
});

test('first normal poll only establishes a baseline',()=>{
  const selected=bio.selectWork(config,[video],[],false,now);
  assert.equal(selected.action,'baseline');
  assert.deepEqual(JSON.parse(bio.registryRow(selected,'baseline','run',now).payload).ids,[video.id]);
});

test('old videos are skipped and new videos are processed oldest first',()=>{
  assert.equal(bio.selectWork(config,[video],[baseline],false,now).action,'noop');
  const newer={...video,id:'bbbbbbbbbbb'};
  assert.equal(bio.selectWork(config,[video,newer],[baseline],false,now).video.id,newer.id);
});

test('manual replay can select a baseline video but not repeat a registered one',()=>{
  const manualConfig={...config,manualVideoId:video.id};
  assert.equal(bio.selectWork(manualConfig,[video],[baseline],true,now).action,'video');
  assert.equal(bio.selectWork(manualConfig,[video],[baseline],false,now).action,'noop');
  for(const state of ['declined','expired','published'])assert.equal(bio.selectWork(manualConfig,[video],[baseline,{video_id:video.id,state}],true,now).action,'noop');
  assert.throws(()=>bio.selectWork(manualConfig,[],[baseline],true,now),/not in/);
});

test('pending or uncertain claims prevent another draft or approval request',()=>{
  for(const state of ['processing','pending','publishing']){
    assert.equal(bio.selectWork(config,[{...video,id:'bbbbbbbbbbb'}],[baseline,{state}],false,now).action,'noop');
    assert.throws(()=>bio.selectWork({...config,manualVideoId:video.id},[video],[baseline,{state}],true,now),/pending/);
  }
});

test('approval mode builds a hidden native YouTube card with optional text off',()=>{
  const prepared=bio.prepareCard(work,{data:[existing],revision:41});
  assert.deepEqual(prepared.links[1],{...existing,position:1});
  assert.equal(prepared.card.title,'');assert.equal(prepared.card.description,'');
  assert.equal(prepared.card.status,'draft');assert.equal(prepared.card.isActive,false);
  assert.deepEqual(JSON.parse(prepared.card.content),{provider:'youtube',snippet:video.url,consentCategory:'marketing',height:360});
});

test('automatic mode uses a live card and never requires an AI key',()=>{
  const card=bio.proposedCard({...work,config:{...config,mode:'AUTOMATIC',showTitle:true,showDescription:true}});
  assert.equal(card.status,'live');assert.equal(card.isActive,true);
  assert.equal(card.title,video.title);assert.equal(card.description,video.description);
});

test('existing matching cards are idempotent and edited cards are protected',()=>{
  const card=bio.proposedCard(work);
  assert.equal(bio.prepareCard(work,{data:[card,existing],revision:41}).needsWrite,false);
  const live={...card,isActive:true,status:'live'};
  assert.equal(bio.prepareCard(work,{data:[live,existing],revision:41}).alreadyPublished,true);
  for(const patch of [{title:'Manual edit'},{content:'{}'},{isActive:true,status:'draft'}])assert.throws(()=>bio.prepareCard(work,{data:[{...card,...patch}],revision:41}));
});

test('approval is bound to both the unchanged card and exact draft revision',()=>{
  const prepared={...bio.prepareCard(work,{data:[existing],revision:41}),revision:'42'};
  assert.equal(bio.reviewCard(prepared,{data:prepared.links,revision:42}).revision,'42');
  assert.throws(()=>bio.reviewCard(prepared,{data:prepared.links,revision:43}),/revision changed/);
  assert.throws(()=>bio.reviewCard(prepared,{data:prepared.links.map(x=>x.id===prepared.card.id?{...x,title:'Edited'}:x),revision:42}),/changed/);
});

test('decline, timeout and malformed approvals cannot publish',()=>{
  assert.equal(bio.approvalDecision({data:{approved:true,respondedAt:now}},work,now),'approved');
  assert.equal(bio.approvalDecision({data:{approved:false,respondedAt:now}},work,now),'declined');
  assert.equal(bio.approvalDecision({data:{approved:'true',respondedAt:now}},work,now),'declined');
  assert.equal(bio.approvalDecision({},work,now),'expired');
  assert.equal(bio.approvalDecision({data:{approved:true,respondedAt:now}},work,'2026-11-02T12:00:00Z'),'expired');
});

test('feed titles are escaped in approval email HTML',()=>{
  const html=bio.approvalMessage({...work,video:{...video,title:'<img src=x onerror=alert(1)>'}});
  assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));
});

test('public verification requires a confirmed revision and expected card',()=>{
  const prepared={...bio.prepareCard(work,{data:[existing],revision:41}),revision:'42'};
  const publication={data:{publicationStatus:'published',publishedRevision:42,publicUrl:'https://example.com'}};
  assert.ok(bio.verifyPublication(prepared,publication,{statusCode:200,body:prepared.card.id+video.id}).publication);
  assert.ok(bio.verifyPublication(prepared,publication,{statusCode:200,data:prepared.card.id+video.id}).publication);
  assert.throws(()=>bio.verifyPublication(prepared,publication,{statusCode:200,body:'empty'}));
  assert.throws(()=>bio.verifyPublication(prepared,{data:{...publication.data,publishedRevision:41}},{statusCode:200,body:prepared.card.id+video.id}));
});

test('export is portable, all connections resolve, and all Code nodes compile',()=>{
  const workflow=buildWorkflow();const names=new Set(workflow.nodes.map(n=>n.name));
  for(const [source,ports]of Object.entries(workflow.connections)){assert.ok(names.has(source));for(const port of ports.main)for(const edge of port||[])assert.ok(names.has(edge.node));}
  for(const node of workflow.nodes.filter(n=>n.type==='n8n-nodes-base.code'))assert.doesNotThrow(()=>new Function(node.parameters.jsCode),node.name);
  assert.ok(!JSON.stringify(workflow).includes('prhomelab'));
  assert.ok(!workflow.nodes.some(n=>n.type==='n8n-nodes-base.webhook'));
  const save=workflow.nodes.find(n=>n.name==='Save video card');
  assert.equal(save.parameters.operation,'customRequest');assert.ok(save.parameters.customQuery.includes("'0'"));
});
