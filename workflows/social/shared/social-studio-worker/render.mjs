import { mkdir, writeFile, readFile, cp, stat, rename } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import { postHTML, reelHTML } from './creative.mjs';
import { narrationLines } from './narration.mjs';
import { reelBeats } from './message.mjs';
import { createHash } from 'node:crypto';
import { productProof } from './product-proof.mjs';
import { renderAnimatedPost } from './post-video.mjs';

export async function command(file, args, {cwd, log, timeout=300000}={}) {
  return new Promise((res,rej) => {
    const child=spawn(file,args,{cwd,windowsHide:true,env:{...process.env,CI:'1',HYPERFRAMES_SKIP_SKILLS:'1',HYPERFRAMES_TELEMETRY_DISABLED:'1',HYPERFRAMES_NO_TELEMETRY:'1'}});let out='';
    const timer=setTimeout(()=>{child.kill('SIGTERM');rej(new Error('Render command timed out'));},timeout);
    for(const stream of [child.stdout,child.stderr])stream.on('data',b=>{out+=b.toString();if(out.length>160000)out=out.slice(-160000);});
    child.on('error',e=>{clearTimeout(timer);rej(e);});
    child.on('close',async code=>{clearTimeout(timer);if(log)await writeFile(log,out).catch(()=>{});code===0?res(out):rej(new Error(`Render command failed (${code}): ${out.slice(-2200)}`));});
  });
}
export async function renderJob(job, root, assets) {
  const brand=JSON.parse(await readFile(join(assets,'brand-manifest.json'),'utf8'));
  for(const [name,entry] of Object.entries(brand))if(createHash('sha256').update(await readFile(join(assets,name))).digest('hex')!==entry.sha256)throw new Error('Official brand asset checksum mismatch: '+name);
  const music=JSON.parse(await readFile(join(assets,'demo-music-manifest.json'),'utf8'));
  if(createHash('sha256').update(await readFile(join(assets,'demo-music.wav'))).digest('hex')!==music.sha256)throw Error('Music checksum mismatch');
  const proof=JSON.parse(await readFile(join(assets,'product-proof-manifest.json'),'utf8'));
  for(const beat of [0,1,2,3,4])for(const name of [productProof(job,beat).phone]){
    if(!proof[name]||createHash('sha256').update(await readFile(join(assets,name))).digest('hex')!==proof[name].sha256)throw new Error('Product proof checksum mismatch: '+name);
  }
  job.designVersion=10;
  const dir=join(root,job.id);await mkdir(dir,{recursive:true});await cp(assets,join(dir,'assets'),{recursive:true});
  await writeFile(join(dir,'caption.txt'),job.copy.caption+'\n\n'+job.feature.url+'\n');
  await writeFile(join(dir,'creative.json'),JSON.stringify({id:job.id,kind:job.kind,designVersion:job.designVersion,feature:job.feature,layout:job.layout,copy:job.copy,campaignIndex:job.campaignIndex,productProofManifest:proof,nativePhoneViews:[0,1,2,3,4].map(beat=>{const {phone,phoneOffset}=productProof(job,beat);return {phone,phoneOffset};}),storyboard:job.kind==='reel'?reelBeats(job):undefined,brand,music,provenance:'Neutral illustrations of a fictional page interface with fictional demonstration data. The selected campaign determines the page and feature shown. These are product demonstrations, not customer results. Publication state is recorded separately in the studio ledger.'},null,2));
  let narration;
  if(job.kind==='reel'){
  await writeFile(join(dir,'narration-input.json'),JSON.stringify(narrationLines(job)));
  await command(process.env.VOICE_PYTHON||'python3',[resolve('narrate.py'),dir],{log:join(dir,'narration.log'),timeout:180000});
  narration=JSON.parse(await readFile(join(dir,'narration.json'),'utf8'));

  }
  const voiced={...job,narration};
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
  const files=[],layoutAudits=[];
  try{
    const page=await browser.newPage({viewport:{width:1080,height:job.kind==='reel'?1920:1350},deviceScaleFactor:1});
    const count=job.kind==='post'&&job.postType!=='single'?4:1;
    for(let i=0;i<count;i++){
      await writeFile(join(dir,`slide-${i+1}.html`),postHTML(job,i));
      await page.goto('file:///'+join(dir,`slide-${i+1}.html`).replaceAll('\\','/'));
      await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));await page.evaluate(()=>document.fonts.ready);
      const audit=await page.evaluate(height=>{
        const boxes=[...document.querySelectorAll('.brand,.headline,.detail,.content-card,.end-brand,.end-message,.site,.footer,.post-proof,.post-takeaway')].map(el=>{const r=el.getBoundingClientRect();return {selector:el.className,x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,overflow:el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2};});
        const issues=boxes.filter(b=>b.x<0||b.right>1080||b.y<0||b.bottom>height||b.overflow).map(b=>'overflow: '+b.selector);
        for(let a=0;a<boxes.length;a++)for(let b=a+1;b<boxes.length;b++){const x=boxes[a],y=boxes[b];if(Math.min(x.right,y.right)-Math.max(x.x,y.x)>2&&Math.min(x.bottom,y.bottom)-Math.max(x.y,y.y)>2)issues.push('overlap: '+x.selector+' / '+y.selector);}
        return {boxes,issues};
      },job.kind==='reel'?1920:1350);
      if(audit.issues.length)throw new Error('Poster layout: '+audit.issues.join('; '));
      layoutAudits.push({slide:i+1,...audit});
      const file=job.kind==='post'?`slide-${i+1}.jpg`:'cover.jpg';await page.screenshot({path:join(dir,file),type:'jpeg',quality:94});files.push(file);
    }
  }finally{await browser.close();}
  if(job.kind==='post')files.push(...await renderAnimatedPost(job,dir,command));
  if(job.kind==='reel'){
    await writeFile(join(dir,'index.html'),reelHTML(voiced));
    // The installed package entry is resolved from its package contract below.
    const pkg=JSON.parse(await readFile(resolve('node_modules/hyperframes/package.json'),'utf8'));
    const bin=resolve('node_modules/hyperframes',typeof pkg.bin==='string'?pkg.bin:Object.values(pkg.bin)[0]);
    const sampleTimes=narration.cues.map(c=>(c.sceneStart+Math.min(1.2,c.sceneDuration/2)).toFixed(3)).join(',');
    await command(process.execPath,[bin,'check',dir,'--at',sampleTimes,'--json'],{log:join(dir,'check.log'),timeout:240000});
    await command(process.execPath,[bin,'snapshot',dir,'--at',sampleTimes],{log:join(dir,'snapshots.log'),timeout:240000});
    const pending=join(dir,'reel.pending.mp4');
    await command(process.execPath,[bin,'render',dir,'--fps','24','--quality','looks','--workers','1','--output',pending],{log:join(dir,'render.log'),timeout:900000});
    const normalized=join(dir,'reel.normalized.mp4');
    await command(process.env.FFMPEG_PATH||'ffmpeg',['-y','-i',pending,'-c:v','copy','-af','loudnorm=I=-16:TP=-1.5:LRA=7','-c:a','aac','-b:a','128k','-ar','48000','-movflags','+faststart',normalized]);
    await rename(normalized,pending);
    const probe=JSON.parse(await command(process.env.FFPROBE_PATH||'ffprobe',['-v','error','-show_streams','-show_format','-of','json',pending]));
    const video=probe.streams.find(s=>s.codec_type==='video');
    if(video?.width!==1080||video?.height!==1920||Math.abs(Number(probe.format.duration)-narration.duration)>.15||Number(video.nb_frames)<350)throw new Error('Invalid rendered video dimensions/duration');
    if(!probe.streams.some(s=>s.codec_type==='audio'))throw new Error('Missing narrated audio track');
    const audioLog=await command(process.env.FFMPEG_PATH||'ffmpeg',['-hide_banner','-i',pending,'-af','loudnorm=I=-16:TP=-1:LRA=7:print_format=json','-f','null','-']);
    const levels=JSON.parse(audioLog.slice(audioLog.lastIndexOf('{'),audioLog.lastIndexOf('}')+1));
    if(Number(levels.input_i)<-19||Number(levels.input_i)>-13||Number(levels.input_tp)>-1)throw new Error('Encoded narration levels outside safe range');
    probe.narration={voice:narration.voice,language:narration.language,apiCostUsd:0,cues:narration.cues,integratedLufs:Number(levels.input_i),truePeakDbtp:Number(levels.input_tp)};
    const decoded=await promisify(execFile)(process.env.FFMPEG_PATH||'ffmpeg',['-v','error','-i',pending,'-vf','scale=64:114,format=gray','-f','rawvideo','pipe:1'],{encoding:'buffer',maxBuffer:16*1024*1024,timeout:90000,windowsHide:true});
    const pixels=64*114;const frameCount=decoded.stdout.length/pixels;const empty=[];
    if(!Number.isInteger(frameCount)||frameCount<350)throw new Error('Incomplete video decode');
    for(let n=0;n<frameCount;n++){let sum=0,squares=0;for(let p=n*pixels;p<(n+1)*pixels;p++){const value=decoded.stdout[p];sum+=value;squares+=value*value;}if(Math.sqrt(Math.max(0,squares/pixels-(sum/pixels)**2))<1.5)empty.push(n);}
    if(empty.length)throw new Error('Blank encoded video frames: '+empty.join(','));
    probe.frameInspection={decodedFrames:frameCount,blankFrames:empty};
    await writeFile(join(dir,'media-check.json'),JSON.stringify(probe,null,2));files.push('reel.mp4');
    await rename(pending,join(dir,'reel.mp4'));
  }
  await writeFile(join(dir,'layout-check.json'),JSON.stringify(layoutAudits,null,2));
  for(const file of files)if((await stat(join(dir,file))).size<(/\.(?:jpg|mp4)$/.test(file)?1000:2))throw new Error('Empty output: '+file);
  return [...files,...(job.kind==='reel'?['voiceover.wav','narration.vtt','narration.srt','narration.json']:[]),'caption.txt','creative.json','layout-check.json',...(job.kind==='reel'?['media-check.json']:[])];
}
