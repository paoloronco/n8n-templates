# Automate Local Video Creation and Publishing to Instagram Reels & YouTube Shorts

## Quick Overview

Coordinate local video production and scheduled publishing from n8n. Queue rendering jobs, let a local worker create videos, receive authorized MP4 uploads, and deliver approved content to Instagram Reels and YouTube Shorts. The workflow connects the production stages; rendering, persistent queues, and media helpers run outside n8n.

## How It Works

- **Create drafts** — A manual branch selects four format/audience combinations, submits jobs, and polls their rendering status for review on the rendering PC.
- **Prepare daily production** — A scheduled branch requests a batch of five videos through an external queue service.
- **Connect the worker** — A webhook bridge passes signed job claims and completion requests to the backend for authorization and durable queue updates.
- **Receive rendered media** — An upload branch authorizes the destination, restores the original binary, stores the MP4, and verifies the uploaded bytes.
- **Publish to Instagram** — Scheduled slots claim ready videos, perform Meta API actions, and persist publication results through the helper.
- **Serve authorized media** — A dedicated branch delivers the exact video authorized by the backend through an expiring media link.
- **Deliver to YouTube** — After the Instagram verification gate, validate the connected YouTube channel, prepare the original MP4, upload when needed, and persist the returned video ID.
- **Verify delivery** — Poll YouTube processing and available video/audio metadata before finalizing the publication receipt.

## Setup

1. Import the workflow JSON into n8n and keep it inactive during configuration.
2. Install the matching external queue/backend, rendering worker, media storage, and Python publishing helpers described in the full guide. These components are not installed by importing the workflow.
3. Connect your own SSH credentials to the helper/storage hosts. Review every SSH command, helper directory, and storage path for your deployment.
4. Configure the worker bridge, upload route, public HTTPS media route, and the backend's signature verification, expiry, replay protection, and upload authorization.
5. Connect your own Meta credentials and eligible Instagram professional account. Check the permissions required by your Meta application and publishing API.
6. Connect your own YouTube OAuth credentials, enable the required YouTube Data API access, and replace the channel-ID placeholder in the channel validation logic.
7. Configure the renderer with sample content and assets you own. Inspect output for unintended logos, text, colors, licensing issues, and narration problems.
8. Set the workflow timezone explicitly. Review the daily batch trigger and all publishing slots before activation.
9. Validate preview and no-publishing behavior in the external helpers before running an end-to-end test. Approve a controlled live test separately.
10. Activate the intended schedules only after rendering, media delivery, publication receipts, and recovery behavior have been verified in your environment.

## Requirements

- An n8n instance with network access to the configured services and support for the included SSH, webhook, Meta, and YouTube integrations.
- A local rendering machine with the compatible worker and rendering dependencies.
- Matching queue/backend and Python helper implementations, persistent queue state, and persistent media storage.
- SSH access with the permissions required for helper execution and media transfer.
- Public HTTPS access to the media-delivery endpoint required by the publishing platforms; internal management endpoints should remain restricted.
- Meta/Instagram publishing credentials and a supported professional account.
- YouTube OAuth credentials with access to the intended channel.

## Customization

- **Content formats and audiences** — Edit the combinations in `Choose formats and audience` and the matching backend/renderer configuration.
- **Daily volume** — Adjust the batch request and publishing slots together; an available slot does not guarantee a ready video.
- **Timing** — Change the schedule triggers and explicitly set the workflow timezone.
- **Visual identity** — Configure layouts, colors, text, logos, and narration in the renderer, not only in n8n.
- **Publishing metadata** — Review captions, titles, descriptions, tags, and visibility settings in the relevant nodes and helper configuration.
- **Infrastructure** — Replace helper paths, storage locations, and service routes consistently while preserving authorization and receipt handling.

## Testing & Operations

- Start with fictional sample content and preview-only rendering.
- Test rejected signatures, expired links, unauthorized upload destinations, and failed rendering without publishing.
- Inspect the original MP4, including audible narration, before approving platform delivery.
- Record publication IDs and inspect existing backend state before retrying a failed run. Resume incomplete stages rather than blindly publishing again.
- Keep persistent queue/media backups and monitor the worker, helper services, free storage, and failed n8n executions.

## Additional Info

This is an orchestration workflow, not a standalone renderer or an installer for the external services. Compatible helper implementations must be supplied alongside the workflow or deployed separately. Local rendering still consumes hardware resources; platform and third-party API limits or charges may apply.

A private YouTube test does not make an earlier Instagram publication private. Stream metadata does not prove audible narration, and local format checks do not guarantee YouTube Shorts classification. Trigger names and dry-run flags are not substitutes for verifying the actual no-publishing behavior of the backend.

## Documentation

[Complete Setup Guide & Technical Documentation](https://paoloronco.notion.site/Automate-Local-Video-Creation-and-Publishing-to-Instagram-Reels-YouTube-Shorts-41af0ba27c32817aac38f04798207385)

## Professional Services & Consulting

For implementation support, workflow customization, or integration consulting, visit [paoloronco.it](https://paoloronco.it).