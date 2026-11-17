# Optional local rendering adapter

Not required by the cloud template. This source runs beside an **existing** local HyperFrames/offline-Kokoro runtime, outside the n8n VM. It accepts the same account, voice, narration, upload, completion, render and poll contract used by the n8n pipeline. It never calls HeyGen generation APIs.

Copy `config.example.json` to `local-render-api.local.json`, replace all example values with paths to your installed runtime and generate a private random credential. Keep that file and all generated media private. `LOCAL_RENDER_API_CONFIG` can select a config file outside this directory. The existing runtime's `voice/speech.py`, offline models and installed HyperFrames CLI are required; this adapter does not install them.

Run `python local-render-api.py` on the rendering machine. The default is loopback. Do not put a PC loopback URL in a workflow running on another VM: configure a private service address reachable from n8n, and expose only the intended authenticated rendering service. `publicBaseUrl` is the exact adapter origin returned for short-lived signed uploads/media, not the public n8n URL.

The current private test credential uses the header `X-OrbitPage-Test-Token`. Use that exact header with your own random secret in an n8n Header Auth credential. This name is retained for compatibility; neither the secret nor a personal credential ID is distributed. The credential is never attached to the signed media/download requests.

The adapter has serialized mutation keys, durable render IDs, checked ZIP extraction, one render at a time, offline narration and a full final media decode. Local requests are not charged as cloud API usage. Files and state are kept alongside the adapter; choose retention and service management for your deployment. A completed render is never automatically resubmitted by recovery.

Run `python adapter.test.py` for isolated HTTP contract tests. They generate an ephemeral credential and stub the render thread. The separate technical preview/report documents the real renderer test. This source is a draft: private VM-to-PC connectivity and persistent service deployment remain unverified. No auto-start installation is included.
