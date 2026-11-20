# Configuration and operations

## Required node support

Use n8n with native Data Table 1.1, HTML 1.2, OpenAI 2 (Responses), Send Email 2.1 (Send and Wait), HTTP Request 4.2, Facebook Graph API 1, IF 2.2 and Wait 1.1 support. The release's isolated native acceptance test ran on the owner's n8n installation, previously identified as 2.47.5; no universal n8n Cloud/version compatibility certification is claimed. No community package is required.

## Configure V3 only

| Field | Meaning |
| --- | --- |
| `action` | `setup`, `preview` or `publish`. Default setup makes no service requests. |
| `generationEnabled` | Explicitly permits a new AI/render job. Default false. An existing approved preview can be reused with it off. |
| `publishingEnabled` | Must be true for publish mode; the human decision is still required. Default false. |
| `jobsTable` | Dedicated table name, starting with a lower-case letter, using lower-case letters/digits/underscores. Never use a production/V2 table. |
| `sourceUrl` | One public HTTPS article, product page or release note. This version reads server-delivered HTML; it does not execute website JavaScript or log into a website. |
| `titleSelector` | CSS selector for the relevant title, for example `article h1`. |
| `bodySelector` | CSS selector for individual meaningful fact blocks, for example `article .social-fact`. At most twelve unique blocks, each at most 600 characters. Broad/oversized selections stop rather than silently dropping facts. |
| `brand`, `language` | Your brand (up to 60 characters), and English or Italian. |
| `ctaUrl` | Approved HTTPS destination appended to the caption separately from AI output. |
| `format` | `single` or `carousel`. |
| `campaignRevision` | An intentional revision label. Changing it permits a new job even if source facts are unchanged; do not use it to bypass uncertain or already published jobs. |
| `imageUrl`, `musicUrl` | Optional licensed HTTPS assets reachable by Creatomate. Leave empty for text-only/silent output. These are configured assets, not automatically licensed website images. |
| `model` | A model supported by the native OpenAI Responses node and the strict schema/reasoning settings used here. Default `gpt-5-mini`. |
| `inputUsdPerMillion`, `outputUsdPerMillion` | Current prices for the selected model; initial zero values block generation. Check pricing whenever changing the model. |
| `maxMonthlyAiUsd` | Local estimated AI reservation ceiling, default USD 3. Four potential calls are reserved before generation: writer, reviewer, one writer correction and second reviewer. Each reserves 20,000 input tokens and 1,800 output tokens at your configured prices; serialized prompt/schema input is capped at 16,000 UTF-8 bytes. This is a conservative estimate with overhead margin, not a provider billing guarantee. |
| `maxMonthlyRenderRequests` | Local monthly render-request reservation ceiling, default eight. A new carousel reserves four; a single video reserves one. This is not currency or a provider credit balance. |
| `senderEmail`, `approverEmail` | Configured SMTP sender and one authorized reviewer. SMTP credentials are selected separately. |
| `approvalHours` | One to 24 hours. Rejection/expiry terminates without publication. |
| `instagramAccountId`, `instagramUsername` | Exact destination to be displayed in a publish approval and checked through authenticated Meta API reading. |

The budget month uses UTC `YYYY-MM`. Reservations are intentionally not refunded automatically after failed or uncertain calls. Token usage receipts are retained in contextJson, but the workflow cannot observe provider billing elsewhere. Data Tables persist the current owner and counter values; setup never clears them.

## Editorial journal

Setup creates string columns `jobKey`, `sourceUrl`, `sourceHash`, `status`, `caption`, `renderIds`, `instagramId`, `permalink`, `contextJson`. A special `__ledger` row holds the shared budget/lock; other rows correspond to selected content revisions. Do not modify the ledger or contextJson while a job is running.

The source fingerprint includes normalized selected title/facts plus brand, language, CTA, output format, optional asset URLs and campaignRevision. Unselected HTML is not part of the fingerprint. The chosen CSS selectors therefore define which changes are meaningful. The first run can generate a job; later identical revisions return their saved status without AI/render requests.

Expected states include `reserved`, `writer_pending`, `drafted`, `reviewer_pending`, `correction`, `reviewed`, `editorial_rejected`, `render_create_pending`, `rendering`, `next_render`, `render_failed`, `ready`, `awaiting_approval`, `preview_approved`, `approval_rejected`, `approval_expired`, `approved`, `publishing`, `published`.

One atomic comparison of the previous ledger JSON grants the next owner. A stale writer receives no updated row and stops before spending. This deliberately allows only one active job per installation, including the email wait; it suits a small editorial workflow, not a high-throughput multi-brand scheduler. Initialize the table once, without concurrent setup runs. Use separate tables for separate installations. No unqualified exactly-once claim is made across external API failures.

## Human review

The SMTP message contains the source, ordered video links, snapshots when returned by Creatomate, full caption, destination, package hash and expiry. The hash binds selected facts, draft/caption, render IDs and destination. Immediately after the response, n8n reloads the persisted record and verifies the hash/status before continuing. A changed or expired record needs a new review.

Keep access to approval messages and URLs limited to authorized reviewers. An email approval is an access link, not an independent login flow. Configure the n8n public webhook/approval base URL and reverse proxy correctly. Test its reachability in your own installation.

`preview` and `publish` both request one human decision. A preview approval stays private. To publish that exact preview later, set publish mode and the destination; the workflow claims the journal without a new generation reservation, reuses draft/render IDs and requests a new approval. A source/output-setting change produces a different fingerprint and needs new generation instead.

## Creatomate and media retention

Header Auth is `Authorization: Bearer YOUR_KEY`. Creation uses `POST https://api.creatomate.com/v2/renders`; polling and refresh use GET on the same render ID. No POST is automatically retried. A receipt is persisted before polling. Four carousel parts are rendered sequentially and preserve index order.

The workflow checks provider-reported MP4 format, 1080 × 1350 dimensions, 24 fps, expected duration and nonempty file size, and rejects renderer errors/warnings. It does not decode the MP4, measure audio loudness or certify visual layout offline. Human review must inspect every file. Before actual Meta publication, it refreshes only the reviewed render IDs and requires matching IDs, dimensions, duration and file size.

Provider URLs can expire and are not a permanent archive. Download approved files if long-term storage is required. Changing to a different render ID requires a new review. Public video URLs are needed for Meta to fetch the file; V3 does not expose the local worker, n8n admin APIs or private production galleries.

## Instagram

Configure your own Meta OAuth credential and professional account with the required publishing permissions. The exported native Graph API nodes use v25.0, matching the existing template integration; verify the supported Graph version for your app before live use. The authenticated account ID and username must equal the reviewed destination.

For a carousel, create one `VIDEO` child container for each file, poll each to `FINISHED`, then create a `CAROUSEL` parent with ordered children, poll it, publish once and read the resulting media's ID/permalink. A single video uses `REELS` with feed sharing. No narration or YouTube output is included.

Every Meta intent/receipt is persisted. Status reads wait 60 seconds and permit at most five incomplete polls per container. Render reads wait ten seconds and permit at most 90 incomplete polls per file. If your service needs longer, reconcile the stored IDs rather than creating replacements blindly. The configured execution timeout must also cover expected processing; adjust it for your installation before live use.

## Errors and recovery

- **No useful source facts:** correct selectors before enabling generation. Do not use the entire page as a substitute for meaningful source selection.
- **Already handled revision:** inspect the existing record/status. Do not change campaignRevision merely to replay it.
- **Known editorial rejection, human rejection/expiry or renderer failure:** the terminal record is kept and the owned lock is released. The same revision is not automatically retried.
- **Pending/uncertain OpenAI, render or Meta request:** the lock stays owned and a request-intent checkpoint remains. Use the n8n error and provider logs to identify the existing request. Missing HTTP response does not mean no resource/publication was created. No automatic refund or replay occurs.
- **Unknown render creation outcome without an ID:** look up the request using jobKey/index metadata in Creatomate. Reconcile before manually resetting or releasing anything.
- **Unknown Meta publish outcome:** inspect the saved creation/container ID and account media. Record the real media receipt if publication succeeded. Do not blindly call media_publish again.
- **Journal conflict:** stop the next action and inspect competing work. Never erase the ledger to make a retry run.
- **Expired/unavailable render:** refresh the same render through Creatomate. If it no longer exists, a newly generated package needs a fresh human approval.

Recovery from an uncertain external write requires manual reconciliation; V3 does not ship an automatic replay button. Keep the error execution data private and configure retention and storage limits appropriate to your source/usage records. Maintain or export old terminal rows before the Data Table reaches your installation's storage limit; do not prune active jobs.

## Official references

- [Data Table row operations](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows)
- [Send Email and approval](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.sendemail)
- [Creatomate render creation](https://creatomate.com/docs/api/reference/create-a-render)
- [Creatomate render status](https://creatomate.com/docs/api/reference/get-the-status-of-a-render)
- [Creatomate text properties](https://creatomate.com/docs/api/render-script/text-element)
- [Creatomate audio properties](https://creatomate.com/docs/api/render-script/audio-element)
- [Instagram content publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing)
