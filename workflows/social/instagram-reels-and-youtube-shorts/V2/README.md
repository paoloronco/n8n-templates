# Instagram Reels and YouTube Shorts — V2 Cloud Templates

### Quick Overview

Choose a cloud renderer while retaining the familiar social workflow. Every variant includes a main workflow and a required native n8n Runtime, with generation/publication off. No VM rendering worker is needed.

| Provider | Output and allowance |
| --- | --- |
| [HeyGen Voice + HyperFrames Cloud](./HeyGen-HyperFrames/README.md) | Continuous narration, signed composition ZIP upload and managed HyperFrames rendering. API credits required. |
| [Shotstack Sandbox](./Shotstack/README.md) | Watermarked Sandbox rendering, 24 fps. Free rendering requires an available account credit; speech generation consumes credits. Social publication is blocked. |
| [JSON2Video](./JSON2Video/README.md) | 25 fps. 600 initial non-renewing evaluation credits; non-commercial free plan, possible watermark. Real quota checked before rendering. |

### How It Works

Manual/scheduled/authenticated inputs → native journal and budget → native OpenAI writer/reviewer → provider rendering and verified originals → private review → optional gated platform delivery. Horizontal sections use one orange overview and gray functional notes; media and alternate paths occupy separate bands.

### Setup

Choose one provider, read its guide, import Runtime first and main workflow second. Select the runtime in every caller, configure your credentials/destination IDs/public HTTPS routes, then initialize storage with generation/publication still off. Keep these archive templates inactive; configure a separate working copy for acceptance testing.

### Requirements

n8n Data Tables and native OpenAI Responses (checked on 2.47.5), provider API entitlement, OpenAI quota, public signed HTTPS delivery and persistent n8n storage. Shotstack/JSON2Video's shared runtime additionally contains the Shotstack verified community package.

### Customization

Adjust brand facts/assets, topics, prompts, schedule, destinations and budget. Preserve the journal, signatures, original-media checks and uncertain-request recovery. Provider rights and actual output dimensions/fps govern use.

### Additional Info

Read [verification.md](./verification.md) for tested and untested paths. [manifest.json](./manifest.json) contains SHA-256 hashes. These are sanitized template exports, not an enabled deployment or a Creator Portal submission. V1 remains available [here](../V1/README.md).

**Documentation:** [Notion V2 guide](https://app.notion.com/p/41cf0ba27c3281dcb532fbca12406c6a)
