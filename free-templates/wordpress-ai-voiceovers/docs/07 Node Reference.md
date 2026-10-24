# 07 · Node Reference

| Stage | Nodes | Purpose |
| --- | --- | --- |
| Ingest | Schedule Trigger, Wordpress, Code, Google Sheets | Fetch recent posts, convert HTML to readable text, upsert queue |
| Select | Wait, Google Sheets2, Code Clean | Read queue and choose oldest empty Status |
| EN | Google Translate, Code EN Clean, HTTP GCP TTS EN | Translate, normalize whitespace, generate completed WAV |
| IT | Code IT Clean, HTTP GCP TTS IT | Add title, normalize whitespace, generate completed WAV |
| Publish | WordPress GET/Update EN and IT | Read raw page content and idempotently append a marked player |
| Join | Merge EN + IT Complete | Wait for both successful page updates |
| State | Google Sheets Mark Done / Mark Failed | Persist final success or handled failure |

HTTP TTS nodes deliberately have no automatic retry because a timeout may leave a still-running paid synthesis operation. Translate, WordPress reads/updates and the done write retry up to three times.

The failure node stores only a shortened error in Status. Detailed stack traces remain in n8n execution data and Cloud Run logs.
