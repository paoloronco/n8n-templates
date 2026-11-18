# V2 — Cloud provider selection

### Quick Overview

Choose one provider folder; V1 is available separately for local rendering.

| Provider | Output and requirements |
| --- | --- |
| [Creatomate Cloud](./Creatomate/README.md) | 4:5 musical posts and video carousels, 24 fps. API credits required. |
| [Shotstack Sandbox](./Shotstack/README.md) | 24 fps, watermark; evaluation publication blocked. Speech can consume credits even in Sandbox. |
| [JSON2Video](./JSON2Video/README.md) | 25 fps; initial evaluation quota, not a recurring monthly free allowance. Commercial rights require the appropriate plan. |

### How It Works

The selected provider renders; n8n retains job IDs, validates the original media and controls delivery.

### Setup

Follow the provider README. Import inactive, select your credentials and configure your own public HTTPS routes and destinations. Social variants require their Runtime.json.

### Requirements

Provider API entitlement/quota, n8n persistent storage, HTTPS and selected channel credentials. See each guide for voice, dimensions, fps, watermark and license limits.

### Customization

Replace neutral samples with your own content. Keep generation, publication and paid-voice flags off until intentionally configured.

### Additional Info

[Family overview](../README.md) · [Notion V2 guide](https://app.notion.com/p/41cf0ba27c32812bbc05f0267444ebfc)
