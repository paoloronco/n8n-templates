# Version 2

## 17 November 2026 — production/template parity review

- Rebuilt **Local Video Production (template)** from the actual published local production workflow, preserving its 74-node graph and exact canvas arrangement.
- Replaced private helper/state paths, webhooks, channel ID, branding, filenames, tags and credential bindings with portable configuration.
- Used generic credential selectors with null IDs to prevent n8n's automatic account selection during import.
- Corrected misleading daily-batch labels: 09:00 checks approved ready drafts; it does not generate or approve five videos.
- Enabled successful-execution retention in production and the template; kept the reusable template inactive.
- Matched example runtime URLs to the portable webhook paths and added configuration consistency checks.
- Left the existing cloud submission unchanged; no Creator Portal submission was performed in this review.

## Initial end-to-end runtime

## 2.0.1 — English interface and defaults

- Translated the gallery, approval, rejection and recovery messages into English.
- Made US English the default narration language and translated every sample brief.
- Updated the installed runtime, n8n example, documentation and distributable package.
- Preserved historical job content, approved MP4s, receipts and account configuration.

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
