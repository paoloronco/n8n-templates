# 04 · Google Cloud Setup

1. Create or select a billed project and enable the APIs listed in 03.
2. Create a regional Cloud Storage bucket near the Cloud Run region. Replace YOUR_BUCKET_NAME in both WordPress Update nodes.
3. Grant the Cloud Run runtime service account Cloud Text-to-Speech User and bucket-level Storage Object User.
4. If direct browser playback is required, grant Storage Object Viewer to allUsers on this audio-only bucket. Otherwise adapt the workflow to signed URLs.
5. Create a separate service account for n8n. Grant only Translation API User and the minimum Google Sheets/Drive access needed for the queue.
6. Share the Sheet with the n8n service account email.
7. Create a Secret Manager secret containing a long random API key for the service.

Deploy Cloud Run and the bucket in an appropriate region, for example europe-west1. LOCATION controls the TTS API separately: global is the compatible default. For regional processing use a supported value such as eu; the service then selects eu-texttospeech.googleapis.com and uses locations/eu. Confirm that Long Audio Synthesis and both selected voices are supported before activation.

Do not reuse an Owner or Editor identity in n8n or Cloud Run.
