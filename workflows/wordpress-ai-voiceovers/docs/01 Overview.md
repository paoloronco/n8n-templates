# 01 · Overview

The workflow fetches WordPress posts from the last 30 days, normalizes rendered HTML without deleting technical symbols, and upserts each post into Google Sheets. It selects the oldest row whose Status is empty.

Two branches then run:

- English: Google Translate, whitespace normalization, Google long-form TTS, English WordPress page.
- Italian: title plus original content, whitespace normalization, Google long-form TTS, Italian WordPress page.

A Merge node waits for both WordPress updates. Only then is Status set to done. A handled branch error is persisted as failed: reason.

## Deliberate choices

OpenAI was removed because semantic cleaning could delete commands, URLs, paths and version numbers. The deterministic normalizer only strips HTML, script/style blocks and redundant whitespace.

The workflow uses raw editable WordPress page content and a marker such as wp-voiceover:123:en. Replaying a successful WordPress update therefore returns the existing page unchanged.

The Cloud Run endpoint requires X-API-Key and validates text size and filenames. For the strongest boundary, deploy Cloud Run privately and call it with a Google-signed OIDC ID token as described in 05.
