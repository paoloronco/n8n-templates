# Cloud video production with n8n

A separate copy using standard n8n nodes for input, narration, project ZIP creation, cloud rendering, draft approval and recovery. No extra packages, video runtime, Python, FFmpeg or Chromium are needed on the n8n VM.

**Current status:** the technical flow was tested on the real n8n instance against an authenticated local API simulator backed by the installed HyperFrames renderer. Actual HeyGen rendering returned HTTP 402 because its API wallet has no credits. The delivered workflow is inactive, with new generation disabled before any provider call. No subscriptions or wallet top-ups were made.

This copy delivers to cloud storage. Social publishing remains in the separate original workflow, preserved unchanged.

## Files

- [Importable workflow](automate-cloud-video-production.json)
- [Example brief](example-brief.json)
- [Technical validation and known limits](TEST-RESULTS.md)
- [Technical preview video](technical-preview.mp4) — rendered by the local simulator.

The orange overview is divided into How it works, Setup, Customization and Additional info, with consulting links. Eight gray notes document the functional sections. The owner's operational node arrangement is preserved.

## Documentation

[Open the extended Notion guide](https://app.notion.com/p/41af0ba27c3281f7b166e83346bbbb4c?pvs=204) for six chapters covering setup, workflow stages, brief customization, draft review, recovery and validation. Notion access follows the page permissions.

## Setup

1. Import `automate-cloud-video-production.json` into an n8n release supporting Data Tables with table creation and lookup by name, Forms, HTTP Request, Code, Crypto, Compression and Extract from File.
2. Connect HeyGen Cloud Header Auth credentials to **Read HeyGen Cloud**, **Call HeyGen Cloud**, and **Refresh cloud video URL**. Use the exact header name and value format accepted for your issued credential. Store the key or token only in n8n credentials; do not paste it into the workflow JSON.
3. Connect one dedicated Basic Auth credential to both intake and recovery forms.
4. Replace `https://YOUR_N8N_HOST` in the Code nodes with your public HTTPS n8n base URL. Retain the webhook paths or update the review and decision links together.
5. Run **Set up cloud storage** once. Repeating setup preserves the generation ledger.
6. Run **Create one cloud example** to verify the default spending block.
7. Publish in n8n only when provider access and billing authorization are intentionally configured. This does not submit anything to the Creator Portal.

## Spending authorization

`USE_EXISTING_API_CREDITS` is **false** in **Plan next step**. New jobs stop before voice generation, uploads or rendering. Recovery of a known render ID can still read its status and download the existing file.

If you later explicitly authorize using already-funded API credits, change this constant to `true`. The account must report an API wallet with automatic reload disabled and at least 0.20 API credits, the start threshold observed in the actual response. Speech selects `heygen-voice-1-turbo-free`, with no paid voice fallback. The workflow never buys credits, subscribes or changes billing settings.

A conditional Data Table update caps this workflow at three distinct render jobs. This is a render-count limit, not a currency budget. Uncertain submissions retain their permit. Upload and render retries preserve idempotency keys and stop before the provider's 24-hour replay window expires.

HeyGen web-plan generations and API credits are separate. Reported free counters did not make the tested key eligible for rendering. HeyGen also documents that MCP OAuth sign-in is unavailable to automations such as n8n. See [authentication and MCP limitations](https://developers.heygen.com/llms.txt) and [API billing](https://www.heygen.com/api-pricing). The legacy quota endpoint is used only by the simulator profile; production wallet checks use v3.

## Input and quality

Use `example-brief.json`. It supports two to five English scenes, title, brand, narration, caption, accent, and the existing `wall_text`, `hook_demo`, `custom_motion` and `slideshow` layouts. Slideshow needs public HTTPS PNG, JPEG or WebP images. Assets are downloaded and bundled.

Output target: 1080 × 1920, 30 fps, H.264/AAC MP4, with the cloud high-quality preset. The project includes GSAP, Inter, narration and scene images. Limits: 700 narration characters, 60 seconds, 3 MiB per image, 12 MiB narration, 8 MiB ZIP and 40 MiB MP4.

`technical-preview.mp4` is a local simulation result. The video rendered from n8n's uploaded ZIP was byte-identical to an independent local reference. This verifies the technical path, not identical output from the untested managed cloud renderer.

## Review and delivery

Treat the private review link as a bearer secret. GET only previews and refreshes the expiring provider URL. Watch the complete MP4 and listen before approving or rejecting.

POST approval must match the token and exact SHA-256. It is accepted once within seven days. Invalid input returns 400; a mismatched token or hash returns 403; a reused or expired decision returns 409. Rejection never creates a replacement render. This copy never posts to social accounts.

Reopen the approved review link for a fresh download URL. Cloud retention follows provider policy; download the master for permanent storage. Permanent archival is not guaranteed.

## Recovery and retention

State and provider IDs live in `orbitpage_cloud_video_jobs`. The protected recovery form needs the job ID and private token. A worker lease and conditional checkpoint updates prevent concurrent advancement.

- Known render IDs are polled and downloaded again, without another submission.
- A lost acknowledgement can replay the same key inside its retry window. After that, provide the existing render ID.
- Uncertain speech requires its existing WAV URL; recovery never automatically regenerates it.
- Failed and rejected jobs do not approve themselves.

The ZIP is removed from the checkpoint after the cloud asset completes. Data Tables and saved executions need normal retention management. Success and error execution saving are explicitly enabled.

## Verification boundaries

The workflow measures PCM WAV duration and levels, hashes the MP4, and parses its codecs, dimensions and duration. It does not fully decode video or measure encoded loudness inside n8n. Human review remains required. Full decoding, browser playback and Earshot measurements were performed separately on the operator PC.

See [TEST-RESULTS.md](TEST-RESULTS.md). GSAP and Inter are embedded in the project builder; their licenses apply. The Inter license is included here and in generated project ZIPs. No npm installation is needed on the n8n VM.

## Consulting & customization

For implementation, account configuration or workflow adaptations, contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit [paoloronco.it](https://paoloronco.it/).
