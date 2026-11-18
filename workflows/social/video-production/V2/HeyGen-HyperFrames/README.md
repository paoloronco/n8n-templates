# Video Production — Local Worker or Cloud

## Quick overview

Turn a brief into narrated Instagram Reels and YouTube Shorts with HeyGen, optionally archive the MP4 in Dropbox, and publish on schedule. One n8n workflow handles validation and recovery, reducing manual work without installing a video renderer on your server.

## How it works

1. Receive an English video brief through the protected intake form or the included **Example brief**.
2. Validate the brief, create a job in n8n Data Tables, and reserve the configured rendering allowance.
3. Generate narration and render the vertical MP4 through HeyGen Cloud using the included HyperFrames composition.
4. Check the original video's metadata and SHA-256, then optionally archive it in Dropbox.
5. Authorize valid videos automatically. A private preview and manual approval remain available when explicitly enabled.
6. Publish selected Instagram Reels and YouTube Shorts at the configured time through Meta's Graph API and the YouTube API.
7. Save provider IDs and delivery receipts so interrupted jobs can resume without repeating completed channel uploads.

## Setup

1. Import the JSON into n8n. Keep the workflow inactive and generation and publishing disabled during configuration.
2. Edit **Apply video configuration**: enter your public n8n URL, jobs table name, brand, destination account IDs, timezone and publishing hours.
3. Connect HeyGen Header Auth and Basic Auth for the protected forms.
4. Connect the selected social OAuth credentials. For Dropbox archiving, also connect Dropbox OAuth2 and create the destination folder.
5. Keep `manualAction: "setup"` and run **Set up cloud storage** once to initialize the storage tables.
6. Check the configuration before enabling `allowExistingApiCredits` and `publishingEnabled`. Select the intended destinations in your brief, then activate the workflow when ready.

## Requirements

- An n8n instance with Data Tables and a publicly reachable HTTPS URL.
- A HeyGen API key with eligible API credits. Website free generations do not fund the API wallet; API usage may incur charges.
- Publishing credentials and access to the Instagram and/or YouTube destination accounts.
- A Basic Auth credential to protect intake and recovery forms.
- A Dropbox account and OAuth2 credential only if archiving is enabled.

## Customization

- Write your own narration, caption and two to five scenes in **Example brief** or the intake form.
- Choose `explainer` or `slideshow`; provide a public HTTPS image for every slideshow scene.
- Adjust branding, accent color, destinations and Dropbox folder. Match the Schedule nodes with the configured `timezone` and `hours`.
- Keep automatic authorization, or set `requireVideoApproval` to `true` if your deployment needs manual review.

## Additional info

- [Compare the HeyGen and NextCut variants](../README.md).
- Stock n8n nodes only: no local worker, video renderer or extra packages on the n8n host. Output targets 1080 × 1920, 30 fps, H.264/AAC MP4.
- `maxCloudRenders` limits jobs, not spending. Generation, social publishing and Dropbox archiving start disabled.
- Technical checks passed; live managed HeyGen rendering and social delivery by this cloud copy remain unverified.
- [Full setup, examples and recovery guide](https://app.notion.com/p/41af0ba27c3281f7b166e83346bbbb4c) · [Workflow JSON](https://github.com/paoloronco/n8n-templates/blob/main/workflows/social/video-production/V2/HeyGen-HyperFrames/workflow.json).
- Availability: [GitHub](https://github.com/paoloronco/n8n-templates/tree/main/workflows/social/video-production/heygen) · [Gumroad](https://paoloronco.gumroad.com/l/social-local-videoproduction) · [n8n submission](https://n8n.io/workflows/22950) (not yet public; the updated cloud version is not confirmed in review).
- Support and customization: [Consulting and support](https://paoloronco.it/).


## Version selection

This is V2 HeyGen Voice + HyperFrames. V1 uses a local worker and has a separate installation. One product download includes both versions. [Provider documentation](https://app.notion.com/p/41cf0ba27c3281129b90cecd2134fc53).
