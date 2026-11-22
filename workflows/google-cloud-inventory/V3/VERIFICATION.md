# Verification and revision scope

The revised V3 code was imported into the owner's n8n environment and exercised against real Google APIs, BigQuery and a private copied Google Sheets dashboard. Both an initial baseline and subsequent comparison completed. The comparison inventoried 385 assets and recorded 0 additions, 4 metadata modifications and 0 removals. Delivery finished with Sheets updated and email skipped.

The test harness used separate BigQuery table names and an n8n run registry, existing Google credential bindings, a private copied spreadsheet and `sendEmail=false`. It added a terminal assertion node. These harness changes are not included in the public workflow. All 22 public Code node bodies match the exported, actually executed definitions after reversing the test-only table-name substitution. Workflow node IDs assigned during import and configured destinations are environment-specific.

The run produced report.html, inventory.csv, changes.csv, findings.csv and resource-changes.csv and updated 8 managed Sheets tabs. The V3 HTML export was downloaded and tested in a browser: filtering hid nonmatching rows and clearing the filter restored all rows without horizontal page overflow.

All 52 automated regression checks passed across V2/V3. They compile Code nodes and n8n expressions and verify notification selection for additions/removals, routine lifecycle records, Google-managed and user-managed keys, unknown metadata, mixed event counts, full-history retention, baseline silence, disabled email, incomplete audit rejection and configured execution URLs.

SMTP transport was not exercised by the integration runs. Generated email content, counters, attachment selection and the no-email route were checked. The public template needs the importing user's own API permissions, credential selections and destinations before execution. Google API visibility and effective permissions still determine inventory coverage.

The canvas uses the owner's approved functional geometry. Overview notes contain about 200 words; section notes are under 50 words. The public JSON is inactive with no pinned execution data, credential references, personal cloud project/account settings, operational spreadsheet IDs, instance metadata or webhook identifiers. Existing public node IDs were preserved; V2 adds one documentation-only worker note.

The JSON and Markdown documentation were edited directly for this revision. No Publishing Assistant run or newly generated artwork is claimed. Original source exports are retained separately from the reviewed files. Publishing these files to GitHub does not submit a revision to n8n Creators.

## Presentation revision

The current runtime is preserved. Canvas positions and note geometry follow the reviewed instance export; two node labels and their references are made clearer. Privacy review removes all credential bindings, webhook identifiers, instance metadata and personal contact links. Regression checks are rerun on the prepared file. Previous live-account runs above are historical evidence; no new Google scan or SMTP delivery is claimed by this presentation update.
