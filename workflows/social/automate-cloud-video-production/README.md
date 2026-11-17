# Video production and publishing with n8n

**Technical revision, 17 November 2026.** This version adds native scheduled social delivery to the cloud pipeline. Validation distinguishes real local rendering, native n8n protocol-fixture tests and read-only provider checks. Managed HeyGen generation and real social uploads have not been certified. See [TEST-RESULTS.md](TEST-RESULTS.md) before enabling production. Creator Portal submission remains a manual owner action.

## How it works

One workflow handles a structured brief, narrated video, exact-file review, approved download, scheduled Instagram Reels / YouTube Shorts delivery and recovery. The distributed template defaults to **HeyGen Cloud**. It uses stock n8n nodes and needs no renderer, worker, Python, FFmpeg, Chromium or additional packages installed on the n8n VM.

1. Submit a real brief through the protected form or run the English example.
2. Validate the input, reserve an authorized cloud-render allowance, synthesize narration and package the self-contained project in n8n.
3. Upload the ZIP, submit a high-quality render and poll the same render ID. Validate WAV/MP4 metadata and hash the original MP4.
4. Review the complete video and audio. Approval binds the exact SHA-256, full brief, caption, destination accounts, visibility and earliest publishing time.
5. At a configured publishing slot, reserve one due approved job. Verify account identities and deliver only its selected channels. Save every provider ID and processing receipt.
6. Recover incomplete delivery without repeating completed channels. An uncertain write requires reconciliation against its existing provider ID before another upload is possible.

The 09:00 schedule reports the approved queue. Publishing slots are 10:00, 12:00, 15:00, 18:00 and 21:00 in Europe/Rome. Empty queues do nothing. These schedules do not invent briefs or approve content.

## Setup

1. Import [automate-cloud-video-production.json](automate-cloud-video-production.json) into n8n with Data Tables, Webhook, HTTP Request, Code, Crypto, Compression and Extract from File. Leave it inactive during setup.
2. Edit **Apply video configuration** once. Set `publicN8nBaseUrl`, a dedicated `jobsTable`, brand, intended account identities and default targets. The cloud renderer is `heygen` at `https://api.heygen.com`.
3. Connect the rendering Header Auth credential to every authenticated rendering request, including review, delivery and media-refresh nodes. Use the authentication format accepted for the issued credential; keep the value exclusively in n8n credentials.
4. Connect one dedicated Basic Auth credential to the intake and recovery forms. Connect Instagram Facebook Graph OAuth and YouTube OAuth only if those targets will be used. Complete the platform permissions / app review required by the accounts.
5. Leave `manualAction: "setup"` and run **Set up cloud storage** once. To run the English sample, change `manualAction` to `"example"` and execute the same Manual Trigger; restore `"setup"` afterwards. Setup preserves existing ledgers. Use a different table for a staging copy; two copies must not own the same table/webhook paths.
6. Verify that the default generation block returns a receipt before any provider call. Only an operator who has explicitly authorized using already-funded API credits should set `allowExistingApiCredits: true`.
7. Verify a rendered draft, its review page, exact-file approval and hash-checked download. For a private YouTube test use `privateTest: true`, `targets.youtube: true`, `targets.instagram: false`. The workflow refuses a private test that also selects Instagram.
8. After testing the actual configured provider and destinations privately, set `publishingEnabled: true` and publish the workflow in n8n. Publishing in n8n is separate from Creator Portal submission; the owner performs that submission manually.

After publishing, open `/webhook/video-intake` for the brief form and `/webhook/video-recovery` for recovery, under your configured n8n base URL. Both are Basic Auth protected HTML forms served by stock Webhook nodes. GET only displays the form; POST processes the submission. They intentionally avoid the native Form Trigger restriction on reachable Respond to Webhook nodes. Review uses `/webhook/video-review`; media uses `/webhook/video-media`. Give each staging copy different paths.

The public HTTPS n8n endpoint must reach the configured renderer. Review and Instagram media are served through n8n using expiring capabilities; neither a review browser nor Meta needs direct access to a private local renderer. Protect the n8n editor and saved execution data through the instance's normal access controls.

## Cloud and personal parity

The cloud template and intended personal copy use the **same nodes, connections, approval rules, schedules, media validation and recovery logic**. The personal profile changes configuration and credential bindings; it does not replace social publishing with SSH scripts.

| Setting | Distributed cloud template | Personal local profile |
| --- | --- | --- |
| `renderer` | `heygen` | `local` |
| `rendererBaseUrl` | Official HeyGen API | Compatible HTTP adapter reachable from n8n |
| Rendering credentials | Owner's HeyGen credential | Private adapter credential |
| Brand/accounts/targets | Generic configuration | Owner's actual destinations |
| Narration and rendering | HeyGen-managed | Existing offline Kokoro + HyperFrames runtime |

Changing an endpoint alone does not make an unrelated renderer compatible. The local adapter must implement the account/voice, speech, direct upload, completion, render and status response contract. The included optional adapter source has been tested beside an existing renderer on the operator PC. It is **not required by the cloud template** and does not belong on the n8n VM. Its test deployment binds to PC loopback; a private reachable deployment, restart handling and personal workflow cutover have not been completed. The existing personal production workflow remains in place.

Existing jobs remain bound to their original rendering profile. Switching a job to another origin is refused before credential transmission. Changing social identities also invalidates delivery approval.

## Customization

Use [example-brief.json](example-brief.json). Supported layouts are `wall_text`, `hook_demo`, `custom_motion` and `slideshow`. Customize two to five English scenes, title, narration, brand, caption and accent. Slideshow scenes require public HTTPS PNG, JPEG or WebP images; the workflow bundles downloaded assets with GSAP, Inter and narration.

Targets can be Instagram, YouTube, both, or download only. `privateTest` affects YouTube visibility and must skip Instagram. `publishAt` sets the earliest delivery time; publication waits for an available configured slot. Changing the approved brief, file, privacy or identities requires a fresh review.

The native Schedule node and the configuration's `hours` / `timezone` must agree if publishing times are changed. Keep the claim, exact-file approval and uncertain-write checks intact.

## Approval and recovery

Treat review URLs and recovery tokens as secrets. A GET previews and never approves. The review page requires a reviewer name and confirmation of complete video/audio review. Approval expires after seven days. Rejected drafts never publish.

The protected recovery form accepts the job ID, private token and existing provider IDs. Known renders are polled again. Uncertain speech needs its existing WAV URL. Instagram container creation, Instagram publication and YouTube upload are checkpointed before the write; a lost acknowledgement blocks a replacement write until reconciled. Do not invent an ID or delete a receipt to force a retry.

Expired delivery approvals can return to review through recovery. Provider IDs, uncertain-write markers and completed receipts are retained. A renewed approval does not authorize uploading an uncertain item a second time.

Slot claims and job leases use conditional Data Table updates. Completed channel receipts are independent: an Instagram success followed by a YouTube failure resumes at YouTube. Failed downloads or invalid MP4 bytes become durable recoverable job errors.

## Additional info

Output targets 1080 × 1920 at 30 fps, H.264/AAC MP4 using cloud `high` / local `delivery`. The local technical sample is 15.467 seconds and fully decodes. Local and cloud voice engines differ; identical spoken timbre or byte-identical managed-cloud output is not claimed.

Limits: 700 narration characters, 60 seconds, 3 MiB per image, 12 MiB narration, 8 MiB project ZIP, 40 MiB MP4. n8n validates metadata and hashes; it does not fully decode the MP4 or measure final encoded loudness. Human editorial review remains required. Data Tables, execution history and provider media need normal retention management; permanent cloud archival is not guaranteed.

`allowExistingApiCredits` and `publishingEnabled` default to **false**. `maxCloudRenders: 3` caps distinct submitted cloud jobs; it is a lifetime render-count limit for that ledger, not a promise of three free API renders or a currency budget. It is checked before speech. No subscription, top-up or automatic paid fallback is implemented. The voice model is explicitly `heygen-voice-1-turbo-free`; that promotion can expire, and the workflow fails rather than silently selecting a paid model. HeyGen web generations do not fund its API wallet.

See [TEST-RESULTS.md](TEST-RESULTS.md) for measured results and remaining integration work. The packaged preview is a real local-adapter render of the exported project, not evidence of a successful managed HeyGen render. Third-party asset licenses apply; the existing Inter license is retained.

## Consulting & customization

For implementation and account configuration, visit [paoloronco.it](https://paoloronco.it/) or contact [info@paoloronco.it](mailto:info@paoloronco.it).
