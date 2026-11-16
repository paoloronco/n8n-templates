"""Fetch the publisher's pinned Kokoro v1 model release and verify its SHA-256."""
import hashlib
from pathlib import Path
import sys
import urllib.request

MODELS = {
    "kokoro-v1.0.onnx": "beb0d1848dee9a49da392cc3df26958d46cfa35d321edf434f52949153f0df3a",
    "voices-v1.0.bin": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
}
root = Path(sys.argv[1] if len(sys.argv) > 1 else "models")
root.mkdir(parents=True, exist_ok=True)
for name, expected in MODELS.items():
    target = root / name
    if not target.exists() or hashlib.sha256(target.read_bytes()).hexdigest() != expected:
        temporary = target.with_suffix(target.suffix + ".partial")
        urllib.request.urlretrieve("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/" + name, temporary)
        if hashlib.sha256(temporary.read_bytes()).hexdigest() != expected:
            raise ValueError("Downloaded model hash mismatch: " + name)
        temporary.replace(target)
    print(name + ": SHA-256 verified")
