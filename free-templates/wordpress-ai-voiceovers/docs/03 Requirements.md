# 03 · Requirements

## Accounts and access

- n8n with the built-in WordPress, Google Sheets, Google Translate, HTTP Request, Code and Merge nodes.
- WordPress REST API access through an Application Password. Use a dedicated user allowed to read posts and edit only the two target pages.
- Google Cloud project with billing.
- Google service account for Translate and Sheets.
- Google Sheet with ID, Title, Date, Content, Link, Status.
- A secret value for X-API-Key.

OpenAI is not required.

## Google APIs

Enable Cloud Run, Cloud Build, Artifact Registry, Text-to-Speech, Cloud Translation, Cloud Storage and Secret Manager.

The Cloud Run runtime service account needs Cloud Text-to-Speech User and bucket-level Storage Object User. Object User is needed because a manual retry can replace a deterministic filename.

## Public data

Browser audio playback needs publicly readable objects or a separate signed-URL/CDN design. The supplied workflow assumes public read access to audio files only. Do not place private content in that bucket.

## Cost controls

Set a billing budget and alerts, keep Cloud Run max instances at 1, concurrency at 1, and review TTS/Translate quotas. Prices and free tiers change; use the current Google Cloud pricing pages rather than fixed numbers in this guide.
