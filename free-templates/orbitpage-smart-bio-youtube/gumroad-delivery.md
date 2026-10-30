# OrbitPage Smart Bio — YouTube

Thanks for downloading! Keep your creator page in step with your public YouTube channel. Choose immediate publication or review each new video by email before it appears on OrbitPage.

## Download & Documentation

- [Download the workflow JSON](https://raw.githubusercontent.com/paoloronco/n8n-templates/main/free-templates/orbitpage-smart-bio-youtube/OrbitPage_Smart_Bio_YouTube.json).
- [Read the quick setup guide](https://github.com/paoloronco/n8n-templates/blob/main/free-templates/orbitpage-smart-bio-youtube/README.md).
- [Read the complete technical guide](https://github.com/paoloronco/n8n-templates/blob/main/free-templates/orbitpage-smart-bio-youtube/GUIDE.md).
- [Project on GitHub](https://github.com/paoloronco/n8n-templates/tree/main/free-templates/orbitpage-smart-bio-youtube).

## What's Included

- Importable workflow JSON with one orange overview note and ten concise section notes around the aligned nodes.
- Quick README, complete technical guide and n8n catalog copy with a demonstration outline.
- Gumroad listing and delivery text, square thumbnail and landscape cover.
- Workflow capabilities: native YouTube cards, automatic or email-approved publication, persistent video registry and a manual replay for testing.
- Development sources, behavioral tests and a layout verification report for maintainers.

## Getting Started

1. Import the JSON into n8n 2.x and install `n8n-nodes-orbitpage` 0.3.2 or newer.
2. Connect a hosted OrbitPage workspace with `workspace:read`, `links:read`, `links:write`, `publication:read` and `publication:write` scopes; select the credential on every OrbitPage node.
3. Enter the channel's `UC…` ID and a dedicated registry table name in `Configuration`.
4. Choose `EMAIL_APPROVAL` or `AUTOMATIC`; for approval, connect SMTP and set one authorized sender and one reviewer.
5. Run the manual trigger with an empty replay field to establish the baseline; existing videos are not imported automatically.
6. Follow the technical guide to replay a recent public video and check approval, rejection and duplicate handling without uploading a new video.
7. Verify the video cover and playback after consent on your public page; clear `MANUAL_VIDEO_ID` and publish the workflow.

## Important Notes

- No YouTube API key, YouTube OAuth or AI service is required. Your n8n, SMTP and OrbitPage plans may have normal costs or quotas; fifteen-minute polling means 96 scheduled checks per day.
- The feed contains recent public videos, not a complete archive. Private and unlisted videos are excluded; embedding restrictions still apply.
- Approval mode requires private draft API support (`publish=0`). The native cover requires OrbitPage renderer 4.21.162 or newer; configure external consent platforms for the YouTube widget.
- Pending proposals and concurrent page changes require care: the workflow stops rather than publishing unreviewed changes. Do not reset the registry or run overlapping manual replays.
- Existing blocks are preserved and older published video cards are not automatically removed. Custom page layouts still control visual placement.
- Images are promotional illustrations. Review configuration, credentials and execution results in your own workspace before enabling the schedule. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it.
