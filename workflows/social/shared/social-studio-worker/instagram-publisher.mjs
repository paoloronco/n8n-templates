import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { maintainMedia } from './storage.mjs';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const numeric = /^\d{5,30}$/;
const fail = (message, status = 409) => { throw Object.assign(new Error(message), { status }); };
const mediaId = value => numeric.test(String(value || '')) ? String(value) : fail('Meta returned an invalid identifier');

export function validateInstagramCaption(value) {
  const caption = typeof value === 'string' ? value.trim() : '';
  if (!caption || caption.length > 2200) fail('Instagram caption must contain 1–2200 characters', 400);
  if (/\b(?:kinetic typography|content[\s-]card collage|motion graphics|storyboards?|camera (?:moves?|angles?)|scene transitions?|render(?:ing)? instructions?|art direction|1080\s*[x×]\s*(?:1350|1920))\b/i.test(caption)) {
    fail('Public caption contains internal production directions; describe the customer problem and verified Example capability instead', 400);
  }
  return caption;
}

// Tokens stay in n8n. This module persists intent/results and never calls Meta.
export function createInstagramPublisher({ db, getJob, saveJob, output, token,
  accountId, username, publicBase, publicBases = {}, now = Date.now, readFile = readFileSync }) {
  if (!numeric.test(accountId) || !/^[a-zA-Z0-9_.]+$/.test(username)) fail('Invalid Instagram target', 400);
  const base = new URL(publicBase);
  if (base.protocol !== 'https:' || base.search || base.hash || base.username || base.password) fail('Invalid media delivery URL', 400);
  for (const [kind, value] of Object.entries(publicBases)) {
    if (!['post', 'reel'].includes(kind)) fail('Invalid media delivery format', 400);
    if (value === undefined) continue;
    const url = new URL(value);
    if (url.origin !== base.origin || url.search || url.hash || url.username || url.password) fail('Invalid format media delivery URL', 400);
  }
  db.exec(`CREATE TABLE IF NOT EXISTS instagram_publications
    (job_id TEXT PRIMARY KEY, content_hash TEXT UNIQUE NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS instagram_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  const read = id => {
    const row = db.prepare('SELECT data FROM instagram_publications WHERE job_id=?').get(id);
    return row ? JSON.parse(row.data) : null;
  };
  const save = p => {
    p.updatedAt = now();
    db.prepare('UPDATE instagram_publications SET data=? WHERE job_id=?').run(JSON.stringify(p), p.jobId);
    return p;
  };
  const enabled = () => db.prepare("SELECT value FROM instagram_settings WHERE key='enabled'").get()?.value === 'true';
  function configure(value) {
    if (typeof value !== 'boolean') fail('enabled must be a boolean', 400);
    db.prepare("INSERT INTO instagram_settings(key,value) VALUES('enabled',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(String(value));
    return { enabled: value, accountId, username };
  }
  const signature = (id, file, expires) => createHmac('sha256', token).update(`instagram-media:v1:${accountId}:${id}:${file}:${expires}`).digest('hex');
  const assetUrl = (p, file) => `${(p.publicBase || publicBase).replace(/\/$/, '')}/${p.jobId}/${file}?expires=${p.expires}&sig=${signature(p.jobId, file, p.expires)}`;
  function view(p) {
    if (!p) return { done: false, state: 'not_started', enabled: enabled() };
    return { jobId: p.jobId, state: p.state, done: p.state === 'published', accountId, username,
      mediaId: p.mediaId, permalink: p.permalink, error: p.error, action: p.action || undefined };
  }
  function stop(p, message) {
    p.state = 'reconciliation_required'; p.error = message; p.action = null; save(p);
    fail(message);
  }
  function offer(p, stage, method, node, edge, query = {}, delaySeconds = 0) {
    p.stage = stage;
    p.action = { stepId: randomUUID(), method, node: String(node), edge, query, delaySeconds };
    p.state = method === 'POST' ? 'mutation_pending' : 'checking';
    save(p); return view(p);
  }
  function inspectJob(id) {
    if (!uuid.test(id)) fail('Invalid job ID', 400);
    const job = getJob(id);
    if (job.previewOnly) fail('Preview fixtures cannot be published');
    if (job.state !== 'ready' || job.review?.approved !== true || !job.copy?.caption?.trim()) fail('Only ready, editorially approved content can be published');
    if ((job.kind === 'reel' && job.designVersion < 3) || (job.kind === 'post' && job.designVersion < 2)) fail('Legacy creative must be reviewed before publication');
    const animated=job.kind==='post'&&job.designVersion>=8;
    const files = job.kind === 'reel' ? ['reel.mp4'] : job.files.filter(f => (animated?/^slide-\d+\.mp4$/:/^slide-\d+\.jpg$/).test(f)).sort((a,b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
    if (!['post', 'reel'].includes(job.kind) || !files.length || files.length > 10 || files.some(f => !job.files.includes(f))) fail('Invalid publishable assets');
    const caption = validateInstagramCaption(job.copy.caption);
    const hash = createHash('sha256').update(accountId + ':' + job.kind);
    for (const file of files) hash.update(readFile(join(output, id, file)));
    return { job, files, caption, digest: hash.digest('hex') };
  }
  function claim(id, executionId, dryRun = false) {
    if (!/^[a-zA-Z0-9:_-]{1,120}$/.test(executionId || '')) fail('Invalid execution ID', 400);
    const prior=read(id);
    if(prior?.state==='published'){
      const job=getJob(id);
      if(job.state==='archived'&&job.mediaDeletedAt)return view(prior);
      if(inspectJob(id).digest!==prior.contentHash)fail('Published content cannot change under the same job ID');
      return view(prior);
    }
    const { job, files, caption, digest } = inspectJob(id);
    if (dryRun === true) return { done: true, dryRun: true, accountId, username, jobId: id, kind: job.kind, assets: files, caption, contentHash: digest, enabled: enabled() };
    if (!enabled()) fail('Instagram publishing is disabled');
    db.exec('BEGIN IMMEDIATE');
    try {
      let p = read(id);
      if (p) {
        if (p.contentHash !== digest) fail('Published content cannot change under the same job ID');
        if (p.state === 'published') { db.exec('COMMIT'); return view(p); }
        if (!p.action || p.state === 'reconciliation_required') fail(p.error || 'Publication requires reconciliation');
        if (p.executionId !== executionId && now() - p.updatedAt < 35 * 60_000) fail('Another execution owns this publication');
        p.executionId = executionId;
        if (p.action.method === 'POST') {
          if (p.stage === 'publish') {
            const result = offer(p, 'recover_publish', 'GET', p.rootId, '', { fields: 'status_code,status' });
            db.exec('COMMIT'); return result;
          }
          stop(p, 'A media creation response is uncertain; do not create another container automatically');
        }
        save(p); db.exec('COMMIT'); return view(p);
      }
      const duplicate = db.prepare('SELECT job_id FROM instagram_publications WHERE content_hash=?').get(digest);
      if (duplicate) fail('Identical media already has a publication record: ' + duplicate.job_id);
      p = { jobId: id, contentHash: digest, kind: job.kind, files, caption, executionId,
        publicBase: publicBases[job.kind] || publicBase,
        expires: Math.floor(now()/1000) + 7200, updatedAt: now(), children: [], index: 0, polls: 0,
        hasCover: job.kind === 'reel' && job.files.includes('cover.jpg'), state: 'checking' };
      db.prepare('INSERT INTO instagram_publications(job_id,content_hash,data) VALUES(?,?,?)').run(id, digest, JSON.stringify(p));
      const result = offer(p, 'identity', 'GET', 'me', 'assigned_instagram_accounts', { fields: 'id,username' });
      db.exec('COMMIT'); return result;
    } catch (e) {
      if (db.isTransaction) db.exec('ROLLBACK');
      throw e;
    }
  }
  function createNext(p) {
    p.polls = 0;
    if (p.kind === 'reel') return offer(p, 'create_root', 'POST', accountId, 'media', {
      media_type: 'REELS', video_url: assetUrl(p, 'reel.mp4'), caption: p.caption, share_to_feed: true,
      ...(p.hasCover ? { cover_url: assetUrl(p, 'cover.jpg') } : {}), is_ai_generated: true });
    if (p.files.length === 1) return offer(p, 'create_root', 'POST', accountId, 'media', {
      ...(p.files[0].endsWith('.mp4')?{media_type:'REELS',video_url:assetUrl(p,p.files[0]),share_to_feed:true}:{image_url:assetUrl(p,p.files[0])}), caption: p.caption, is_ai_generated: true });
    if (p.index < p.files.length) return offer(p, 'create_child', 'POST', accountId, 'media', {
      ...(p.files[p.index].endsWith('.mp4')?{media_type:'VIDEO',video_url:assetUrl(p,p.files[p.index])}:{image_url:assetUrl(p,p.files[p.index])}), is_carousel_item: true });
    return offer(p, 'create_root', 'POST', accountId, 'media', {
      media_type: 'CAROUSEL', children: p.children.join(','), caption: p.caption, is_ai_generated: true });
  }
  function record(id, executionId, stepId, response) {
    const p = read(id);
    if (!p || p.executionId !== executionId) fail('Publication owner mismatch');
    if (p.state === 'published' && p.lastStep === stepId) return view(p);
    if (!p.action || p.action.stepId !== stepId) fail('Stale or already consumed publication step');
    if (!response || typeof response !== 'object') return stop(p, 'Invalid Meta response');
    if (response.error) {
      if (p.stage === 'publish') return offer(p, 'recover_publish', 'GET', p.rootId, '', { fields: 'status_code,status' });
      return stop(p, 'Meta request failed; inspect the n8n execution before resuming');
    }
    p.lastStep = stepId;
    switch (p.stage) {
      case 'identity': {
        if (response.data?.length !== 1 || String(response.data[0].id) !== accountId || response.data[0].username !== username) return stop(p, 'The connected Instagram account does not match the configured target');
        return offer(p, 'quota', 'GET', accountId, 'content_publishing_limit');
      }
      case 'quota': {
        const quota = response.data?.[0];
        if (!Number.isInteger(quota?.quota_usage) || quota.quota_usage >= Math.min(quota.config?.quota_total || 50, 50)) return stop(p, 'Instagram publishing quota is unavailable or exhausted');
        return createNext(p);
      }
      case 'create_child':
        p.currentId = mediaId(response.id); p.polls = 0;
        return offer(p, 'poll_child', 'GET', p.currentId, '', { fields: 'status_code,status' });
      case 'create_root':
        p.rootId = mediaId(response.id); p.polls = 0;
        return offer(p, 'poll_root', 'GET', p.rootId, '', { fields: 'status_code,status' });
      case 'poll_child': case 'poll_root': case 'recover_publish': {
        const stage = p.stage;
        if (response.status_code === 'IN_PROGRESS' && ++p.polls < 6) return offer(p, stage, 'GET', stage === 'poll_child' ? p.currentId : p.rootId, '', { fields: 'status_code,status' }, 60);
        if (stage === 'recover_publish') {
          if (response.status_code !== 'PUBLISHED') return stop(p, 'Publish result is uncertain; keep the existing container and reconcile it without reposting');
          return offer(p, 'recover_media', 'GET', accountId, 'media', { fields: 'id,caption,permalink,timestamp,media_type,media_product_type', limit: 25 });
        }
        if (response.status_code !== 'FINISHED') return stop(p, 'Meta media processing did not finish: ' + String(response.status_code).slice(0,60));
        if (stage === 'poll_child') { p.children.push(p.currentId); p.index++; return createNext(p); }
        p.publishStartedAt = now();
        return offer(p, 'publish', 'POST', accountId, 'media_publish', { creation_id: p.rootId });
      }
      case 'publish':
        p.mediaId = mediaId(response.id);
        return offer(p, 'verify_media', 'GET', p.mediaId, '', { fields: 'id,permalink,caption,timestamp,media_type,media_product_type' });
      case 'recover_media': {
        const matches = (response.data || []).filter(m => m.caption === p.caption && Math.abs(Date.parse(m.timestamp) - p.publishStartedAt) < 15 * 60_000);
        if (matches.length !== 1) return stop(p, 'Published container found; its media ID needs manual reconciliation');
        p.mediaId = mediaId(matches[0].id);
        return offer(p, 'verify_media', 'GET', p.mediaId, '', { fields: 'id,permalink,caption,timestamp,media_type,media_product_type' });
      }
      case 'verify_media': {
        const url = new URL(response.permalink || 'https://invalid.local');
        if (String(response.id) !== p.mediaId || url.protocol !== 'https:' || !['www.instagram.com','instagram.com'].includes(url.hostname) || response.caption !== p.caption) return stop(p, 'Published media verification did not match the expected content');
        if (p.kind === 'reel' && response.media_product_type !== 'REELS') return stop(p, 'The published media is not a Reel');
        p.state = 'published'; p.permalink = url.href; p.publishedAt = response.timestamp; p.action = null; save(p);
        const job = getJob(id); job.published = true; job.instagram = { mediaId: p.mediaId, permalink: p.permalink, publishedAt: p.publishedAt }; saveJob(job);
        // Cleanup failure must never obscure a verified receipt or cause another Meta mutation.
        try { maintainMedia({db,output,now:now()}); } catch {}
        return view(p);
      }
      default: return stop(p, 'Unknown publication stage');
    }
  }
  function publicAsset(id, file, expires, sig) {
    if (!uuid.test(id) || !/^(reel\.mp4|cover\.jpg|slide-\d+\.(?:jpg|mp4))$/.test(file)) fail('Media unavailable',404);
    const exp = Number(expires);
    if (!Number.isSafeInteger(exp) || exp <= Math.floor(now()/1000) || exp > Math.floor(now()/1000)+7200 || !/^[a-f0-9]{64}$/.test(sig || '')) fail('Media link expired or invalid',403);
    const expected = Buffer.from(signature(id,file,exp)); const provided = Buffer.from(sig);
    if (!timingSafeEqual(expected,provided)) fail('Media link expired or invalid',403);
    const p = read(id);
    if (!p || p.expires !== exp || p.state === 'reconciliation_required' || (!p.files.includes(file) && !(file === 'cover.jpg' && p.hasCover))) fail('Media unavailable',404);
    const job = getJob(id);
    if (job.state !== 'ready' || !job.files.includes(file)) fail('Media unavailable',404);
    return join(output,id,file);
  }
  return { claim, record, publicAsset, configure, enabled, status: id => view(read(id)) };
}
