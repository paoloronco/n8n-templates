# Unified workflow correction — technical validation

Date: 17 November 2026. Native n8n 2.47.5 protocol integration passed with recorded media. Managed HeyGen rendering, real social writes and personal production cutover remain unverified.

## Previous submission

The recorded submission for Creator Portal template 22950 used `automate-cloud-video-production.json`, 68 nodes, SHA-256 `3c80a20104aa72b412b984baa3dc29948f732669a583f1b1f208c97c4aa05d81`. That JSON contains neither the instruction to start a local worker nor SSH/Execute Command nodes. Its legacy portal title still refers to local video.

The previous cloud workflow did have a functional gap: it stopped at approved cloud delivery and left social publishing in the separate local workflow. The present correction adds native social delivery to the shared pipeline. No new Portal submission has been made.

## Automated logic tests

24 Node tests pass against the actual exported Code-node sources: graph/JavaScript validity; cloud default and absent VM runtime nodes; malformed webhook isolation; protected HTML form GET/POST routing; private YouTube target checks; exact-file/brief/identity/privacy/time approval; slot collision prevention; final processing poll; uncertain upload reconciliation; immutable provider IDs; visibility mismatch; MP4 hash mismatch; independent Instagram/YouTube receipts; expiring distinct media capabilities; renderer origin/profile binding; current spending policy; cap before speech; recoverable cap/MP4 errors; approval renewal preserving uncertain writes; renewed media capabilities; recovery receipts; multiple managed Instagram accounts; and binary restoration after native Crypto hashing.

Four HTTP adapter contract tests pass: credential/profile response, required idempotency keys, concurrent repeated mutation keys with unchanged IDs, changed-input conflicts, upload checksums/completion gates and ZIP traversal rejection. These unit tests stub only the render thread; the separate render below uses the real installed engine.

## Real local rendering test

The harness executed the exact exported planner and project-builder code against the authenticated local HTTP adapter. It synthesized a **new** English narration with offline Kokoro, built and uploaded the self-contained ZIP, completed the upload, submitted one real HyperFrames render, polled its existing ID, downloaded the result and bound a technical approval to its hash. No recorded narration fixture, HeyGen generation, social write, credit purchase or subscription was used.

- Original MP4 SHA-256: `35b3f8b81e6445e3e7f985cade2299ed4fb991e14a8177ab9621aeb7af2de92d`.
- Size: 704,392 bytes; duration 15.467 s; 1080 × 1920; H.264/AAC; 30 fps.
- Full FFmpeg decode: passed. Three decoded frames were visually inspected.
- HyperFrames check: browser ran; lint, runtime, layout, motion, contrast, craft and audio returned zero errors and zero warnings for the tested composition.
- Earshot meter readings: -22.2 LUFS integrated, -5.8 dBTP true peak, zero clipped samples. This is a measurement, not a human editorial listening approval or a claim of broadcast loudness.
- Technical approval in the harness does not approve a real social publication.

The first harness attempt stopped before ZIP upload because its PUT action was mistakenly sent as GET. The harness method was corrected and resumed from the saved checkpoint, reusing the same narration and asset. The exported n8n upload node was already configured as PUT. No extra render was created.

## Native n8n integration

The 133-node graph was installed in isolated staging, preserving node IDs and positions through n8n's built-in import CLI. No packages, firewall rules, API scopes or VM services were added. A temporary authenticated protocol fixture returned the existing recorded narration and real MP4. It did not synthesize speech or render video. These calls test native n8n orchestration and are not evidence of a successful HeyGen render.

- The cloud generation block stopped a native job before any provider request.
- Read-only real-provider checks passed: HeyGen account HTTP 200, exact Instagram identity, Instagram publishing quota and exact YouTube channel. No provider generation or social writes were requested.
- n8n downloaded the recorded WAV, built and hashed its self-contained project, compressed it and uploaded the actual 633,199-byte ZIP.
- The same job recovered from an interrupted upload-completion stage. A deliberate one-time MP4 HTTP 503 then produced a durable failure receipt with private recovery details.
- Recovery reused the same asset and render ID and reached review. Fixture totals remained one speech request, one ZIP upload and one render request; actual generation calls were zero.
- Chrome played the native hash-checked media response at 1080 × 1920, duration 15.466667 seconds. A download-only technical approval was saved and read back. This is a test decision, not human editorial approval or permission to publish to social media.
- The approved file was downloaded through n8n: 704,392 bytes and SHA-256 `35b3f8b81e6445e3e7f985cade2299ed4fb991e14a8177ab9621aeb7af2de92d`, matching the original exactly.
- Manually invoking the native schedule entry with publishing disabled returned `publishing_disabled_or_outside_slot` and made no social calls. Clock-driven production delivery with publishing enabled has not been certified.

Integration exposed and corrected two material issues: native Form Triggers reject reachable Respond to Webhook nodes, so stock Basic Auth Webhooks now serve the HTML forms and their POSTs; native Crypto removes a processed binary, so verified media and delivery explicitly restore the original download after hash validation. Webhook registration IDs and recoverable failure receipts were also corrected.

## Remaining limits

Managed HeyGen rendering remains untested because the account previously returned HTTP 402 with no funded API render allowance. Account authentication now passes; it does not establish rendering entitlement. Stock n8n needs no additional VM packages, but the cloud API still requires valid credentials and rendering credits. No purchase, subscription, paid fallback or new HeyGen generation was attempted.

The optional local adapter was tested on PC loopback only. Private network reachability from the n8n VM, persistent service operation, restart/cutover and migration of personal jobs/receipts remain pending. Automatic approval review rejected starting the PC adapter on the private LAN; that action was not retried through another route. No auto-start was installed. The existing personal production workflow was not replaced and is not claimed to run this new graph.

Real Instagram publication and YouTube upload/processing have not been executed for this revision. Their transition logic and independent recovery receipts pass automated tests, and the connected OAuth identities pass native read-only checks. Operators must verify a private YouTube upload and their actual destinations before enabling production delivery. Creator Portal submission remains a manual owner action; no new submission was made during this revision.
