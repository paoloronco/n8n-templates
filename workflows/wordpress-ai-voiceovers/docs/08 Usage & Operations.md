# 08 · Usage & Operations

## Normal states

- Empty Status: eligible for processing.
- done: both audio files completed and both WordPress pages updated.
- failed: reason: a handled processing step failed; the row will not retry automatically.

To retry a failed row, first resolve the cause, verify whether the deterministic WAV already exists, then clear Status and run once manually.

## Routine checks

- n8n executions: unexpected stops and node errors.
- Google Sheet: failed rows or old empty rows.
- Cloud Run logs: upstream TTS errors, operation names and timeouts.
- Storage: both expected object names.
- WordPress: exactly one marker and player per Post ID/language.
- Billing and quotas: unusual request or character volume.

## Recovery

If a WordPress update succeeded before the other branch failed, a retry is safe for page content because the successful language marker prevents another block. TTS may still be invoked again, so inspect the bucket after a timeout.

Keep the workflow inactive while changing credentials, page IDs or bucket names.
