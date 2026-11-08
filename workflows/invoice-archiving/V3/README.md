# Invoice Processing & Archiving — V3

## Quick overview

Process invoice PDF attachments from Gmail, extract and validate invoice data, check duplicates, organize files in Google Drive, and register records in Google Sheets. Includes a review queue, optional Gmail labels and execution emails, plus configurable OCR and AI fallback endpoints. **Test required before production use.**

## How it works

1. **Gmail intake** — Run manually or on a six-hour schedule. Download email attachments and split PDFs into individual items.
2. **Extract text** — Read text-based PDFs; an optional, disabled HTTP OCR branch can handle image-only documents after configuration.
3. **Validate and classify** — Extract vendor, invoice number, date, optional due date, total and currency. Assign categories using configurable keywords.
4. **Optional AI fallback** — When heuristic extraction fails, an optional API-compatible endpoint can attempt structured extraction. Configure and test it before enabling.
5. **Review queue** — Invalid documents are recorded in a separate Google Sheets tab, with optional Gmail review labeling.
6. **Duplicate check** — Search the invoice registry by a composite vendor/invoice/date key before archiving.
7. **Organize and recover** — Find or create year/month/category folders in Drive, then check for a previously uploaded PDF.
8. **Archive and register** — Upload missing PDFs, upsert invoice metadata in Sheets, and optionally label source messages.
9. **Execution summary** — Optionally email a summary after processing. Validate the aggregation with multiple invoices before relying on its counts.

## Setup

1. Import [`Invoice_Processing_Archiving_V3.json`](./Invoice_Processing_Archiving_V3.json) into n8n. Leave the schedule inactive.
2. Connect **Gmail**, **Google Drive**, and **Google Sheets** credentials in the corresponding nodes.
3. Edit **Configuration**: set `driveFolderId`, default currency, categories, Gmail search criteria, and optional reporting/label settings.
4. Create a Google spreadsheet with **Invoices** and **Review Queue** tabs. Replace `REPLACE_WITH_SPREADSHEET_ID` in every Sheets node.
5. **Invoices** headers: `uniqueKey`, `invoiceNumber`, `vendor`, `invoiceDate`, `amount`, `currency`, `category`, `fileName`, `driveFileId`, `status`, `sourceMessageId`, `processedAt`, `dueDate`.
6. **Review Queue** headers: `uniqueKey`, `invoiceNumber`, `vendor`, `invoiceDate`, `dueDate`, `amount`, `currency`, `category`, `fileName`, `driveFileId`, `status`, `sourceMessageId`, `processedAt`, `reason`.
7. Review the Drive folder search/create nodes: ensure searches are scoped to the intended **parent folder and exact name**, and creation uses the correct parent ID. Do not assume the exported defaults provide this behavior.
8. Configure optional Gmail label IDs and recipient address. For OCR/AI, replace placeholder endpoints and model, add authentication, enable the HTTP nodes, and set the corresponding configuration flags.
9. Test with valid, invalid, duplicate and multi-attachment PDFs; test existing folder paths, partial Drive/Sheets failures and multiple messages before activating the schedule.

## Requirements

- n8n with Gmail, Google Drive, Google Sheets, Extract from File, Code, IF, Loop Over Items and HTTP Request nodes.
- Gmail OAuth2 access to invoice emails.
- Google Drive access to a designated root folder.
- A Google spreadsheet with the two tabs and exact column headers.
- Text-based PDF invoices for the default path.
- **Optional:** external OCR service and an OpenAI-compatible API for AI extraction. These may incur costs.

## Customization

- **Invoice selection:** change the Gmail query and polling interval.
- **Classification:** edit keyword-to-category rules in `Configuration`.
- **Extraction:** adapt invoice field patterns and validation thresholds for your document formats.
- **Folder hierarchy:** adapt year/month/category folder naming and search/creation parameters.
- **Optional extensions:** configure OCR, AI, Gmail labels and report email independently.
- **Sheets:** add fields, adapt matching keys and review statuses to your workflow.

## Additional info

- **Test status:** This export has not been validated end-to-end against authenticated Gmail, Drive and Sheets accounts. It is not production-ready.
- **Drive operations:** Inspect and configure the folder/PDF lookup nodes and parent folder IDs before execution. A generic unfiltered list operation does not establish correct folder matching or recovery.
- **Duplicate and recovery limits:** Sheets and Drive are not transactional; concurrent runs can race. Filename-based recovery is not a guarantee of exactly-once processing.
- **Execution summary:** The loop completion output and report counts need a multi-item test; do not assume they reflect every outcome without verification.
- **Optional endpoints:** OCR and AI are integration stubs, not turnkey services. They require provider-specific request/response mapping and secure authentication.
- **Security:** Invoices contain sensitive billing information. Use least-privilege credentials, restrict access to n8n execution data, Drive and Sheets, and never commit populated exports or customer invoices.
- **Retention:** Original Gmail messages are retained. This workflow is not accounting software or a legally certified archive.

## Support & consulting

Need help adapting or deploying the template? Contact [info@paoloronco.it](mailto:info@paoloronco.it) or visit [paoloronco.it](https://paoloronco.it).

[Browse all invoice archiving versions](../README.md) · [n8n templates repository](https://github.com/paoloronco/n8n-templates)
