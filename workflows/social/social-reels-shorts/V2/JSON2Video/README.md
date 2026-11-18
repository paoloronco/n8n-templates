# Instagram Reels and YouTube Shorts — V2 JSON2Video

### Quick Overview

Create and independently review English copy, then render 1080 × 1920 (9:16), narrated vertical MP4 plus cover and caption using JSON2Video. No local Social Studio, SSH, Python or FFmpeg worker is required. This is an inactive template with generation and publishing disabled.

### How It Works

1. Reserve an idempotent job and OpenAI budget in native n8n Data Tables.
2. Native OpenAI writer/reviewer nodes create grounded copy with one bounded correction.
3. The required Runtime sub-workflow checkpoints the selected cloud render, polls the same receipt and verifies original media metadata/hash.
4. Signed HTTPS routes deliver assets and private previews. A separate publication gate and durable claims guard Instagram and the same-MP4 YouTube path.

### Setup

1. Read [documentation.md](./documentation.md). Import [Runtime.json](./Runtime.json) first, then [workflow.json](./workflow.json), keeping both inactive.
2. Select that runtime in **every Execute Sub-workflow node**; public exports intentionally leave the selection empty.
3. Select OpenAI, inbound webhook and platform credentials. Header Auth: `x-api-key: <API key>` on the three JSON2Video runtime nodes.
4. In **Apply cloud configuration**, replace the example HTTPS origin and empty account/channel fields. Match the unique asset/media/preview routes and preserve limits.
5. Keep `manualAction: "setup"`, `generationEnabled: false`, `publishingEnabled: false`; initialize the native journal once. Setup does not generate media.
6. Use a separate working copy for an intentionally funded preview; register its HTTPS asset routes and disable its schedule before testing. Retained templates remain inactive.

### Requirements

n8n with Data Tables, Code, Compression, Crypto, Execute Sub-workflow and native OpenAI Responses support (verified on 2.47.5), public HTTPS delivery, durable storage, OpenAI API quota and the selected renderer entitlement. Platform publication also needs the corresponding Meta/YouTube permissions. The shared provider runtime contains the verified Shotstack community nodes; install `@shotstack/n8n-nodes-shotstack` even when selecting JSON2Video, so the imported graph has no unknown nodes.

25 fps. 600 initial non-renewing evaluation credits; non-commercial free plan, possible watermark. Real quota checked before rendering.

### Customization

Set destination accounts, topics, copy/review rules, budgets and schedule. Bundled graphics and facts describe a fictional Example brand at example.com. All logos and sample illustrations are neutral. Set your own verified facts, catalog, copy rules, narration and composition assets before use. Preserve idempotency, conditional checkpoints and signed-file checks; never erase uncertain receipts to retry.

### Additional Info

Free renderer offers do not include OpenAI costs. Runtime render counters are cumulative guards, not provider billing caps. Inactive templates do not register production webhooks; a manual run alone cannot expose assets to a cloud renderer. Runtime copies shared within a provider family need only be imported once.

See [verified scope and remaining acceptance tests](../verification.md). Paid rendering/voice, live AI and social publication were not exhaustively exercised; these files are not a universal production certification. No Creator Portal submission was made.

**Documentation:** [Notion V2 guide](https://app.notion.com/p/41cf0ba27c3281dcb532fbca12406c6a) · [Complete setup](./documentation.md) · [V1 local worker](../../V1/README.md)


## This provider and current sample

Selected provider: **JSON2Video**. 25 fps; initial evaluation quota, not a recurring monthly free allowance. Commercial rights require the appropriate plan. Import only this provider folder. The sample uses newly authored grayscale cards, generic font and new procedural audio, without owner production screenshots, media or palette. Replace the fictional facts and sample branding with your own verified content.

[Provider documentation](https://app.notion.com/p/41cf0ba27c3281ab945ee3521ce3faa4) · [Version selection](../../README.md)
