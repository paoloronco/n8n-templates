"""Same local voice, one continuous passage; no fixed silence between scenes."""
import json,os,pathlib,subprocess,sys
import numpy as np
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro
from speech_flow import phoneme_script,trim_outer,scene_cues

def main(directory):
 texts=json.loads((directory/'narration-input.json').read_text(encoding='utf-8'))
 models=pathlib.Path(os.environ.get('KOKORO_MODEL_DIR','/opt/kokoro'));options=ort.SessionOptions()
 options.intra_op_num_threads=2;options.inter_op_num_threads=1;options.enable_cpu_mem_arena=False;options.enable_mem_pattern=False
 session=ort.InferenceSession(str(models/'kokoro-v1.0-timed.onnx'),sess_options=options,providers=['CPUExecutionProvider'])
 model=Kokoro.from_session(session,str(models/'voices-v1.0.bin'));assert model.has_timings,'Native voice timings required'
 texts,parts,phonemes=phoneme_script(model,texts)
 samples,rate,marks=model.create_timed(phonemes,voice='af_heart',speed=1,lang='en-us',is_phonemes=True,continuous=True,sentence_pause=.16,clause_pause=.06)
 assert rate==24000;samples,head=trim_outer(samples,rate);duration,cues=scene_cues(texts,parts,marks,len(samples),head,rate)
 audio=np.zeros(round(duration*rate),dtype=np.float32);start=round(.12*rate);audio[start:start+len(samples)]=samples
 raw=directory/'voice-raw.wav';sf.write(raw,audio,rate,subtype='PCM_16')
 result=subprocess.run([os.environ.get('FFMPEG_PATH','ffmpeg'),'-v','info','-y','-i',str(raw),'-af','loudnorm=I=-16:TP=-2:LRA=7:print_format=json','-ar',str(rate),'-c:a','pcm_s16le',str(directory/'voiceover.wav')],capture_output=True,text=True,check=True)
 measurement,_=json.JSONDecoder().raw_decode(result.stderr[result.stderr.rfind('{'):]);assert -18<=float(measurement['output_i'])<=-14 and float(measurement['output_tp'])<=-1.8
 normalized,_=sf.read(directory/'voiceover.wav');assert np.isfinite(normalized).all() and np.max(np.abs(normalized))<.85
 def stamp(s,separator):
  ms=round(s*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}{separator}{ms%1000:03}'
 for filename,separator,prefix in [('narration.vtt','.','WEBVTT\n\n'),('narration.srt',',','')]:
  (directory/filename).write_text(prefix+'\n\n'.join(f'{i+1}\n{stamp(c["start"],separator)} --> {stamp(c["end"],separator)}\n{c["text"]}' for i,c in enumerate(cues))+'\n',encoding='utf-8')
 report={'provider':'kokoro-local','model':'Kokoro-82M-v1.0','voice':'af_heart','language':'en-US','speed':1,'continuous':True,'timingSource':'native model phoneme durations','sentencePause':.16,'clausePause':.06,'apiCostUsd':0,'duration':duration,'cues':cues,'maxSentenceGap':round(max(b['start']-a['end'] for a,b in zip(cues,cues[1:])),4),'measurement':measurement,'syntheticVoice':True}
 (directory/'narration.json').write_text(json.dumps(report,indent=2),encoding='utf-8');raw.unlink();print(json.dumps({'ok':True,'duration':duration,'continuous':True,'maxSentenceGap':report['maxSentenceGap']}))
if __name__=='__main__':main(pathlib.Path(sys.argv[1]))
