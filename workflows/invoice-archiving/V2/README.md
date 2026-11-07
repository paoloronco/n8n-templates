# Unified Invoice Archiving

## Quick overview

Automatically collect PDF invoices from Gmail, identify supported providers, extract and validate invoice data without AI, archive PDFs via SFTP, and update Google Sheets. Includes four configurable example provider profiles (A–D), with manual or scheduled execution. No live vendor-specific parsing rules are distributed.

## How it works

1. **Trigger** — Run manually or automatically every six hours.
2. **Gmail intake** — Search for messages from configured senders with PDF attachments.
3. **PDF filtering** — Process eligible PDF attachments individually; skip unrelated Octopus documents.
4. **Text extraction** — Extract readable text from each PDF using n8n's Extract from File node.
5. **Invoice parsing** — Identify the provider and extract invoice number, date, amount, and optional service information using the regex patterns configured in **Configure Providers**.
6. **Validation** — Reject invoices with missing required fields. Validate required fields; provider-specific VAT and gross-total reconciliation is not included in this generic version.
7. **SFTP archiving** — Route the PDF to the provider's configured directory using a standardized filename.
8. **Google Sheets** — Insert or update the corresponding invoice record in the provider's worksheet.
9. **Completion** — End the provider branch after successful processing. The original Gmail message is retained.

The workflow uses deterministic parsing rather than an AI model. No OpenRouter or OpenAI API key is required.

## Setup

1. **Import the workflow** — Import `Unified_Invoice_Archiving - template.json` into n8n.
2. **Connect Gmail** — Configure Gmail OAuth2 in **Gmail - Get invoice messages**. Update the Gmail query to match your invoice senders and review the `newer_than:30d` search window.
3. **Connect SFTP** — Configure SFTP credentials in the four **SFTP upload** nodes. Set the SFTP folders in the four profiles inside **Configure Providers**; placeholder folders must be replaced with writable paths.
4. **Connect Google Sheets** — Configure Google Sheets credentials, replace `YOUR_SPREADSHEET_ID`, and set worksheet names and column mappings in the four **Sheets upsert** nodes. Create the expected headers before testing. Keep each node's matching column aligned with its worksheet.
5. **Review provider rules** — In **Configure Providers**, replace the four example sender addresses, names, regex patterns, and destination folders. Test each parser against actual PDFs.
6. **Review the schedule** — The Schedule Trigger is configured to run every six hours. Adjust it if needed; keep the workflow inactive during initial testing.
7. **Test each provider** — Run manually with representative PDFs for each configured provider. Verify the SFTP file, filename, destination, amount including VAT where applicable, and Google Sheets row.
8. **Test reprocessing and failures** — Re-run a previously processed invoice and check how your SFTP server handles an existing file. Test an invalid PDF and an unavailable SFTP destination before activating the schedule.

## Requirements

- An n8n instance with Gmail, Extract from File, Code, SFTP (FTP node), and Google Sheets nodes.
- A Gmail account with OAuth2 credentials and access to invoice emails.
- An SFTP server, valid credentials, and writable destination directories.
- A Google Sheets spreadsheet with appropriate worksheets, headers, and credentials.
- Text-based PDF invoices compatible with the regex rules you configure.

**Not required:** AI provider, LLM API key, Google Drive, or OCR service.

## Customization

- **Invoice providers** — Modify the Gmail search query and provider profiles in **Configure Providers**; extend routing when adding more than four providers.
- **PDF selection** — Adjust the PDF attachment filter in **Normalize PDF binary**.
- **Filenames and folders** — Set destination folders in **Configure Providers** and adjust the canonical filename pattern in **Parse invoice and canonical name**.
- **Spreadsheet fields** — Update the per-provider Google Sheets mappings and matching columns.
- **Schedule** — Change the Schedule Trigger interval or use the Manual Trigger for controlled runs.
- **Document retention** — Gmail messages are preserved by default. Add labels or archival actions only after validating successful processing.
- **Additional providers** — Extend the parser and add the corresponding storage and Sheets branch, or refactor the routing for larger deployments.

## Additional info

- **Duplicate handling:** Google Sheets uses insert-or-update behavior, but the workflow does **not** perform a preventive SFTP duplicate lookup or maintain a persistent processing registry. Verify your server's behavior when the same filename is uploaded again.
- **Failure handling:** Parsing and upload errors can stop an execution. There is no dedicated error workflow, automatic notification, or centralized failure log in this version.
- **PDF limitations:** Image-only PDFs require OCR, which is not included. Changes to a provider's invoice layout may require updating its parsing expressions.
- **Multiple attachments:** Eligible PDFs are separated into individual items, but this should be tested with real multi-attachment messages.
- **Data security:** Invoices may contain personal, billing, and financial information. Restrict access to Gmail, n8n execution data, SFTP folders, and Google Sheets; use least-privilege credentials.
- **Production readiness:** Test the imported workflow against actual invoice samples and failure scenarios before enabling unattended runs. It is not a substitute for legally compliant accounting or document retention.

## Security and publishing

- This public template intentionally excludes real OAuth/SFTP/Google Sheets credential references, personal sender addresses, private storage paths, live spreadsheet IDs, and n8n instance identifiers.
- Example provider addresses and `YOUR_*` values are placeholders. Configure them after import; do not commit populated exports back to a public repository.
- n8n workflow exports do not include stored credential secrets, but may include credential IDs, names, URLs, account identifiers, and paths. Review all fields and sticky notes before sharing.
- Never publish execution histories, extracted PDF text, sample invoices containing billing data, or credential backups.
- The private production workflow includes additional vendor-specific handling and Gmail Trash actions; **those features are not part of this public template**.
