# Social Reels & Shorts — Local Worker or Cloud

### Quick Overview

One package includes **V1 with a local worker** and **V2 with a choice of cloud provider**. Import one option. All exports are inactive templates; configure your own credentials, facts, media and destinations.

| Version / provider | What to choose |
| --- | --- |
| [V1 — Local worker](./V1/README.md) | Render on your own computer/VM; install and configure the companion runtime. |
| [HeyGen Voice + HyperFrames](./V2/HeyGen-HyperFrames/README.md) | Cloud narration and vertical HyperFrames rendering. API credits required. |
| [Shotstack Sandbox](./V2/Shotstack/README.md) | 24 fps, watermark; evaluation publication blocked. Speech can consume credits even in Sandbox. |
| [JSON2Video](./V2/JSON2Video/README.md) | 25 fps; initial evaluation quota, not a recurring monthly free allowance. Commercial rights require the appropriate plan. |

### How It Works

The Social Studio generates and reviews copy before rendering and gated social delivery. V1 delegates to the local worker; V2 uses a native n8n Runtime and the selected provider.

### Setup

1. Choose V1 or one V2 provider and read its README and documentation.md.
2. Import inactive. For Social V2 import Runtime.json first and select it in every Execute Sub-workflow caller.
3. Configure your own service credentials, account IDs, HTTPS routes, storage and limits.
4. Keep generation and publication off during setup. Use a fresh journal and media directory; do not import an existing production database.
5. Review a private preview before deliberately enabling a separately configured working copy.

### Requirements

n8n, persistent storage, public HTTPS where media delivery requires it, and credentials for the services you select. V1 additionally needs its local worker dependencies; V2 needs provider access/quota. Social copy generation uses OpenAI and may incur costs. Free renderer offers do not cover unrelated services.

### Customization

Use your own brief, fact catalog, brand, colors, typography and licensed media. Samples are newly authored neutral demonstrations; no production videos, captures, palettes, private accounts or secrets are included. Preserve receipt, idempotency, media-authorization and recovery checks.

### Additional Info

The versions have different setup and output contracts. A local job cap is not a provider spending cap. Provider terms and free allowances can change. Read the verification scope beside the selected version; this package is not a claim that all live paths have been exercised. No Creator Portal submission is performed by this maintenance.

[Complete Notion documentation](https://paoloronco.notion.site/41af0ba27c32817490eeff675e958ce2) · [Gumroad — all versions included](https://paoloronco.gumroad.com/l/social-reels)
