# Validation — 16 November 2026

## Follow-up audit — 17 November 2026

The owner’s real personal workflow was exported from n8n, corrected, published and exported again. It is active, uses `Europe/Rome`, and keeps the original operational node IDs, all node positions, credentials and account settings. The only operational edits were accurate labels for the daily queue check and retaining successful executions; its daily sticky note was corrected without changing its geometry.

The local gallery health check returned `ok: true`. The real SSH backend returned runtime version 2.0.1, publishing enabled, an available worker, the configured account/channel and the same five delivery hours as n8n. A direct execution of the real daily queue helper succeeded and reported `queued: 0` with approved-ready draft IDs. Its signed worker bridge also produced successful production executions. This verifies the available runtime and registered production webhooks; it is not evidence of a newly observed clock-triggered social post.

The new inactive **Local Video Production (template)** was saved in n8n and re-exported. Its graph, configuration-independent parameters and positions match the personal workflow after the documented sanitization. The export has no personal account bindings; generic credential selector IDs are null. Private instance metadata and pinned execution data are excluded from distribution. The example worker/backend webhook URLs now match the JSON.

The backend suite passed 24 tests and the updated worker/workflow suite passed 13 tests. No additional render, social post, paid API request or Creator Portal submission was made in this follow-up. A full new private delivery was not repeated; the real rendering, approval and provider checks below remain the evidence from 16 November.

## End-to-end evidence — 16 November 2026

## English update — version 2.0.1

The gallery, approval/recovery controls, operational guide, example briefs and default narration language are now English. The installed runtime and the n8n example were updated. The 24 backend tests passed on the SSH host with the account configuration unchanged, and all 12 Node checks passed against the installed English version. A fresh US English sample rendered successfully: 17.87 seconds, H.264/AAC 1080×1920, complete decoding and non-silent audio. This language-only verification did not upload or publish another social post. Historical media and receipts retain their original content.

## Original end-to-end validation

This package was tested with a real self-hosted n8n instance, a Linux SSH backend and a Windows rendering computer using Node.js 24 and Python 3.13. The portable export contains 74 nodes, has no credential bindings and is inactive for configuration.

| Check | Observed result |
| --- | --- |
| Python backend suite | 24 passing tests locally and on the Linux helper host |
| Node worker/gallery and workflow suite | 12 passing tests, including the installed runtime |
| Four real formats | wall_text, hook_demo, custom_motion and slideshow rendered successfully |
| Media verification | H.264 1080×1920, AAC, full FFmpeg decode and non-silent audio |
| HyperFrames | No errors in lint, runtime, layout, motion, contrast or audio checks; advisory warnings remain |
| Real gallery intake | A submitted Italian brief entered the durable queue |
| Real rendering recovery | A failed draft resumed with the same job ID after the renderer was corrected |
| Signed upload | The backend verified the MP4 bytes before the draft became ready |
| Draft approval | Gallery approval recorded the exact hash, brief, reviewer, targets and privacy |
| YouTube private delivery | Upload, durable ID, remote processing/audio metadata and private visibility verified; Instagram skipped |
| YouTube recovery | A controlled post-upload verification error resumed the recorded video ID; no second upload |
| Instagram delivery | Identity/quota checks, container processing, publish and remote caption/ID/permalink read-back succeeded |
| Live canvas preservation | Re-downloaded export matched every original node ID/position/credential binding and all original sticky-note content and geometry |
| Final live workflow | 74 nodes, no temporary maintenance nodes, individual production nodes enabled |

Actual provider IDs, account bindings, private configuration, source media and execution evidence are retained privately and excluded from this reusable package. Platform tests ran on separate channel-specific drafts: one private YouTube test and one clearly labelled public Instagram test. This does not assert a second live run on every possible combination of settings or every n8n version.

The offline speech engine is resource-bounded to two native math threads and a small ONNX CPU pool. The installation was also checked by generating a fresh Italian narration from its final directory. Models, npm/Python environments and private configuration are not bundled in the ZIP; install them using the runtime guide.

Automated fixtures cover signature/expiry/replay failures, lease/upload authorization, missing briefs/timestamps, rejection and approval binding, duplicate-upload prevention, uncertain outcomes, recorded-ID recovery, incorrect YouTube visibility/audio metadata, the final poll boundary and manual-versus-production scheduling behavior.

Local measurements and remote metadata do not replace editorial review or guarantee Shorts classification. Runtime schedules cannot wake a sleeping rendering computer. Startup configuration on the test computer was left unchanged; the runtime can be started with `launch.ps1`.
