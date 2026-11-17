import concurrent.futures, hashlib, importlib.util, json, os, pathlib, secrets, tempfile, threading, unittest, urllib.error, urllib.request, zipfile

ROOT=pathlib.Path(__file__).parent
with tempfile.TemporaryDirectory() as config_dir:
    config_file=pathlib.Path(config_dir)/'adapter.json'
    config_file.write_text(json.dumps({'token':secrets.token_hex(32),'runtimeRoot':config_dir,'node':'unused','ffmpeg':'unused','ffprobe':'unused','voicePython':'unused','modelsDir':config_dir,'publicBaseUrl':'http://127.0.0.1','port':0}))
    previous=os.environ.get('LOCAL_RENDER_API_CONFIG');os.environ['LOCAL_RENDER_API_CONFIG']=str(config_file)
    try:
        spec=importlib.util.spec_from_file_location('local_render_api',ROOT/'local-render-api.py')
        api=importlib.util.module_from_spec(spec);spec.loader.exec_module(api)
    finally:
        if previous is None:os.environ.pop('LOCAL_RENDER_API_CONFIG',None)
        else:os.environ['LOCAL_RENDER_API_CONFIG']=previous

class AdapterContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory()
        api.ROOT=pathlib.Path(cls.temp.name);api.STATE=api.ROOT/'state.json'
        api.state={'assets':{},'renders':{},'idempotency':{},'requests':[],'ttsCalls':0,'uniqueRenders':0,'failedDownloads':0,'failNextVideoDownload':False}
        cls.started=[]
        api.render_worker=lambda render_id: cls.started.append(render_id)
        cls.server=api.ThreadingHTTPServer(('127.0.0.1',0),api.Handler)
        cls.base='http://127.0.0.1:'+str(cls.server.server_port)
        api.config['publicBaseUrl']=cls.base
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown();cls.server.server_close();cls.temp.cleanup()
    def request(self,path,body=None,key=None,method=None,authenticated=True,raw=False):
        headers={'X-OrbitPage-Test-Token':api.config['token']} if authenticated else {}
        if key:headers['Idempotency-Key']=key
        data=body if raw else json.dumps(body).encode() if body is not None else None
        if data is not None and not raw:headers['Content-Type']='application/json'
        req=urllib.request.Request(self.base+path,data=data,headers=headers,method=method or ('POST' if data is not None else 'GET'))
        try:
            with urllib.request.urlopen(req,timeout=10) as response:return response.status,json.loads(response.read())
        except urllib.error.HTTPError as error:return error.code,json.loads(error.read())
    def test_01_profile_and_authentication(self):
        self.assertEqual(self.request('/v3/users/me',authenticated=False)[0],401)
        status,body=self.request('/v3/users/me');self.assertEqual(status,200);self.assertTrue(body['data']['no_external_calls']);self.assertEqual(body['data']['billing_type'],'local')
    def test_02_concurrent_mutation_replay_and_changed_input(self):
        raw=b'not a real archive; the render thread is stubbed only in this unit test'
        body={'size_bytes':len(raw),'checksum_sha256':hashlib.sha256(raw).hexdigest()}
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(lambda _:self.request('/v3/assets/direct-uploads',body,'one-asset'),range(12)))
        ids={r[1]['data']['asset_id'] for r in results};self.assertEqual(len(ids),1);asset=ids.pop()
        self.assertEqual(self.request('/v3/assets/direct-uploads',{**body,'size_bytes':1},'one-asset')[0],409)
        submit={'quality':'high','resolution':'1080p','fps':30,'project':{'asset_id':asset}}
        self.assertEqual(self.request('/v3/hyperframes/renders',submit,'one-render')[0],400)
        signed=api.signed_url('/upload/'+asset).replace(self.base,'')
        self.assertEqual(self.request(signed,b'wrong',method='PUT',authenticated=False,raw=True)[0],400)
        self.assertEqual(self.request(signed,raw,method='PUT',authenticated=False,raw=True)[0],200)
        self.assertEqual(self.request('/v3/assets/'+asset+'/complete',{'checksum_sha256':body['checksum_sha256']},'complete')[0],200)
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(lambda _:self.request('/v3/hyperframes/renders',submit,'one-render'),range(12)))
        self.assertEqual(len({r[1]['data']['render_id'] for r in results}),1);self.assertEqual(api.state['uniqueRenders'],1);self.assertEqual(len(self.started),1)
        self.assertEqual(self.request('/v3/hyperframes/renders',{**submit,'fps':60},'one-render')[0],409)
    def test_03_archive_traversal_rejected(self):
        folder=api.ROOT/'project';folder.mkdir(exist_ok=True);assets=api.ROOT/'local-assets';assets.mkdir(exist_ok=True)
        for name in ['../escape.txt','C:/escape.txt','..\\escape.txt']:
            info=zipfile.ZipInfo('safe.txt');info.filename=name
            with zipfile.ZipFile(assets/'unsafe.zip','w') as z:z.writestr(info,'unsafe')
            with self.subTest(name=name):
                with self.assertRaisesRegex(ValueError,'Unsafe'):api.extract_project('unsafe',folder)
    def test_04_idempotency_key_is_required(self):
        self.assertEqual(self.request('/v3/assets/direct-uploads',{})[0],400)

if __name__=='__main__':unittest.main()
