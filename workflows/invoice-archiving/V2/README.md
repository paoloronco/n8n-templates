# Archive and log invoices from Gmail with SFTP and Google Sheets — V2

This V2 is maintained on GitHub. V1 is the original published Creator template; V3 is the separate Google Drive version being prepared for the revised Creator submission.

Collect text-based invoice PDFs from Gmail, extract invoice details with configurable rules, archive each PDF over SFTP, and insert or update a shared Google Sheets register. Four example categories cover utilities, internet, cloud and hosting. No AI API or OCR service is required.

## How it works

1. Start manually or run every six hours after publishing/activating the workflow.
2. Gmail retrieves all messages matching `has:attachment filename:pdf newer_than:30d (subject:invoice OR subject:fattura)`, including read messages, and downloads their attachments.
3. Messages without binary attachments are discarded. **Normalize PDF binary** splits PDF attachments into individual linked items and rejects any PDF larger than 20 MiB using its actual binary size. Other attachment types are skipped.
4. **Extract PDF text** reads text from binary property `data`.
5. **Parse invoice and canonical name** matches one of four example provider patterns, extracts and validates the invoice number, date and total, and builds the filename and destination path.
6. One provider filter routes the invoice to its SFTP upload node. After a successful upload, a per-item Code node restores the corresponding parsed record and PDF using n8n item linking.
7. The provider's Google Sheets node inserts or updates a row in the same `Invoices` worksheet, matching on **Unique Key** (`Provider:Invoice Number`).
8. The branch completes. Source Gmail messages are retained without modification.

The five canvas notes include one yellow overview with setup instructions and four brief gray section notes. Existing node IDs, positions, sticky dimensions and connections are preserved.

## Setup

1. Import `Unified_Invoice_Archiving - template.json` into n8n. Leave the workflow inactive while configuring it.
2. Connect Gmail OAuth2 in **Gmail - Get invoice messages**. Restrict the search to your invoice senders, review the 30-day lookback and test the query in Gmail. `Return All` is enabled, so all matching messages are retrieved; use a narrow query for large mailboxes.
3. Open **Parse invoice and canonical name** and customize the `patterns` array and extraction regexes to match your real PDF text. The shipped rules are working examples, not vendor-specific parsers. Provider names must match their downstream filter values:

   | Provider | Category | Default SFTP folder |
   | --- | --- | --- |
   | `UtilityProvider` | `utilities` | `/invoices/utilities` |
   | `InternetProvider` | `internet` | `/invoices/internet` |
   | `CloudProvider` | `cloud` | `/invoices/cloud` |
   | `HostingProvider` | `hosting` | `/invoices/hosting` |

4. Create those folders on your SFTP server, with write access for the SFTP account, or adjust `targetPath` in the parser. Connect credentials in **all four SFTP upload nodes**. Binary property `data` contains the PDF.
5. Create a Google spreadsheet with an `Invoices` worksheet and these exact headers:

   `Provider`, `Category`, `Invoice Number`, `Date`, `Amount`, `File`, `Unique Key`

6. The four Sheets nodes use **Service Account** authentication. Create/connect that credential, enable the required Google Sheets/Drive APIs, and share the spreadsheet with the service account email as **Editor**. Replace `REPLACE_WITH_GOOGLE_SHEET_ID` in **all four Sheets nodes**. Keep `Unique Key` as the matching column. To use OAuth2 instead, change each node's authentication and credential selection.
7. Test a representative text-based PDF for each provider and an email with several PDF attachments. Compare the source invoice with the SFTP file and spreadsheet fields. Re-run an invoice and verify your server's overwrite behavior and the existing Sheets row.
8. Test invalid input and service failures. Review the schedule and workflow timezone before publishing/activating unattended runs.

## Parsing examples

The initial patterns recognize text such as `Utility Provider`, `Internet Provider`, `Cloud Provider` and `Hosting Provider`. Provider detection examines PDF text, so Gmail sender filtering should be configured separately in the Gmail query.

Supported field labels include `Invoice number`, `Invoice no.`, `Invoice #`, `Fattura n.`, `Invoice date`, `Data fattura`, `Total due`, `Total amount`, `Totale da pagare` and `Importo totale`. Adapt these expressions when suppliers use different labels or layouts.

- Dates accept `YYYY-MM-DD` or day/month/year with `/`, `.` or `-` separators. Calendar dates are validated. US month/day/year dates need a custom rule.
- Totals accept `1234.56`, `1234,56`, `1,234.56` and `1.234,56`, with optional leading `EUR`, `USD`, `GBP`, `€`, `$` or `£`. Negative totals, malformed grouping and ambiguous single separators with three fractional digits are rejected. Credit notes require a custom rule.
- Example input: `Cloud Provider`, `Invoice number: INV-1001`, `Invoice date: 2026-11-01`, `Total due: EUR 1.234,56`.
- Example result: amount `1234.56`, key `CloudProvider:INV-1001`, file `2026-11-01_CloudProvider_INV-1001.pdf`, folder `/invoices/cloud`.
- Invoice numbers are URL-encoded in filenames, so a slash becomes `%2F`; the original invoice number remains in the register.

## Limitations and recovery

- Scanned/image-only PDFs require OCR, which is not included. Encrypted or unreadable PDFs may fail text extraction.
- Unknown or ambiguous providers, missing fields, invalid dates and invalid totals stop the execution. There is no review queue, dedicated error workflow or automatic failure notification.
- SFTP and Sheets retry failed operations up to **three total attempts**, waiting three seconds between attempts.
- There is no transaction across SFTP and Sheets. If Sheets fails after upload, the PDF may already exist. Fix the failing service and rerun with the same invoice key.
- There is no preventive duplicate lookup or persistent processing registry. Repeated executions upload the same canonical filename again and may overwrite it. The 30-day Gmail window includes previously processed messages.
- Sheets upsert matches `Provider:Invoice Number`; invoice numbers must be unique within a provider. Adapt the key if a supplier reuses numbers across years or accounts.
- VAT reconciliation, currency conversion, invoice authenticity verification, Google Drive archiving and Gmail cleanup are not implemented in this V2 template.

## Review and validation

The revision corrects escaped parser regexes and Code-node input access, restores invoice data once per input item after SFTP, validates dates and European/US amount formats, and checks actual PDF byte size. The README now describes the nodes and values present in the JSON.

Local regression checks cover PDF attachment splitting and size limits, all four provider routes, per-item data restoration, repeated invoice keys, malformed inputs and graph/configuration integrity. Synthetic PDFs are used for the parser fixtures; SFTP and Sheets effects are simulated. These checks do not establish connectivity to your Gmail mailbox, SFTP server or Google spreadsheet. Verify those services with your own credentials before enabling the schedule.

## Customization and sharing

Adjust the Gmail query, provider expressions, destination folders, filename format, schedule and Sheets mappings. When adding a provider, extend the parser and add a matching filter/storage/Sheets branch. Configure account-specific credentials and resource values after import; the public JSON contains no credential bindings, personal invoice data or live spreadsheet IDs.

The workflow is saved inactive for setup. Publishing this file to GitHub does not submit it for review in the n8n Creator Portal.
