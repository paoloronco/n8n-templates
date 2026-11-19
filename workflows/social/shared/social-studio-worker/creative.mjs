import {reelBeats} from './message.mjs';
import {posterHTML} from './post.mjs';
import {productProof} from './product-proof.mjs';
import {campaignIndex} from './campaign.mjs';
import {sceneCSS,sceneMarkup,fitScript} from './scene-design.mjs';
export const DESIGN_VERSION=10;
export const postHTML=(job,index)=>posterHTML(job.kind==='reel'?{...job,kind:'post',postType:'single',cover9x16:true}:job,index);
export function reelHTML(job){
 const cues=job.narration?.cues;if(cues?.length!==6)throw Error('Six measured narration cues are required');
 const beats=reelBeats(job),duration=job.narration.duration;
 const plans=[['phone-center','statement','phone-right','statement','phone-left'],['phone-right','statement','phone-center','phone-left','statement'],['phone-left','phone-center','statement','phone-right','statement']];
 const plan=plans[campaignIndex(job)%3],skin=({editorial:'ink',blueprint:'paper',spotlight:'blue'})[job.layout]||'ink';
 const scenes=cues.map((c,i)=>{const p=i<5?productProof(job,i):null,mode=i===5?'end':plan[i],tone=i===5?'paper':i===2&&skin==='ink'?'blue':skin;
  return `<section id="scene-${i}" class="clip" data-start="${c.sceneStart}" data-duration="${c.sceneDuration}" data-track-index="${i}">${sceneMarkup({id:'scene-'+i,mode,skin:tone,reel:true,heading:beats[i].heading,detail:i===0?'':beats[i].line,asset:p?.phone,phoneOffset:p?.phoneOffset,logo:tone==='paper'?'demo-logo-dark.png':'demo-logo-light.png',subject:job.feature.id})}</section>`;}).join('');
 const motion=`const tl=gsap.timeline({paused:true});${JSON.stringify(cues)}.forEach((c,i)=>{const s='#scene-'+i;tl.fromTo(s+' .headline, '+s+' .end-message',{y:26},{y:0,duration:.65,ease:'power3.out'},c.sceneStart+.05);if(document.querySelector(s+' .device-stage'))tl.fromTo(s+' .device-stage',{y:24,scale:.98},{y:0,scale:1,duration:Math.max(1,c.sceneDuration-.2),ease:'none'},c.sceneStart+.1);if(document.querySelector(s+' .rule'))tl.fromTo(s+' .rule',{width:110},{width:280,duration:Math.max(1,c.sceneDuration-.2),ease:'none'},c.sceneStart+.1);});window.__timelines.main=tl;`;
 const points=[{t:0,v:.70}];for(const c of cues)points.push({t:Math.max(0,c.start-.12),v:.70},{t:c.start,v:.335},{t:c.end,v:.335},{t:Math.min(duration,c.end+.2),v:.70});points.push({t:duration,v:0});
 const sorted=[...new Map(points.map(p=>[p.t,p])).values()].sort((a,b)=>a.t-b.t);
 const automation=JSON.stringify({version:1,lanes:[{target:'volume',points:sorted}]}).replaceAll('"','&quot;');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><script src="assets/gsap.min.js"></script><style>${sceneCSS}html,body{height:1920px}#root{position:relative;width:100%;height:100%;overflow:hidden}</style></head><body><div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-duration="${duration}" data-fps="24">${scenes}<audio id="voice" src="voiceover.wav" data-start="0" data-duration="${duration}" data-volume="1" data-track-index="10"></audio><audio id="music" src="assets/demo-music.wav" data-start="0" data-duration="${duration}" data-volume="1" data-automation="${automation}" data-track-index="11"></audio></div><script>${fitScript}${motion}</script></body></html>`;
}
