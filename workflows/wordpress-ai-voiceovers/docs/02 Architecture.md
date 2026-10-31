# 02 · Architecture

## Data flow

WordPress posts → HTML normalization → Google Sheets queue → oldest empty row

- EN → Google Translate → EN text → Cloud Run TTS → EN page
- IT → IT text → Cloud Run TTS → IT page

Both page updates → Merge → Status done

Any handled branch failure → Status failed: reason

## Contracts

Google Sheet columns: ID, Title, Date, Content, Link, Status.

Audio object names are deterministic:

| Language | Object |
| --- | --- |
| Italian | POST_ID.wav |
| English | POST_IDEN.wav |

The TTS request contains text, language, voice and filename. A successful response has status completed, gcs_uri, filename and operation. HTTP 4xx means invalid or unauthorized input; HTTP 5xx means configuration, timeout or upstream synthesis failure.

WordPress blocks contain language-specific HTML comments. Existing legacy blocks without those markers are not removed automatically.

## Execution semantics

n8n executionOrder v1 visits branches top to bottom, so the EN branch may finish before IT begins. The Merge node is the actual synchronization barrier. Status done is downstream of Merge, never downstream of one language alone.
