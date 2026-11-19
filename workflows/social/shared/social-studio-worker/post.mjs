import {campaign,campaignIndex} from './campaign.mjs';
import {productProof} from './product-proof.mjs';
import {sceneCSS,sceneMarkup,fitScript} from './scene-design.mjs';
export function postConcept(job){const s=campaign(job).story;return {page:'Your '+job.feature.id+' page',detail:s[2].line,takeaway:s[2].heading,friction:[s[1].heading,s[1].line],solution:[s[2].heading,s[2].line]};}
function slide(job,index){
 const s=campaign(job).story,p=productProof(job,index===0?0:3),plan=[['phone-center','phone-right','statement','end'],['phone-right','statement','phone-left','end'],['phone-left','phone-center','statement','end']][campaignIndex(job)%3];
 const mode=plan[index],skin=index===3?'paper':({editorial:'ink',blueprint:'paper',spotlight:'blue'})[job.layout]||'ink';
 return {mode,skin,heading:index===0?job.copy.hook:index===1?s[0].heading:s[2].heading,detail:index===0?'':index===1?s[0].line:campaign(job).solution,asset:p.phone,phoneOffset:p.phoneOffset,logo:skin==='paper'?'demo-logo-dark.png':'demo-logo-light.png',subject:job.feature.id};
}
export function posterHTML(job,index=0){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${sceneCSS}${job.cover9x16?`html,body{height:1920px}.canvas.reel.cover{--phone-left:340px;--phone-top:730px;--phone-width:390px;--phone-angle:0deg}.canvas.reel.cover .brand{top:310px}.canvas.reel.cover .headline{left:80px;top:465px;width:850px;font-size:72px}.canvas.reel.cover .detail{display:none}.canvas.reel.cover .proof-note{bottom:285px}`:''}</style></head><body>${sceneMarkup({...slide(job,index),reel:Boolean(job.cover9x16),counter:job.postType==='single'?'':`${index+1} / 4`}).replace('class="canvas ','class="canvas '+(job.cover9x16?'cover ':''))}<script>${fitScript}</script></body></html>`;
}
export function postVideoHTML(job){
 const indices=job.postType==='single'?[0,1,3]:[0,1,2,3],duration=indices.length*5.5;
 const scenes=indices.map((index,i)=>`<section id="scene-${i}" class="clip" data-start="${i*5.5}" data-duration="5.5" data-track-index="1">${sceneMarkup({...slide(job,index),id:'scene-'+i,counter:job.postType==='single'?'':`${index+1} / 4`})}</section>`).join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><script src="assets/gsap.min.js"></script><style>${sceneCSS}#root{position:relative;width:100%;height:100%;overflow:hidden}</style></head><body><div id="root" data-composition-id="main" data-width="1080" data-height="1350" data-duration="${duration}" data-fps="24">${scenes}<audio id="post-music" src="assets/demo-music.wav" data-start="0" data-duration="${duration}" data-volume="1" data-track-index="10" data-fade-in=".2" data-fade-out=".6"></audio></div><script>${fitScript}const tl=gsap.timeline({paused:true});${JSON.stringify(indices)}.forEach((_,i)=>{const s='#scene-'+i;tl.fromTo(s+' .headline, '+s+' .end-message',{y:25},{y:0,duration:.6,ease:'power3.out'},i*5.5+.05);if(document.querySelector(s+' .device-stage'))tl.fromTo(s+' .device-stage',{y:24,scale:.98},{y:0,scale:1,duration:5.2,ease:'none'},i*5.5+.1);if(document.querySelector(s+' .rule'))tl.fromTo(s+' .rule',{width:110},{width:280,duration:5.2,ease:'none'},i*5.5+.1);});window.__timelines.main=tl;</script></body></html>`;
}
