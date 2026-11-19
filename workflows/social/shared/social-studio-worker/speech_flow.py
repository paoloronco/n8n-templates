"""Continuous Kokoro phrasing and scene cuts from native phoneme timestamps."""
import math,re
import numpy as np

def spoken_parts(text):
 text=re.sub(r'example\s*(?:\.|dot)\s*com\b','example dot com',text,flags=re.I)
 parts=[s.strip() for s in re.split(r'(?<=[.!?])\s+',text) if s.strip()]
 assert all(len(s)<=160 and len(s.split())<=24 for s in parts),'Use a shorter complete narration sentence'
 return parts

def phoneme_script(model,lines):
 assert len(lines) in (3,4,6) and all(isinstance(t,str) and 5<=len(t)<=220 for t in lines)
 texts=[' '.join(spoken_parts(re.sub(r'\s+',' ',t.replace('’',"'").replace('‘',"'")).strip())) for t in lines]
 parts=[' '.join(model.tokenizer.phonemize(t,'en-us').split()) for t in texts]
 assert all(parts),'Empty narration phonemes'
 return texts,parts,' '.join(parts)

def trim_outer(samples,rate):
 assert len(samples) and np.isfinite(samples).all(),'Invalid synthesized audio'
 active=np.flatnonzero(np.abs(samples)>max(float(np.max(np.abs(samples)))*.001,.00005))
 assert len(active),'Silent synthesized narration'
 head=max(0,int(active[0])-round(.08*rate));end=min(len(samples),int(active[-1])+round(.15*rate))
 return samples[head:end].astype(np.float32),head

def scene_cues(texts,parts,marks,sample_count,trim_head,rate=24000):
 assert len(marks)==len(' '.join(parts)),'Model phoneme timings do not match narration'
 cues=[];cursor=0;lead=.12;fps=24;offset=lead-trim_head/rate
 for text,part in zip(texts,parts):
  group=marks[cursor:cursor+len(part)];spoken=[t for t in group if t.phoneme.strip() and t.phoneme not in '.,!?;:—–' and t.end>t.start]
  assert spoken,'Missing timed speech'
  cues.append({'text':text,'start':round(max(lead,spoken[0].start+offset),4),'end':round(spoken[-1].end+offset,4)})
  cursor+=len(part)+1
 cuts=[0]+[math.floor((a['end']+b['start'])/2*fps)/fps for a,b in zip(cues,cues[1:])]
 duration=math.ceil(max(15,lead+sample_count/rate+1.8,cuts[-1]+5.5)*fps)/fps;cuts.append(duration)
 assert 15<=duration<=36,'Narration exceeds short-video budget'
 for i,c in enumerate(cues):
  c.update(sceneStart=round(cuts[i],4),sceneDuration=round(cuts[i+1]-cuts[i],4))
  assert c['sceneDuration']>=1.15 and c['start']>=cuts[i]-1/fps and c['end']<=cuts[i+1]+1/fps,'Native speech does not fit its scene'
 return duration,cues
