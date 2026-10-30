import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { buildWorkflow } from './workflow.mjs';

// Reuse the owner's Publishing Assistant geometry checks without running its
// email/Notion/paid API branches. Only public template data enters this pass.
const assistant=JSON.parse(await readFile(new URL('../template-publishing-assistant/Template-Publishing-Assistant.json',import.meta.url),'utf8'));
const engine=assistant.nodes.find(n=>n.name==='Generate sticky notes and align nodes').parameters.jsCode;
const workflow=buildWorkflow({presentation:false});
const readme=(await readFile(new URL('./README.md',import.meta.url),'utf8')).replace(/\r\n/g,'\n');
const phases=[
  ['Configure and start checks','Set the channel and publication mode once. Manual and scheduled checks use the same configuration, create or reuse a dedicated registry, and validate the required inputs.',[
    'Manual check or replay','Check YouTube every 15 minutes','Configuration','Create or reuse registry','Validate Configuration']],
  ['Find the next video','Check private-draft support, then read the public feed and registry. The first normal run records existing videos without importing them; later checks select one unseen video, oldest first.',[
    'Read OrbitPage API contract','Require private draft support','Read public YouTube feed','Parse channel feed','Read channel registry','Select next video']],
  ['Claim work or finish','Skip checks with no work. Save the baseline or claim a selected video before changing the page. A pending or uncertain claim blocks another proposal.',[
    'Has new work','Claim video or remember baseline','Is a video']],
  ['Stage the video card','Read existing blocks and publication state, then prepare a native YouTube card. Preserve existing content and reject unrelated private drafts. Automatic mode publishes now; approval mode saves a private proposal.',[
    'Read current blocks','Check publication before staging','Prepare YouTube card','Card needs saving','Save video card']],
  ['Route the saved proposal','Record the saved revision and processing state. Send private proposals to email review; automatic or already-published cards continue directly to the public verification phase.',[
    'Card saved','Remember saved card','Email approval required']],
  ['Wait for email review','Email the signed approve and decline buttons to the configured reviewer. Interpret the response or timeout and route the exact proposal to publication or cleanup.',[
    'Email approval — Approva or Rifiuta','Read approval decision','Video was approved']],
  ['Publish the approved card','Re-read blocks and publication state. Compare the exact reviewed revision and card before activating and publishing it. Any intervening edit stops the operation for manual review.',[
    'Read blocks after approval','Check publication after approval','Review exact hidden card','Publish approved video card']],
  ['Discard an unchanged proposal','For rejection or timeout, remove only the unchanged proposed card and restore the prior public content. Preserve concurrent edits by stopping cleanup when the reviewed revision no longer matches.',[
    'Read declined draft','Check declined publication','Prepare declined draft cleanup','Discard declined video draft','Remember declined or expired']],
  ['Check the public page','Read resulting publication metadata and validate its HTTPS destination before fetching the public page. Both automatic publication and approved proposals share this verification path.',[
    'Prepare publication check','Read resulting publication','Validate public destination','Check public page']],
  ['Record and return results','Confirm the expected revision, card and video in public HTML before marking publication complete. The shared result also reports no-work, baseline, rejected and expired outcomes.',[
    'Verify published card','Remember verified publication','Result']],
];
const executable=workflow.nodes;
const ids=new Map(executable.map(n=>[n.name,n.id]));
const members=phases.flatMap(p=>p[2]);
assert.equal(members.length,executable.length);
assert.equal(new Set(members).size,executable.length);
assert.ok(members.every(name=>ids.has(name)));
for(const [,description] of phases) assert.ok(description.split(/\s+/).length<50);
const sections=phases.map(([title,description,names])=>({title,description,nodeIds:names.map(n=>ids.get(n))}));
const source={cleanWorkflow:workflow,regenerateStickyNotes:true,report:{verificationPassed:true},reportMarkdown:'# Public template presentation\n'};
const generated=runInNewContext(`(function(){${engine}\n})()`,{
  $:name=>{assert.equal(name,'Scan and redact workflow secrets');return {first:()=>({json:source})};},
  $input:{first:()=>({json:{readme_markdown:readme,sticky_notes:{sections}}})},
},{timeout:5000})[0].json;

// Keep the Assistant's local node spacing and text clearance. Pack its sections
// into three reading rows, with approve/decline in separate lanes at the bottom.
const output=JSON.parse(JSON.stringify(generated.cleanWorkflow));
const notes=output.nodes.filter(n=>n.type==='n8n-nodes-base.stickyNote');
const layout=JSON.parse(JSON.stringify(generated.layout));
const gap=192;
const columnWidths=[Math.max(...[0,3,6,7].map(i=>layout.sections[i].width)),Math.max(...[1,4,8].map(i=>layout.sections[i].width)),Math.max(...[2,5,9].map(i=>layout.sections[i].width))];
const x=[0,columnWidths[0]+gap,columnWidths[0]+columnWidths[1]+2*gap];
const y=[0,Math.max(...layout.sections.slice(0,3).map(s=>s.height))+gap];
y.push(y[1]+Math.max(...layout.sections.slice(3,6).map(s=>s.height))+gap);
const destinations=[[x[0],y[0]],[x[1],y[0]],[x[2],y[0]],[x[0],y[1]],[x[1],y[1]],[x[2],y[1]],[x[0],y[2]],[x[0],y[2]+layout.sections[6].height+gap],[x[1],y[2]],[x[2],y[2]]];
layout.sections.forEach((section,i)=>{
  const [nx,ny]=destinations[i];
  const dx=nx-section.x,dy=ny-section.y;
  notes[i+1].position=[nx,ny];
  for(const name of section.nodes){
    const node=output.nodes.find(n=>n.name===name);
    node.position=[node.position[0]+dx,node.position[1]+dy];
    const box=layout.nodeBounds[name];box.x+=dx;box.y+=dy;
  }
  section.x=nx;section.y=ny;section.flowAnchor+=dy;
});
notes[0].position=[-1024,0];
const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const frames=notes.map(n=>({x:n.position[0],y:n.position[1],width:n.parameters.width,height:n.parameters.height}));
for(let i=0;i<frames.length;i++)for(let j=i+1;j<frames.length;j++)assert.ok(!overlaps(frames[i],frames[j]),'Section collision');
const bounds=Object.values(layout.nodeBounds);
for(let i=0;i<bounds.length;i++){
  const b=bounds[i],s=layout.sections[b.section];
  assert.ok(b.x>=s.x&&b.y>=s.y+s.headerHeight&&b.x+b.width<=s.x+s.width&&b.y+b.height<=s.y+s.height,'Node outside section');
  for(let j=i+1;j<bounds.length;j++)assert.ok(!overlaps(b,bounds[j]),'Node collision');
}
const logic=nodes=>nodes.filter(n=>n.type!=='n8n-nodes-base.stickyNote').map(({position,credentials,webhookId,...n})=>n);
assert.deepEqual(logic(output.nodes),logic(executable));
assert.deepEqual(output.connections,workflow.connections);
assert.ok(output.nodes.every(n=>!n.credentials&&!n.webhookId));
assert.equal(notes[0].parameters.color,1);
assert.equal(notes[0].parameters.content,readme.trim());
const presentation={notes,positions:Object.fromEntries(output.nodes.filter(n=>n.type!=='n8n-nodes-base.stickyNote').map(n=>[n.name,n.position]))};
layout.algorithm='template-publishing-assistant-v4-with-compact-reading-rows';
layout.assistantSourceSha256=createHash('sha256').update(engine).digest('hex');
layout.graphSha256=createHash('sha256').update(JSON.stringify({nodes:logic(executable),connections:workflow.connections})).digest('hex');
layout.proseLanguage='en';layout.overviewMatchesReadme=true;layout.sectionWords=phases.map(([title,description])=>({title,words:description.split(/\s+/).length}));
await writeFile(new URL('./presentation.json',import.meta.url),JSON.stringify(presentation,null,2)+'\n');
await writeFile(new URL('./layout-report.json',import.meta.url),JSON.stringify(layout,null,2)+'\n');
await writeFile(new URL('./sticky-notes.md',import.meta.url),notes.map(n=>n.parameters.content).join('\n\n---\n\n')+'\n');
await writeFile(new URL('./OrbitPage_Smart_Bio_YouTube.json',import.meta.url),JSON.stringify(buildWorkflow(),null,2)+'\n');
console.log(`Publishing layout verified: ${executable.length} executable nodes, ${notes.length} notes; graph and executable parameters preserved.`);
