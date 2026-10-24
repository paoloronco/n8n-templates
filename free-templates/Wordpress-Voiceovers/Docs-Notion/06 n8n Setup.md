# 06 · n8n Setup

Import Workflow/WordPress_VoiceOvers_withAI_GoogleCloud_updated.json. It is intentionally inactive.

## Credentials

- WordPress: dedicated least-privilege user and Application Password.
- Google API: service account with Translate and Sheet access.
- HTTP Header Auth: Name X-API-Key, Value the same secret configured in Cloud Run.

## Replace every placeholder

1. In all Google Sheets nodes, select the same document and tab.
2. In both HTTP GCP TTS nodes, replace YOUR_CLOUD_RUN_URL and select the Header Auth credential.
3. In both WordPress GET and Update nodes, set the English and Italian page IDs.
4. In both WordPress Update nodes, replace YOUR_BUCKET_NAME.
5. Confirm the Google voices exist in the selected LOCATION.
6. Adjust the 30-day WordPress fetch window and schedule if needed.

## First run

Use a short test post. Execute manually and verify two WAV objects, one player on each page, and Status done. Execute again after temporarily clearing Status: the marker should prevent duplicate players.

Do not run two manual executions at the same time. Google Sheets is a queue, not an atomic lock.
