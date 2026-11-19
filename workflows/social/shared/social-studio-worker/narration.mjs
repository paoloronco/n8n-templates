import{reelBeats}from'./message.mjs';
export function narrationLines(job){
 if(job.kind==='post')return [];
 if(job.kind!=='reel')throw Error('Expected a Reel');
 const lines=reelBeats(job).map(b=>b.line);
 // The turn is an imperative in the curated campaign catalog. Link it to the
 // preceding situation without adding a capability or lengthening every beat.
 lines[3]='With Example, '+lines[3][0].toLowerCase()+lines[3].slice(1);
 return lines.map(s=>s.replace(/(?:https?:\/\/)?(?:www\.)?example\s*(?:\.|dot)\s*com\b\/?/gi,'example dot com').replace(/Example/gi,'Example').replace(/\bQR\b/gi,'Q R').replace(/[’‘]/g,"'"));
}
