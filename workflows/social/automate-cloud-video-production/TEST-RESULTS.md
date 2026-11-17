# Unified workflow correction — technical validation

Date: 17 November 2026. Status: draft; native n8n integration is pending.

## Previous submission

The recorded submission for Creator Portal template 22950 used `automate-cloud-video-production.json`, 68 nodes, SHA-256 `3c80a20104aa72b412b984baa3dc29948f732669a583f1b1f208c97c4aa05d81`. That JSON contains neither the instruction to start a local worker nor SSH/Execute Command nodes. Its legacy portal title still refers to local video.

The previous cloud workflow did have a functional gap: it stopped at approved cloud delivery and left social publishing in the separate local workflow. The present correction adds native social delivery to the shared pipeline. No new Portal submission has been made.

## Automated logic tests

18 Node tests pass against the actual exported Code-node sources: graph/JavaScript validity; cloud default and absent VM runtime nodes; malformed webhook isolation; private YouTube target checks; exact-file/brief/identity/privacy/time approval; slot collision prevention; final processing poll; uncertain upload reconciliation; immutable provider IDs; visibility mismatch; MP4 hash mismatch; independent Instagram/YouTube receipts; expiring distinct media capabilities; renderer origin/profile binding; current spending policy; cap before speech; recoverable cap/MP4 errors; approval renewal preserving uncertain writes.

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

## What remains unverified

This new 132-node graph has not yet been imported/executed in n8n. Native Data Table operations, item linkage through loops, social OAuth node schemas, binary retention, media webhook responses, live scheduling and canvas appearance need staging verification. The current Chrome n8n session is expired and its extension command connection is timing out. Existing production was not replaced.

Managed HeyGen rendering remains untested because the account previously returned HTTP 402 with no funded API render allowance. That older refusal does not prove successful cloud generation. The current test used no HeyGen requests. Stock n8n needs no additional VM packages, but the cloud API still requires valid credentials and rendering entitlement.

The optional local adapter was tested on PC loopback only. Private network reachability from the n8n VM, persistent service operation, restart/cutover and migration of personal jobs/receipts remain pending. No auto-start was installed.

GitHub draft preparation does not update the main release, Gumroad delivery or Creator Portal. Replace those only after native integration passes; Portal submission remains a manual owner action.
