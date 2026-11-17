"""Compatible local HTTP adapter. No HeyGen or paid generation requests.

Install only beside an existing rendering runtime, outside the n8n VM.
Configuration and generated media are private and are never shipped in the
cloud template. Default binding is loopback; network deployment is explicit.
"""
import hashlib,hmac,json,os,pathlib,secrets,stat,subprocess,threading,time,urllib.parse,uuid,wave,zipfile
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer

ROOT=pathlib.Path(__file__).resolve().parent
CONFIG=pathlib.Path(os.environ.get('LOCAL_RENDER_API_CONFIG',str(ROOT/'local-render-api.local.json')))
STATE=ROOT/'local-render-state.json'
config=json.loads(CONFIG.read_text(encoding='utf-8-sig'))
if len(config.get('token',''))<32:raise ValueError('A private adapter credential is required')
RUNTIME=pathlib.Path(config['runtimeRoot'])
NODE=config['node']
FFMPEG=config['ffmpeg']
FFPROBE=config['ffprobe']
VOICE_PYTHON=config['voicePython']
MODELS=pathlib.Path(config['modelsDir'])
RENDER_LIMIT=threading.Semaphore(1)
lock=threading.RLock()
mutation_lock=threading.Lock()
state=json.loads(STATE.read_text(encoding='utf8')) if STATE.exists() else {'assets':{},'renders':{},'idempotency':{},'requests':[],'ttsCalls':0,'uniqueRenders':0,'failedDownloads':0,'failNextVideoDownload':False}
def save():
    temp=STATE.with_suffix('.tmp');temp.write_text(json.dumps(state,indent=2),encoding='utf-8');os.replace(temp,STATE)
def public_base():
    base=str(config['publicBaseUrl']).rstrip('/')
    parsed=urllib.parse.urlsplit(base)
    if parsed.scheme not in ('http','https') or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path not in ('','/'):raise ValueError('Configure the exact adapter origin')
    return base

def sign(path,expires):return hmac.new(config['token'].encode(),f'{path}:{expires}'.encode(),hashlib.sha256).hexdigest()
def signed_url(path):
    expires=int(time.time())+1800
    return public_base()+path+'?'+urllib.parse.urlencode({'expires':expires,'signature':sign(path,expires)})
def valid_signature(path,query):
    try:
        expires=int(query.get('expires',['0'])[0]);signature=query.get('signature',[''])[0]
        return expires>=time.time() and hmac.compare_digest(signature,sign(path,expires))
    except (ValueError,TypeError):return False
def extract_project(asset_id,folder):
    target=folder.resolve()
    archive=ROOT/'local-assets'/f'{asset_id}.zip'
    with zipfile.ZipFile(archive) as z:
        infos=z.infolist()
        if len(infos)>50 or sum(i.file_size for i in infos)>40*1024*1024:raise ValueError('Project archive exceeds configured limits')
        for info in infos:
            resolved=(target/info.filename).resolve()
            if not resolved.is_relative_to(target) or pathlib.PurePosixPath(info.filename).is_absolute() or pathlib.PureWindowsPath(info.filename).drive or chr(92) in info.filename or '\\' in info.filename or stat.S_ISLNK(info.external_attr>>16):raise ValueError('Unsafe archive path')
        z.extractall(target)
    if not (target/'index.html').is_file():raise ValueError('Missing index.html')
def render_worker_inner(render_id):
    with lock:
        item=state['renders'][render_id];item['status']='rendering';save()
    folder=ROOT/'local-renders'/render_id;folder.mkdir(parents=True,exist_ok=True)
    try:
        extract_project(item['assetId'],folder)
        env={**os.environ,'PATH':str(pathlib.Path(FFMPEG).parent)+os.pathsep+os.environ.get('PATH',''),'HF_TELEMETRY_DISABLED':'1'}
        args=[NODE,str(RUNTIME/'node_modules/hyperframes/bin/hyperframes.mjs'),'render',str(folder),'--quality','delivery','--workers','2','--output',str(folder/'reel.mp4'),'--json']
        with (folder/'render.log').open('w',encoding='utf8') as log:
            result=subprocess.run(args,cwd=folder,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=1200,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        if result.returncode or not (folder/'reel.mp4').is_file():raise ValueError('Local renderer failed; inspect render.log')
        probe=json.loads(subprocess.check_output([FFPROBE,'-v','error','-show_format','-show_streams','-of','json',str(folder/'reel.mp4')],creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0)))
        video=next((v for v in probe['streams'] if v.get('codec_type')=='video'),{})
        audio=next((v for v in probe['streams'] if v.get('codec_type')=='audio'),{})
        duration=float(probe['format']['duration'])
        if video.get('codec_name')!='h264' or audio.get('codec_name')!='aac' or video.get('width')!=1080 or video.get('height')!=1920 or not 3<=duration<=60:raise ValueError('Rendered media does not match H.264/AAC 1080x1920 and 3-60 seconds')
        decode=subprocess.run([FFMPEG,'-v','error','-i',str(folder/'reel.mp4'),'-f','null','-'],capture_output=True,timeout=180,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        if decode.returncode:raise ValueError('The rendered MP4 did not fully decode')
        with lock:
            item.update(status='completed',duration=float(probe['format']['duration']),probe=probe,completedAt=time.time());save()
    except Exception as e:
        with lock:item.update(status='failed',failure_message=str(e));save()

def render_worker(render_id):
    with RENDER_LIMIT:render_worker_inner(render_id)

class Handler(BaseHTTPRequestHandler):
    server_version='LocalVideoRenderingAPI/1.0'
    def log_message(self,format,*args):pass
    def response(self,status,body):
        raw=json.dumps(body).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(raw)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(raw)
    def error(self,status,code,message):self.response(status,{'error':{'code':code,'message':message}})
    def authorized(self):return hmac.compare_digest(self.headers.get('X-OrbitPage-Test-Token',''),config['token'])
    def body(self,max_size=9*1024*1024):
        size=int(self.headers.get('Content-Length','0'))
        if size<0 or size>max_size:raise ValueError('Request body exceeds configured limit')
        return self.rfile.read(size)
    def handle_request(self):
        parsed=urllib.parse.urlsplit(self.path);path=parsed.path;query=urllib.parse.parse_qs(parsed.query)
        if path=='/health':return self.response(200,{'ok':True,'provider':'local','externalGenerationCalls':0})
        capability=path.startswith('/media/') or path.startswith('/upload/')
        if not (valid_signature(path,query) if capability else self.authorized()):return self.error(401,'unauthorized','A private rendering credential or valid media capability is required')
        with lock:
            state['requests'].append({'method':self.command,'path':path,'at':time.time()});save()
        if self.command=='GET':
            if path=='/v3/users/me':return self.response(200,{'data':{'provider':'local','billing_type':'local','no_external_calls':True,'narration':'offline-kokoro','rendering':'local-hyperframes'}})
            if path=='/v3/models/audio/voices':return self.response(200,{'data':[{'voice_id':'local_en_us','mode':'instant','status':'ACTIVE','name':'Offline US English'},{'voice_id':'local_en_gb','mode':'instant','status':'ACTIVE','name':'Offline UK English'}]})
            if path.startswith('/v3/hyperframes/renders/'):
                render_id=path.rsplit('/',1)[1]
                with lock:
                    item=state['renders'].get(render_id)
                    if not item:return self.error(404,'not_found','Unknown local render')
                    item['polls']=item.get('polls',0)+1;save()
                    data={'render_id':render_id,'status':item['status'],'duration':item.get('duration'),'failure_message':item.get('failure_message'),'fps':30,'quality':'high','resolution':'1080p'}
                    if item['status']=='completed':data['video_url']=signed_url('/media/'+render_id+'.mp4')
                return self.response(200,{'data':data})
            if path.startswith('/media/audio_') and path.endswith('.wav'):
                identity=path.rsplit('/',1)[1][:-4]
                if not __import__('re').fullmatch(r'audio_[a-f0-9]{32}',identity):return self.error(404,'not_found','Unknown narration')
                return self.serve_file(ROOT/'local-voices'/identity/'narration.wav','audio/wav')
            if path.startswith('/media/hfr_local_') and path.endswith('.mp4'):
                render_id=path.rsplit('/',1)[1][:-4]
                with lock:
                    if state['failNextVideoDownload']:
                        state['failNextVideoDownload']=False;state['failedDownloads']+=1;save()
                        return self.error(503,'injected_download_failure','Intentional one-time download failure to verify recovery without another render')
                return self.serve_file(ROOT/'local-renders'/render_id/'reel.mp4','video/mp4')
            return self.error(404,'not_found','Unknown rendering API endpoint')
        if self.command=='PUT' and path.startswith('/upload/'):
            asset_id=path.rsplit('/',1)[1]
            with lock:item=state['assets'].get(asset_id)
            if not item:return self.error(404,'not_found','Unknown upload')
            raw=self.body()
            if len(raw)!=item['size'] or hashlib.sha256(raw).hexdigest()!=item['checksum']:return self.error(400,'invalid_checksum','ZIP checksum or size mismatch')
            target=ROOT/'local-assets';target.mkdir(exist_ok=True);(target/f'{asset_id}.zip').write_bytes(raw)
            with lock:item['uploaded']=True;save()
            return self.response(200,{'ok':True})
        if self.command=='POST':
            body=json.loads(self.body() or b'{}');idempotency=self.headers.get('Idempotency-Key','');
            if not idempotency:return self.error(400,'idempotency_required','An idempotency key is required')
            key=path+':'+idempotency;request_hash=hashlib.sha256(json.dumps(body,sort_keys=True).encode()).hexdigest()
            with lock:
                old=state['idempotency'].get(key)
                if old:
                    if old.get('requestHash')!=request_hash:return self.error(409,'idempotency_conflict','This key belongs to another request')
                    return self.response(old['status'],old['body'])
            if path=='/v3/models/audio/tts':
                text=body.get('text');voice=body.get('voice_id')
                if not isinstance(text,str) or not text.strip() or len(text)>700 or voice not in ('local_en_us','local_en_gb'):return self.error(400,'invalid_narration','Use an English narration of at most 700 characters and an available offline voice')
                identity='audio_'+hashlib.sha256(key.encode()).hexdigest()[:32]
                folder=ROOT/'local-voices'/identity;folder.mkdir(parents=True,exist_ok=True)
                request_file=folder/'request.json';fingerprint=hashlib.sha256(json.dumps(body,sort_keys=True).encode()).hexdigest()
                with lock:
                    if request_file.exists() and json.loads(request_file.read_text(encoding='utf-8'))['fingerprint']!=fingerprint:return self.error(409,'idempotency_conflict','The existing narration key belongs to different input')
                    request_file.write_text(json.dumps({'fingerprint':fingerprint}),encoding='utf-8')
                    wav_file=folder/'narration.wav'
                    if not wav_file.is_file():
                        brief_file=folder/'brief.json';brief_file.write_text(json.dumps({'language':'en-US' if voice=='local_en_us' else 'en-GB','narration':text}),encoding='utf-8')
                        pending=folder/'pending.wav'
                        with (folder/'speech.log').open('w',encoding='utf-8') as log:
                            result=subprocess.run([VOICE_PYTHON,str(RUNTIME/'voice'/'speech.py'),str(brief_file),str(pending),str(MODELS)],cwd=RUNTIME,stdout=log,stderr=subprocess.STDOUT,timeout=180,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
                        if result.returncode or not pending.is_file():raise ValueError('Offline narration failed; inspect its speech log')
                        with wave.open(str(pending),'rb') as wav:
                            duration=wav.getnframes()/wav.getframerate()
                            if wav.getsampwidth()!=2 or not 2<=duration<=58.8:raise ValueError('Offline narration does not match the WAV/duration contract')
                        os.replace(pending,wav_file);state['ttsCalls']+=1;save()
                    with wave.open(str(wav_file),'rb') as wav:duration=wav.getnframes()/wav.getframerate()
                return self.response(200,{'data':{'audio_url':signed_url('/media/'+identity+'.wav'),'duration':duration,'engine':'offline-kokoro'}})
            if path=='/v3/assets/direct-uploads':
                asset_id='asst_local_'+hashlib.sha256(key.encode()).hexdigest()[:32]
                existing=state['assets'].get(asset_id)
                if existing and existing.get('requestHash')!=request_hash:return self.error(409,'idempotency_conflict','This asset key belongs to different input')
                with lock:state['assets'].setdefault(asset_id,{'size':body['size_bytes'],'checksum':body['checksum_sha256'],'uploaded':False,'completed':False,'requestHash':request_hash});save()
                data={'asset_id':asset_id,'upload_url':signed_url('/upload/'+asset_id),'upload_headers':{'Content-Type':'application/zip'}};status=200;response={'data':data}
            elif path.startswith('/v3/assets/') and path.endswith('/complete'):
                asset_id=path.split('/')[-2]
                with lock:item=state['assets'].get(asset_id)
                if not item or not item['uploaded'] or body.get('checksum_sha256')!=item['checksum']:return self.error(400,'incomplete_upload','The uploaded ZIP has not been verified')
                with lock:item['completed']=True;save()
                status=200;response={'data':{'asset_id':asset_id,'status':'completed'}}
            elif path=='/v3/hyperframes/renders':
                if body.get('quality')!='high' or body.get('resolution')!='1080p' or body.get('fps')!=30:return self.error(400,'invalid_quality','The rendering API expects the production quality settings')
                asset_id=body.get('project',{}).get('asset_id')
                with lock:
                    if not state['assets'].get(asset_id,{}).get('completed'):return self.error(400,'invalid_asset','Unknown project ZIP')
                    render_id='hfr_local_'+hashlib.sha256(key.encode()).hexdigest()[:32]
                    existing=state['renders'].get(render_id)
                    if existing and existing.get('requestHash')!=request_hash:return self.error(409,'idempotency_conflict','This render key belongs to different input')
                    if not existing:
                        state['uniqueRenders']+=1;state['renders'][render_id]={'assetId':asset_id,'status':'queued','createdAt':time.time(),'polls':0,'requestHash':request_hash};save()
                status=202;response={'data':{'render_id':render_id}}
                if not existing:threading.Thread(target=render_worker,args=(render_id,),daemon=True).start()
            else:return self.error(404,'not_found','Unknown rendering API endpoint')
            with lock:state['idempotency'][key]={'status':status,'body':response,'requestHash':request_hash};save()
            return self.response(status,response)
        return self.error(405,'method_not_allowed','Unsupported API request')
    def serve_file(self,path,mime):
        if not path.is_file():return self.error(404,'not_found','Unknown local media')
        size=path.stat().st_size;start=0;end=size-1;status=200
        request_range=self.headers.get('Range','')
        if request_range.startswith('bytes='):
            parts=request_range[6:].split('-',1);start=int(parts[0] or '0');end=min(int(parts[1]) if parts[1] else end,end);status=206
            if start>end or start>=size:return self.error(416,'invalid_range','Range exceeds media size')
        self.send_response(status);self.send_header('Content-Type',mime);self.send_header('Accept-Ranges','bytes');self.send_header('Content-Length',str(end-start+1));self.send_header('Cache-Control','private, no-store')
        if status==206:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
        self.end_headers()
        with path.open('rb') as stream:
            stream.seek(start);remaining=end-start+1
            while remaining:
                chunk=stream.read(min(65536,remaining))
                if not chunk:break
                self.wfile.write(chunk);remaining-=len(chunk)
    def do_GET(self):self.dispatch()
    def do_POST(self):self.dispatch()
    def do_PUT(self):self.dispatch()
    def dispatch(self):
        try:
            if self.command=='POST':
                with mutation_lock:self.handle_request()
            else:self.handle_request()
        except (BrokenPipeError,ConnectionResetError):pass
        except Exception as e:self.error(400,'invalid_request',str(e))

if __name__=='__main__':
    for render_id,item in list(state['renders'].items()):
        if item['status'] in ('queued','rendering'):threading.Thread(target=render_worker,args=(render_id,),daemon=True).start()
    (ROOT/'local-render-api.pid').write_text(str(os.getpid()),encoding='ascii')
    print('Local rendering API listening on configured port '+str(config['port']),flush=True)
    ThreadingHTTPServer((config.get('bindHost','127.0.0.1'),config['port']),Handler).serve_forever()
