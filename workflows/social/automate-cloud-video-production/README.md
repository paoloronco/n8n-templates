## Quick overview

- Create narrated Instagram Reels and YouTube Shorts from a brief, archive videos in Dropbox, and publish on schedule. HeyGen cloud rendering and error recovery reduce manual work, with no extra software required on your n8n server.

## How it works

- Turn an English brief into a narrated vertical video with HeyGen Cloud and HyperFrames.
- Validate the original MP4 and optionally archive it in Dropbox.
- Publish selected Instagram Reels and YouTube Shorts on schedule, without per-video approval.
- Save provider IDs and recover failed stages while preserving completed channel receipts.

## Setup

- Import the workflow into n8n with Data Tables and a public HTTPS URL.
- Edit **Apply video configuration**: set your URL, jobs table, brand, destination accounts, timezone and publishing hours.
- Connect HeyGen Header Auth, form Basic Auth and the selected social OAuth credentials. For Dropbox, connect OAuth2 and create the destination folder.
- Keep `manualAction: "setup"` and run **Set up cloud storage** once.
- Test configuration before enabling `allowExistingApiCredits`, `publishingEnabled` and workflow activation.

## Customization

- Use **Example brief** or the protected intake form to supply narration, captions and two to five scenes.
- Choose `explainer` or `slideshow`; slideshow requires a public HTTPS image for every scene.
- Customize branding, composition, destinations, Dropbox folder and schedule. Match the Schedule nodes with `timezone` and `hours`.
- Automatic authorization is the default; enable `requireVideoApproval` only for deployments needing manual review.

## Additional info

- Stock n8n nodes only; no renderer, worker or extra packages on the n8n host. Output targets 1080 × 1920, 30 fps, H.264/AAC MP4.
- Generation and publishing start disabled. HeyGen API usage may consume credits; website free generations do not fund the API wallet.
- `maxCloudRenders` caps jobs, not currency. Technical checks passed; live managed rendering and cloud social delivery remain unverified.
- [Full setup, examples and recovery guide](https://app.notion.com/p/41af0ba27c3281f7b166e83346bbbb4c) · [Workflow JSON](https://github.com/paoloronco/n8n-templates/blob/main/workflows/social/automate-cloud-video-production/automate-cloud-video-production.json).
- Distribution: [GitHub](https://github.com/paoloronco/n8n-templates/tree/main/workflows/social/automate-cloud-video-production) · [Gumroad](https://paoloronco.gumroad.com/l/social-local-videoproduction) · [n8n submission](https://n8n.io/workflows/22950) (not yet public; the Creator Portal still lists the previous local title under review).
- Support and customization: [Email support](mailto:info@paoloronco.it) · [Consulting website](https://paoloronco.it/).
