# Social Posts & Carousels — Local Worker or Cloud

### Quick Overview

V3 is published in the n8n library as [Create and publish Instagram posts with OpenAI and Facebook Graph API](https://n8n.io/workflows/22955-create-and-publish-instagram-posts-with-openai-and-facebook-graph-api/). The listing retains its original title; its downloadable workflow is the V3 Creatomate implementation.

This directory contains **V1 with a local worker**, **V2 with a choice of cloud provider**, and **V3 for website-source updates, an editorial register and human-approved Creatomate publishing**. Import one option. All exports are inactive templates; configure your own credentials, facts, media and destinations.

| Version / provider | What to choose |
| --- | --- |
| [V3 — Website updates and approval](./V3/README.md) | Selected source facts, change detection, native editorial register and one exact human approval; Creatomate cloud, one workflow. |
| [V1 — Local worker](./V1/README.md) | Render on your own computer/VM; install and configure the companion runtime. |
| [Creatomate Cloud](./V2/Creatomate/README.md) | 4:5 musical posts and video carousels, 24 fps. API credits required. |
| [Shotstack Sandbox](./V2/Shotstack/README.md) | 24 fps, watermark; evaluation publication blocked. Speech can consume credits even in Sandbox. |
| [JSON2Video](./V2/JSON2Video/README.md) | 25 fps; initial evaluation quota, not a recurring monthly free allowance. Commercial rights require the appropriate plan. |

### How It Works

V1 delegates to the local worker; V2 uses a native n8n Runtime and the selected provider. V3 reads configured website facts, skips handled revisions, writes/reviews copy and renders with Creatomate before one human email approval and optional Instagram delivery. V3 has no local worker or shared Runtime.json.

### Setup

1. Choose V3, V1 or one V2 provider and read the matching README and documentation.md.
2. Import inactive. For Social V2 import Runtime.json first and select it in every Execute Sub-workflow caller. V3 imports as one workflow; follow its separate setup/verification guide.
3. Configure your own service credentials, account IDs, HTTPS routes, storage and limits.
4. Keep generation and publication off during setup. Use a fresh journal and media directory; do not import an existing production database.
5. Review a private preview before deliberately enabling a separately configured working copy.

### Requirements

n8n, persistent storage, public HTTPS where media delivery requires it, and credentials for the services you select. V1 additionally needs its local worker dependencies; V2 needs provider access/quota. Social copy generation uses OpenAI and may incur costs. Free renderer offers do not cover unrelated services.

### Customization

Use your own brief, fact catalog, brand, colors, typography and licensed media. Samples are newly authored neutral demonstrations; no production videos, captures, palettes, private accounts or secrets are included. Preserve receipt, idempotency, media-authorization and recovery checks.

### Additional Info

The versions have different setup and output contracts. A local job cap is not a provider spending cap. Provider terms and free allowances can change. Read the verification scope beside the selected version; this package is not a claim that all live paths have been exercised.

[Complete Notion documentation](https://paoloronco.notion.site/41af0ba27c3281e7a8c3c9434b6efbbe) · [Gumroad — all versions included](https://paoloronco.gumroad.com/l/social-posts)
