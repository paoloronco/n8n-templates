# V2 — Cloud provider selection

### Quick Overview

Choose one provider folder; V1 is available separately for local rendering.

| Provider | Output and requirements |
| --- | --- |
| [HeyGen Voice + HyperFrames](./HeyGen-HyperFrames/README.md) | Cloud narration and vertical HyperFrames rendering. API credits required. |
| [NextCut Free](./NextCut/README.md) | Supplied narration PCM WAV; verified Free-plan quota, 396 × 704, 30 fps. No generated speech. |

### How It Works

The selected provider renders; n8n retains job IDs, validates the original media and controls delivery.

### Setup

Follow the provider README. Import inactive, select your credentials and configure your own public HTTPS routes and destinations. Social variants require their Runtime.json.

### Requirements

Provider API entitlement/quota, n8n persistent storage, HTTPS and selected channel credentials. See each guide for voice, dimensions, fps, watermark and license limits.

### Customization

Replace neutral samples with your own content. Keep generation, publication and paid-voice flags off until intentionally configured.

### Additional Info

[Family overview](../README.md) · [Notion V2 guide](https://app.notion.com/p/41cf0ba27c328141b536e0deeb40474a)
