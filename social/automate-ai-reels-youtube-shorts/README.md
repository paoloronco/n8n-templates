# Automate AI-Powered Instagram Reels & YouTube Shorts Creation and Publishing

## Quick Overview

Create AI-assisted narrated vertical videos with a companion studio and renderer. Generate and review English copy, prepare the original MP4, publish approved content to Instagram Reels, and coordinate YouTube Shorts uploads. Persisted job state and publication receipts help track delivery across both platforms.

## How It Works

- **Reserve production** — Manual, scheduled, or authenticated webhook input requests a Reel job and budget authorization from the studio.
- **Generate and review copy** — OpenAI writes the content; the studio validates it and coordinates independent editorial review and any correction request.
- **Render the video** — The studio queues narrated vertical-video rendering while n8n polls for completion or failure.
- **Apply the Instagram gate** — Preview-only jobs or disabled publishing stay in the private-preview path.
- **Preserve the source** — Before Instagram publication, an SSH helper preserves the original MP4 and associates it with the job.
- **Publish to Instagram** — Claim Meta actions, execute them, and persist results until a verified Instagram receipt is available.
- **Prepare YouTube delivery** — Validate the OAuth channel, check the preserved media/job association, and claim the YouTube stage.
- **Upload or resume** — Upload the original video only when required, persist the returned ID, and reuse recorded publication context for subsequent checks.
- **Verify and finalize** — Check video/channel identity, processing, and available video/audio metadata before finalizing the helper receipt.
- **Serve Instagram assets** — A separate webhook branch relies on the studio to authorize the exact media request and return the requested bytes.

## Setup

1. Import the workflow JSON and leave the workflow inactive during configuration.
2. Deploy the matching studio backend, video renderer, narration dependencies, persistent storage, and SSH YouTube media helper. These are external components, not installed by the JSON.
3. Replace all studio service URL placeholders consistently and configure the studio's public media route.
4. Connect HTTP Header Auth credentials for the studio and authentication for the test webhook.
5. Connect your OpenAI credentials. Verify writer/reviewer model availability, prompts, budgets, and usage settings in the studio.
6. Connect the intended Instagram professional account through your Meta credentials and confirm required publishing permissions.
7. Connect SSH credentials to the helper host. Update every helper directory and media path, including preparation, claim, record, and finalize commands.
8. Connect YouTube OAuth credentials, configure the required YouTube Data API access, and replace the channel-ID placeholder used by the channel guard.
9. Configure neutral sample assets, layouts, voice, captions, and rendering settings. Keep publishing disabled while validating previews and backend dry-run behavior.
10. Configure public HTTPS media delivery and verify authorization and expiry handling. Set the workflow timezone and review the included Monday/Thursday 10:00 schedule.
11. Inspect a complete sample MP4 and verify both platform stages with explicitly approved test settings before enabling automatic publishing.

## Requirements

- An n8n instance with network access to the studio, OpenAI, Meta, YouTube, and the SSH helper host.
- Compatible studio backend, video renderer, narration stack, and persistent job/media storage.
- OpenAI API credentials and quota for generation and review.
- Studio authentication and protected test-webhook access.
- Meta credentials and an eligible Instagram professional account.
- YouTube OAuth credentials for the configured channel and required API access.
- SSH access to the matching Python media helper and its storage.
- Public HTTPS media delivery with backend-enforced authorization and link expiry.
- Original or licensed content, visual assets, music, and voice rights where applicable.

## Customization

- **Editorial brief** — Adapt topics, audience, tone, factual constraints, and review criteria in the studio configuration.
- **Narration and visuals** — Change voice, language, timing, captions, layouts, and colors in the renderer and its supported configuration.
- **Models and budgets** — Adjust writer/reviewer requests and generation limits in the studio.
- **Publishing metadata** — Review Instagram captions and YouTube title, description, tags, and visibility options.
- **Timing** — Change `Twice-weekly private production` and explicitly set the workflow timezone.
- **Infrastructure** — Replace backend URLs, helper paths, storage locations, and the expected channel ID consistently.

## Testing & Operations

- Prove preview/no-publishing behavior before using any full-flow manual or webhook test.
- Review the original MP4 for audible narration, correct dimensions, legible captions, and unintended branding.
- Test rejected drafts, renderer failures, unavailable assets, and invalid or expired media requests.
- Verify that preserved media belongs to the expected job and that the configured OAuth channel is correct.
- Keep recorded Instagram and YouTube publication IDs. Recover the incomplete stage rather than blindly restarting both publications.
- Monitor model spend, renderer/helper health, free storage, failed executions, and videos still awaiting platform processing.

## Additional Info

The workflow orchestrates external production services; it is not a standalone video generator. Compatible studio and helper implementations must be supplied with the release or installed separately. API usage, narration, rendering, and hosting may have separate costs.

Instagram publication precedes the YouTube stage. A private YouTube test does not privatize or prevent the earlier Instagram post. Trigger names do not guarantee a dry run. Audio-stream metadata does not prove audible narration, and format checks do not guarantee Shorts classification. Separate executions can create distinct production requests.

## Documentation

[Complete Setup Guide & Technical Documentation](https://paoloronco.notion.site/Automate-AI-Powered-Instagram-Reels-YouTube-Shorts-Creation-and-Publishing-41af0ba27c32817490eeff675e958ce2)

## Professional Services & Consulting

For implementation support, workflow customization, or integration consulting, visit [paoloronco.it](https://paoloronco.it).