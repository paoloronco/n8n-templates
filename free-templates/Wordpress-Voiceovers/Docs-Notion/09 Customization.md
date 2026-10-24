# 09 · Customization

## Voice or language

Change language, voice and filename suffix in the relevant HTTP TTS node. Confirm voice availability in the configured regional endpoint. For another language, duplicate the full branch and connect its successful WordPress update to a Merge that waits for every branch.

## Article window

The Wordpress node currently fetches the last 30 days. Increase or reduce the Luxon days value according to publishing frequency. returnAll can be expensive on large sites, so prefer a bounded window.

## Page markup

Edit only the HTML appended by the two Update nodes. Preserve the language-specific wp-voiceover marker; it is the idempotency key.

## Private audio

The template uses public object URLs for browser playback. For private content, replace them with a controlled media endpoint or signed-URL design and account for URL expiry.

## Text preparation

The deterministic Code nodes preserve semantic content. If spoken output needs special handling, add explicit replacements for known tokens rather than a broad instruction to delete code or symbols.
