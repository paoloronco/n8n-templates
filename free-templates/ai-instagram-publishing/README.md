# AI News → Social Publishing Automation

![AI News → Social Publishing Automation](assets/cover.png)

## Links

- **Workflow JSON:** [Download and import](./RSS_AInews-socialPublishing_template.json)
- **Documentation (Notion):** [Setup guide](https://paoloronco.notion.site/Documentation-n8n-RSS-AI-Instagram-Publishing-3f5f0ba27c32806ba425f7d84c72961a?pvs=74)
- **n8n Creator:** [View template](https://n8n.io/workflows/11791-automate-rss-to-instagram-with-ai-generated-content-and-cloudinary/)
- **Gumroad:** [View on Gumroad](https://paoloronco.gumroad.com/l/AInews-SocialPubblishing)

## Quick Overview

Turn RSS news into publishable Instagram content automatically. The workflow collects articles, uses AI to select and transform relevant stories, generates captions and visuals, uploads media through Cloudinary, and publishes to Instagram through the Meta Graph API.

## How It Works

- **RSS collection** — The workflow reads one or more configurable RSS feeds for the topics or industries you want to monitor.
- **AI selection** — AI evaluates incoming stories and selects content suitable for social publishing.
- **Copy generation** — The selected article is transformed into a social headline and Instagram-ready caption.
- **Image generation** — AI creates a visual associated with the selected story and publishing context.
- **Media hosting** — Cloudinary stores the generated image and provides the media URL required by the publishing flow.
- **Instagram publishing** — The Meta Graph API publishes the generated image and caption to the configured Instagram account.
- **Scheduling** — The complete pipeline can run automatically on a configurable schedule.

## Setup

- **Get the workflow** — Download the workflow JSON from this folder and import it into n8n. Configure your own credentials, email recipient, Google Drive folder ID, and Instagram business account ID.
- **Configure RSS feeds** — Replace or extend the source feeds for your target niche, publication set, or topic.
- **Configure AI services** — Add the required AI credentials and review prompts for selection, copy, and image generation.
- **Configure Cloudinary** — Connect the account used to host generated social images.
- **Configure Meta** — Connect the required Instagram/Meta Graph API credentials and target professional account.
- **Review the schedule** — Set a publishing frequency appropriate for your content strategy.
- **Test before publishing** — Run the workflow with controlled inputs and verify copy, image, upload, and Instagram publishing.

## Requirements

- n8n instance
- One or more RSS feeds
- AI provider/API credentials required by the workflow
- Cloudinary account
- Meta/Instagram professional account with Graph API access
- Required Meta application permissions and credentials

### Optional

- Additional RSS categories or source lists
- Alternative AI models or providers
- Additional moderation or approval step before publishing
- Additional social publishing destinations

## Customization

- **Topics and sources** — Replace the RSS feeds to target technology, fashion, travel, business, or another niche.
- **Editorial behavior** — Modify AI prompts for article selection, tone, headline style, and caption structure.
- **Visual generation** — Adapt image prompts and generation settings to your brand or content style.
- **Publishing frequency** — Change the schedule or add approval gates before publication.
- **Distribution** — Extend the workflow beyond Instagram with additional social channels.
- **Branding** — Add recurring brand instructions, hashtags, CTA rules, or visual constraints.

## Additional Info

- This template is free and the sanitized importable JSON is available in this repository. Configure all required credentials and account-specific parameters before running.
- API usage, Cloudinary, and other external services may have separate costs.
