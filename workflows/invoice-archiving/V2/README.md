# Unified Invoice Archiving

## Quick overview

Automatically collect PDF invoices from Gmail, identify supported providers, extract and validate invoice data without AI, archive PDFs via SFTP, and update Google Sheets. Supports Octopus Energy, Dimensione, Google Cloud, and Hetzner, with manual or scheduled execution.

## How it works

1. **Trigger** — Run manually or automatically every six hours.
2. **Gmail intake** — Search for messages from configured senders with PDF attachments.
3. **PDF filtering** — Process eligible PDF attachments individually; skip unrelated Octopus documents.
4. **Text extraction** — Extract readable text from each PDF using n8n's Extract from File node.
5. **Invoice parsing** — Identify the provider and extract the invoice number, date, amount, and applicable service or account details using provider-specific JavaScript rules.
6. **Validation** — Reject invoices with missing required fields. For Hetzner, check that the extracted gross total agrees with net amount plus VAT.
7. **SFTP archiving** — Route the PDF to the provider's configured directory using a standardized filename.
8. **Google Sheets** — Insert or update the corresponding invoice record in the provider's worksheet.
9. **Completion** — End the provider branch after successful processing. The original Gmail message is retained.

The workflow uses deterministic parsing rather than an AI model. No OpenRouter or OpenAI API key is required.

## Setup

1. **Import the workflow** — Import `Unified_Invoice_Archiving.json` into n8n.
2. **Connect Gmail** — Configure Gmail OAuth2 in **Gmail - Get invoice messages**. Update its Gmail search query to match your invoice senders. Replace the placeholder sender addresses and review the `newer_than:450d` search window.
3. **Connect SFTP** — Configure SFTP credentials in the four **SFTP upload** nodes. Update the destination folders in **Parse invoice and canonical name**; the provided paths are placeholders and must exist with appropriate write permissions.
4. **Connect Google Sheets** — Configure the Google Sheets credentials, spreadsheet IDs, worksheet names, and column mappings in the four **Sheets upsert** nodes. Create the expected headers before testing. Keep each node's matching column aligned with its worksheet.
5. **Review provider rules** — In **Parse invoice and canonical name**, check the vendor detection, invoice-number patterns, dates, amounts, and service descriptions against your actual PDFs.
6. **Review the schedule** — The Schedule Trigger is configured to run every six hours. Adjust it if needed; keep the workflow inactive during initial testing.
7. **Test each provider** — Run manually with a representative PDF for Octopus Energy (electricity and gas, if applicable), Dimensione, Google Cloud, and Hetzner. Verify the SFTP file, filename, destination, amount including VAT where applicable, and Google Sheets row.
8. **Test reprocessing and failures** — Re-run a previously processed invoice and check how your SFTP server handles an existing file. Test an invalid PDF and an unavailable SFTP destination before activating the schedule.

## Requirements

- An n8n instance with Gmail, Extract from File, Code, SFTP (FTP node), and Google Sheets nodes.
- A Gmail account with OAuth2 credentials and access to invoice emails.
- An SFTP server, valid credentials, and writable destination directories.
- A Google Sheets spreadsheet with appropriate worksheets, headers, and credentials.
- Text-based PDF invoices from the supported providers.

**Not required:** AI provider, LLM API key, Google Drive, or OCR service.

## Customization

- **Invoice providers** — Modify the Gmail search query and add provider-specific parsing and routing rules in the Code and Filter nodes.
- **PDF selection** — Adjust the PDF attachment filter and Octopus-specific document checks in **Normalize PDF binary**.
- **Filenames and folders** — Change the canonical filename pattern and SFTP destination paths in **Parse invoice and canonical name**.
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
