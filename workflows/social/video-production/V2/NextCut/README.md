# Create and Publish Reels & Shorts with NextCut and Dropbox

## Quick overview

Create vertical Reels and Shorts from a structured brief and supplied narration using NextCut. Verify each MP4, optionally archive it to Dropbox, and schedule Instagram or YouTube delivery. Keep job checkpoints and publishing receipts to recover interruptions without generating or uploading duplicates.

## How it works

- Receive an English brief through a protected form or **Example brief**, including two to five scenes and an existing narration WAV URL.
- Validate the request and save its job in n8n Data Tables.
- Verify the NextCut Free plan and quota, reserve a workflow permit, and submit native JSON scenes for rendering.
- Resolve the rendering ID to NextCut's separate job UUID, then download and inspect the original H.264/AAC MP4 and its SHA-256.
- Optionally archive the verified original to Dropbox.
- Authorize technically valid videos automatically and publish selected Instagram Reels or YouTube Shorts when due and enabled.
- Retain provider IDs, file hashes and channel receipts to resume the same job without repeating completed actions.

## Setup

- Import [the workflow JSON](./workflow.json) and keep it inactive during configuration.
- Edit **Apply video configuration**: set your public HTTPS n8n URL, a unique jobs table, brand, intended social account IDs, timezone and delivery hours.
- Create an HTTP **Header Auth** credential with **Name:** `x-api-key` and **Value:** your raw NextCut API key. Select it on every NextCut HTTP node.
- Connect Basic Auth to protect intake and recovery forms. Connect the OAuth credentials for the social channels you intend to use.
- For Dropbox archiving, connect Dropbox OAuth2, create your destination folder and set `dropboxEnabled: true`.
- Keep `manualAction: "setup"` and run **Set up cloud storage** once. Set `manualAction: "check"` to inspect the free account without rendering.
- Supply your own public narration WAV URL. The included example uses an existing public audio sample for a technical demonstration; it does not generate speech.
- Select `manualAction: "example"` to create the example. The initial local cap is one job; deliberate increases remain subject to the provider's verified free quota.
- Match the Schedule nodes to the workflow timezone and configured delivery hours. Delivery defaults to **09:00 UTC**; the read-only daily queue check runs at **08:00 UTC**. Set intended targets in the brief, enable `publishingEnabled` and activate the workflow after configuration.

## Requirements

- A recent n8n instance with Data Tables, stock nodes and a publicly reachable HTTPS URL. No additional renderer, worker or packages on the host.
- A NextCut Free account and API key with available quota. This adapter rejects paid plans, active subscriptions and unverifiable or exhausted quotas.
- A public HTTPS **16-bit PCM WAV**, mono or stereo, 16–96 kHz, between 2 and 29.4 seconds. **NextCut does not currently generate narration.**
- Instagram and/or YouTube account access and publishing credentials for the selected channels. Instagram delivery requires a compatible professional account and Meta permissions.
- A Basic Auth credential for the protected forms, plus Dropbox OAuth2 only when archiving is enabled.

## Customization

- Edit brand, accent, caption, scenes, optional image URLs and intended destinations. Slideshow scenes each need a public HTTPS image.
- Output is **396 × 704, exact 9:16, 30 fps, H.264/AAC MP4**, up to 30 seconds. The live Free API rejected 720 × 1280 because it caps the longest side at 720 pixels. This configuration is **not Full HD**.
- Set the Dropbox folder, publishing slots and a unique table/webhook namespace for each installation.
- Keep `requireVideoApproval: false` for automatic authorization, or explicitly enable manual review if required by your deployment.
- Use the protected recovery form, or `manualAction: "recover"` with `manualRecovery`, to resume saved provider IDs. Never repeat an uncertain render or social upload automatically.

## Additional info

- Workflow activation, social publishing and Dropbox archiving start disabled. All individual production nodes remain enabled.
- NextCut currently advertises 25 Free renders per month. Native rendering uses one credit; other API actions can consume different amounts. Free limits may change. Check [NextCut pricing](https://nextcut.io/pricing) and [API documentation](https://nextcut.io/docs/api-reference).
- `maxCloudRenders` is an atomic workflow job cap, not a currency budget. Rejected jobs remain in the ledger. `get_usage.totalCostUsd` also includes estimated AWS compute costs for free renders; it is not a paid-credit balance. No subscription, top-up or billing activation is implemented.
- The private equivalent passed native rendering, Dropbox upload/download hash verification and recovery without a new render. This anonymized export passed offline validation; live social publishing with NextCut remains unverified.
- [GitHub package](https://github.com/paoloronco/n8n-templates/tree/main/workflows/social/video-production/V2/NextCut) · [Workflow JSON](./workflow.json) · [Compare both renderers](../README.md). [Gumroad](https://paoloronco.gumroad.com/l/social-local-videoproduction) offers both provider downloads. No n8n Creators submission has been performed for NextCut.
- [Full setup, configuration and recovery guide](https://paoloronco.notion.site/41bf0ba27c3281b5a38fe146d963960f).
- Support and customization: [info@paoloronco.it](mailto:info@paoloronco.it) · [Consulting website](https://paoloronco.it/).


## Version selection

This is V2 NextCut Free. V1 uses a local worker and has a separate installation. One product download includes both versions. [Provider documentation](https://paoloronco.notion.site/41bf0ba27c3281b5a38fe146d963960f).
