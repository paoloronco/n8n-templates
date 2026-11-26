import json,re,uuid,hashlib
from pathlib import Path
ROOT=Path(__file__).parent
OUT=ROOT if (ROOT/'workflow.json').is_file() else ROOT/'release'
OUT.mkdir(exist_ok=True)
source=(ROOT/'src/core.js').read_text(encoding='utf8')
parts=re.split(r'// @block (\w+)\n',source)
blocks={parts[i]:parts[i+1] for i in range(1,len(parts),2)}
nodes=[];connections={}
# Preserve the identifiers in the reviewed distribution.
CONDITION_IDS={'Setup only?': '19c24007-48fc-4214-8564-22b9ea6afd24', 'Ledger already initialized?': '5c36108f-12a6-41f2-bbdd-a996290ce27d', 'Already handled revision?': '218ea22d-cd9e-41f6-b7c5-1d3c8c2adde6', 'Reuse an approved preview?': '5014b1c8-0451-47b9-b7d4-326ef42d9eaf', 'Editorial review passed?': '89333f8d-a76e-469b-b197-b6c76e49261a', 'One correction requested?': 'a6dcce77-fbd1-4feb-81b4-1903c67e5b70', 'Render failed definitively?': 'dc2939d1-c8eb-4e44-b014-bc3e3db00029', 'All videos ready?': 'ee49f6fc-d788-45fe-9739-2adec6b49fac', 'Next carousel video?': 'f5ae42c7-131e-4510-9fda-ddb4c596cf62', 'Approved for real publication?': '77cbc294-1e16-4e6b-abc7-67eee0b0b981', 'Meta action is a status read?': 'fe00e4c0-05cc-466e-93a7-339b2c1d5e75', 'Instagram receipt verified?': '7efd24b5-0135-46e6-9741-604a6d647d01'}
def add(name,kind,p,pos,version=None,**extra):
    typ=kind if kind.startswith('@') else 'n8n-nodes-base.'+kind
    versions={'manualTrigger':1,'scheduleTrigger':1.3,'code':2,'if':2.2,'httpRequest':4.2,'html':1.2,'dataTable':1.1,'wait':1.1,'emailSend':2.1,'facebookGraphApi':1,'stickyNote':1}
    node={'id':str(uuid.uuid5(uuid.NAMESPACE_URL,'social-posts-v3:'+name)),'name':name,'type':typ,'typeVersion':version or versions.get(kind,2),'parameters':p,'position':pos,**extra}
    nodes.append(node);return name
def link(a,b,out=0):
    main=connections.setdefault(a,{'main':[]})['main']
    while len(main)<=out:main.append([])
    main[out].append({'node':b,'type':'main','index':0})
def code(name,body,pos,deps=()):
    return add(name,'code',{'jsCode':blocks['common']+'\n'+'\n'.join(blocks[d] for d in deps)+'\n'+body},pos)
def iff(name,expression,pos):
    return add(name,'if',{'conditions':{'options':{'caseSensitive':True,'leftValue':'','typeValidation':'strict','version':2},'conditions':[{'id':CONDITION_IDS.get(name,str(uuid.uuid5(uuid.NAMESPACE_URL,'social-v3-condition:'+name))),'leftValue':'={{ '+expression+' }}','rightValue':True,'operator':{'type':'boolean','operation':'true','singleValue':True}}],'combinator':'and'},'options':{}},pos)
columns=['jobKey','sourceUrl','sourceHash','status','caption','renderIds','instagramId','permalink','contextJson']
schema=[{'id':k,'displayName':k,'type':'string','display':True,'required':False,'defaultMatch':False,'canBeUsedToMatch':True} for k in columns]
table={'__rl':True,'mode':'name','value':"={{ $('Configure V3 only').first().json.jobsTable }}"}
def dt(name,operation,pos,key=None,value=None,filters=None):
    p={'dataTableId':table,'operation':operation}
    if operation=='get':p.update({'matchType':'allConditions','filters':{'conditions':[{'keyName':'jobKey','keyValue':key} ]},'returnAll':True})
    else:
        p.update({'columns':{'mappingMode':'defineBelow','value':value or {k:'={{ $json.'+k+' }}' for k in columns},'matchingColumns':[],'schema':schema},'options':{}})
        if operation=='update':p.update({'matchType':'allConditions','filters':{'conditions':filters or [{'keyName':'jobKey','keyValue':key or '={{ $json.jobKey }}'}]}})
    return add(name,'dataTable',p,pos,alwaysOutputData=True)
def checkpoint(name,pos):
    return dt(name,'update',pos,value={k:'={{ '+('JSON.stringify($json)' if k=='contextJson' else ("($json.renders || []).map(r => r.id).join(',')" if k=='renderIds' else "$json."+k+" || ''"))+' }}' for k in columns})
def http(name,method,url,pos,body=None,credential=None,text=False):
    p={'method':method,'url':url,'options':{'timeout':120000 if method=='POST' else 30000,'response':{'response':{'responseFormat':'text' if text else 'json',**({'outputPropertyName':'data'} if text else {})}}}}
    if body:p.update({'sendBody':True,'specifyBody':'json','jsonBody':body})
    if credential:p.update({'authentication':'genericCredentialType','genericAuthType':'httpHeaderAuth'})
    return add(name,'httpRequest',p,pos,retryOnFail=False,notesInFlow=False,**({'notes':'Select a Header Auth credential: Authorization = Bearer YOUR_CREATOMATE_KEY. No credential is bundled.'} if credential else {}))
def note(name,text,pos,width,height,color=6):
    return add(name,'stickyNote',{'content':text,'width':width,'height':height,'color':color},pos)
config={
    'action':'setup','generationEnabled':False,'publishingEnabled':False,'jobsTable':'social_posts_v3_editorial',
    'sourceUrl':'https://example.com/product-update','titleSelector':'article h1','bodySelector':'article .social-fact',
    'brand':'Example','language':'English','ctaUrl':'https://example.com/product-update','format':'carousel',
    'campaignRevision':'1','imageUrl':'','musicUrl':'','model':'gpt-5-mini','maxMonthlyAiUsd':3,
    'inputUsdPerMillion':0,'outputUsdPerMillion':0,'maxMonthlyRenderRequests':8,
    'senderEmail':'','approverEmail':'','approvalHours':24,'instagramAccountId':'','instagramUsername':''
}
add('Set up or run V3','manualTrigger',{},[0,0])
add('Check configured source daily','scheduleTrigger',{'rule':{'interval':[{'field':'cronExpression','expression':'0 0 10 * * *'}]}},[0,192],disabled=True)
code('Configure V3 only','const c='+json.dumps(config)+'; return [{json:configure(c,$execution.id,new Date().toISOString())}];',[272,0],['configure'])
iff('Setup only?',"$json.action === 'setup'",[544,0])
add('Create dedicated editorial table','dataTable',{'resource':'table','operation':'create','tableName':"={{ $('Configure V3 only').first().json.jobsTable }}",'columns':{'column':[{'name':k} for k in columns]},'options':{'createIfNotExists':True}},[0,544])
dt('Read setup ledger','get',[272,544],key='__ledger')
iff('Ledger already initialized?',"Boolean($json.contextJson)",[544,544])
code('Initialize new budget ledger',"return [{json:{jobKey:'__ledger',sourceUrl:'',sourceHash:'',status:'ledger',caption:'',renderIds:'',instagramId:'',permalink:'',contextJson:JSON.stringify({rev:0,owner:'',jobKey:'',month:'',aiReservedUsd:0,renderReserved:0})}}];",[816,736])
dt('Insert initial ledger once','insert',[1088,736])
code('Setup receipt',"return [{json:{status:'setup_only',table:$('Configure V3 only').first().json.jobsTable,paidRequests:0,note:'Setup preserves an existing ledger. Do not run setup concurrently.'}}];",[1360,544])
http('Read configured source','GET',"={{ $('Configure V3 only').first().json.sourceUrl }}",[816,0],text=True)
add('Extract selected source fields','html',{'operation':'extractHtmlContent','sourceData':'json','dataPropertyName':'data','extractionValues':{'values':[{'key':'title','cssSelector':"={{ $('Configure V3 only').first().json.titleSelector }}",'returnValue':'text','returnArray':False,'skipSelectors':'script,style,nav,footer'},{'key':'facts','cssSelector':"={{ $('Configure V3 only').first().json.bodySelector }}",'returnValue':'text','returnArray':True,'skipSelectors':'script,style,nav,footer'}]},'options':{'trimValues':True,'cleanUpText':True}},[1088,0])
code('Fingerprint selected facts',"return [{json:sourceSnapshot($('Configure V3 only').first().json,$input.first().json)}];",[1360,0],['source'])
dt('Find existing source revision','get',[1632,0],key='={{ $json.jobKey }}')
code('Choose new job or reuse preview',"return [{json:chooseJob($('Fingerprint selected facts').first().json,$input.first().json)}];",[1904,0],['source'])
iff('Already handled revision?',"$json.route === 'skip'",[2176,0])
code('Return existing editorial status',"const j=$input.first().json;return [{json:{status:j.status,jobKey:j.jobKey,permalink:j.permalink||'',newPaidRequests:0,note:'Existing revision retained. Pending/uncertain requests must be reconciled, not replayed.'}}];",[2448,192])
dt('Read shared budget and lock','get',[2448,0],key='__ledger')
code('Reserve bounded budget and claim',"return [{json:reserve($('Choose new job or reuse preview').first().json,$input.first().json,new Date().toISOString())}];",[2720,0],['reserve'])
dt('Acquire journal lock atomically','update',[2992,0],value={'contextJson':'={{ $json.next }}'},filters=[{'keyName':'jobKey','keyValue':'__ledger'},{'keyName':'contextJson','keyValue':'={{ $json.previous }}'}])
code('Verify durable lock ownership',"const expected=$('Reserve bounded budget and claim').first().json;assert($input.first().json.contextJson===expected.next,'Concurrent journal change: no paid request authorized');return [{json:expected.job}];",[3264,0])
iff('Reuse an approved preview?',"$json.resumeExisting === true",[3536,0])
code('Prepare new editorial record',"return [{json:rowFor($input.first().json)}];",[3808,192])
dt('Insert editorial record','insert',[4080,192])
checkpoint('Save reused preview for review',[3808,0])

# Editorial generation, with a single bounded correction.
code('Prepare writer request',"const j=jobFromRow($input.first().json);j.writerRequest=requestFor(j);j.status='writer_pending';return [{json:j}];",[0,1184],['prompts'])
checkpoint('Checkpoint writer intent',[272,1184])
def openai(name,request_node,field,pos):
    expr="$('"+request_node+"').last().json."+field
    return add(name,'@n8n/n8n-nodes-langchain.openAi',{'modelId':{'__rl':True,'mode':'id','value':'={{ '+expr+'.model }}'},'responses':{'values':[{'role':'system','content':'={{ '+expr+".messages[0].content }}"},{'content':'={{ '+expr+".messages[1].content }}"}]},'simplify':False,'builtInTools':{},'options':{'maxTokens':'={{ '+expr+'.max_completion_tokens }}','maxToolsIterations':1,'parallelToolCalls':False,'reasoning':{'reasoningOptions':{'effort':'low','summary':'none'}},'store':False,'textFormat':{'textOptions':{'type':'json_schema','name':'={{ '+expr+'.response_format.json_schema.name }}','schema':'={{ JSON.stringify('+expr+'.response_format.json_schema.schema) }}','strict':True}}}},pos,version=2,retryOnFail=False,notes='Select your own OpenAI credential. No API tools or automatic retries. No live AI calls were used for package verification.')
openai('Write grounded social copy','Prepare writer request','writerRequest',[544,1184])
code('Validate draft and fact references',"const j=clone($('Prepare writer request').last().json);delete j.writerRequest;return [{json:acceptDraft(j,$input.first().json)}];",[816,1184],['ai'])
checkpoint('Save validated draft',[1088,1184])
code('Prepare independent review',"const j=jobFromRow($input.first().json);j.reviewerRequest=requestFor(j,true);j.status='reviewer_pending';return [{json:j}];",[1360,1184],['prompts'])
checkpoint('Checkpoint reviewer intent',[1632,1184])
openai('Review facts and grammar','Prepare independent review','reviewerRequest',[1904,1184])
code('Apply one-correction rule',"const j=clone($('Prepare independent review').last().json);delete j.reviewerRequest;return [{json:acceptReview(j,$input.first().json)}];",[2176,1184],['ai'])
checkpoint('Save editorial decision',[2448,1184])
iff('Editorial review passed?',"JSON.parse($json.contextJson).status === 'reviewed'",[2720,1184])
iff('One correction requested?',"JSON.parse($json.contextJson).status === 'correction'",[2992,1376])

# Explicit cloud-render lifecycle.
code('Build next Creatomate composition',"const j=jobFromRow($input.first().json);j.renderRequest=composition(j,j.renderIndex);j.status='render_create_pending';return [{json:j}];",[0,1856],['composition'])
checkpoint('Checkpoint render intent',[272,1856])
http('Create Creatomate render','POST','https://api.creatomate.com/v2/renders',[544,1856],"={{ $('Build next Creatomate composition').last().json.renderRequest }}",credential=True)
code('Keep render receipt before polling',"const j=clone($('Build next Creatomate composition').last().json);delete j.renderRequest;return [{json:acceptRender(j,$input.first().json)}];",[816,1856],['composition'])
checkpoint('Checkpoint render receipt',[1088,1856])
add('Wait for cloud rendering','wait',{'amount':10,'unit':'seconds'},[1360,1856],webhookId='bf8385f5-09ca-433c-a000-b11459fbe70f')
code('Prepare existing render poll',"return [{json:jobFromRow($input.first().json)}];",[1632,1856])
http('Read same Creatomate render','GET',"={{ 'https://api.creatomate.com/v2/renders/' + $('Prepare existing render poll').last().json.renders[$('Prepare existing render poll').last().json.renderIndex].id }}",[1904,1856],credential=True)
code('Check render result and dimensions',"return [{json:pollRender(clone($('Prepare existing render poll').last().json),$input.first().json)}];",[2176,1856],['composition'])
checkpoint('Checkpoint render progress',[2448,1856])
iff('Render failed definitively?',"JSON.parse($json.contextJson).status === 'render_failed'",[2720,1856])
iff('All videos ready?',"JSON.parse($json.contextJson).status === 'ready'",[2992,1856])
iff('Next carousel video?',"JSON.parse($json.contextJson).status === 'next_render'",[3264,2048])

# One human decision over the exact final package.
code('Build exact approval package',"return [{json:prepareApproval(jobFromRow($input.first().json),new Date().toISOString())}];",[0,2528],['approval'])
checkpoint('Checkpoint approval package',[272,2528])
add('Approve or reject exact videos','emailSend',{'operation':'sendAndWait','fromEmail':'={{ JSON.parse($json.contextJson).config.senderEmail }}','toEmail':'={{ JSON.parse($json.contextJson).config.approverEmail }}','subject':'={{ "Review Instagram " + JSON.parse($json.contextJson).config.format + ": " + JSON.parse($json.contextJson).title }}','message':'={{ JSON.parse($json.contextJson).reviewHtml }}','approvalOptions':{'values':{'approvalType':'double','approveLabel':'Approve this exact package','disapproveLabel':'Reject'}},'options':{'limitWaitTime':{'values':{'resumeAmount':'={{ JSON.parse($json.contextJson).config.approvalHours }}','resumeUnit':'hours'}},'appendAttribution':False}},[544,2528],retryOnFail=False,notes='Select SMTP credentials. One email, with complete caption and ordered render links. External n8n approval URLs must be HTTPS. No email was sent during verification.')
code('Hold human response',"return [{json:{approvalResponse:$input.first().json,job:jobFromRow($('Checkpoint approval package').last().json)}}];",[816,2528])
dt('Reload exact package before approval','get',[1088,2528],key='={{ $json.job.jobKey }}')
code('Validate approval hash and expiry',"const held=$('Hold human response').last().json;return [{json:approvalDecision(held.job,held.approvalResponse,$input.first().json,new Date().toISOString())}];",[1360,2528],['approval'])
checkpoint('Checkpoint human decision',[1632,2528])
iff('Approved for real publication?',"JSON.parse($json.contextJson).status === 'approved'",[1904,2528])
code('Refresh only reviewed render IDs',"const j=jobFromRow($input.first().json);return j.renders.map((r,index)=>({json:{job:j,index,renderId:r.id}}));",[2176,2528])
http('Refresh existing originals','GET',"={{ 'https://api.creatomate.com/v2/renders/' + $json.renderId }}",[2448,2528],credential=True)
code('Check refreshed originals match',"const source=$('Refresh only reviewed render IDs').all();return [{json:refreshRenders(clone(source[0].json.job),$input.all().map(i=>i.json))}];",[2720,2528],['composition'])
checkpoint('Checkpoint refreshed URLs',[2992,2528])
def meta(name,p,pos):return add(name,'facebookGraphApi',{'authType':'oAuth2','graphApiVersion':'v25.0',**p},pos,retryOnFail=False,notes='Select your own Meta OAuth credential. Requires the reviewed Instagram professional account and publishing permissions. No account or token is bundled.')
meta('Verify authenticated Instagram destination',{'httpRequestMethod':'GET','node':'={{ JSON.parse($json.contextJson).config.instagramAccountId }}','edge':'','options':{'queryParametersJson':'{"fields":"id,username"}'}},[3264,2528])
code('Prepare first Meta container',"return [{json:beginMeta(jobFromRow($('Checkpoint refreshed URLs').last().json),$input.first().json)}];",[3536,2528],['meta'])

# Durable publication state machine: each intent and receipt is visible.
checkpoint('Checkpoint Meta intent',[0,3200])
iff('Meta action is a status read?',"JSON.parse($json.contextJson).action.method === 'GET'",[272,3200])
add('Wait for Meta processing','wait',{'amount':60,'unit':'seconds'},[544,3392],webhookId='d57a8eb7-058b-4010-bef8-2338c1682075')
meta('Execute exact Meta action',{'httpRequestMethod':"={{ JSON.parse($('Checkpoint Meta intent').last().json.contextJson).action.method }}",'node':"={{ JSON.parse($('Checkpoint Meta intent').last().json.contextJson).action.node }}",'edge':"={{ JSON.parse($('Checkpoint Meta intent').last().json.contextJson).action.edge }}",'options':{'queryParametersJson':"={{ JSON.stringify(JSON.parse($('Checkpoint Meta intent').last().json.contextJson).action.query) }}"}},[816,3200])
code('Persist Meta result before next action',"return [{json:acceptMeta(jobFromRow($('Checkpoint Meta intent').last().json),$input.first().json)}];",[1088,3200],['meta'])
checkpoint('Checkpoint Meta receipt',[1360,3200])
iff('Instagram receipt verified?',"JSON.parse($json.contextJson).status === 'published'",[1632,3200])
code('Continue recorded Meta job',"return [{json:jobFromRow($input.first().json)}];",[1904,3392])

# Release only after known terminal states; unknown POST outcomes keep the lock.
code('Select completed editorial job',"return [{json:jobFromRow($input.first().json)}];",[2448,3200])
dt('Read lock for terminal release','get',[2720,3200],key='__ledger')
code('Prepare owner-checked lock release',"return [{json:releaseLedger($('Select completed editorial job').last().json,$input.first().json)}];",[2992,3200],['release'])
dt('Release only matching lock','update',[3264,3200],value={'contextJson':'={{ $json.next }}'},filters=[{'keyName':'jobKey','keyValue':'__ledger'},{'keyName':'contextJson','keyValue':'={{ $json.previous }}'}])
code('Return verified editorial result',"const expected=$('Prepare owner-checked lock release').last().json;assert($input.first().json.contextJson===expected.next,'Lock release conflict');const j=$('Select completed editorial job').last().json;return [{json:{status:j.status,source:j.sourceUrl,jobKey:j.jobKey,renders:j.renders.map(r=>({id:r.id,url:r.url})),instagramId:j.instagramId||'',permalink:j.permalink||'',apiVerification:'Live API behavior is not certified by offline tests'}}];",[3536,3200])

chains=[['Set up or run V3','Configure V3 only','Setup only?'],['Check configured source daily','Configure V3 only'],['Create dedicated editorial table','Read setup ledger','Ledger already initialized?'],['Initialize new budget ledger','Insert initial ledger once','Setup receipt'],['Read configured source','Extract selected source fields','Fingerprint selected facts','Find existing source revision','Choose new job or reuse preview','Already handled revision?'],['Read shared budget and lock','Reserve bounded budget and claim','Acquire journal lock atomically','Verify durable lock ownership','Reuse an approved preview?'],['Prepare new editorial record','Insert editorial record','Prepare writer request','Checkpoint writer intent','Write grounded social copy','Validate draft and fact references','Save validated draft','Prepare independent review','Checkpoint reviewer intent','Review facts and grammar','Apply one-correction rule','Save editorial decision','Editorial review passed?'],['Build next Creatomate composition','Checkpoint render intent','Create Creatomate render','Keep render receipt before polling','Checkpoint render receipt','Wait for cloud rendering','Prepare existing render poll','Read same Creatomate render','Check render result and dimensions','Checkpoint render progress','Render failed definitively?'],['Build exact approval package','Checkpoint approval package','Approve or reject exact videos','Hold human response','Reload exact package before approval','Validate approval hash and expiry','Checkpoint human decision','Approved for real publication?'],['Refresh only reviewed render IDs','Refresh existing originals','Check refreshed originals match','Checkpoint refreshed URLs','Verify authenticated Instagram destination','Prepare first Meta container','Checkpoint Meta intent','Meta action is a status read?'],['Execute exact Meta action','Persist Meta result before next action','Checkpoint Meta receipt','Instagram receipt verified?'],['Select completed editorial job','Read lock for terminal release','Prepare owner-checked lock release','Release only matching lock','Return verified editorial result']]
for chain in chains:
    for a,b in zip(chain,chain[1:]):link(a,b)
for a,b,o in [('Setup only?','Create dedicated editorial table',0),('Setup only?','Read configured source',1),('Ledger already initialized?','Setup receipt',0),('Ledger already initialized?','Initialize new budget ledger',1),('Already handled revision?','Return existing editorial status',0),('Already handled revision?','Read shared budget and lock',1),('Reuse an approved preview?','Save reused preview for review',0),('Reuse an approved preview?','Prepare new editorial record',1),('Save reused preview for review','Build exact approval package',0),('Editorial review passed?','Build next Creatomate composition',0),('Editorial review passed?','One correction requested?',1),('One correction requested?','Prepare writer request',0),('One correction requested?','Select completed editorial job',1),('Render failed definitively?','Select completed editorial job',0),('Render failed definitively?','All videos ready?',1),('All videos ready?','Build exact approval package',0),('All videos ready?','Next carousel video?',1),('Next carousel video?','Build next Creatomate composition',0),('Next carousel video?','Wait for cloud rendering',1),('Approved for real publication?','Refresh only reviewed render IDs',0),('Approved for real publication?','Select completed editorial job',1),('Meta action is a status read?','Wait for Meta processing',0),('Meta action is a status read?','Execute exact Meta action',1),('Wait for Meta processing','Execute exact Meta action',0),('Instagram receipt verified?','Select completed editorial job',0),('Instagram receipt verified?','Continue recorded Meta job',1),('Continue recorded Meta job','Checkpoint Meta intent',0)]:link(a,b,o)
note('Overview and setup','# Website updates to Instagram videos · V3\n\n### How it works\nFor small editorial teams turning a public article, product page or release note into Instagram content.\n\n1. A manual or daily run reads selected facts and skips revisions already handled.\n2. OpenAI writes the copy; a separate review allows one correction.\n3. Creatomate renders one video or a four-video carousel.\n4. Email approval gates optional Instagram publication; a Data Table keeps progress and receipts.\n\n### Setup\n- [ ] In **Configure V3 only**, choose a dedicated `jobsTable`. Run `action: setup` once, sequentially.\n- [ ] Connect OpenAI, Creatomate Header Auth and SMTP credentials. For publishing, connect Meta OAuth with Instagram publishing permissions.\n- [ ] Set `sourceUrl`, CSS selectors, brand, email addresses and current model prices. Use a professional Instagram account and public HTTPS approval links.\n- [ ] Run `action: preview` with `generationEnabled: true`; keep `publishingEnabled: false`. Inspect all videos and test approval/rejection.\n- [ ] To publish, configure the exact Instagram destination and use `action: publish` with `publishingEnabled: true`. Test before enabling the disabled schedule.\n\n### Customization\nChoose `single` or `carousel`, English or Italian, CTA and optional licensed image/music URLs.\n\nPreview uses paid APIs and sends email. Uncertain requests need manual reconciliation. Remote services still require live acceptance testing.\n\n[Complete setup and recovery guide](https://github.com/paoloronco/n8n-templates/blob/main/workflows/social/social-posts-carousels/V3/documentation.md)',[-768, -192],704,928,1)
note('Source and durable reservation','## 1. Detect a new source revision\nSelected facts identify the revision; a Data Table records progress and prevents duplicate jobs. An atomic reservation serializes processing, including approval waits.',[-48, -192],4464,624,7)
note('Setup band','## Create the editorial register\nRun `action: setup` once with a dedicated table name. Setup preserves existing records and makes no AI, rendering, email or social requests.',[-48, 448],1744,560,7)
note('Grounded editorial review','## 2. Write and review the copy\nOpenAI drafts from selected facts, then checks accuracy and grammar. One correction is allowed before rejection; inspect the source claims yourself.',[-48, 1056],3376,640,7)
note('Cloud renderer','## 3. Render with Creatomate\nCreate one 16.5-second video or four ordered 5.5-second videos at 1080 × 1350. Saved render IDs let the workflow poll existing requests.',[-48, 1728],3648,624,7)
note('Human review','## 4. Review the exact video package\nEmail presents the videos, caption and destination for one decision. Rejection, expiry or changed content prevents publication; preview also sends this email.',[-48, 2400],3920,624,7)
note('Publication and recovery','## 5. Publish and keep the receipt\nPublish only approved media to the verified Instagram account, then save its ID and permalink. Reconcile uncertain requests before retrying to avoid duplicates.',[-48, 3072],3920,624,7)
workflow={'name':'Create and publish Instagram video posts with OpenAI and Creatomate','active':False,'nodes':nodes,'connections':connections,'settings':{'executionOrder':'v1','timezone':'Europe/Rome','executionTimeout':7200,'saveDataErrorExecution':'all','saveDataSuccessExecution':'none','saveManualExecutions':False,'callerPolicy':'workflowsFromSameOwner','availableInMCP':False},'pinData':{},'meta':{'templateCredsSetupCompleted':False}}
(OUT/'workflow.json').write_text(json.dumps(workflow,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({'nodes':len(nodes),'notes':sum(n['type'].endswith('stickyNote') for n in nodes),'bytes':(OUT/'workflow.json').stat().st_size,'output':str(OUT/'workflow.json')}))
