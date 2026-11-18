# Neutral worker branding overlay

This source/assets overlay is for the matching v10 local Social Studio worker only. It is not a Docker image, a complete installation or a migration of an existing production service. Keep it in a separate test deployment with a new SQLite database and media directory. Do not connect it to existing jobs: old jobs retain their original captions, facts, narration and media.

The fictional demonstration brand is Example and the sample domain is example.com. All phone illustrations and logos were created afresh. Replace the catalog, copy rules, narration invitation, phone/browser text, end card and images with your own verified brand facts before public use. Recompute brand-manifest.json, product-proof-manifest.json and music-v10-manifest.json after changing assets.

Install the modules at the matching worker root and the bundled assets in its assets directory. Preserve your private STUDIO settings and storage policy. The existing operating-system dependencies, Chromium/FFmpeg, timed Kokoro/model environment and YouTube SSH helper remain separate prerequisites described in documentation.md. No credentials, database or previously generated media are included. Do not enable publication until a private preview has been reviewed.

This revision received source, asset and offline contract checks. It has not passed a fresh full local installation, video render or live platform publication test.
