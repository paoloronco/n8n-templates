# 10 · Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| HTTP 401 | Missing or wrong X-API-Key | Check the n8n Header Auth credential and Cloud Run secret |
| HTTP 503 | Service env missing | Set API_KEY, BUCKET_NAME and PROJECT_ID |
| HTTP 502 | Google synthesis failed | Read Cloud Run logs; verify API, voice, region, IAM and billing |
| HTTP 504 | Wait exceeded | Check operation/logs and bucket before any retry |
| Audio 403 | Object not readable | Fix bucket read policy or use the intended signed media design |
| Audio 404 | Wrong bucket/object or failed synthesis | Compare bucket placeholder and deterministic filename |
| WordPress 401/403 | Credential lacks page edit access | Recreate the least-privilege Application Password/user |
| Blocks disappear | GET used rendered content | Confirm context edit and content.raw remain configured |
| Row says failed | A handled branch failed | Read the stored reason and n8n execution, fix, then clear Status |
| Row never reaches done | One Merge input did not arrive | Inspect both EN and IT branches |
| Duplicate legacy players | Old blocks lack v1.3 marker | Remove legacy duplicates once manually; future runs are marked |

The health endpoint only proves the container is running. A complete test must POST /long-tts and confirm the object exists before the response is accepted.
