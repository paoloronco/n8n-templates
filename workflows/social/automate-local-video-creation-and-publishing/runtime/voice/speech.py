"""Offline Kokoro narration, isolated from the queue.py SSH entry point."""
import json
from pathlib import Path
import sys
import os
# Bound native math pools on machines that also run browsers and n8n tools.
for variable in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS", "MKL_NUM_THREADS", "NUMEXPR_NUM_THREADS"):
    os.environ[variable] = "2"
import soundfile as sf
from kokoro_onnx import Kokoro
import onnxruntime as rt

brief = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8-sig"))
models = Path(sys.argv[3])
voices = {"it-IT": ("if_sara", "it"), "en-US": ("af_heart", "en-us"), "en-GB": ("bf_emma", "en-gb")}
if brief["language"] not in voices:
    raise ValueError("Supported narration languages: it-IT, en-US, en-GB")
voice, language = voices[brief["language"]]
options = rt.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
options.enable_cpu_mem_arena = False
options.enable_mem_pattern = False
options.graph_optimization_level = rt.GraphOptimizationLevel.ORT_ENABLE_BASIC
session = rt.InferenceSession(str(models / "kokoro-v1.0.onnx"), sess_options=options, providers=["CPUExecutionProvider"])
engine = Kokoro.from_session(session, str(models / "voices-v1.0.bin"))
samples, rate = engine.create(brief["narration"], voice=voice, speed=0.97, lang=language)
sf.write(sys.argv[2], samples, rate)
