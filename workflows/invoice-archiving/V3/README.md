# Invoice Processing & Archiving — V3

Archive invoice PDFs from Gmail in Google Drive and maintain an invoice register in Google Sheets. The workflow validates invoice fields, skips registered invoice keys, reuses existing Drive PDFs after partial failures, records rejected documents for review and optionally labels Gmail messages or emails a completion summary.

This is the V3 based on the owner's 70-node local workflow. Its revision preserves the original node IDs, positions and sticky dimensions, updates the nine canvas notes, and adds **Carry validated invoice** to preserve either rules-based or AI-validated data across the Sheets lookup. The public export has 71 nodes and contains no credential bindings or owner account metadata.

V1 remains the original published Creator template. V2 is the separate SFTP version maintained on GitHub. V4 beta is outside this release.

## How it works

1. Run from the n8n editor or on the six-hour schedule. Gmail downloads messages matching `has:attachment filename:pdf newer_than:90d`, including read messages. All matches are retrieved, so narrow the query for a large mailbox.
2. Split PDF attachments into linked items, skipping non-PDF files. Reject files over 20 MiB using actual binary size. A loop processes one attachment at a time.
3. Extract PDF text. Readable text proceeds to the parser. If text is missing and OCR is enabled, an authenticated HTTP endpoint can return text. Unreadable PDFs or extraction errors can proceed to review when no usable text is available.
4. Validate vendor, invoice number, invoice date, optional due date, amount and currency. Classify using keywords. Missing or invalid fields enter review, or optional AI fallback when usable text is available.
5. Preserve the validated record and query the `Invoices` worksheet by `uniqueKey`. Registered keys end as duplicates without Drive writes.
6. Resolve exact year, month and category folders within their respective parents. Create only missing folders. Searches exclude trashed items and use the configured parent rather than Drive root.
7. Search for the exact canonical PDF filename in the category folder. Reuse an existing file or upload the PDF, then upsert the invoice row.
8. Rejected documents are upserted into `Review Queue` with a reason and Gmail message reference. Optional Gmail labels distinguish archived and review messages. Source emails are retained.
9. The loop collects archived, duplicate and review outcomes. An optional completion email counts these outcomes and totals archived amounts separately by currency.

## Setup

1. Import [`Invoice_Processing_Archiving_V3.json`](./Invoice_Processing_Archiving_V3.json). Keep the workflow inactive while configuring it.
2. Connect **Gmail OAuth2**, **Google Drive OAuth2** and **Google Sheets OAuth2** credentials in every corresponding node. The Google identity needs write access to the selected Drive folder and spreadsheet. Use the same intended Drive/account settings in all Drive nodes; this export uses My Drive.
3. In **Gmail — Find invoice PDFs**, restrict the query to relevant invoice senders or subjects and review the 90-day window. Read messages are included, so subsequent runs can revisit the same PDFs.
4. In **Configuration**, replace `REPLACE_WITH_DRIVE_FOLDER_ID` with a designated root folder ID. Set `defaultCurrency`, keyword categories and `maxPdfTextChars` for your documents. This node fails clearly when the root folder remains unconfigured.
5. In **Parse & validate invoice**, adapt labels and patterns to your supplier layouts. The rules support common English, Italian and German labels. They do not authenticate invoices or reconcile VAT.
6. Create one Google spreadsheet with these exact worksheet names and headers. Replace `REPLACE_WITH_SPREADSHEET_ID` in **all three Sheets nodes**.

   **Invoices:** `uniqueKey`, `invoiceNumber`, `vendor`, `invoiceDate`, `dueDate`, `amount`, `currency`, `category`, `fileName`, `driveFileId`, `status`, `sourceMessageId`, `processedAt`.

   **Review Queue:** `uniqueKey`, `invoiceNumber`, `vendor`, `invoiceDate`, `dueDate`, `amount`, `currency`, `category`, `fileName`, `driveFileId`, `status`, `sourceMessageId`, `processedAt`, `reason`.

7. Keep **uniqueKey** as the matching column in both write nodes and in the invoice lookup. The review key uses the message and attachment IDs; the validated invoice key uses vendor, invoice number and invoice date.
8. Optional Gmail labels: create labels first, then set their **IDs** in `labelProcessed` and `labelReview`. They are blank by default, so label branches are skipped. Set `reportEmail` to receive the single completion digest, or leave it blank.
9. Test valid, invalid, duplicate and multi-attachment messages. Check folder parents and the actual PDF contents, rerun an invoice, and test recovery after a missing Sheets row. Review summary counts before activating the schedule. Avoid overlapping executions against the same archive.

## Optional OCR and AI

Both flags default to `false`. These are HTTP integration points; no OCR engine, AI account, API key or paid service is bundled.

- **OCR:** Set `ocrEndpoint` to your HTTPS service, add its authentication in **OCR — Optional HTTP endpoint**, and adapt the multipart `file` request if required. The response must expose `text` or `result.text`. Set `enableOCR: true` only after testing. The HTTP node is enabled, while the IF condition controls whether it runs.
- **AI:** Set `aiEndpoint` to a compatible HTTPS chat-completions endpoint, set `aiModel`, add HTTP authentication and adapt provider-specific parameters. The expected response is `choices[0].message.content` containing JSON with `vendor`, `invoiceNumber`, ISO `invoiceDate`, optional ISO `dueDate`, numeric `amount` and `currency`. Set `enableAI: true` only after testing.
- AI receives the selected extracted text, including OCR output, rather than an empty original extraction. It is skipped when no usable text exists.
- AI results must pass the same calendar-date, non-negative amount and identity rules as the rules-based path. A null or empty amount is rejected. Negative totals and amounts over 100,000,000 require review. External service errors or unusable responses can lead to review; adjust response mappings for your provider.

## Field and identity rules

- Dates accept ISO `YYYY-MM-DD` or day/month/year with `.`, `/` or `-`. Two-digit years are interpreted as 2000–2099. US month/day/year requires a custom rule. Due dates cannot precede invoice dates.
- Totals support decimal comma or dot and correctly grouped European/US formats, for example `1234,56`, `1234.56`, `1.234,56` and `1,234.56`. Ambiguous grouping is rejected. Supported currency symbols/labels include EUR, USD and GBP; otherwise the configured default is used. There is no currency conversion.
- The invoice key URL-encodes normalized vendor/invoice/date components and preserves punctuation distinctions. The readable filename includes a deterministic 64-bit hash suffix, reducing collisions after filename cleanup. This revision's keys and filenames differ from the previous V3 draft: reconcile any pre-existing archive before migration.
- Year/month/category searches use exact names inside the expected parent. If a folder already contains several exact matches, the search selects one; consolidate duplicate archive folders before running. Concurrent executions can still race.

## Validation and limits

Local regression tests exercise all Code nodes and simulate the graph through new uploads, folder reuse, duplicate skipping, Drive recovery, review, optional labels, OCR, AI and mixed-outcome summaries. Gmail, Drive, Sheets and external endpoint operations are simulated. These checks do not establish live authentication, service permissions, API availability or compatibility with every supplier PDF.

Drive uploads and Sheets writes are not transactional. A file may be uploaded before registration fails; a subsequent run can recover it using its canonical filename. There is no exactly-once guarantee. Hard service failures can stop the execution before a summary is sent; there is no dedicated error-notification workflow. Large mailboxes and repeated 90-day scans can use significant execution time and quota.

The public JSON excludes credentials, owner emails, real folder/spreadsheet IDs, pinned data and instance metadata. Configure account-specific values after import and keep populated exports private. The workflow is inactive; updating GitHub or preparing an upload does not submit it for Creator review.

[Browse the invoice versions](../README.md)
