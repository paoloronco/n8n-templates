# Validation results

Revision: **17 November 2026**. This document separates technical validation from live provider certification.

## Checks completed without generation costs

| Check | Result |
| --- | --- |
| Personal source workflow regression and archive checks | 31 passed. |
| Public workflow regression, automatic policy and Dropbox checks | 33 passed; all Code nodes compile and all connections resolve. |
| No-credit dispatch gate | Every tested pre-render stage stops with a recoverable receipt while `allowExistingApiCredits` is false. No provider action is dispatched. |
| Self-contained project | The actual builder emits the neutral English composition, narration, fonts and GSAP; no runtime download is needed by the composition. |
| Offline HyperFrames composition audit | Passed with zero errors and warnings across lint, browser runtime, layout, motion, contrast, craft and audio. Scene midpoints at 3, 9 and 15 seconds were inspected. |
| Byte integrity and delivery recovery | Changed originals are refused; uncertain Instagram/YouTube writes require provider-ID reconciliation; completed channels retain their receipts. |
| Dropbox logic | Stable paths, preserved original binary, optional bypass, archive-before-delivery gate, automatic authorization and recoverable archive errors passed. |
| Anonymization | Credential IDs, account bindings, instance metadata, source branding, campaign content and previous visual presets removed. |
| Portable canvas | 139 nodes. Original node positions, IDs, connection graph and sticky geometry/colors preserved; public note text explains the distributed behavior. All production nodes are enabled; workflow activation is off. |

The offline visual audit used synthetic audio solely to validate packaging and timing. The test media helper creates minimal MP4 metadata and a PCM test tone in memory; these are not a playable video showcase or evidence of managed-cloud rendering. No prerecorded production media is distributed.

Earlier on the same date, the native n8n Dropbox integration was exercised with an existing MP4: upload, download and SHA-256 comparison passed. A repeat upload retained the same Dropbox file ID. That established the original-file archive behavior; it did not generate a HeyGen video or post to social accounts. The distributed template has that personal OAuth binding removed.

The technical audit runs on the author's workstation, using existing tools. Those tools are **not deployment dependencies** of the cloud workflow and are not installed on the n8n host by this package.

## Deliberate live-test exclusions

- No HeyGen speech generation, asset upload or managed render was requested in this revision.
- No credits, subscriptions or top-ups were purchased or consumed for generation tests.
- No new Instagram or YouTube publication was made to validate this cloud copy.
- A successful paid-provider end-to-end run, current credential entitlement and editorial quality are **not certified**.

The template intentionally starts inactive with `allowExistingApiCredits: false`, `publishingEnabled: false` and no selected social destinations. The operator must configure their own accounts and test the actual provider before production. API usage after enabling generation can incur costs.

## Reproduce the offline logic checks

From this package directory, with Node.js available on a development machine:

```sh
node --test tests/workflow.test.cjs tests/archive-and-production.test.cjs
```

These tests execute the exported Code-node logic and mocked provider responses. They contain no network calls, credentials or generation requests. They do not require installing anything on the n8n host.

The validated provider contracts were compared with the official [speech API](https://developers.heygen.com/docs/voices/heygen-voice-speech.md), [direct upload API](https://developers.heygen.com/reference/create-asset-upload) and [HyperFrames render API](https://developers.heygen.com/reference/create-hyperframes-render). Endpoint/schema review complements the checks; it does not substitute for a real authenticated provider run.
