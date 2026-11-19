# Video Production — Local Worker or Cloud

### Quick Overview

This directory contains source files for **V1 with a local worker** and **V2 with a choice of cloud provider**. Import one option. All exports are inactive templates; configure your own credentials, facts, media and destinations.

| Version / provider | What to choose |
| --- | --- |
| [V1 — Local worker](./V1/README.md) | Render on your own computer/VM; install and configure the companion runtime. |
| [HeyGen Voice + HyperFrames](./V2/HeyGen-HyperFrames/README.md) | Cloud narration and vertical HyperFrames rendering. API credits required. |
| [NextCut Free](./V2/NextCut/README.md) | Supplied narration PCM WAV; verified Free-plan quota, 396 × 704, 30 fps. No generated speech. |

V1 runtime **2.0.2** includes the reviewed 76-node canvas, unbound credential selectors and generic demonstration visuals. See [V1 documentation](./V1/documentation.md).

### How It Works

Provide your own structured brief and scenes. The selected local worker or cloud service renders the video; n8n coordinates verification, optional archive and guarded channel delivery.

### Setup

1. Choose V1 or one V2 provider and read its README and documentation.md.
2. Import only the workflow for your selected version/provider, and keep it inactive during configuration.
3. Configure your own service credentials, account IDs, HTTPS routes, storage and limits.
4. Keep generation and publication off during setup. Use a fresh journal and media directory; do not import an existing production database.
5. Review a private preview before deliberately enabling a separately configured working copy.

### Requirements

n8n, persistent storage, public HTTPS where media delivery requires it, and credentials for the services you select. V1 additionally needs its local worker dependencies; V2 needs provider access/quota. Free renderer offers do not cover unrelated services.

### Customization

Use your own brief, fact catalog, brand, colors, typography and licensed media. Samples are newly authored neutral demonstrations; no production videos, captures, palettes, private accounts or secrets are included. Preserve receipt, idempotency, media-authorization and recovery checks.

### Additional Info

The versions have different setup and output contracts. A local job cap is not a provider spending cap. Provider terms and free allowances can change. Read the verification scope beside the selected version; this package is not a claim that all live paths have been exercised. No Creator Portal submission is performed by this maintenance.

[Complete Notion documentation](https://paoloronco.notion.site/41af0ba27c3281f7b166e83346bbbb4c) · [Gumroad — all versions included](https://paoloronco.gumroad.com/l/social-local-videoproduction)
