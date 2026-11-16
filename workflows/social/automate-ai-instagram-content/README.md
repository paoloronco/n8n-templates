### Quick Overview

Automate AI-assisted Instagram content creation with n8n and OpenAI. Generate and review English captions, coordinate single-image and carousel rendering, manage production budgets, and optionally publish approved content through the Instagram Graph API with secure media delivery.

### How It Works

1. A manual trigger, twice-weekly schedule, or authenticated webhook starts a new content-production request.
2. An external content studio reserves the job, prepares an editorial brief, and checks the generation budget.
3. OpenAI generates English social media copy based on the studio's configured writing instructions.
4. The studio validates the draft, including factual constraints, content novelty, and recorded API usage.
5. An independent OpenAI review evaluates editorial quality and can request a correction.
6. The studio queues approved content for image or carousel rendering, while n8n polls production status.
7. Completed assets are returned as private deliverables for review.
8. If publishing is enabled and the job is not preview-only, n8n executes authorized Instagram Graph API actions.
9. Publication responses are persisted until the studio confirms the Instagram media ID and permalink.
10. A separate webhook securely delivers authorized media using signed, expiring links.

### Setup

1. Import the workflow JSON into n8n and leave it inactive.
2. Deploy the compatible external content-studio backend, renderer, and persistent storage.
3. Replace the studio service URLs with endpoints reachable from your n8n instance.
4. Configure HTTP Header Auth credentials for the studio API and test webhook.
5. Connect OpenAI API credentials and verify the configured writing and review models.
6. Connect Meta OAuth credentials for an eligible Instagram professional account.
7. Configure editorial topics, content budgets, image layouts, and publishing preferences in the studio.
8. Set the workflow timezone and review the Tuesday/Friday production schedule.
9. Generate private previews and validate media authorization before enabling publishing.

### Requirements

- Working n8n instance with HTTP Request, Webhook, OpenAI, and Meta integrations.
- OpenAI API credentials and sufficient usage quota.
- Compatible external content-studio backend and image renderer.
- Persistent job and media storage.
- HTTP Header Auth credentials for studio communication.
- Instagram professional account with Meta publishing permissions.
- Public HTTPS media-delivery endpoint.
- Original or appropriately licensed visual assets.

### Customization

- Define content topics, audience, and editorial tone.
- Customize AI writing prompts and review criteria through the studio.
- Configure single-image and carousel layouts.
- Adjust colors, typography, and visual identity.
- Select AI models and configure generation budgets.
- Change publishing frequency and workflow timezone.
- Customize Instagram captions and approval controls.

### Additional Info

This workflow supports Instagram image posts and carousels. It does not generate narrated Reels or publish to YouTube.

The external studio handles rendering, persistent job state, budget enforcement, and media authorization. These components are not included in the workflow JSON.

OpenAI usage may incur additional costs. AI-generated content should be reviewed for factual accuracy and licensing.

Manual or test executions may publish content when the backend publishing gate is enabled.

**Documentation:** [Complete Setup Guide](https://paoloronco.notion.site/Automate-AI-Social-Media-Content-Creation-and-Publishing-to-Instagram-41af0ba27c3281e7a8c3c9434b6efbbe)

**GitHub:** [Workflow Repository](https://github.com/paoloronco/n8n-templates/tree/main/workflows/social/automate-ai-instagram-content)
