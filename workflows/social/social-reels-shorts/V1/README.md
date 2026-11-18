# Instagram Reels and YouTube Shorts — V1 Local Worker

### Quick Overview

The preserved original template orchestrates AI writing/review, local Social Studio rendering and optional gated social delivery. A workflow import alone cannot install its companion worker.

### How It Works

Reserve a durable job → write and review English copy → queue/poll the external worker → inspect private media → follow the publication gate and persist platform receipts. The YouTube-enabled export retains the same original MP4 for Shorts.

### Setup

1. Read [documentation.md](./documentation.md) and obtain the matching worker source/assets before importing.
2. Import [workflow.json](./workflow.json) inactive. Install/configure the worker, persistent storage and required helpers.
3. Set private worker/public signed-media URLs, credentials, destination accounts and timezone.
4. Confirm the persisted publishing gate is off, then review a deliberately funded preview before any publication.

### Requirements

n8n, OpenAI API quota, Meta professional-account permissions, a compatible Node/HyperFrames/Chromium/FFmpeg worker, matching assets and persistent SQLite/media storage. Reels additionally require the compatible timed Kokoro model/wrapper and the matching SSH YouTube helper plus YouTube OAuth. These companion components are not installed by this JSON.

### Customization

Change branding, facts, topics, schedules, prompts and layouts in the matching worker; preserve asset manifests, budgets and publication claims. Do not mix backend versions.

### Additional Info

Local rendering does not make OpenAI free. The local-worker graph and canvas geometry are retained; the full clean-machine worker installation was not tested here. For cloud rendering without that worker, choose [V2](../V2/README.md).

**Documentation:** [Notion version guides](https://app.notion.com/p/41af0ba27c32817490eeff675e958ce2) · [Complete local setup](./documentation.md)


## Neutral branding and generated media

Use [worker-source.zip](./worker-source.zip) with the included compatible local worker in a separate deployment. It includes the neutral source, new fictional sample illustrations/logos, music and regenerated asset checksums. Read [ANONYMIZATION.md](./ANONYMIZATION.md) before applying it. The n8n JSON delegates copy/rendering to the worker: replacing only the workflow title cannot change server-generated media. Start with a new database/output directory; old jobs and previously rendered videos retain their original content. This overlay is not a complete worker/model/SSH installer or a production deployment.


## Current neutral package

Use `worker-source.zip`: application modules, newly authored monochrome compositions, fictional sample images, generic DejaVu Sans and new procedural demonstration audio. These are independent of the owner's production templates and media. No model weights or prebuilt container are included. For Reels, the documented timed-voice environment remains a prerequisite. Keep publication off until a private preview has passed. The previous dated Sandbox tests used older artwork; no full render of this revision is claimed.
