# Create and Publish Reels & Shorts

## Quick overview

Choose HeyGen or NextCut to turn a brief into a vertical video, optionally archive the verified MP4 in Dropbox, and schedule Instagram or YouTube delivery. Both variants use stock n8n nodes and retain checkpoints for recovery.

## How it works

- Each standalone workflow validates the brief, tracks its job in n8n Data Tables, renders in the selected cloud service, and checks the original MP4.
- Optional Dropbox archiving precedes delivery. Technically valid videos are authorized automatically; publishing runs only after you enable and configure it.
- Saved provider IDs, file hashes and channel receipts support recovery of interrupted jobs.

| Variant | Narration | Output configuration | API policy | Package |
| --- | --- | --- | --- | --- |
| HeyGen | Generates speech through HeyGen | 1080 × 1920, 30 fps, H.264/AAC MP4 | Eligible HeyGen API credits required; website free generations do not fund API usage | [README and setup](./heygen/README.md) · [JSON](./heygen/create-and-publish-reels-shorts-heygen-dropbox.json) |
| NextCut | Requires your own public PCM WAV URL | 396 × 704, exact 9:16, 30 fps, up to 30 seconds | Adapter accepts a verified Free plan with available quota and rejects paid subscriptions | [README and setup](./nextcut/README.md) · [JSON](./nextcut/create-and-publish-reels-shorts-nextcut-dropbox.json) |

## Setup

- Download the JSON from the selected variant and follow its README. Each provider folder contains only its workflow JSON, README, cover and thumbnail.
- Keep the imported workflow inactive while configuring its credentials, public n8n URL, storage tables, branding and publishing destinations.
- Run the included storage setup once. Select the intended channels, configure their OAuth credentials and enable publishing when ready.
- If importing both variants, use separate tables and webhook namespaces; follow each variant's configuration notes.

## Requirements

- A recent n8n instance with Data Tables and a publicly reachable HTTPS URL.
- The selected provider's API credential and eligible quota or API credits.
- Basic Auth for the intake and recovery forms, plus the credentials required for your selected social destinations.
- Dropbox OAuth2 only when archiving is enabled. NextCut also requires a supplied narration WAV.

## Customization

- Set your brand, scenes, caption, destinations, Dropbox folder, timezone and publishing slots.
- Choose HeyGen when generated narration and the Full HD output configuration fit your requirements; choose NextCut when supplied audio and the tested Free-plan resolution fit your requirements.
- Keep automatic authorization or explicitly enable the optional manual review setting.

## Additional info

- Both variants render in the cloud. No local video worker, renderer or extra packages are required on the n8n host.
- Activation, social publishing and Dropbox archiving start disabled. Review each variant's generation policy before running an example.
- HeyGen passed offline technical checks; live managed rendering and social delivery remain unverified. The private NextCut equivalent passed live rendering, Dropbox integrity and recovery checks; live social delivery remains unverified.
- Free-plan limits and API pricing can change. The workflow job cap is not a currency budget.
- Provider credentials and scenes differ between these variants; read the selected package's setup instructions before importing.
- Support and customization: [Consulting website](https://paoloronco.it/).
