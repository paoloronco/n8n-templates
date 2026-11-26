# V2.1 verification

The public JSON is derived from a private production export, with account configuration and supplier identities replaced for reuse. All 50 node IDs, operational-node positions, section-note geometry and note colors are preserved. The main note is widened into the free space to the left and resized to hold the exact full Creator Portal description. Node names and their graph/expression references are updated consistently where identifying supplier names were removed.

## Privacy checks

The public package is recursively checked for contact addresses, original owner and supplier identifiers, private paths, network addresses, credential bindings, instance metadata and common token/private-key patterns. No such findings remain in the release package. The Gmail API URL is a standard service endpoint; all authentication is supplied after import.

Real spreadsheet IDs are replaced with `REPLACE_WITH_SPREADSHEET_ID` in all six Sheets nodes. SFTP destinations use generic `/invoices/` folders. Pinned data and the private instance's error-workflow binding are removed. The original private source bytes are retained separately and are not published.

## Configuration changes

- The public export is inactive, with all individual processing nodes enabled.
- Four fictional provider profiles replace named supplier detection and invoice prefixes.
- The Gmail example query searches 30 days and contains no sender addresses.
- SFTP paths, worksheet references and setup notes are rewritten for the public example profiles.
- The PDF size limit uses actual binary bytes.
- The workflow title and main sticky note match the current Creator Portal title and all six description sections verbatim. Versioning remains in the V2.1 directory and export filename.

## Functional validation

The accompanying test script exercises the actual exported Code nodes with fictional invoice text and mock register/SFTP results. It checks all profile parsers, invalid-document review, register conflicts, duplicate and missing-file decisions, review-key stability, source binary retention, attachment completion, mixed review messages and archive confirmation.

All **31 checks passed**. A Gitleaks directory scan and a separate recursive source-identifier scan reported **no leaks or remaining private identifiers** in the five-file package.

These checks do not establish live Gmail/SFTP/Sheets authentication or compatibility with every invoice layout. No real mailbox processing or invoice upload is performed for the public release. The Creator Portal's AI/human review remains a separate submission step.

## Creator feedback alignment

The main sticky note contains the same title, Quick overview, How it works, Setup, Requirements, Customization and Additional info as the reviewed Creator Portal form. Its text is copied without rewriting. The two trigger names describe invoice processing; their graph references are updated without changing execution parameters. The five existing section notes remain unchanged. No production workflow is edited, and no human-review submission is performed.
