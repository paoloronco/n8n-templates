import { existsSync, lstatSync, realpathSync, readdirSync, rmSync, statfsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const MEDIA_RETENTION_DAYS=7;
export const MIN_FREE_BYTES=1024**3;
const day=86400000;
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export function assertRenderSpace(output,stats=statfsSync) {
  const s=stats(output),freeBytes=Number(s.bavail)*Number(s.bsize);
  if(freeBytes<MIN_FREE_BYTES)throw Object.assign(new Error('Studio disk has less than 1 GiB free; no new generation is authorized'),{status:507});
  return {freeBytes,minimumFreeBytes:MIN_FREE_BYTES,retentionDays:MEDIA_RETENTION_DAYS};
}
export function maintainMedia({db,output,now=Date.now(),dryRun=false}) {
  const root=realpathSync(output),report={dryRun,expired:[],trimmed:[],protected:[],errors:[]};
  const publications=new Map(db.prepare('SELECT job_id,data FROM instagram_publications').all().map(r=>[r.job_id,JSON.parse(r.data)]));
  const rows=db.prepare("SELECT data FROM jobs WHERE json_extract(data,'$.mediaDeletedAt') IS NULL OR json_extract(data,'$.cleanupPending')=1").all();
  const save=j=>db.prepare('UPDATE jobs SET data=? WHERE id=?').run(JSON.stringify(j),j.id);
  for(const row of rows){
    const job=JSON.parse(row.data);if(!uuid.test(job.id))continue;
    const p=publications.get(job.id),dir=join(root,job.id);
    if(job.held>0||['reserved','needs_revision','drafted','queued','rendering'].includes(job.state)||(p&&p.state!=='published')){report.protected.push(job.id);continue;}
    try{
      if(existsSync(dir)&&(lstatSync(dir).isSymbolicLink()||!lstatSync(dir).isDirectory()||realpathSync(dir)!==resolve(root,job.id)))throw new Error('Unexpected media directory');
      const lastActivity=Math.max(Date.parse(p?.publishedAt||'')||0,Date.parse(job.readyAt||job.updatedAt||job.createdAt)||0);
      const age=now-lastActivity;
      const terminal=['ready','failed','rejected','archived'].includes(job.state);
      const published=p?.state==='published'&&job.published===true;
      const expired=published||job.cleanupPending||terminal&&age>=MEDIA_RETENTION_DAYS*day;
      if(expired&&(published||!(p?.expires*1000>now))){
        report.expired.push(job.id);
        if(!dryRun){
          job.archivedFiles=job.archivedFiles||job.files;job.files=[];job.lastGenerationState=job.lastGenerationState||job.state;job.state='archived';
          job.mediaDeletedAt=job.mediaDeletedAt||new Date(now).toISOString();job.cleanupPending=true;save(job);
          rmSync(dir,{recursive:true,force:true});job.cleanupPending=false;save(job);
        }
      }else if(job.state==='ready'&&existsSync(dir)){
        const keep=new Set([...(job.files||[]),'layout-check.json','check.log','render.log','narration.log']);
        const artifacts=readdirSync(dir).filter(n=>!keep.has(n)&&(['assets','snapshots','frames','.hyperframes'].includes(n)||/\.html$|\.pending\.mp4$/.test(n)));
        if(artifacts.length){report.trimmed.push({jobId:job.id,artifacts});if(!dryRun)for(const n of artifacts)rmSync(join(dir,n),{recursive:true,force:true});}
      }
    }catch(e){report.errors.push({jobId:job.id,error:e.message});}
  }
  return report;
}
