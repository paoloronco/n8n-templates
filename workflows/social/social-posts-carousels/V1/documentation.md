# V1 — Instagram Posts and Carousels with a local worker

← [Instagram Posts — V1 / V2](https://app.notion.com/p/41af0ba27c3281e7a8c3c9434b6efbbe)

V1 only — install the compatible local Social Studio worker. V2 cloud templates use their native n8n Runtime sub-workflow instead and do not follow these installation steps.

## 1. What is installed outside n8n

The worker is a Node.js HTTP service (`service.mjs`) which owns briefs, validation, a SQLite journal, render scheduling, source assets and publication receipts. It runs Playwright/Chromium and local HyperFrames, then FFmpeg/FFprobe for media processing. n8n calls its private API; n8n does not render the video itself.

The recovered v10 Posts renderer produces musical MP4s at 1080 × 1350, 24 fps: one 16.5-second single or four 5.5-second carousel parts. Older JSON/README descriptions also refer to JPEG outputs. The installed renderer version determines the files; do not document all V1 deployments as JPEG-only.

## 2. Obtain the matching source package first

The V1 folder includes the workflow, setup guides and worker-source.zip with the application source, neutral composition and matching assets. Extract the source ZIP into a separate worker directory. Importing the workflow JSON does not install or start that service.

Before installation, obtain:

- Matching `service.mjs`, `render.mjs`, publication/storage/catalog modules, composition files, `package.json` and `package-lock.json`.
- The full `assets/` directory and its manifests, including the current `sample-*.png`, logos, font and `demo-music.wav`. Keep the manifests and matching file bytes together.

Use the application and asset bytes supplied in worker-source.zip. It is source code, not a prebuilt container or one-click installer. Model weights, the timed-voice environment and the YouTube SSH helper are separate prerequisites for the Reels/Shorts route; they are not needed for musical Posts rendering.

**Installation boundary:** install the bundled worker source and its documented system dependencies separately. For Reels/Shorts, obtain and verify the timed Kokoro environment and matching SSH helper before enabling those routes. A complete clean-machine installation was not executed during this catalog revision.

## 3. Install the Node renderer dependencies

Use a supported Linux host/container with a non-root service identity, persistent storage, network access to n8n and enough memory for Chromium. Use a Node.js runtime with `node:sqlite` and `DatabaseSync` available (for example a compatible Node 24 LTS installation). The recovered lockfile pins HyperFrames 0.9.30, Playwright 1.64.1 and GSAP 3.15.0; preserve these versions until an upgrade is separately tested.

From the directory containing the recovered source and lockfile:

```sh
npm ci
npx playwright install --with-deps chromium
node --input-type=module -e "import { DatabaseSync } from 'node:sqlite'; console.log(typeof DatabaseSync)"
ffmpeg -version
ffprobe -version
```

Install the OS FFmpeg/FFprobe packages using your host's package manager before the last two checks. If Chromium is supplied by a container image, verify that executable and set `CHROMIUM_PATH` rather than assuming the download path.

These commands install/check prerequisites; they do not synthesize content, call OpenAI or publish. Do not run the `render` npm script as a health test: it starts actual local rendering.

## 4. Validate source assets and output storage

The renderer checks the SHA-256 manifests for sample artwork, logos and music before creating a job. Missing files or mismatched checksums are installation errors: restore the matching bundle rather than disabling those checks.

The source creates `data/studio.sqlite` and `data/jobs/<job-id>/` relative to its working directory. Put `data/` on persistent writable storage and keep `assets/` readable by the service identity. At least 1 GiB of free disk is required by the current guard; this is a refusal threshold, not an adequate capacity plan for many renders.

## 5. Configure the service

| Setting | Meaning in the recovered service |
| --- | --- |
| `STUDIO_TOKEN` | Required secret of at least 24 characters. Internal API uses `Authorization: Bearer <secret>`. Generate/store it in a secret store or a service-only environment file. |
| `PORT` | Defaults to 3848. The service listens on 0.0.0.0; use a private network/firewall and do not expose the complete API publicly. |
| `STUDIO_PUBLIC_URL` | Base used to build private gallery/download links; it does not configure access control. |
| `STUDIO_VIEWERS` | Comma-separated allowed viewer IPs for the private gallery; default loopback. Do not grant arbitrary public access to bypass preview restrictions. |
| `STUDIO_INSTAGRAM_MEDIA_BASE` | Public HTTPS signed-media base which matches the n8n asset webhook path. |
| `STUDIO_INSTAGRAM_POST_MEDIA_BASE`, `STUDIO_INSTAGRAM_REEL_MEDIA_BASE` | Optional format-specific signed-media bases, matching the same public origin. |
| `CHROMIUM_PATH` | Optional installed Chromium executable. |
| `FFMPEG_PATH`, `FFPROBE_PATH` | Optional executable paths; defaults `ffmpeg` and `ffprobe`. |

The included worker source implements `STUDIO_INSTAGRAM_ACCOUNT_ID` and `STUDIO_INSTAGRAM_USERNAME` in `service.mjs`, without owner defaults. Set both and `STUDIO_INSTAGRAM_MEDIA_BASE` before startup. The older recovered entry point used hard-coded destinations; do not reuse it for this anonymous template. Missing or invalid destination settings stop the neutral worker before it can serve jobs.

Publication policy is persisted in SQLite through `/v1/instagram/settings`. A new database defaults to disabled, but an existing database can already have publishing enabled. Do not rely on an unimplemented environment flag.

## 6. Start and supervise the worker

Set the working directory to the source folder so relative source, assets and data paths resolve correctly. Provision the service-only environment file with the settings above, then start using the actual installed Node binary:

```sh
node --env-file=/path/to/your/service-only.env service.mjs
```

The path is a documentation example; replace it with the real protected environment file. The command does not create that file or select a service manager automatically.

For a persistent installation, configure systemd or your existing container supervisor with the same working directory, environment, source/assets and persistent `data/` mount. Use a restart policy and bounded resources. No tested Compose file or portable container image is distributed with the public V1 JSON; do not present an invented `docker compose up` command as the original deployment.

Back up the SQLite database consistently with its WAL state and preserve publication receipts before upgrades. Keep originals for queued or uncertain jobs. Current media maintenance can expire or remove completed media; retention is not a substitute for an archive.

## 7. Connect n8n and verify without generating

1. Read `GET /health` from the same network as n8n. Expected fields include `ok`, `version`, `rendering` and `publishingEnabled`. Ensure publishing is false before a preview.
2. Create n8n Header Auth with name `Authorization` and value `Bearer <your STUDIO_TOKEN>`; select it on protected studio HTTP nodes.
3. Use the reachable private worker hostname/port in every studio node. In Docker, `localhost` in n8n refers to n8n's container; use the actual service/network name.
4. Confirm unauthenticated `/v1/` calls fail. The recovered `/health` endpoint is unauthenticated and must remain on the intended private network.
5. Check authenticated `GET /v1/storage` and `GET /v1/budget`; inspect logs and persistent directory permissions. These checks do not reserve an AI job.
6. Map the public n8n signed-media route to the configured media base; validate signature/expiry and external HTTPS reachability without exposing all studio endpoints.
7. Configure OpenAI and Meta using the linked V1 guides. Leave schedules and publishing off until the complete preview is reviewed.

If `/health` reports publishing enabled on an existing installation, turn it off through the documented authenticated `POST /v1/instagram/settings` with body `{"enabled":false}` in that installation before a test. Do not wipe the database to reset the gate.

## 8. Controlled first preview and failure checks

Reserve a single intended job only after prerequisites and API budget are ready. OpenAI generation/review can incur charges even though rendering is local. Inspect the output single/carousel files, dimensions, music and caption before any platform action.

| Failure | What to inspect |
| --- | --- |
| Cannot connect | Private hostname/port, container network and service process. |
| 401 | Exact Bearer header and matching service token. |
| SQLite/module error | Node version, `node:sqlite`, persistent writable data directory. |
| Browser executable missing | Playwright browser installation or `CHROMIUM_PATH`, OS dependencies. |
| Manifest/checksum error | Restore matching source assets and manifests. |
| Render failure / low disk | Worker logs, FFmpeg/FFprobe, permissions, capacity and current job state. |

A lost n8n response does not cancel the worker job. Retain its ID, inspect the journal and reconcile any existing platform receipt before retrying. See the V1 Testing, Operations and API/Security pages for detailed checks.

## n8n credentials and platform setup

1. Import `workflow.json` inactive. Keep every node enabled; leave the schedule inactive until acceptance testing.
2. Replace all worker URLs consistently; the service must be reachable from n8n's network. Connect a dedicated worker Header Auth credential and a separate inbound test-webhook secret.
3. Select an OpenAI API credential on both writing/review HTTP nodes. V1 preserves the historical HTTP implementation; V2 uses native OpenAI nodes. Match the backend's configured models and usage schema.
4. Connect the Facebook Graph API OAuth2 credential for an eligible Instagram professional account. Use the callback URL shown by n8n in the matching Meta application; grant publishing/read permissions for the selected API/login product. Confirm the actual account ID and username in the matching backend, rather than reusing another account.
5. Configure the signed public media HTTPS route and corresponding backend media-base setting. Meta must fetch only the authorized file; do not expose the private worker API as a workaround.
6. Check the timezone and each trigger. A manual trigger or test label is not an Instagram publication guard. Check `previewOnly`, `dryRun` and the persisted backend gate before a run.
7. Complete one intentionally funded private preview, inspect media/copy and reconcile its receipts before testing a platform action.


## Detailed version documentation

[Notion V1/V2 documentation](https://app.notion.com/p/41af0ba27c3281e7a8c3c9434b6efbbe).

The worker installation and live social paths were not re-executed for this release.


## Neutral branding and generated media

Use [worker-source.zip](./worker-source.zip) as the source for a separate compatible local worker deployment. It includes the neutral source, new fictional sample illustrations/logos, music and regenerated asset checksums. Read [ANONYMIZATION.md](./ANONYMIZATION.md) before applying it. The n8n JSON delegates copy/rendering to the worker: replacing only the workflow title cannot change server-generated media. Start with a new database/output directory; old jobs and previously rendered videos retain their original content. This source bundle is not a prebuilt worker/model/SSH environment or a configured production deployment.


## Current neutral package

Use `worker-source.zip`: application modules, newly authored monochrome compositions, fictional sample images, generic DejaVu Sans and new procedural demonstration audio. These are independent of the owner's production templates and media. No model weights or prebuilt container are included. For Reels, the documented timed-voice environment remains a prerequisite. Keep publication off until a private preview has passed. The previous dated Sandbox tests used older artwork; no full render of this revision is claimed.
