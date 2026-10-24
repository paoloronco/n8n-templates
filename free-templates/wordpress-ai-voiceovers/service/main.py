import logging
import os
import re
import secrets
import uuid

from fastapi import FastAPI, Header, HTTPException
from google.cloud import texttospeech_v1
from pydantic import BaseModel


app = FastAPI()
logger = logging.getLogger(__name__)

BUCKET_NAME = os.environ.get("BUCKET_NAME", "")
PROJECT_ID = os.environ.get("PROJECT_ID", "")
LOCATION = os.environ.get("LOCATION", "global")
API_KEY = os.environ.get("API_KEY", "")
TTS_TIMEOUT_SECONDS = int(os.environ.get("TTS_TIMEOUT_SECONDS", "840"))
MAX_TEXT_BYTES = 900_000
SUPPORTED_LOCATIONS = {"global", "eu", "us", "us-central1"}


class TTSRequest(BaseModel):
    text: str
    language: str = "it-IT"
    voice: str = "it-IT-Wavenet-B"
    filename: str | None = None


def _filename(value: str | None) -> str:
    value = value or f"tts-{uuid.uuid4()}.wav"
    value = re.sub(r"[^A-Za-z0-9._-]", "-", value).strip(".-")
    if not value:
        raise HTTPException(status_code=400, detail="Invalid filename")
    return value if value.lower().endswith(".wav") else f"{value}.wav"


def _validate(req: TTSRequest, api_key: str | None) -> str:
    if not API_KEY:
        raise HTTPException(status_code=503, detail="API_KEY is not configured")
    if not api_key or not secrets.compare_digest(api_key, API_KEY):
        raise HTTPException(status_code=401, detail="Invalid API key")
    if not BUCKET_NAME or not PROJECT_ID:
        raise HTTPException(status_code=503, detail="Cloud service is not configured")
    if LOCATION not in SUPPORTED_LOCATIONS:
        raise HTTPException(status_code=503, detail="Unsupported TTS LOCATION")
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    if len(req.text.encode("utf-8")) > MAX_TEXT_BYTES:
        raise HTTPException(status_code=413, detail="Text exceeds the 900 KB safety limit")
    return _filename(req.filename)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/long-tts")
def long_tts(req: TTSRequest, x_api_key: str | None = Header(default=None)):
    filename = _validate(req, x_api_key)
    gcs_uri = f"gs://{BUCKET_NAME}/{filename}"
    operation_name = None

    try:
        client_options = (
            {"api_endpoint": f"{LOCATION}-texttospeech.googleapis.com"}
            if LOCATION != "global"
            else None
        )
        client = texttospeech_v1.TextToSpeechLongAudioSynthesizeClient(
            client_options=client_options
        )
        operation = client.synthesize_long_audio(
            request={
                "parent": f"projects/{PROJECT_ID}/locations/{LOCATION}",
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
        operation_name = operation.operation.name
        operation.result(timeout=TTS_TIMEOUT_SECONDS)
    except TimeoutError as exc:
        logger.exception("TTS operation timed out: %s", operation_name)
        raise HTTPException(
            status_code=504,
            detail=f"TTS operation timed out: {operation_name}",
        ) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("TTS operation failed: %s", operation_name)
        raise HTTPException(status_code=502, detail="TTS operation failed") from exc

    return {
        "status": "completed",
        "gcs_uri": gcs_uri,
        "filename": filename,
        "operation": operation_name,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))
