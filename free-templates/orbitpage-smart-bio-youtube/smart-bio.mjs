// Pure functions shared by the importable workflow and its behavioral tests.
export function validateConfiguration(raw) {
  const config = {
    channelId: String(raw.YOUTUBE_CHANNEL_ID || '').trim(),
    mode: String(raw.MODE || 'EMAIL_APPROVAL').trim(),
    tableId: String(raw.REGISTRY_TABLE_ID || '').trim(),
    fromEmail: String(raw.FROM_EMAIL || '').trim(),
    approvalEmail: String(raw.APPROVAL_EMAIL || '').trim(),
    showTitle: raw.SHOW_TITLE === true,
    showDescription: raw.SHOW_DESCRIPTION === true,
    approvalHours: Number(raw.APPROVAL_TIMEOUT_HOURS ?? 48),
    manualVideoId: String(raw.MANUAL_VIDEO_ID || '').trim(),
  };
  if (!/^UC[\w-]{22}$/.test(config.channelId)) throw new Error('Enter the UC… channel ID, not a handle or video URL.');
  if (!['AUTOMATIC', 'EMAIL_APPROVAL'].includes(config.mode)) throw new Error('MODE must be AUTOMATIC or EMAIL_APPROVAL.');
  if (!/^[\w-]{5,100}$/.test(config.tableId)) throw new Error('The registry could not be created or reused. Check REGISTRY_TABLE_NAME and Data Table access.');
  if (config.mode === 'EMAIL_APPROVAL' && [config.fromEmail, config.approvalEmail].some(v => !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(v))) throw new Error('Configure one FROM_EMAIL and one APPROVAL_EMAIL.');
  if (!Number.isInteger(config.approvalHours) || config.approvalHours < 1 || config.approvalHours > 168) throw new Error('Approval timeout must be 1–168 hours.');
  if (config.manualVideoId && !/^[\w-]{11}$/.test(config.manualVideoId)) throw new Error('MANUAL_VIDEO_ID must be an 11-character public YouTube video ID.');
  return config;
}

export function feedVideos(document, channelId) {
  const text = value => String(Array.isArray(value) ? value[0]?._ ?? value[0] ?? '' : value?._ ?? value ?? '');
  const ownsChannel = value => text(value) === channelId || `UC${text(value)}` === channelId;
  const feed = document.feed;
  if (!feed || !ownsChannel(feed['yt:channelId'])) throw new Error('The response is not the configured YouTube channel feed.');
  const entries = feed.entry ? (Array.isArray(feed.entry) ? feed.entry : [feed.entry]) : [];
  const videos = entries.map(entry => {
    const id = text(entry['yt:videoId']);
    const publishedAt = text(entry.published);
    if (!/^[\w-]{11}$/.test(id) || !ownsChannel(entry['yt:channelId']) || !Number.isFinite(Date.parse(publishedAt))) throw new Error('Invalid YouTube feed entry.');
    const media = entry['media:group'] || {};
    return { id, title: text(entry.title).slice(0, 200), description: text(media['media:description']).slice(0, 2000), publishedAt, url: `https://www.youtube.com/watch?v=${id}` };
  });
  return [...new Map(videos.map(v => [v.id, v])).values()].sort((a,b) => Date.parse(a.publishedAt)-Date.parse(b.publishedAt) || a.id.localeCompare(b.id));
}

export function requireDraftCapability(spec, config) {
  if (config.mode === 'AUTOMATIC') return config;
  const parameters=spec.paths?.['/links']?.put?.parameters || [];
  const supportsDraft=parameters.some(p=>{
    const resolved=p.$ref?.startsWith('#/components/parameters/') ? spec.components?.parameters?.[p.$ref.split('/').pop()] : p;
    return resolved?.name==='publish' && resolved.in==='query' && resolved.schema?.enum?.some(v=>String(v)==='0');
  });
  if (!supportsDraft) throw new Error('This OrbitPage API does not advertise private link drafts (publish=0). Update OrbitPage before using EMAIL_APPROVAL. No card was saved.');
  return config;
}

export function selectWork(config, videos, rows, manual, now) {
  const baselineKey = `${config.channelId}:baseline`;
  const baseline = rows.find(r => r.key === baselineKey);
  const known = new Set(rows.map(r => r.video_id).filter(Boolean));
  const initial = baseline ? JSON.parse(baseline.payload || '{}').ids || [] : [];
  initial.forEach(id => known.add(id));
  if (manual && config.manualVideoId) {
    if (rows.some(r => ['processing','pending','publishing'].includes(r.state))) throw new Error('Another video is pending or needs reconciliation. Finish it before replaying a video.');
    const video = videos.find(v => v.id === config.manualVideoId);
    if (!video) throw new Error('Manual video is not in the current public channel feed. Choose a recent public video.');
    // An explicit manual replay may select an initial-baseline video, never a claimed video.
    if (rows.some(r => r.video_id === video.id)) return { action:'noop', message:'Video already registered; no second email or card.' };
    return { action:'video', config, video, key:`${config.channelId}:${video.id}`, startedAt:now, expiresAt:new Date(Date.parse(now)+config.approvalHours*3600000).toISOString() };
  }
  if (!baseline) return { action:'baseline', config, key:baselineKey, startedAt:now, baselineIds:videos.map(v=>v.id), message:'Baseline saved. Existing videos were not imported.' };
  if (rows.some(r => ['processing','pending','publishing'].includes(r.state))) return { action:'noop', message:'Another video is pending or needs reconciliation. No second draft was created.' };
  const video = videos.find(v => !known.has(v.id));
  if (!video) return { action:'noop', message:'No new public video.' };
  return { action:'video', config, video, key:`${config.channelId}:${video.id}`, startedAt:now, expiresAt:new Date(Date.parse(now)+config.approvalHours*3600000).toISOString() };
}

export function registryRow(work, state, executionId, now) {
  return {
    key:work.key, channel_id:work.config.channelId, video_id:work.video?.id || '', state,
    title:work.video?.title || 'Channel baseline', execution_id:String(executionId), updated_at:now,
    payload:JSON.stringify(work.action === 'baseline' ? {ids:work.baselineIds} : {blockId:`smartbio-${work.video.id}`,expiresAt:work.expiresAt}),
  };
}

export function proposedCard(work) {
  return { id:`smartbio-${work.video.id}`, type:'embed', title:work.config.showTitle ? work.video.title : '', description:work.config.showDescription ? work.video.description : '',
    url:'', content:JSON.stringify({provider:'youtube',snippet:work.video.url,consentCategory:'preferences',height:360}),
    isActive:work.config.mode === 'AUTOMATIC', status:work.config.mode === 'AUTOMATIC' ? 'live' : 'draft',
    availability:'available', position:0, campaignName:'orbitpage-smart-bio' };
}

export function sameCard(actual, expected) {
  if (!actual || actual.type !== 'embed' || actual.id !== expected.id) return false;
  let a,b;
  try { a=JSON.parse(actual.content); b=JSON.parse(expected.content); } catch { return false; }
  return ['provider','snippet','consentCategory','height'].every(k=>a[k]===b[k]) && actual.title===expected.title && actual.description===expected.description && actual.campaignName===expected.campaignName;
}

export function prepareCard(work, response) {
  const body=response.body || response;
  if (!Array.isArray(body.data) || !Number.isSafeInteger(body.revision)) throw new Error('Invalid OrbitPage block response.');
  const card=proposedCard(work);
  const matches=body.data.filter(b=>b.id===card.id);
  if (matches.length > 1 || (matches[0] && !sameCard(matches[0],card))) throw new Error('The existing Smart Bio card was edited. Review it manually; nothing was overwritten.');
  const existing=matches[0];
  if (existing && !(existing.isActive === true && existing.status==='live') && !(existing.isActive === false && existing.status==='draft')) throw new Error('The existing card visibility was changed. Review it manually.');
  const links=existing ? body.data : [card,...body.data];
  return {...work, card, links:links.map((b,position)=>({...b,position})), revision:String(body.revision), needsWrite:!existing, alreadyPublished:!!existing && existing.isActive===true && existing.status==='live'};
}

export function reviewCard(work, response) {
  const body=response.body || response;
  if (!Array.isArray(body.data) || !Number.isSafeInteger(body.revision) || String(body.revision)!==work.revision) throw new Error('The reviewed draft revision changed. Approval was not applied.');
  const actual=body.data.find(b=>b.id===work.card.id);
  if (!sameCard(actual,work.card) || actual.isActive!==false || actual.status!=='draft') throw new Error('The proposed card changed or is no longer a hidden draft. Approval was not applied.');
  return {...work,revision:String(body.revision)};
}

export function approvalDecision(response, work, now) {
  const data=response.data;
  if (Date.parse(now)>Date.parse(work.expiresAt) || !data?.respondedAt) return 'expired';
  return data.approved===true ? 'approved' : 'declined';
}

export function approvalMessage(work) {
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<h2>Nuovo video pronto per OrbitPage</h2><p><strong>${escape(work.video.title)}</strong></p><p><a href="${escape(work.video.url)}">Guarda il video su YouTube</a></p><p>La card YouTube è salvata come bozza nascosta. Approva per renderla pubblica oppure rifiuta per scartare la bozza.</p><p>Titolo esterno: ${work.config.showTitle?'visibile':'nascosto'} · Descrizione esterna: ${work.config.showDescription?'visibile':'nascosta'}.</p><p>Scadenza: ${escape(work.expiresAt)}. L'approvazione riguarda solo questa card; eventuali modifiche alla card richiedono una nuova revisione.</p>`;
}

export function verifyPublication(work, publication, response) {
  const p=publication.data;
  if (!p || !Number.isSafeInteger(Number(work.revision)) || p.publicationStatus!=='published' || p.publishedRevision < Number(work.revision)) throw new Error('OrbitPage has not confirmed the requested publication.');
  const html=response.body ?? response.data;
  if (response.statusCode!==200 || typeof html!=='string' || !html.includes(work.card.id) || !html.includes(work.video.id)) throw new Error('The public HTML did not contain the expected published YouTube card.');
  return {...work,publication:{revision:p.publishedRevision,url:p.publicUrl},message:'YouTube card published and found in the public page.'};
}

export function publicDestination(value) {
  if (typeof value!=='string' || !/^https:\/\/[a-z0-9.-]+(?::443)?(?:\/[a-z0-9/_-]*)?$/i.test(value)) throw new Error('Invalid public HTTPS destination.');
  return value;
}
