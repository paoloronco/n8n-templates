# Social Studio worker source

Source, newly authored monochrome compositions, fictional sample artwork, DejaVu Sans and newly generated instrumental audio are included. No production captures, production media, owner palettes, credentials or databases are included.

Use Node.js with node:sqlite support, npm ci, FFmpeg/ffprobe and the compatible local voice environment described in documentation.md. The Reel path requires the timed Kokoro model/interface; that environment and weights are not bundled. This is application source, not a prebuilt OS/container or model installer. Posts do not require narration.

Set STUDIO_TOKEN (new random private value of at least 24 characters), STUDIO_INSTAGRAM_ACCOUNT_ID, STUDIO_INSTAGRAM_USERNAME, STUDIO_INSTAGRAM_MEDIA_BASE, optional format-specific media bases and STUDIO_VIEWERS for your own installation. Start with npm start at the worker root. Use a new writable data directory and publication disabled. Bind and expose the service only on the intended private n8n network. All three destination settings have no owner defaults.

Keep secrets in private environment/settings. Replace fictional Example facts, examples and assets with your own content. Recompute asset checksums after changes. Review one private output before any social test. Existing production databases/media are not a template input and must not be copied into this package.
