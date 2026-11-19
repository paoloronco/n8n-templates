import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import crypto from 'node:crypto';

export const runtimeRoot = path.dirname(fileURLToPath(import.meta.url));
const rendererVersion = '2.0.4';
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const digest = value => crypto.createHash('sha256').update(value).digest('hex');

export async function command(bin, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {windowsHide:true, ...options});
    let output = '', error = '';
    child.stdout.on('data', b => { output = (output + b).slice(-100000); });
    child.stderr.on('data', b => { error = (error + b).slice(-100000); });
    const timer = setTimeout(() => { child.kill(); reject(new Error('Command timed out: ' + path.basename(bin))); }, options.timeout ?? 1200000);
    child.once('error', e => { clearTimeout(timer); reject(e); });
    child.once('close', code => { clearTimeout(timer); code === 0 ? resolve({output,error}) : reject(new Error(path.basename(bin) + ' failed: ' + error.slice(-1800) + output.slice(-700))); });
  });
}

export function composition(request, duration) {
  const b=request.brief, count=b.scenes.length, slot=duration/count;
  if (!/^#[a-fA-F0-9]{6}$/.test(b.accent) || !Number.isFinite(duration) || duration<3 || duration>60) throw Error('Invalid render settings');
  const scenes=b.scenes.map((_,i)=>`<div id="scene-${i}" class="clip" data-composition-id="scene-${i}" data-composition-src="compositions/scene-${i}.html" data-start="${i*slot}" data-duration="${slot}" data-track-index="0" data-width="1080" data-height="1920"></div>`).join('\n');
  return `<!doctype html><html lang="${escapeHtml(b.language.split('-')[0])}"><head><meta charset="utf-8"><meta name="viewport" content="width=1080,height=1920"><title>${escapeHtml(b.title)}</title><script src="assets/gsap.min.js"></script>
  <style>
  *{box-sizing:border-box}body{margin:0;background:#eeeeee;color:#222222;font-family:sans-serif}#root{position:relative;width:100%;height:100%;overflow:hidden}.clip{position:absolute;inset:0}.scene-inner{position:absolute;inset:0;background:#eeeeee;overflow:hidden}.sheet{position:absolute;inset:220px 280px 660px 110px;display:flex;flex-direction:column;justify-content:center;gap:34px;padding:48px;background:#ffffff;border:2px solid #cccccc}.brand{font-size:28px;line-height:1.3;font-weight:600;color:#555555;overflow-wrap:anywhere}.scene-count{font-size:28px;line-height:1.3;color:#555555}h1{font-size:58px;line-height:1.12;font-weight:700;margin:0;overflow-wrap:anywhere}p{font-size:34px;line-height:1.4;margin:0;color:#333333;overflow-wrap:anywhere}.art{display:block;width:100%;height:280px;object-fit:contain;background:#f4f4f4}.hook_demo .scene-count{border-bottom:4px solid ${b.accent};padding-bottom:20px}.custom_motion .sheet{border-left:14px solid ${b.accent}}.slideshow .sheet{gap:26px;inset:220px 280px 660px 110px}.slideshow h1{font-size:50px}.slideshow p{font-size:30px}
  </style></head><body><div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-start="0" data-duration="${duration}">${scenes}<audio id="narration" class="clip" data-start="0" data-duration="${duration}" data-track-index="1" data-track-kind="audio" src="assets/narration.wav"></audio></div><script>const tl=gsap.timeline({paused:true});window.__timelines['main']=tl;</script></body></html>`;
}

export function sceneComposition(request, duration, i) {
  const b=request.brief,s=b.scenes[i],count=b.scenes.length,slot=duration/count,id='scene-'+i;
  return `<!doctype html><html><body><template><style>#root{position:absolute;inset:0;width:100%;height:100%}</style>
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920"><section class="scene-inner ${escapeHtml(request.format)}">
    <div id="${id}-copy" class="sheet" data-hold><div class="brand">${escapeHtml(b.brand)}</div>
    ${s.asset?`<img class="art" src="../assets/${escapeHtml(s.asset)}" alt="${escapeHtml(s.title)}">`:''}
    <h1>${escapeHtml(s.title)}</h1><p>${escapeHtml(s.body)}</p>
    <div class="scene-count">Scene ${i+1} of ${count}</div></div></section></div>
    <script>{const tl=gsap.timeline({paused:true});window.__timelines['${id}']=tl;}</script>
  </template></body></html>`;
}

export async function mediaQc(file, c) {
  const ffprobe=c.ffprobe || 'ffprobe', ffmpeg=c.ffmpeg || 'ffmpeg';
  const info=JSON.parse((await command(ffprobe,['-v','error','-show_streams','-show_format','-of','json',file],{timeout:60000})).output);
  const v=info.streams.find(s=>s.codec_type==='video'), a=info.streams.find(s=>s.codec_type==='audio');
  const duration=Number(info.format.duration);
  if(v?.width!==1080||v.height!==1920||v.codec_name!=='h264'||a?.codec_name!=='aac'||duration<3||duration>60)throw Error('MP4 format failed QC');
  const measured=await command(ffmpeg,['-hide_banner','-nostats','-v','info','-xerror','-i',file,'-af','volumedetect','-f','null','-'],{timeout:300000});
  const mean=Number(measured.error.match(/mean_volume:\s*(-?[\d.]+|-?inf) dB/)?.[1]),peak=Number(measured.error.match(/max_volume:\s*(-?[\d.]+|-?inf) dB/)?.[1]);
  if(!Number.isFinite(mean)||!Number.isFinite(peak)||mean<=-55||peak<=-45)throw Error('Audio is silent or too quiet');
  return {width:1080,height:1920,duration,fullDecode:true,audioAudible:true,meanDb:mean,peakDb:peak};
}

export async function render(job, c) {
  const root=path.resolve(c.workDir), folder=path.join(root,'jobs',job.id), assets=path.join(folder,'assets');
  if(!/^[a-f0-9]{32}$/.test(job.id))throw Error('Invalid job ID');
  await fs.mkdir(assets,{recursive:true});
  const hash=digest(JSON.stringify({rendererVersion,request:job.request})), manifestFile=path.join(folder,'render.json'), output=path.join(folder,'reel.mp4');
  try {const old=JSON.parse(await fs.readFile(manifestFile,'utf8'));if(old.requestHash===hash&&digest(await fs.readFile(output))===old.sha256)return {...old,folder,output};}catch{}
  await fs.writeFile(path.join(folder,'brief.json'),JSON.stringify(job.request.brief,null,2));
  await fs.copyFile(path.join(runtimeRoot,'node_modules/gsap/dist/gsap.min.js'),path.join(assets,'gsap.min.js'));
  for(const scene of job.request.brief.scenes)if(scene.asset){if(!/^[a-f0-9]{64}\.(png|jpg|jpeg|webp)$/.test(scene.asset))throw Error('Invalid asset name');await fs.copyFile(path.join(root,'assets',scene.asset),path.join(assets,scene.asset));}
  const narration=path.join(assets,'narration.wav');
  if(c.voicePython && c.modelsDir){
    await command(c.voicePython,[path.join(runtimeRoot,'voice/speech.py'),path.join(folder,'brief.json'),narration,path.resolve(c.modelsDir)],{cwd:folder,timeout:300000});
  }else if(process.platform==='win32'){
    const speechInput=path.join(folder,'speech.json');await fs.writeFile(speechInput,JSON.stringify(job.request.brief));
    const powershell=path.join(process.env.SystemRoot || 'C:/Windows','System32/WindowsPowerShell/v1.0/powershell.exe');
    await command(powershell,['-NoProfile','-NonInteractive','-ExecutionPolicy','RemoteSigned','-File',path.join(runtimeRoot,'speak.ps1'),'-InputFile',speechInput,'-OutputFile',narration],{timeout:120000});
  }else{
    const narrationFile=path.join(folder,'narration.txt');await fs.writeFile(narrationFile,job.request.brief.narration);
    await command(c.espeak || 'espeak-ng',['-v',job.request.brief.language.split('-')[0],'-s','155','-f',narrationFile,'-w',narration],{timeout:120000});
  }
  const probe=JSON.parse((await command(c.ffprobe || 'ffprobe',['-v','error','-show_format','-of','json',narration],{timeout:60000})).output);
  const duration=Math.ceil((Number(probe.format.duration)+0.8)*30)/30;
  if(duration<3||duration>59.8)throw Error('Narration must produce a video between 3 and 60 seconds; shorten or expand the brief');
  await fs.writeFile(path.join(folder,'index.html'),composition(job.request,duration));
  await fs.mkdir(path.join(folder,'compositions'),{recursive:true});
  for(let i=0;i<5;i++)await fs.rm(path.join(folder,'scene-'+i+'.html'),{force:true});
  for(let i=0;i<job.request.brief.scenes.length;i++)await fs.writeFile(path.join(folder,'compositions','scene-'+i+'.html'),sceneComposition(job.request,duration,i));
  const cli=path.join(runtimeRoot,'node_modules/hyperframes/bin/hyperframes.mjs');
  const env={...process.env,PATH:path.dirname(c.ffmpeg || 'ffmpeg')+path.delimiter+process.env.PATH,HF_TELEMETRY_DISABLED:'1'};
  const check=await command(process.execPath,[cli,'check',folder,'--json'],{cwd:folder,env,timeout:300000});
  await fs.writeFile(path.join(folder,'hyperframes-check.json'),check.output);
  if(c.prepareOnly)return {folder,output:null,duration,requestHash:hash};
  const rendered=await command(process.execPath,[cli,'render',folder,'--output',path.join(folder,'visual.mp4'),'--quality','looks','--workers','1','--strict'],{cwd:folder,env});
  await fs.writeFile(path.join(folder,'render.log'),rendered.output+'\n'+rendered.error);
  await command(c.ffmpeg || 'ffmpeg',['-y','-v','error','-i',path.join(folder,'visual.mp4'),'-i',narration,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-ar','48000','-b:a','128k','-af','apad','-t',String(duration),'-movflags','+faststart',output],{timeout:300000});
  const qc=await mediaQc(output,c), bytes=await fs.readFile(output);
  if(bytes.length>40*1024*1024)throw Error('MP4 exceeds the 40 MiB upload limit');
  await command(c.ffmpeg || 'ffmpeg',['-y','-v','error','-ss',String(Math.min(2,duration/2)),'-i',output,'-frames:v','1',path.join(folder,'cover.jpg')],{timeout:60000});
  await fs.writeFile(path.join(folder,'caption.txt'),job.request.brief.caption);
  const result={runtimeVersion:rendererVersion,requestHash:hash,sha256:digest(bytes),size:bytes.length,qc,duration};
  await fs.writeFile(manifestFile,JSON.stringify(result,null,2));
  return {...result,folder,output};
}
