### Quick Overview

Create AI-assisted narrated videos for Instagram Reels and YouTube Shorts using n8n and OpenAI. Automate script generation, editorial review, video rendering coordination, and cross-platform publishing with controlled approvals, persistent job tracking, and media verification.

### How It Works

1. A manual trigger, twice-weekly schedule, or authenticated webhook initiates video production.
2. The external studio reserves a production job, prepares the editorial brief, and checks the available AI budget.
3. OpenAI generates English video scripts and publishing copy using the studio's writing instructions.
4. The studio validates content quality, novelty, factual constraints, and recorded model usage.
5. A separate OpenAI review evaluates the draft and can request a correction before rendering.
6. The external renderer creates a narrated vertical video while n8n monitors production status.
7. Completed videos are available for private preview, with publishing controlled by the backend.
8. Before Instagram publication, an SSH helper preserves the original MP4 and associates it with the production job.
9. Authorized Instagram Graph API actions publish the Reel and persist the resulting publication receipt.
10. The workflow verifies the YouTube OAuth channel, uploads the preserved MP4 when required, and records the video ID.
11. YouTube processing, video dimensions, and available audio metadata are checked before finalizing delivery.
12. A separate webhook delivers authorized media assets through expiring signed URLs.

### Setup

1. Import the workflow JSON into n8n and keep it inactive during configuration.
2. Deploy the compatible content studio, video renderer, narration dependencies, and persistent media storage.
3. Replace all `YOUR-STUDIO-SERVICE` placeholders with your configured backend address.
4. Configure HTTP Header Auth credentials for studio requests and authenticated webhook access.
5. Connect OpenAI credentials and verify the configured writing and review models.
6. Configure Meta OAuth for your Instagram professional account.
7. Connect YouTube OAuth and replace `YOUR_YOUTUBE_CHANNEL_ID` with your intended channel ID.
8. Configure SSH credentials and deploy the compatible Python YouTube media helper.
9. Customize video layouts, narration, captions, and publishing metadata.
10. Set the workflow timezone and review the Monday/Thursday production schedule.
11. Test complete video generation and preview-only behavior before enabling live publishing.

### Requirements

- Working n8n instance with OpenAI, Meta, YouTube, SSH, and Webhook integrations.
- OpenAI API credentials and available quota.
- Compatible external AI content studio and video renderer.
- Narration dependencies and persistent media storage.
- SSH-accessible Python YouTube media helper.
- Instagram professional account with publishing permissions.
- YouTube OAuth credentials and YouTube Data API access.
- Public HTTPS media-delivery endpoint.
- Original or appropriately licensed media and audio assets.

### Customization

- Adapt AI video topics, audience, and editorial style.
- Modify script generation and independent review settings.
- Configure narration voice, language, and timing.
- Customize vertical video layouts, captions, and branding.
- Adjust Instagram captions and YouTube titles, descriptions, and tags.
- Select AI models and configure production budgets.
- Change publishing schedules, visibility settings, and approval controls.
- Adapt helper paths and backend configuration to your infrastructure.

### Additional Info

This workflow coordinates AI-assisted video production and publishing. The external content studio, renderer, narration stack, and Python helper are not included in the JSON.

Instagram publication is completed before YouTube delivery. A private YouTube test does not prevent or privatize an earlier Instagram publication.

Video metadata checks do not guarantee audible narration or YouTube Shorts classification. Inspect rendered videos before publishing.

OpenAI API usage, rendering, and hosting may incur additional costs.

**Documentation:** [Complete Setup Guide](https://paoloronco.notion.site/Automate-AI-Powered-Instagram-Reels-YouTube-Shorts-Creation-and-Publishing-41af0ba27c32817490eeff675e958ce2)

**GitHub:** [Workflow Repository](https://github.com/paoloronco/n8n-templates/tree/main/workflows/social/automate-ai-reels-youtube-shorts)
