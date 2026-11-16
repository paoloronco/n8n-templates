### Quick Overview

Coordinate local video rendering and scheduled publishing to Instagram Reels and YouTube Shorts with n8n. Manage durable production queues, communicate with a local rendering worker, securely transfer media, and verify publishing results using Meta and YouTube APIs.

### How It Works

1. A manual trigger creates four video drafts, while scheduled triggers reserve daily production batches and publishing slots.
2. n8n sends rendering requests to an external Python queue service over SSH and retrieves persistent job IDs.
3. A signed webhook bridge allows the local rendering worker to claim jobs and report completed renders.
4. The workflow polls rendering status, detects failures, and makes completed videos available for preview.
5. Scheduled publishing slots claim ready videos and execute Instagram Graph API actions through OAuth.
6. Instagram responses are recorded by the local helper until publication is confirmed.
7. After Instagram verification, the workflow checks the connected YouTube channel and uploads the preserved MP4 when required.
8. YouTube processing, video dimensions, and available audio metadata are checked before finalizing the publication receipt.
9. Separate webhook branches authorize MP4 uploads and deliver media through expiring signed links.

### Setup

1. Import the workflow JSON into n8n and keep it inactive during configuration.
2. Deploy the compatible Python queue service, local rendering worker, publishing helpers, and persistent storage.
3. Configure SSH credentials and update the Python helper paths, including `/opt/local-video-production/`.
4. Configure the signed worker bridge, authorized upload webhook, and public HTTPS media-delivery endpoint.
5. Connect Meta OAuth credentials with the permissions required to publish Instagram Reels.
6. Connect YouTube OAuth credentials and replace `REPLACE_WITH_YOUTUBE_CHANNEL_ID` with your intended channel ID.
7. Configure the renderer, video formats, schedules, and workflow timezone.
8. Verify private previews, signed requests, and publishing safeguards before enabling live execution.

### Requirements

- Self-hosted n8n with SSH, Webhook, Meta Graph API, and YouTube integrations.
- Local video rendering machine and compatible Python worker.
- External queue/backend, publishing helpers, and persistent media storage.
- SSH access to the configured infrastructure.
- Instagram professional account with publishing permissions.
- YouTube OAuth credentials and YouTube Data API access.
- Public HTTPS endpoint for authorized media delivery.

### Customization

- Adjust video formats, audiences, and production settings.
- Change daily production volume and publishing time slots.
- Customize video layouts, captions, visual identity, and assets in the renderer.
- Modify Instagram captions and YouTube publishing metadata.
- Configure workflow timezone, helper paths, and storage locations.
- Adapt review, authorization, and publishing controls to your environment.

### Additional Info

This workflow orchestrates external video-production services; the JSON does not include the renderer, worker, or Python helpers.

Local rendering requires compatible hardware and consumes system resources. Platform API limits may apply.

Manual executions can reach real publishing actions. Test preview-only behavior before enabling live publication.

A private YouTube upload does not make an earlier Instagram Reel private.

**Documentation:** [Complete Setup Guide](https://paoloronco.notion.site/Automate-Local-Video-Creation-and-Publishing-to-Instagram-Reels-YouTube-Shorts-41af0ba27c32817aac38f04798207385)

**GitHub:** [Workflow Repository](https://github.com/paoloronco/n8n-templates/tree/main/social/automate-local-video-creation-and-publishing)
