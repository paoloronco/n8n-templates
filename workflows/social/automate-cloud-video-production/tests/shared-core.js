// Pure JavaScript shared by the n8n Code nodes and the local checks.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function httpsUrl(value, purpose) {
  const text = String(value || '');
  const match = text.match(/^https:\/\/([^/?#]+)(?:[/?#]|$)/i);
  if (!match || match[1].includes('@') || match[1].includes(':') || text.length > 12000) throw Error('Invalid HTTPS ' + purpose + ' URL');
  const host = match[1].toLowerCase();
  if (!/^[a-z0-9.-]+$/.test(host) || !host.includes('.') || /(^|\.)(localhost|local|internal)$/.test(host) || /^\d+(\.\d+){3}$/.test(host)) throw Error('Public HTTPS URLs are required');
  return text;
}
function baseValidateBrief(input) {
  const b = typeof input === 'string' ? JSON.parse(input) : input;
  if (!b || typeof b !== 'object' || Array.isArray(b)) throw Error('Brief must be a JSON object');
  const text = (v, label, max) => { if (typeof v !== 'string' || !v.trim() || v.length > max) throw Error(label + ' is required (maximum ' + max + ' characters)'); return v.trim(); };
  const format = b.format || 'explainer';
  if (!['explainer','slideshow'].includes(format)) throw Error('Unsupported video format');
  const source = b.brief || b;
  if (!Array.isArray(source.scenes) || source.scenes.length < 2 || source.scenes.length > 5) throw Error('Use two to five scenes');
  const accent = source.accent || '#2563EB';
  if (!/^#[0-9a-f]{6}$/i.test(accent)) throw Error('Accent must be a six-digit hex color');
  const scenes = source.scenes.map(s => ({ title:text(s.title,'Scene title',68), body:text(s.body,'Scene body',155), ...(s.imageUrl ? {imageUrl:httpsUrl(s.imageUrl,'image')} : {}) }));
  if (format === 'slideshow' && scenes.some(s => !s.imageUrl)) throw Error('Slideshow needs one image URL per scene');
  return {format, brief:{title:text(source.title,'Title',100),brand:text(source.brand || 'Your Brand','Brand',35),language:'en',accent,narration:text(source.narration,'Narration',700),caption:text(source.caption || source.title,'Caption',1800),scenes}};
}
function wavInfo(buffer) {
  if (buffer.length < 44 || buffer.toString('ascii',0,4) !== 'RIFF' || buffer.toString('ascii',8,12) !== 'WAVE') throw Error('Narration must be a PCM WAV file');
  let fmt, data;
  for (let p=12; p+8<=buffer.length;) {
    const type=buffer.toString('ascii',p,p+4), n=buffer.readUInt32LE(p+4), start=p+8;
    if (start+n>buffer.length) throw Error('Truncated WAV chunk');
    if (type==='fmt ' && n>=16) fmt={format:buffer.readUInt16LE(start),channels:buffer.readUInt16LE(start+2),rate:buffer.readUInt32LE(start+4),byteRate:buffer.readUInt32LE(start+8),bits:buffer.readUInt16LE(start+14)};
    if (type==='data') data={start,size:n};
    p=start+n+(n%2);
  }
  if (!fmt || !data || fmt.format!==1 || fmt.bits!==16 || ![1,2].includes(fmt.channels) || fmt.rate<16000 || fmt.rate>96000 || fmt.byteRate!==fmt.rate*fmt.channels*2) throw Error('Expected mono/stereo 16-bit PCM narration');
  const duration=data.size/fmt.byteRate;
  let squares=0, peak=0, samples=0;
  for(let p=data.start;p+1<data.start+data.size;p+=2){const v=buffer.readInt16LE(p)/32768;squares+=v*v;peak=Math.max(peak,Math.abs(v));samples++;}
  const rms=Math.sqrt(squares/Math.max(samples,1));
  if (!Number.isFinite(duration) || duration<2 || duration>58.8 || rms<0.0018 || peak<0.006) throw Error('Narration is too short, too long, or silent');
  return {duration,rate:fmt.rate,channels:fmt.channels,rmsDb:20*Math.log10(rms),peakDb:20*Math.log10(peak)};
}
function mp4Info(b) {
  function boxes(start,end) {
    const result=[];
    for(let p=start;p+8<=end;){let size=b.readUInt32BE(p),head=8;const type=b.toString('ascii',p+4,p+8);
      if(size===1){if(p+16>end)throw Error('Truncated MP4 box');size=Number(b.readBigUInt64BE(p+8));head=16;}
      if(size===0)size=end-p;
      if(!Number.isSafeInteger(size)||size<head||p+size>end)throw Error('Invalid MP4 box');
      result.push({type,start:p+head,end:p+size});p+=size;
    }return result;
  }
  const top=boxes(0,b.length),moov=top.find(x=>x.type==='moov');
  if(!top.some(x=>x.type==='ftyp')||!moov||!top.some(x=>x.type==='mdat'))throw Error('MP4 is missing required boxes');
  const children=boxes(moov.start,moov.end),mvhd=children.find(x=>x.type==='mvhd');
  if(!mvhd)throw Error('MP4 duration is missing');
  const p=mvhd.start,version=b[p],timescale=b.readUInt32BE(p+(version===1?20:12));
  const duration=(version===1?Number(b.readBigUInt64BE(p+24)):b.readUInt32BE(p+16))/timescale;
  const tracks=[];
  for(const track of children.filter(x=>x.type==='trak')){
    const tc=boxes(track.start,track.end),tkhd=tc.find(x=>x.type==='tkhd'),mdia=tc.find(x=>x.type==='mdia');if(!mdia)continue;
    const mc=boxes(mdia.start,mdia.end),hdlr=mc.find(x=>x.type==='hdlr'),minf=mc.find(x=>x.type==='minf');if(!hdlr||!minf)continue;
    const handler=b.toString('ascii',hdlr.start+8,hdlr.start+12),stbl=boxes(minf.start,minf.end).find(x=>x.type==='stbl');if(!stbl)continue;
    const stsd=boxes(stbl.start,stbl.end).find(x=>x.type==='stsd');if(!stsd)continue;
    const entries=boxes(stsd.start+8,stsd.end),codec=entries[0]?.type;
    const result={handler,codec};if(tkhd){result.width=b.readUInt32BE(tkhd.end-8)/65536;result.height=b.readUInt32BE(tkhd.end-4)/65536;}tracks.push(result);
  }
  const video=tracks.find(x=>x.handler==='vide'),audio=tracks.find(x=>x.handler==='soun');
  if(video?.width!==1080||video?.height!==1920||!['avc1','avc3'].includes(video?.codec)||audio?.codec!=='mp4a'||!Number.isFinite(duration)||duration<3||duration>60)throw Error('Expected 1080 × 1920 H.264/AAC MP4, 3–60 seconds');
  return {duration,width:video.width,height:video.height,videoCodec:video.codec,audioCodec:audio.codec,metadataOnly:true};
}
function freeQuota(data, characters) {
  const d=data?.data?.details || data?.details;
  const render=Number(d?.hyperframes_api_render_free_credit);
  const speechSeconds=Number(d?.tts_shared_free_ms)/1000;
  if(!Number.isFinite(render)||render<1)throw Error('No verified free HyperFrames API render allowance; spending is disabled');
  // Reserve conservatively: speech costs vary with the selected voice/model.
  if(!Number.isFinite(speechSeconds)||speechSeconds<Math.max(60,characters/5))throw Error('No verified free speech allowance; spending is disabled');
  return {freeApiRenders:render,freeSpeechSeconds:speechSeconds};
}
function accountGuard(data, simulated=false) {
  const a=data?.data || data;
  if(a?.billing_type!=='wallet'||a?.wallet?.auto_reload?.enabled!==false)throw Error('A verified API wallet with automatic reload disabled is required');
  const balance=Number(a.wallet.remaining_balance);
  if(simulated){if(a.simulated_cloud!==true||balance!==0)throw Error('Unexpected simulator billing profile');return {billingType:'simulated',balance:0,autoReload:false};}
  if(!Number.isFinite(balance)||balance<0.2)throw Error('No usable API credits. HeyGen web-plan free generations do not fund this API wallet. No funds will be added.');
  return {billingType:'wallet',balance,autoReload:false};
}
function renderBody(c, request) {
  return {project:{type:'asset_id',asset_id:c.assetId},fps:30,quality:'high',format:'mp4',resolution:'1080p',aspect_ratio:'9:16',composition:'index.html',title:request.brief.title,callback_id:c.jobId};
}

// Pure state transitions. HTTP requests, credentials and persistence remain in n8n nodes.
function readJob(row) {
  const request = JSON.parse(row.requestJson), context = JSON.parse(row.contextJson);
  if (context.jobId !== row.jobId) throw Error('Job identity mismatch');
  return { request, context };
}
function destinationSnapshot(request) {
  const cfg = request.config;
  return {
    instagram: request.targets.instagram ? { accountId: cfg.instagramAccountId, username: cfg.instagramUsername } : null,
    youtube: request.targets.youtube ? { channelId: cfg.youtubeChannelId, privacy: request.privateTest ? 'private' : 'public' } : null,
  };
}
function authorizeAutomaticVideo(row, cfg, now) {
  if (cfg.requireVideoApproval !== false) return row;
  const { request, context: c } = readJob(row);
  assertRendererProfile(request, cfg);
  if (!['review','approved'].includes(c.stage) || c.delivery?.state === 'published') return row;
  const q=c.qc, a=c.approval;
  if (!/^[a-f0-9]{64}$/.test(row.sha256 || '') || !row.renderId || row.renderId !== c.renderId || q?.width !== 1080 || q?.height !== 1920 || !Number.isFinite(q.duration) || q.duration < 3 || q.duration > 60 || !Number.isFinite(c.audioQc?.rmsDb) || c.audioQc.rmsDb < -55 || !Number.isFinite(c.audioQc?.peakDb) || c.audioQc.peakDb < -45) throw Error('Technical media checks must pass before automatic publishing');
  const destinations=destinationSnapshot(request);
  if (a && (a.sha256 !== row.sha256 || a.requestJson !== row.requestJson || JSON.stringify(a.destinations) !== JSON.stringify(destinations))) throw Error('The authorized file or destinations changed');
  if (a?.mode === 'automatic') return row;
  c.approval={mode:'automatic',sha256:row.sha256,requestJson:row.requestJson,destinations,reviewer:'automatic-publishing-policy',at:new Date(now).toISOString(),validUntil:Number.MAX_SAFE_INTEGER};
  c.stage='approved';
  assertDeliveryApproval({...row,contextJson:JSON.stringify(c)},cfg,Math.max(now,Date.parse(request.publishAt)));
  return {...row,phase:'approved',contextJson:JSON.stringify(c),_previous:row.contextJson,_automaticAuthorizationPrevious:row.contextJson};
}
function assertDeliveryApproval(row, cfg, now) {
  const { request, context } = readJob(row), a = context.approval;
  assertRendererProfile(request,cfg);
  if (a?.mode === 'automatic' && cfg.requireVideoApproval !== false) throw Error('Automatic publishing policy is disabled');
  if (!a || a.sha256 !== row.sha256 || a.requestJson !== row.requestJson || !/^[a-f0-9]{64}$/.test(row.sha256)) throw Error('The exact file, brief and destinations must be approved');
  if (!Number.isFinite(a.validUntil) || a.validUntil <= now) throw Error('Publishing approval has expired');
  const expected = destinationSnapshot(request);
  if (JSON.stringify(a.destinations) !== JSON.stringify(expected)) throw Error('Approved destinations changed');
  if (expected.instagram && (cfg.instagramAccountId !== expected.instagram.accountId || cfg.instagramUsername !== expected.instagram.username)) throw Error('The current Instagram target differs from approval');
  if (expected.youtube && cfg.youtubeChannelId !== expected.youtube.channelId) throw Error('The current YouTube target differs from approval');
  if (request.privateTest && request.targets.instagram) throw Error('A private YouTube test must skip Instagram');
  if (!Number.isFinite(Date.parse(request.publishAt)) || Date.parse(request.publishAt) > now) throw Error('This approval is not due yet');
  return { request, context };
}
function slotKey(cfg, now, executionId, manual) {
  if (manual) return 'manual:' + executionId;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: cfg.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(now)).map(p => [p.type, p.value]));
  if (!cfg.hours.includes(Number(parts.hour)) || Number(parts.minute) > 20) return null;
  return `${parts.year}-${parts.month}-${parts.day}-${parts.hour}`;
}
function reserveSlot(ledger, jobId, key, now) {
  const value = JSON.parse(ledger.contextJson), claims = value.claims || {};
  if (!key || (claims[key] && claims[key].jobId !== jobId)) return null;
  for (const [k, v] of Object.entries(claims)) if (v.at < now - 14 * 86400000) delete claims[k];
  claims[key] = claims[key] || { jobId, at: now };
  return { ...ledger, _previous: ledger.contextJson, contextJson: JSON.stringify({ claims }) };
}
function initDelivery(row, cfg, now, executionId, mediaToken) {
  const automaticPrevious=row._automaticAuthorizationPrevious||row.contextJson;
  row=authorizeAutomaticVideo(row,cfg,now);
  if (cfg.publishingEnabled !== true) throw Error('Publishing is disabled');
  const { request, context } = assertDeliveryApproval(row, cfg, now);
  if (!request.targets.instagram && !request.targets.youtube) throw Error('This job has no selected social destination');
  const d = context.delivery || {
    instagram: { state: request.targets.instagram ? 'pending' : 'skipped' },
    youtube: { state: request.targets.youtube ? 'pending' : 'skipped' },
    stage: request.targets.instagram ? 'ig_identity' : 'yt_channel',
  };
  if (d.owner && d.owner !== executionId && d.leaseUntil > now) throw Error('Another delivery execution owns this job');
  if (d.pendingWrite) throw Error('A previous upload outcome is uncertain; reconcile its provider ID before retrying');
  if (d.state === 'reconciliation_required') throw Error('Reconcile the uncertain provider result before resuming');
  if (d.state === 'published') throw Error('The selected destinations already have publication receipts');
  d.owner = executionId; d.leaseUntil = now + 20 * 60000;
  if (!d.mediaToken || d.mediaExpires <= now) {
    if (!/^([a-f0-9]{64}|[a-f0-9]{128})$/.test(mediaToken || '')) throw Error('A separate media capability is required');
    d.mediaToken = mediaToken; d.mediaExpires = now + 2 * 3600000;
  }
  d.state = 'publishing'; delete d.error;
  context.delivery = d;
  return { ...row, phase: 'publishing', contextJson: JSON.stringify(context), _previous: automaticPrevious };
}
function deliveryTransition(row, cfg, now, executionId, response) {
  const previous = row.contextJson, { request, context } = readJob(row), d = context.delivery;
  let action = { kind: 'receipt' };
  try {
    assertDeliveryApproval(row, cfg, now);
    if (cfg.publishingEnabled !== true) throw Error('Publishing is disabled');
    if (!d || d.owner !== executionId || d.leaseUntil <= now) throw Error('Delivery lease is unavailable');
    const meta = (stage, method, node, edge = '', query = {}) => ({ kind: 'instagram', stage, method, node, edge, query });
    const get = (stage, url) => ({ kind: 'read', stage, url });
    const requireId = (value, label) => { if (!/^\d{5,30}$/.test(String(value || ''))) throw Error(label + ' is missing'); return String(value); };
    if (response !== undefined) {
      const body = response.body ?? response;
      if (response.error || body?.error || Number(response.statusCode) >= 400) throw Error(response.error?.message || body.error?.message || body.error || body.message || 'Provider request failed');
      switch (d.stage) {
        case 'ig_identity':
          if (!Array.isArray(body.data) || body.data.filter(a=>a.id===cfg.instagramAccountId&&a.username===cfg.instagramUsername).length !== 1) throw Error('Instagram identity differs from the approved account');
          d.stage = 'ig_quota'; break;
        case 'ig_quota': {
          const q = body.data?.[0];
          if (!Number.isInteger(q?.quota_usage) || !Number.isInteger(q?.config?.quota_total) || q.quota_usage >= q.config.quota_total) throw Error('Instagram publishing quota is unavailable or exhausted');
          d.stage = 'ig_create'; break;
        }
        case 'ig_create':
          d.instagram.containerId = requireId(body.id, 'Instagram container ID'); delete d.pendingWrite;
          d.instagram.polls = 0; d.stage = 'ig_poll'; break;
        case 'ig_poll':
          d.instagram.polls = (d.instagram.polls || 0) + 1;
          if (body.status_code === 'FINISHED') d.stage = 'ig_publish';
          else if (body.status_code === 'IN_PROGRESS' && d.instagram.polls < 20) d.stage = 'ig_wait';
          else throw Error('Instagram processing failed or timed out; retain the existing container');
          break;
        case 'ig_wait': d.stage = 'ig_poll'; break;
        case 'ig_publish':
          d.instagram.mediaId = requireId(body.id, 'Instagram media ID'); delete d.pendingWrite;
          d.stage = 'ig_verify'; break;
        case 'ig_verify':
          if (String(body.id) !== d.instagram.mediaId || body.caption !== request.brief.caption || body.media_product_type !== 'REELS' || !/^https:\/\/(?:www\.)?instagram\.com\/(?:reel|p)\/[A-Za-z0-9_-]+\/?$/.test(body.permalink || '')) throw Error('Instagram publication read-back differs from the approved item');
          d.instagram = { ...d.instagram, state: 'published', permalink: body.permalink, publishedAt: new Date(now).toISOString() };
          d.stage = request.targets.youtube ? 'yt_channel' : 'done'; break;
        case 'yt_channel':
          if (body.items?.length !== 1 || body.items[0].id !== cfg.youtubeChannelId) throw Error('YouTube channel differs from the approved destination');
          d.stage = d.youtube.videoId ? 'yt_verify' : 'yt_refresh'; break;
        case 'yt_refresh': {
          const detail = body.data || body;
          if (detail.status !== 'completed' || !detail.video_url) throw Error('The original render is not available');
          d.videoUrl = checkedRendererUrl(detail.video_url, request.config, 'original video');
          d.stage = 'yt_download'; break;
        }
        case 'yt_download':
          if (body.sha256 !== row.sha256 || body.qc?.width !== 1080 || body.qc?.height !== 1920 || body.qc?.duration < 3 || body.qc?.duration > 60) throw Error('The downloaded MP4 differs from the approved original');
          d.stage = 'yt_upload'; break;
        case 'yt_upload': {
          const id = body.uploadId || body.id;
          if (!/^[A-Za-z0-9_-]{11}$/.test(id || '')) throw Error('YouTube returned no valid video ID');
          d.youtube.videoId = id; d.youtube.state = 'processing'; delete d.pendingWrite;
          d.youtube.polls = 0; d.stage = 'yt_verify'; break;
        }
        case 'yt_verify': {
          const v = body.items?.[0], file = v?.fileDetails, stream = file?.videoStreams?.[0];
          if (!v || v.id !== d.youtube.videoId || v.snippet?.channelId !== cfg.youtubeChannelId) throw Error('YouTube video/channel read-back mismatch');
          if (['failed', 'rejected', 'deleted'].includes(v.status?.uploadStatus) || ['failed', 'terminated'].includes(v.processingDetails?.processingStatus)) throw Error('YouTube processing failed');
          d.youtube.polls = (d.youtube.polls || 0) + 1;
          const ready = v.status?.uploadStatus === 'processed' && v.processingDetails?.fileDetailsAvailability === 'available' && stream && file.audioStreams?.some(x => x.channelCount > 0);
          if (ready) {
            const privacy = request.privateTest ? 'private' : 'public';
            if (v.status.privacyStatus !== privacy || Number(file.durationMs) < 3000 || Number(file.durationMs) > 60000 || stream.widthPixels !== 1080 || stream.heightPixels !== 1920) throw Error('YouTube media or visibility differs from approval');
            d.youtube = { ...d.youtube, state: 'published', privacy, publishedAt: new Date(now).toISOString() }; d.stage = 'done';
          } else if (d.youtube.polls >= 21) throw Error('YouTube processing timed out; resume verification of its recorded ID');
          else d.stage = 'yt_wait';
          break;
        }
        case 'yt_wait': d.stage = 'yt_verify'; break;
        default: throw Error('Unexpected delivery response');
      }
    }
    switch (d.stage) {
      case 'ig_identity': action = meta(d.stage, 'GET', 'me', 'assigned_instagram_accounts', { fields: 'id,username' }); break;
      case 'ig_quota': action = meta(d.stage, 'GET', cfg.instagramAccountId, 'content_publishing_limit', { fields: 'config,quota_usage' }); break;
      case 'ig_create':
        if (d.pendingWrite) throw Error('Instagram container creation is already in flight');
        if (d.mediaExpires <= now) throw Error('The media capability expired before Instagram container creation');
        action = meta(d.stage, 'POST', cfg.instagramAccountId, 'media', { media_type: 'REELS', video_url: cfg.publicN8nBaseUrl + '/webhook/video-media?job=' + encodeURIComponent(row.jobId) + '&scope=publish&token=' + d.mediaToken + '&expires=' + d.mediaExpires, caption: request.brief.caption, share_to_feed: true });
        break;
      case 'ig_poll': action = meta(d.stage, 'GET', d.instagram.containerId, '', { fields: 'status_code,status' }); break;
      case 'ig_wait': case 'yt_wait': action = { kind: 'wait', stage: d.stage }; break;
      case 'ig_publish':
        if (d.pendingWrite) throw Error('Instagram publication is already in flight');
        action = meta(d.stage, 'POST', cfg.instagramAccountId, 'media_publish', { creation_id: d.instagram.containerId }); break;
      case 'ig_verify': action = meta(d.stage, 'GET', d.instagram.mediaId, '', { fields: 'id,permalink,caption,timestamp,media_product_type' }); break;
      case 'yt_channel': action = get(d.stage, 'https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true'); break;
      case 'yt_refresh': action = { kind: 'renderer', stage: d.stage, url: request.config.rendererBaseUrl + '/v3/hyperframes/renders/' + row.renderId }; break;
      case 'yt_download': action = { kind: 'video', stage: d.stage, url: d.videoUrl }; break;
      case 'yt_upload':
        if (d.pendingWrite || d.youtube.videoId) throw Error('A YouTube upload was already claimed; reconcile or verify its recorded ID');
        action = { kind: 'youtube', stage: d.stage }; break;
      case 'yt_verify': action = get(d.stage, 'https://www.googleapis.com/youtube/v3/videos?part=id,snippet,status,processingDetails,fileDetails&id=' + d.youtube.videoId); break;
      case 'done':
        d.state = 'published'; d.completedAt = new Date(now).toISOString(); delete d.error;
        action = { kind: 'receipt' }; break;
      default: throw Error('Unknown delivery stage');
    }
    if ((action.kind === 'instagram' && action.method === 'POST') || action.kind === 'youtube') d.pendingWrite = { stage: d.stage, requestedAt: now, executionId };
    if (action.kind !== 'receipt') { d.state = 'publishing'; d.owner = executionId; d.leaseUntil = now + 20 * 60000; }
    else { d.owner = ''; d.leaseUntil = 0; }
    d.action = action;
  } catch (error) {
    if (!d) throw error;
    d.state = d.pendingWrite ? 'reconciliation_required' : 'delivery_failed';
    d.error = String(error.message || error).slice(0,1000); d.owner = ''; d.leaseUntil = 0;
    action = { kind: 'receipt' };
  }
  context.delivery = d;
  const phase = d.state === 'publishing' ? 'publishing' : d.state;
  return { ...row, phase, contextJson: JSON.stringify(context), error: d.error || '', _previous: previous, _deliveryAction: action };
}
function reconcileDelivery(row, values, cfg, now) {
  const automaticPrevious=row.contextJson;
  row=authorizeAutomaticVideo(row,cfg,now);
  const { request, context } = assertDeliveryApproval(row, cfg, now), d = context.delivery;
  if (!d || (d.owner && d.leaseUntil > now)) throw Error('The delivery is still owned by an active execution');
  const setId = (object, key, value, pattern) => {
    if (!value) return;
    if (!pattern.test(value) || (object[key] && object[key] !== value)) throw Error('Existing provider IDs are immutable');
    object[key] = value;
  };
  setId(d.instagram,'containerId',values.instagramContainerId,/^\d{5,30}$/);
  setId(d.instagram,'mediaId',values.instagramMediaId,/^\d{5,30}$/);
  setId(d.youtube,'videoId',values.youtubeVideoId,/^[A-Za-z0-9_-]{11}$/);
  if (d.pendingWrite) {
    const s = d.pendingWrite.stage;
    if (s === 'yt_upload' && d.youtube.videoId) { d.stage = 'yt_channel'; delete d.pendingWrite; }
    else if (s === 'ig_publish' && d.instagram.mediaId) { d.stage = 'ig_verify'; delete d.pendingWrite; }
    else if (s === 'ig_create' && d.instagram.containerId) { d.stage = 'ig_poll'; delete d.pendingWrite; }
    else throw Error('Inspect the provider and supply the existing ID; an uncertain write cannot be repeated');
  } else if (d.youtube.videoId && d.youtube.state !== 'published' && (!request.targets.instagram || d.instagram.state === 'published')) d.stage = 'yt_channel';
  d.state = 'approved'; d.owner = ''; d.leaseUntil = 0; delete d.error;
  return { ...row, phase: 'approved', error: '', contextJson: JSON.stringify(context), _previous: automaticPrevious };
}

function checkedRendererUrl(value, cfg, purpose) {
  if(cfg.renderer!=='heygen'||cfg.rendererBaseUrl!=='https://api.heygen.com')throw Error('Use the official HeyGen Cloud rendering profile');
  return httpsUrl(value, purpose);
}
function assertRendererProfile(request, cfg) {
  if (request.config.renderer !== cfg.renderer || request.config.rendererBaseUrl !== cfg.rendererBaseUrl) throw Error('Select the rendering profile that owns this job before sending its credentials');
}
function validateWorkflowBrief(input, cfg, now) {
  const source = typeof input === 'string' ? JSON.parse(input) : input;
  const brief = { ...(source?.brief || source), brand: (source?.brief || source)?.brand || cfg.defaultBrand };
  const request = baseValidateBrief({ ...source, brief });
  const targets = source?.targets || cfg.defaultTargets;
  if (!targets || typeof targets.instagram !== 'boolean' || typeof targets.youtube !== 'boolean') throw Error('Select explicit Instagram/YouTube targets');
  const privateTest = source?.privateTest === true;
  if (privateTest && (targets.instagram || !targets.youtube)) throw Error('A private YouTube test must select YouTube only');
  const publishAt = source?.publishAt || new Date(now).toISOString();
  if (!Number.isFinite(Date.parse(publishAt))) throw Error('Use an ISO publishing time');
  if (targets.instagram && (!/^\d{5,30}$/.test(cfg.instagramAccountId) || !/^[A-Za-z0-9_.]{1,30}$/.test(cfg.instagramUsername))) throw Error('Configure the intended Instagram account and username');
  if (targets.youtube && !/^UC[A-Za-z0-9_-]{22}$/.test(cfg.youtubeChannelId)) throw Error('Configure the intended YouTube channel');
  if (cfg.renderer !== 'heygen') throw Error('This template uses HeyGen Cloud rendering');
  if (cfg.renderer === 'heygen' && cfg.rendererBaseUrl !== 'https://api.heygen.com') throw Error('The cloud adapter must use the official HeyGen API');
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(cfg.publicN8nBaseUrl) || /YOUR_N8N_HOST/i.test(cfg.publicN8nBaseUrl)) throw Error('Configure the public HTTPS n8n base URL');
  return { ...request, targets: { instagram: targets.instagram, youtube: targets.youtube }, privateTest, publishAt: new Date(publishAt).toISOString(), config: JSON.parse(JSON.stringify(cfg)) };
}
function rendererAccount(data, cfg) {
  return accountGuard(data, false);
}
function workflowReviewHtml(row, base, now, cfg={}) {
  const r = JSON.parse(row.requestJson), c = JSON.parse(row.contextJson), e = escapeHtml;
  const expired = !c.approval || c.approval.validUntil <= now;
  const canDecide = cfg.requireVideoApproval !== false && (c.stage === 'review' || (c.stage === 'approved' && expired && c.delivery?.state !== 'published'));
  const target = [r.targets.instagram ? 'Instagram Reels: ' + r.config.instagramUsername : '', r.targets.youtube ? 'YouTube: ' + (r.privateTest ? 'private test' : 'public') : '', !r.targets.instagram && !r.targets.youtube ? 'Approved master download only' : ''].filter(Boolean).join(' · ');
  const media = base + '/webhook/video-media?job=' + encodeURIComponent(row.jobId) + '&scope=review&token=' + encodeURIComponent(row.token) + '&expires=' + c.reviewExpires;
  const form = canDecide ? `<form method="post" action="${e(base)}/webhook/video-decision"><input type="hidden" name="job" value="${e(row.jobId)}"><input type="hidden" name="token" value="${e(row.token)}"><input type="hidden" name="sha256" value="${e(row.sha256)}"><label>Reviewer name <input name="reviewer" maxlength="100"></label><label><input type="checkbox" name="reviewed" value="yes"> I watched the complete MP4 and listened to its audio.</label><p><button name="decision" value="approve">Approve this file and these destinations</button> <button name="decision" value="reject" formnovalidate>Reject draft</button></p></form>` : '';
  const delivery = c.delivery ? `<h2>Delivery status</h2><pre>${e(JSON.stringify({ state: c.delivery.state, instagram: c.delivery.instagram, youtube: c.delivery.youtube, error: c.delivery.error }, null, 2))}</pre>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="referrer" content="no-referrer"><title>Review ${e(r.brief.title)}</title><style>body{background:#111820;color:#f4f6f8;font:17px system-ui;max-width:900px;margin:32px auto;padding:20px}video{max-height:65vh;max-width:100%}label{display:block;margin:16px 0}input,button{font:inherit;padding:10px}button,a{color:#93c5fd}button{background:#1e3540;border:1px solid #93c5fd;cursor:pointer}pre{white-space:pre-wrap;overflow-wrap:anywhere}code{overflow-wrap:anywhere}</style></head><body><h1>${e(r.brief.title)}</h1><p>Status: ${e(c.stage)} · 1080 × 1920 · 30 fps</p><video controls preload="metadata" src="${e(media)}"></video><h2>Destinations</h2><p>${e(target)}</p><p>Earliest publishing time: ${e(r.publishAt)}</p><h2>Caption</h2><pre>${e(r.brief.caption)}</pre><p>SHA-256: <code>${e(row.sha256)}</code></p>${form}${c.approval ? `<p><a href="${e(media)}" download>Download the original video</a></p>` : ''}${delivery}<p>Job: ${e(row.jobId)}</p></body></html>`;
}
function bindWorkflowDecision(row, values, cfg, now) {
  if (cfg.requireVideoApproval === false) throw Error('Manual video decisions are disabled by the automatic publishing policy');
  if (!row.id || row.token !== values.token || row.sha256 !== values.sha256) throw Error('The private token or reviewed file does not match');
  const r = JSON.parse(row.requestJson), c = JSON.parse(row.contextJson);
  const renewal = c.stage === 'approved' && c.approval?.validUntil <= now && c.delivery?.state !== 'published';
  if ((!renewal && c.stage !== 'review') || now > c.reviewExpires || (c.delivery?.owner && c.delivery.leaseUntil > now)) throw Error('This decision is unavailable, expired or already recorded');
  if (!['approve','reject'].includes(values.decision)) throw Error('Choose approve or reject');
  if (values.decision === 'approve') {
    if (values.reviewed !== 'yes' || !String(values.reviewer || '').trim() || String(values.reviewer).length > 100) throw Error('Confirm the complete video/audio review and enter the reviewer name');
    const destinations = destinationSnapshot(r);
    if (destinations.instagram && (destinations.instagram.accountId !== cfg.instagramAccountId || destinations.instagram.username !== cfg.instagramUsername)) throw Error('The current Instagram account differs from the reviewed destination');
    if (destinations.youtube && destinations.youtube.channelId !== cfg.youtubeChannelId) throw Error('The current YouTube channel differs from the reviewed destination');
    c.approval = { sha256: row.sha256, requestJson: row.requestJson, destinations, reviewer: values.reviewer.trim(), at: new Date(now).toISOString(), validUntil: now + 7 * 86400000 };
    c.stage = 'approved';
  } else { c.stage = 'rejected'; delete c.approval; }
  c.decisionAt = new Date(now).toISOString();
  return { ...row, phase: c.stage, contextJson: JSON.stringify(c), _previous: row.contextJson, valid: true };
}
function authorizeMedia(row, query, now, cfg) {
  if (!row?.id || !/^[a-f0-9]{64}$/.test(row.sha256 || '')) throw Error('Media is unavailable');
  const r = JSON.parse(row.requestJson), c = JSON.parse(row.contextJson), expires = Number(query.expires);
  assertRendererProfile(r,cfg);
  if (!Number.isFinite(expires) || expires <= now) throw Error('Media access expired');
  if (query.scope === 'review') {
    if (query.token !== row.token || expires !== c.reviewExpires || !['review','approved','rejected'].includes(c.stage)) throw Error('Private media access denied');
  } else if (query.scope === 'publish') {
    if (!c.approval || c.approval.sha256 !== row.sha256 || c.approval.requestJson !== row.requestJson || c.approval.validUntil <= now || !r.targets.instagram || query.token !== c.delivery?.mediaToken || expires !== c.delivery?.mediaExpires) throw Error('Publishing media access denied');
  } else throw Error('Unknown media purpose');
  return { request: r, context: c };
}

