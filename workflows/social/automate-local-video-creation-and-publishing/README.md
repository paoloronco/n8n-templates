# Local video production, draft approval and publishing

Create narrated vertical videos locally from your own brief and images, review the exact MP4, then deliver approved versions through n8n to Instagram Reels and/or YouTube. This version includes the complete companion runtime: durable SQLite backend, offline speech, four HyperFrames layouts, loopback intake/review gallery, verified file upload and per-channel recovery.

The interface, examples and documentation are in English. New drafts default to US English narration; historical approved media and receipts retain their original content.

## Included

- `workflow.json`: **Local Video Production (template)**, with generic, unbound credential selectors and schedules inactive (the source template file is named `automate-local-video-instagram-youtube.json`).
- `runtime/`: working Python backend, Node.js render worker/gallery, pinned dependencies, examples and tests.
- [Runtime installation and operations guide](runtime/README.md): configuration, first private test, approval, recovery and backups.

## Complete flow

1. Create a draft from a title, narration, caption and two to five scenes. Images are optional except for slideshow.
2. The local worker produces a 1080×1920 H.264/AAC MP4 with offline narration. HyperFrames and FFmpeg check the render.
3. n8n accepts only a signed, leased upload. The backend verifies the exact bytes and decodes audio/video before the draft becomes reviewable.
4. Review the complete local video. Approval binds the MP4 hash, brief, account identities, channels, visibility and earliest publishing time.
5. n8n checks the connected accounts and uses its own OAuth credentials for delivery. Each provider ID is saved durably and read back before success.
6. Recover the incomplete stage from the gallery. Existing IDs are verified again; uncertain uploads require reconciliation before retry.

The daily branch reports approved ready drafts and the publishing slots use the configured timezone. It never invents or approves content automatically. Manual publishing still requires a due approval. Keep the publishing gate closed until setup and the private YouTube test pass.

The default schedule checks up to five approved ready drafts at **09:00** and publishes eligible, due drafts at **10:00, 12:00, 15:00, 18:00 and 21:00**, in `Europe/Rome`. An empty or ineligible queue produces a no-op; it does not fill the day with sample videos. Successful executions are retained for schedule monitoring.

## Production and template editions

This template is derived from the owner's live local production export. Its 74-node graph, node positions, sticky-note geometry, approval checks and recovery behavior match that production version. Installation paths, webhook paths, channel ID, file naming, branding and credential selectors are generalized. Private configuration, actual briefs, media, approval records, execution data and account bindings are excluded. Placeholder credential IDs are explicitly `null` so n8n does not silently bind a local account during import; select your own credentials during setup.

Rendering, speech and media storage run on infrastructure you control. No HeyGen, cloud rendering, paid generative API or cloud media storage is used by this edition. Initial dependency/model installation requires downloads; publishing still requires the official Instagram and YouTube APIs and a reachable signed HTTPS media endpoint.

The separate [cloud edition](https://github.com/paoloronco/n8n-templates/tree/main/workflows/social/automate-cloud-video-production) follows the same brief → render → exact-file approval → durable delivery/recovery approach using a different rendering adapter. Its genuine cloud generation remains unverified because the test API wallet had no credits. The local edition requires its companion runtime and does not satisfy the cloud edition's no-extra-installation constraint. Both target 1080×1920 H.264/AAC output; equal resolution does not imply identical visual rendering.

## Requirements and setup

Use an n8n instance with SSH, HTTPS webhooks, Meta OAuth and YouTube OAuth; a Linux helper host with Python 3.10+, FFmpeg and persistent storage; and a rendering computer with Node.js 22+, FFmpeg and Python for offline Kokoro speech. These components are supplied as source and installed separately; importing JSON does not install them.

Follow [runtime/README.md](runtime/README.md) from backend installation through the first private YouTube test. Configure your own account IDs, channel, shared signing secret, helper paths and webhook URLs. Connect credentials in n8n and review schedules before activation. The gallery remains local to the rendering computer.

A private YouTube test skips Instagram. Instagram tests publish to the selected account. Platform eligibility, permissions, quotas and classification still apply. Local audio measurements verify a non-silent stream; review remains responsible for spoken content and editorial quality.

## Changes from the original template

The package now includes the previously missing renderer and backend. Missing job timestamps stop polling instead of bypassing its timeout. Bridge failures surface as errors. YouTube success requires the approved privacy and actual processing/audio metadata; the final successful poll is accepted. Dry runs do not fabricate upload or audio verification. Approval and render/upload recovery are part of the actual workflow. Provider IDs survive partial failures so retries do not silently duplicate uploads.

## Validation

Run the included Python and Node tests, then a reviewed private test using your own n8n instance. Unit fixtures do not publish. Keep runtime state, original MP4s and configuration backed up; inspect provider state before reconciling uncertain delivery. See the runtime guide for exact recovery controls and limitations.

For implementation support and customization: [paoloronco.it](https://paoloronco.it).
