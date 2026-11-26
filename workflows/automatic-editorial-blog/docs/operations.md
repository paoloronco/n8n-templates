# Operations & Troubleshooting

> Diagnose the first failure, locate the durable editorial receipt and recover the existing slot without duplicating spending or publication.

[Automatic Editorial Blog](../README.md)

## Before you start

Open the failed n8n execution, identify the first failed node and record the claimed runId. Check the backend journal before starting another manual execution. A new manual execution key does not replace the backend's slot and budget controls.

## Authentication and permission symptoms

If a private editorial request returns 401 or 403, inspect the Header Auth credential, the expected header and the endpoint's permissions.

If a OpenAI call fails authentication or model access, inspect the OpenAI credential, the intended API project, billing access and model permissions.

## Configuration symptoms

| Symptom | What to inspect |
| --- | --- |
| No AI call | Claim status, due-slot calendar, budget and existing slot ownership. |
| Empty prompt or unsupported input | writerRequest or reviewRequest; use one text message or a plain string. |
| Model, schema or token error | Parameters returned by the backend and the model's supported options. |
| Backend cannot parse generated JSON | Simplify Output and the normalization expressions in draft and complete. |
| Repeated revisions | Durable backend revision count and final-state decisions. |
| Duplicate articles | Idempotency of claim, draft, complete and fail for the slot and runId. |
| Public HTTP 200 but verification fails | Exact verificationText in the returned HTML, not only in the browser-rendered page. |
| Unexpected OpenAI account | The credentials selected in the writer and reviewer nodes. |

## Failure receipts

Writer, draft, reviewer and complete errors lead to **Prepare failure receipt**. The stage sent to the backend is writer, draft, reviewer or publication.

**Record failed run without regeneration** must receive a successful acknowledgement only after the backend stores the failure. **Stop with durable failure** then raises the workflow error.

If claim fails, AI has not started. If recording fail itself fails, inspect the journal before assuming the failure was durably registered.

## Published article, failed verification

1. Locate the published receipt for the same runId.
2. Confirm the article ID and returned path.
3. Inspect HTTP status, redirects and the HTML marker.
4. Repair the rendering or delivery of the existing article.
5. Recheck the existing publication without generating another article.

Verify public article does not follow redirects. Confirm live receipt requires HTTP 200 and a non-empty verificationText found literally in the returned HTML. Client-rendered pages need a marker that is also present in the server response.

## Retry settings

| Requests | n8n attempts | Wait |
| --- | --- | --- |
| Four private editorial API requests | Up to 3 | 1,500 ms |
| Public article GET | Up to 3 | 2,000 ms |
| OpenAI calls | retryOnFail not explicitly enabled | No workflow retry interval configured. |

The overall workflow timeout is 600 seconds. OpenAI requests use the node's transport timeout settings.

Repeated backend requests must remain idempotent even when a request wrote data before the client received an error.

## Credential rotation and maintenance

Update service secrets in n8n credentials, then confirm the intended nodes still use those credentials. Test rotations in staging before allowing the scheduled path to run.

Keep the backend database and journal durable across deployments. Retain enough execution history to correlate failures with stored runIds, drafts and usage.

Configure a global n8n error workflow if you need centralized failure notifications.

## Rerun safely

First determine whether the backend has an unclaimed slot, a reservation, a saved draft, a review or a publication. Resolve the first failure and reuse or reconcile that durable state according to the backend's recovery contract.

Use a new claim only when the backend explicitly allows another attempt within its budget and slot policy.

## Next step

Use [Customization & Advanced Usage](customization.md) when adapting the workflow, and return to [Testing & Validation](testing.md) after recovery or configuration changes.
