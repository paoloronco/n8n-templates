# Technical validation - 16 November 2026

## What ran on the real n8n instance

- The actual protected intake form was loaded and submitted with its native form token and multipart fields. It returned HTTP 200 and its normal waiting-page URL.
- n8n generated the self-contained project, computed its hash, uploaded its ZIP and completed the simulated cloud asset.
- One render was submitted to an authenticated local API simulator. The simulator rendered the uploaded files with the installed HyperFrames 0.9.58 engine, using delivery quality.
- n8n polled the same render across a durable wait. A deliberate first MP4 download returned 503.
- The job retained its render ID and failed download stage. The actual protected recovery form resumed that same render and obtained the MP4. No second render or narration request occurred.
- The real completion pages returned the controlled error receipt and the recovered draft-review link. Their normal completion POSTs were acknowledged; the recovery acknowledgement returned HTTP 200.
- Chrome loaded and played the complete 19.3-second video to its ended state. Preview GET did not approve it.
- A modified hash and an incorrect token each returned HTTP 403. A valid technical test approval was saved against the exact hash. Replaying it returned HTTP 409. Unauthenticated intake returned HTTP 401.
- The final delivered generation guard was exercised on n8n: it returned a clear blocked receipt, and the provider HTTP nodes did not execute.

The simulator recorded **1 render submission, 1 completed render, 1 recorded-narration fixture request, and 1 intentional download failure**. It used a separate test table and credential. The original local workflow's nodes, connections and settings matched its pre-existing English export exactly.

## Output checks

- 1080 × 1920, 30 fps, H.264 High / AAC, 19.3 seconds.
- Complete FFmpeg decoding passed. Browser playback loaded all media successfully.
- Earshot: -12.3 LUFS integrated, -1.2 dBTP true peak, 0 clipped samples.
- The independent local reference and the MP4 rendered from n8n's uploaded ZIP were byte-identical.
- SHA-256: `68cdff6f72174388f9095d0ae86f18266202f466a0a4a0ca2167172554c4d3ca`.
- JavaScript checks passed for input validation, billing guards, WAV/MP4 parsing, graph integrity, binary handoff, state transitions, retry expiry, exact-file approval, token checks, expiry, rejection and replay.

## Limits of this validation

The actual HeyGen API accepted account/voice/asset operations, including one explicitly free voice generation before the local simulation was requested. Render creation returned **HTTP 402 / insufficient_credit**, so no real managed-cloud video was generated. No plan or credit purchase was made. Subsequent technical provider calls used only the local simulator.

This is a contract simulation, not proof that every HeyGen response, timing, billing rule or codec setting matches the simulator. Real-cloud rendering remains to be tested when suitable API access is available. The default generation guard remains disabled.

The live complete production test used `wall_text`. The other three existing layouts are retained but were not individually run through this new API path. HyperFrames composition checks passed without errors; one TikTok-specific right safe-area warning remained in the example. The workflow targets the retained vertical composition and requires final visual review.

Form completion was tested through the same GET/POST sequence emitted by the native form frontend. Production successes were not retained under the instance defaults during that test; the delivered settings explicitly retain success and error executions. The durable job and approval records were verified separately.

Temporary test nodes and endpoints are excluded from this package. The live copy is restored to the real provider, inactive, with new generation blocked. No social posts or Creator Portal submission were performed for this copy.

## Canvas documentation update

The owner's latest manual node arrangement was retained. The saved export contains 59 operational nodes and nine sticky notes: one orange overview and eight gray functional sections. All operational node objects (including IDs, positions, parameters and credentials), connections and settings matched the owner's pre-change export exactly. The four existing sticky-note IDs were preserved. Browser layout checks found no note text overlapping operational nodes and no clipped note text. This documentation-only update did not execute the workflow or call a video provider.
