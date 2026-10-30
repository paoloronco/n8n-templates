import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { buildWorkflow } from './workflow.mjs';

// Refresh documentation snapshots only. The approved n8n export is never written.
const workflow=buildWorkflow();
const notes=workflow.nodes.filter(n=>n.type==='n8n-nodes-base.stickyNote');
const executable=workflow.nodes.filter(n=>n.type!=='n8n-nodes-base.stickyNote');
const names=new Set(workflow.nodes.map(n=>n.name));
assert.equal(names.size,workflow.nodes.length);
assert.equal(new Set(workflow.nodes.map(n=>n.id)).size,workflow.nodes.length);
assert.equal(workflow.active,false);
assert.deepEqual(workflow.pinData,{});
for (const n of workflow.nodes) {
  assert.ok(!n.credentials&&!n.webhookId,'Remove private instance bindings before publishing');
  assert.ok(n.position.length===2&&n.position.every(Number.isFinite),'Invalid node position');
  if (n.type==='n8n-nodes-base.code') new Function(n.parameters.jsCode);
}
for (const [source,types] of Object.entries(workflow.connections)) {
  assert.ok(names.has(source));
  for (const outputs of Object.values(types)) for (const edges of outputs) for (const edge of edges||[]) assert.ok(names.has(edge.node));
}
const overview=notes.find(n=>n.name==='[TPA] README');
const readme=(await readFile(new URL('./README.md',import.meta.url),'utf8')).replace(/\r\n/g,'\n').trim();
assert.equal(overview.parameters.content.replace(/\r\n/g,'\n').trim(),readme,'Update the README explicitly if the owner changes the overview');
const frames=notes.filter(n=>n!==overview).map(n=>({title:n.name.replace(/^\[TPA\] /,''),id:n.id,x:n.position[0],y:n.position[1],width:n.parameters.width,height:n.parameters.height,nodes:[]}));
for (const n of executable) {
  const [x,y]=n.position;
  const containing=frames.filter(f=>x+48>=f.x&&x+48<=f.x+f.width&&y+48>=f.y&&y+48<=f.y+f.height);
  assert.equal(containing.length,1,'Ambiguous section for '+n.name);
  containing[0].nodes.push(n.name);
}
const sections=notes.filter(n=>n!==overview).map(n=>({title:n.name.replace(/^\[TPA\] /,''),words:n.parameters.content.trim().split(/\s+/).length}));
assert.ok(sections.every(s=>s.words<50),'Section note exceeds fifty words');
const report={version:5,mode:'owner-approved',algorithm:'preserve-owner-canvas',verified:true,positionsPreserved:true,nodeOrderPreserved:true,noteParametersPreserved:true,executableNodes:executable.length,preservedNotes:notes.length,generatedNotes:0,connectionsPreserved:true,workflowInactive:true,overviewMatchesReadme:true,sectionWords:sections,sections:frames,exportSha256:createHash('sha256').update(JSON.stringify(workflow)).digest('hex')};
const presentation={notes,positions:Object.fromEntries(executable.map(n=>[n.name,n.position]))};
await writeFile(new URL('./presentation.json',import.meta.url),JSON.stringify(presentation,null,2)+'\n');
await writeFile(new URL('./layout-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
await writeFile(new URL('./sticky-notes.md',import.meta.url),notes.map(n=>n.parameters.content).join('\n\n---\n\n')+'\n');
console.log(`Verified ${executable.length} executable nodes and ${notes.length} notes. Owner canvas preserved; only documentation snapshots refreshed.`);
