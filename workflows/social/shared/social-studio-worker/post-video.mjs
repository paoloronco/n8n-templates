import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {postVideoHTML} from './post.mjs';

// One seekable render, then independently playable carousel clips with embedded music.
export async function renderAnimatedPost(job,dir,command){
 const duration=job.postType==='single'?16.5:22;
 await writeFile(join(dir,'index.html'),postVideoHTML(job));
 const pkg=JSON.parse(await readFile(resolve('node_modules/hyperframes/package.json'),'utf8'));
 const bin=resolve('node_modules/hyperframes',typeof pkg.bin==='string'?pkg.bin:Object.values(pkg.bin)[0]);
 const times=Array.from({length:job.postType==='single'?3:4},(_,i)=>i*5.5+1.5).join(',');
 await command(process.execPath,[bin,'check',dir,'--at',times,'--json'],{log:join(dir,'post-check.log')});
 const raw=join(dir,'post.pending.mp4'),ffmpeg=process.env.FFMPEG_PATH||'ffmpeg',ffprobe=process.env.FFPROBE_PATH||'ffprobe';
 await command(process.execPath,[bin,'render',dir,'--fps','24','--quality','looks','--workers','1','--output',raw],{log:join(dir,'post-render.log'),timeout:900000});
 const files=[],checks=[];
 for(let i=0;i<(job.postType==='single'?1:4);i++){
  const name=`slide-${i+1}.mp4`,file=join(dir,name),seconds=job.postType==='single'?duration:5.5;
  await command(ffmpeg,['-y','-ss',String(i*5.5),'-i',raw,'-t',String(seconds),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-af','loudnorm=I=-17.2:TP=-1.5:LRA=7','-ar','48000','-c:a','aac','-b:a','128k','-movflags','+faststart',file]);
  const probe=JSON.parse(await command(ffprobe,['-v','error','-show_streams','-show_format','-of','json',file]));
  const v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio');
  if(v?.width!==1080||v?.height!==1350||a?.codec_name!=='aac'||Math.abs(Number(probe.format.duration)-seconds)>.15)throw Error('Invalid animated post: '+name);
  const meter=await command(ffmpeg,['-hide_banner','-i',file,'-af','loudnorm=I=-17.2:TP=-1.5:LRA=7:print_format=json','-f','null','-']);
  const levels=JSON.parse(meter.slice(meter.lastIndexOf('{'),meter.lastIndexOf('}')+1));
  if(!Number.isFinite(Number(levels.input_i))||Number(levels.input_i)<-21||Number(levels.input_i)>-15||Number(levels.input_tp)>-1)throw Error('Missing or unsafe post music: '+name);
  await command(ffmpeg,['-v','error','-i',file,'-f','null','-']);
  checks.push({file:name,duration:seconds,width:1080,height:1350,audio:'AAC embedded music',integratedLufs:Number(levels.input_i),truePeakDbtp:Number(levels.input_tp),fullDecode:true});files.push(name);
 }
 await writeFile(join(dir,'post-media-check.json'),JSON.stringify(checks,null,2));
 return [...files,'post-media-check.json'];
}
