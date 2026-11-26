# Tech & AI News Intelligence — V1

## Archived public version

Import [Tech_AI_Daily_Briefing-RSS-AI-Email-V1.json](Tech_AI_Daily_Briefing-RSS-AI-Email-V1.json).

This is a portable snapshot of the 48-node workflow distributed by the public n8n listing [#11466](https://n8n.io/workflows/11466). Its runtime already uses **OpenAI as the primary provider, Google Gemini as a fallback, Google Sheets subscribers, and SMTP delivery**, even though the listing title mentions Gemini and Gmail.

This archive does not claim to reproduce the earliest historical Gemini/Gmail implementation. Use [V2](../V2/README.md) for new installations.

## How it works

The workflow collects 20 RSS sources, filters recent articles, scores and groups similar stories, excludes previously delivered events, and prepares up to 10 English summaries. OpenAI is tried first, followed by Gemini and a deterministic selection if AI output fails. A responsive HTML briefing is sent through SMTP to recipients in a Google Sheet. Successful sends update workflow static data.

## Setup

Follow the [shared setup instructions](../README.md#setup). Configure both AI credentials, Google Sheets service-account access and the `Subscriber_email` column, an authorized SMTP sender, RSS sources and the delivery schedule. Test with a single recipient before activating scheduled execution.

## Difference from V2

The V1 code retains the historical future-date bound `now + 1234567890` milliseconds, allowing article timestamps approximately 14.3 days ahead. V2 corrects that bound to one hour. The date filter still excludes articles older than 24 hours.

The original n8n source and the V2 source also differ in portable Sheets/SMTP values and the overview note's documentation link. Both have the same 48 node names, connections and positions.

## Portability changes to this archive

The public-source snapshot was sanitized for redistribution:

- Removed four credential selections, including their account-specific names and IDs.
- Removed the workflow ID, instance metadata, version ID and the email node's unused webhook ID.
- Replaced the spreadsheet and worksheet references with `YOUR_GOOGLE_SHEET_ID` and `YOUR_SHEET_NAME`.
- Replaced the sender value with `your-verified-sender@example.com`.

Executable node parameters unrelated to those setup values, node IDs, node positions, connections and all sticky-note text and geometry are preserved from the public snapshot. This sanitized archive is not byte-identical to the API response.

## Operational notes

Summaries use RSS titles and excerpts. Relevance scoring and headline clustering are heuristic. Workflow static data is persisted during successful active production executions rather than ordinary manual tests. Delivery metrics are recorded per successful email item. API usage and email delivery may incur charges.

No new live-provider execution is claimed as part of this versioned publication.
