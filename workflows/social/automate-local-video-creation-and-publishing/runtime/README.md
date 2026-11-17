# Local Video Production runtime

This directory is the complete companion runtime for the n8n workflow. It includes the durable backend, local render worker, intake/review gallery, offline narration and recovery controls. Importing the workflow alone does not install these components.

## Architecture

`local form → signed n8n bridge → SQLite queue → local HyperFrames worker → verified MP4 upload → human approval → n8n OAuth delivery → durable provider receipts`

The local gallery listens only on `127.0.0.1:3850`. The backend runs as a dedicated SSH user on a Linux machine reachable by n8n. OAuth tokens remain in n8n. Python uses its standard library; rendering uses pinned npm dependencies, FFmpeg and optional offline Kokoro speech.

## 1. Backend host

Requirements: Python 3.10+, FFmpeg/ffprobe in PATH, persistent disk and a dedicated non-root SSH user. All helper files and the state directory must belong to that user. Do not use a read-only or ephemeral container filesystem for state.

Copy `backend.py`, `queue.py`, `production.py`, `youtube.py` and `backend_test.py` to `/opt/local-video-production` (or an absolute directory owned by the SSH user). Create `/var/lib/local-video-production` with mode 700. Copy `config.example.json` to `config.local.json` beside the helpers and set mode 600.

Set these configuration fields:

| Field | Value |
| --- | --- |
| `secret` | A new cryptographically random secret, at least 32 characters; use the same value in the worker configuration |
| `stateDir` | Absolute persistent directory, e.g. `/var/lib/local-video-production` |
| `enabled` | Keep `false` until the reviewed private test is ready |
| `accountId`, `username` | Your exact Instagram professional identity |
| `channelId` | Your exact YouTube channel ID |
| `mediaBase` | Production HTTPS URL of the workflow's media GET webhook |
| `timezone`, `hours` | Your timezone and publishing hours; match the n8n schedules |
| `ffmpeg`, `ffprobe` | Executable names or absolute paths |

Generate a secret with Python's `secrets.token_urlsafe(48)` locally. Keep it out of source control, screenshots and logs. There is no need to open an additional public backend port: n8n invokes the Python helpers through SSH.

Run `python3 -B backend_test.py` and `python3 production.py status`. A helper failure returns a non-zero exit code and an explicit JSON error. `LOCAL_VIDEO_CONFIG` can select another configuration file.

## 2. n8n configuration

Import **Local Video Production (template)** with schedules inactive. All individual production nodes should remain enabled. Its credential selectors use generic names and `null` IDs; they are intentionally unbound and contain no account credentials. This also prevents n8n from automatically choosing an existing account during import.

1. Select your dedicated SSH credential on every SSH node, including recovery and file transfer nodes.
2. Search the workflow for `/opt/local-video-production` and `/var/lib/local-video-production`. Replace both consistently if you use other directories. Uploads, the original MP4 download and the signed media endpoint must use the same persistent state directory.
3. Connect Meta OAuth and YouTube OAuth credentials. Replace `REPLACE_WITH_YOUTUBE_CHANNEL_ID` in the channel validation expression. The connected channel is checked before upload.
4. Use unique production webhook paths. Put the bridge POST, upload POST and media GET production URLs into the corresponding runtime configurations. Publish the workflow inside your own n8n to register the production webhooks.
5. Set the workflow timezone and match the backend hours. Keep the daily and publishing schedules disabled until the first test passes. The 09:00 branch reports approved drafts; it does not create or approve content automatically.

The example configurations match the imported paths: bridge `local-video-worker`, upload `local-video-upload`, and media `local-video-media`. Change each URL and its corresponding n8n webhook together. The template uses `Europe/Rome`, a 09:00 approved-queue check and delivery slots at 10:00, 12:00, 15:00, 18:00 and 21:00. It retains successful executions; review instance-level retention and disk usage for the worker's regular bridge polls.

Instagram delivery requires a supported professional account and appropriate Meta app access. YouTube requires an OAuth connection that can upload to, and read the processing/file metadata of, the configured channel. Check the current platform requirements for your own app. Platform errors are retained rather than converted into success.

## 3. Rendering computer

Requirements: Node.js 22+, npm, Python 3.10+, FFmpeg/ffprobe and disk space for models and rendered jobs. Install from the lockfile:

```powershell
npm ci --ignore-scripts
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe setup_models.py models
```

On Linux, use `.venv/bin/python` instead. `setup_models.py` downloads pinned official Kokoro model assets and verifies SHA-256 hashes. It requires about 355 MB plus the Python environment. Speech then runs offline. The worker also supports Windows SAPI or Linux `espeak-ng` when Kokoro is not configured; SAPI requires an installed voice for the selected language.

Copy `worker.example.json` to `worker.local.json`. Set the matching secret, production bridge/upload HTTPS URLs, an absolute writable `workDir`, full FFmpeg/ffprobe paths if needed, and absolute `voicePython` and `modelsDir` paths for Kokoro. The interface, examples and default narration language are English. US English, UK English and Italian narration are supported; select another language explicitly for a draft.

```powershell
node --test worker.test.mjs workflow.test.cjs
node worker.mjs
```

Use `LOCAL_VIDEO_WORKER_CONFIG` to keep the private configuration outside this package. `launch.ps1` starts the worker on Windows using that configuration. Open `http://127.0.0.1:3850/` on the rendering computer. Keep the process running while you want to render or review. The computer must be awake to process drafts. Existing verified uploads can publish from n8n while the computer is offline.

## 4. First complete test

1. Enter a real title, narration, caption and two scenes in the gallery. Choose **private YouTube test**. Slideshow requires two PNG/JPEG/WebP images that you have permission to use. Other layouts support optional images. More scenes can be submitted through the signed bridge using `example-brief.json` as the schema.
2. The worker claims a leased job, renders it and sends the original MP4. Both machines verify its hash. The backend decodes the complete file, checks H.264 1080×1920, AAC, 3–60 seconds and measured non-silent audio. An upload is not a publishing approval.
3. Play the complete video and listen to the narration. Check content, intended channels, privacy and the selected time. Enter the reviewer's name and approve **that version**. Rejected drafts cannot enter publication.
4. Enable publishing on the backend using the command below. Run the publishing branch manually in n8n or wait for a configured slot. Manual execution still requires a due, approved draft. It does not bypass approval.
5. Verify the private YouTube link and the backend/gallery receipt. Private tests skip Instagram entirely. Instagram has no equivalent private publishing test; an Instagram test publishes to the selected account.

The encoded CLI payload uses URL-safe base64 of JSON. To open or close the publishing gate from the backend host:

```bash
python3 -c 'import backend; print(backend.dispatch("production", "configure", {"enabled": True}))'
python3 -c 'import backend; print(backend.dispatch("production", "configure", {"enabled": False}))'
```

This changes only the delivery gate. The gallery continues accepting and reviewing drafts while publishing is disabled. Approval binds the exact MP4 hash, brief hash, account IDs, channels and requested visibility. A target change requires another approval.

## Recovery

| Situation | Recovery behavior |
| --- | --- |
| Render/dependency failure | Error appears on the draft. Fix the cause, then select **Resume rendering or upload**. |
| Upload failed after successful render | Retry reuses the unchanged, hash-verified local MP4; it does not generate a different draft. Renderer version and brief changes invalidate the cache. |
| Worker stops during rendering | Render lease expires; a later pull can recover it. Only the current lease can complete or upload. |
| Instagram processing/read failure | The gallery shows the per-channel error. Retry resumes the existing container/media ID. |
| Lost Instagram publish response | Read the existing container and recent media first. An uncertain create/upload is never repeated automatically. |
| YouTube verification failure | Its video ID is already saved. Retry verifies that same ID without another upload. |
| Missing/uncertain provider ID | State becomes `reconciliation_required`. Inspect the provider account, enter the existing ID in the gallery, then resume verification. Do not guess or blindly create another upload. |
| One channel succeeds | Its receipt remains published. Recovery targets only the incomplete channel. |
| No approved due draft | A clear no-op receipt is returned; no sample content is invented. |

Native n8n executions show HTTP/SSH failures. The gallery displays worker, render and channel errors. SQLite stores job state, approvals, timestamps and provider receipts; its `events` table records transitions. Completion requires actual provider read-back with the expected channel/identity and visibility. Local audio measurements and remote stream metadata do not prove spoken content accuracy or guarantee YouTube's Shorts classification.

## Backups and maintenance

Back up `config.local.json`, worker configuration, the SQLite database and all original MP4s. Use SQLite's backup API or `.backup`; do not copy only the main database file while WAL writes are active. Keep the signing secret with encrypted configuration backups. Media and receipts are retained for recovery; this package performs no automatic destructive cleanup. Apply your own reviewed retention policy after reconciliation.

Monitor `production.py status` for worker heartbeat, free disk, awaiting approvals and queue counts. A busy worker reports heartbeat and renews its lease every minute. Do not run multiple workers against the same local `workDir`. Do not reset the database to retry delivery. Keep failed executions available in n8n.

Public routes validate signatures, expiry, purpose and nonces. The gallery checks Host, Origin and CSRF tokens, and serves only fixed job media paths. Keep the gallery bound to loopback; exposing it publicly would require additional authentication. Do not include `*.local.json`, models, generated jobs, private receipts or node_modules in a public distribution.

## Verification and licenses

Run `python3 -B backend_test.py`, `node --test worker.test.mjs workflow.test.cjs`, then a real approved private test on your own instance. Automated unit fixtures do not publish to providers. Each render runs HyperFrames checks and FFmpeg verification before upload.

Dependencies are pinned in `package-lock.json` and `requirements.txt`. HyperFrames, GSAP, Kokoro, the voice/model assets and the bundled Inter fonts retain their upstream licenses; see [THIRD_PARTY.md](THIRD_PARTY.md). Use only content and images you may publish. This package does not call a paid generative API.
