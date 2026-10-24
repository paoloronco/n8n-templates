"""
WP VoiceOvers — Long-form TTS microservice for Google Cloud Run.

Receives an HTTP request, starts a Google Cloud Text-to-Speech
*Long Audio Synthesis* operation and returns immediately with the
operation name and the target GCS URI.

Configuration is read from environment variables (set them in Cloud Run
with --set-env-vars or the console). Request/response schema is identical
to v1.1 — drop-in replacement.
"""

import os
import re
import traceback

from fastapi import FastAPI, Header, HTTPException
from google.cloud import texttospeech_v1
from pydantic import BaseModel

app = FastAPI(title="WP VoiceOvers Long TTS", version="1.2.0")

BUCKET_NAME = os.environ.get("BUCKET_NAME", "")
PROJECT_ID = os.environ.get("PROJECT_ID", "")
TTS_REGION = os.environ.get("TTS_REGION", "europe-west12")
# Optional shared secret: when set, requests must send header "X-API-Key: <value>"
API_KEY = os.environ.get("API_KEY", "")

# Long Audio Synthesis accepts up to 1,000,000 input bytes; keep a safety margin.
MAX_TEXT_BYTES = 900_000
SAFE_FILENAME_CHARS = re.compile(r"[^A-Za-z0-9._-]")


class TTSRequest(BaseModel):
    text: str
    language: str = "it-IT"
    voice: str = "it-IT-Neural2-F"
    filename: str | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/long-tts")
def long_tts(req: TTSRequest, x_api_key: str | None = Header(default=None)):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key header")
    if not BUCKET_NAME or not PROJECT_ID:
        raise HTTPException(
            status_code=500,
            detail="Service misconfigured: set the BUCKET_NAME and PROJECT_ID env vars",
        )
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")
    if len(req.text.encode("utf-8")) > MAX_TEXT_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"text exceeds the {MAX_TEXT_BYTES}-byte limit for long audio synthesis",
        )

    filename = SAFE_FILENAME_CHARS.sub("_", req.filename or f"tts-{os.urandom(8).hex()}.wav")
    gcs_uri = f"gs://{BUCKET_NAME}/{filename}"

    try:
        client = texttospeech_v1.TextToSpeechLongAudioSynthesizeClient()
        operation = client.synthesize_long_audio(
            request={
                "parent": f"projects/{PROJECT_ID}/locations/{TTS_REGION}",
                "input": texttospeech_v1.SynthesisInput(text=req.text),
                "voice": texttospeech_v1.VoiceSelectionParams(
                    language_code=req.language,
                    name=req.voice,
                ),
                "audio_config": texttospeech_v1.AudioConfig(
                    audio_encoding=texttospeech_v1.AudioEncoding.LINEAR16
                ),
                "output_gcs_uri": gcs_uri,
            }
        )
    except Exception:
        traceback.print_exc()
        raise HTTPException(
            status_code=502,
            detail="Google Cloud TTS rejected the request (see service logs for details)",
        )

    return {
        "status": "started",
        "gcs_uri": gcs_uri,
        "filename": filename,
        "operation": operation.operation.name,
    }


# Cloud Run expects the app to listen on the port injected via the PORT env var (default 8080).
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
