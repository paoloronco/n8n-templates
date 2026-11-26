# Archive Gmail invoice PDFs to SFTP with Google Sheets and review queue

**Version 2.1.**

Collect text-based invoice PDFs from Gmail, validate invoice details, archive them over SFTP and maintain provider registers in Google Sheets. Prevent repeated uploads, record rejected documents in a Review Queue and move a source message to Gmail Trash only after all its eligible PDFs are archived or verified duplicates.

This is a new, standalone V2.1 template. It preserves the 50-node production-derived canvas, while replacing account-specific configuration and supplier identities with four working fictional profiles: `UtilityProvider`, `InternetProvider`, `CloudProvider` and `HostingProvider`. Adapt those rules to your own invoices; this template does not claim support for any named supplier.

## How it works

1. Start manually or use the 15-minute schedule after configuration. Gmail retrieves read and unread messages matching `has:attachment filename:pdf newer_than:30d (subject:invoice OR subject:fattura)`.
2. Split eligible PDF attachments into linked items. Skip other attachment types and reject PDFs over 20 MiB using actual binary size.
3. Process one PDF at a time. Extract embedded text, apply the selected profile, validate required fields and build a canonical filename and SFTP path. OCR is not included.
4. Read the corresponding provider register. A matching invoice number, date and amount proceeds to an SFTP filename and byte-size check. A confirmed existing PDF completes without another upload. A missing file continues to the upload branch.
5. Upload new or missing PDFs through the existing provider branch and upsert the matching register row. Cloud invoice and summary PDFs have distinct filenames; the register keeps the canonical invoice filename.
6. Parsing failures, unreadable PDFs, conflicting register matches and unexpected archived file sizes enter `Review Queue`. Repeated attempts update the same message-and-attachment key.
7. Collect all attachment outcomes. A message containing a review document stays in Gmail. A message moves to Trash only when every eligible PDF is archived or confirmed duplicate.

## Setup

1. Import [`Gmail_Invoice_Archiving_SFTP_V2.1.json`](./Gmail_Invoice_Archiving_SFTP_V2.1.json). Keep it inactive until configuration and tests are complete.
2. Connect Gmail OAuth2 to **Gmail - Get invoice messages** and **Gmail - Trash archived invoice**. Reading and moving messages to Trash require the corresponding permissions.
3. Narrow the Gmail query to the intended invoice messages. The generic query is an example, not a complete invoice-discovery rule.
4. In **Parse invoice and canonical name**, adapt the fictional profile detection and field patterns to your PDF text. Keep profile values aligned with the Filter nodes and **Prepare duplicate lookup**.
5. Create these SFTP directories or change the parser's `folder` values. Connect the intended SFTP credential in all four upload nodes and **SFTP - Check registered PDF**.

   | Profile | Worksheet | Default SFTP folder |
   | --- | --- | --- |
   | `UtilityProvider` | `Utilities` | `/invoices/utilities/electricity` or `/invoices/utilities/gas` |
   | `InternetProvider` | `Internet` | `/invoices/internet` |
   | `CloudProvider` | `Cloud` | `/invoices/cloud` |
   | `HostingProvider` | `Hosting` | `/invoices/hosting` |

6. Create one Google spreadsheet and share it with the intended service account with write access. Connect that credential in **all six Sheets nodes**, then replace `REPLACE_WITH_SPREADSHEET_ID` in every node.
7. Create these exact worksheet names and headers. The read node selects the worksheet dynamically; spelling and matching columns must remain consistent.

   | Worksheet | Headers | Matching column |
   | --- | --- | --- |
   | `Utilities` | `Fornitore`, `Tipo`, `Data`, `Importo`, `invoiceNumber`, `uniqueKey`, `File` | `uniqueKey` |
   | `Internet` | `Fornitore`, `Tipo`, `Data`, `Importo`, `invoiceNumber`, `uniqueKey`, `File` | `invoiceNumber` |
   | `Cloud` | `CloudProvider`, `Account`, `Data Fattura`, `Numero Fattura`, `IMPORTO`, `TOTALE`, `File` | `Numero Fattura` |
   | `Hosting` | `Servizio`, `Data Fattura`, `Numero Fattura`, `IMPORTO` | `Numero Fattura` |
   | `Review Queue` | `uniqueKey`, `invoiceNumber`, `vendor`, `invoiceDate`, `amount`, `currency`, `category`, `fileName`, `targetPath`, `status`, `sourceMessageId`, `sourceAttachmentKey`, `processedAt`, `reason` | `uniqueKey` |

8. Test a new invoice, a verified duplicate, a missing archived file, an invalid PDF and a message with both valid and rejected attachments. Confirm the files, register rows, Review Queue and Gmail Trash behavior before activating the schedule.

## Fictional parsing examples

The examples in [`tests/fixtures.json`](./tests/fixtures.json) are synthetic text. They demonstrate executable profile rules and contain no real supplier, mailbox or invoice data.

- **Utility:** detect `Utility Provider`, distinguish electricity or gas from document text, and accept an invoice such as `UT-2026-1001` with common Italian billing labels.
- **Internet:** detect `Internet Provider`, accept an example number such as `12345 / A / 2026`, and read `TOTALE FATTURA`.
- **Cloud:** detect `Cloud Provider`, accept a fictional `CINV` invoice identifier, and read an explicit gross total or a consistent net/tax/gross block. An optional summary document receives a separate filename.
- **Hosting:** detect `Hosting Provider`, read common English/German invoice labels, and require consistent net + tax = gross values in the `Overview` block.

These are examples to customize, not universal parsers. Preserve the message and attachment identity when modifying Code nodes; downstream safety checks rely on n8n item linking.

## Operational behavior and limits

- Gmail Trash is part of this template's completion path. Source emails with review documents are retained. Test this behavior before enabling unattended runs.
- Duplicate verification uses the register, canonical filename and byte size. It is not a cryptographic content comparison, and it does not authenticate the invoice.
- SFTP and Sheets writes are not transactional. Service failures stop the execution and retain its message; check partial uploads and registers before rerunning.
- Avoid overlapping executions. The workflow does not implement a distributed lock or an exactly-once guarantee.
- A registered invoice with different date/amount, multiple matching rows, or a different archived file size requires review. Review rows are not automatically marked resolved after a later successful archive.
- Supplier invoice numbers can be reused. Review the existing matching keys before adapting profiles for multiple accounts or years.
- PDFs larger than 20 MiB stop normalization; they are not entered in the per-document Review Queue. Image-only, encrypted or unreadable PDFs require review or a separate OCR integration.
- Currency conversion, universal date validation and accounting reconciliation are outside the template's scope. The review currency defaults to EUR; adjust mappings for other currencies.
- No dedicated instance error workflow is bundled. Configure your own n8n failure notifications if needed.

## Validation

Run `node tests/verify.cjs` from this directory. The tests evaluate the exported Code nodes with synthetic data and mock service responses; they make no external API calls. See [`VERIFICATION.md`](./VERIFICATION.md) for the release verification scope.

The export is inactive and contains no credential bindings, real spreadsheet identifiers, instance workflow identifiers, personal contact addresses, private server paths or named invoice suppliers. Configure account-specific values after import.
