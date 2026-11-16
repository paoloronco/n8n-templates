# Version 2

- Included the previously missing backend, render worker, offline narration and local intake/review gallery.
- Added concrete brief/image input and four working video layouts.
- Bound approval to the actual MP4, brief, destination accounts, channels, visibility and earliest publishing time.
- Added server-side upload hash, codec, dimensions, duration, full-decode and audio checks.
- Kept durable provider IDs, per-channel states and explicit reconciliation for uncertain outcomes.
- Added recovery for rendering/upload failures and read-only verification of existing YouTube uploads.
- Fixed missing timestamps bypassing polling timeouts, swallowed bridge errors, incorrect manual execution detection, final-poll rejection and false dry-run evidence.
- Required YouTube privacy to match approval and actual processing/audio metadata before completion.
- Preserved the owner's live node IDs, geometry, credential associations and original notes; expanded the portable template's setup documentation separately.
- Kept all Creator Portal submission steps manual. No resubmission was performed.
