# 05 · TTS Microservice

The FastAPI service starts Google Long Audio Synthesis and waits for operation.result before returning status completed. It returns real HTTP errors and never reports a failed request as success.

## Configuration

| Variable | Required | Example |
| --- | --- | --- |
| BUCKET_NAME | yes | my-audio-bucket |
| PROJECT_ID | yes | my-project-id |
| LOCATION | yes | global |
| API_KEY | yes | Secret Manager value |
| TTS_TIMEOUT_SECONDS | no | 840 |

## Deploy portable API-key mode

From GoogleCloud-Code, with Dockerfile present:

    gcloud run deploy wp-tts --source . --region europe-west1 --allow-unauthenticated --timeout 900 --concurrency 1 --max-instances 1 --service-account YOUR_RUNTIME_SA --set-env-vars BUCKET_NAME=YOUR_BUCKET_NAME,PROJECT_ID=YOUR_PROJECT_ID,LOCATION=global,TTS_TIMEOUT_SECONDS=840 --set-secrets API_KEY=YOUR_SECRET_NAME:latest

Public invocation is required in this portable mode, but /long-tts rejects every request without the secret X-API-Key. Do not place the key in the workflow JSON; create an n8n Header Auth credential.

Test /health, then POST a short sentence. The response must say completed and the WAV must already exist.

## Stronger IAM/OIDC mode

Remove --allow-unauthenticated, grant roles/run.invoker only to the caller identity, and send a Google-signed OIDC ID token whose audience is the exact Cloud Run service URL. Token generation depends on where n8n is hosted and is intentionally not embedded in this portable template. Keep the application API key as defense in depth.

## Timeout warning

A 504 can occur while Google is still finishing the operation. Check the operation name in Cloud Run logs and the bucket before retrying, otherwise synthesis may be billed twice.
