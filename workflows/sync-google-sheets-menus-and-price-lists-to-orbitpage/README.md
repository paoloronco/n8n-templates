# Sync Google Sheets Menus and Price Lists to OrbitPage
## Quick overview
This workflow synchronizes menu items and price lists from a Google Sheets document to a native OrbitPage menu section, preserving other sections and settings.
## How it works
1. Trigger manually or every 30 minutes to start the workflow.
2. Set configuration parameters including mode, spreadsheet ID, sheet name, sync key, section name, currency, registry table, email addresses, and flags.
3. Validate the configuration inputs for correctness and completeness.
4. In SAMPLE mode, run isolated sample tests; otherwise, proceed to create or reuse a registry in Data Tables.
5. Read source rows from the specified Google Sheets document and sheet.
6. Read the current native menu settings and publication status from OrbitPage.
7. Read the ownership registry from Data Tables to track synchronization state.
8. Plan changes by comparing the sheet data with the current menu and registry snapshot, detecting additions, updates, deletions, and warnings.
9. Check if there are menu changes to apply.
10. If in PREVIEW mode or no changes, output a preview or no-op result.
11. If changes exist and approval is required, prepare a pending review record and claim it in the registry.
12. Send an email with the diff for approval and wait for a response within a configured timeout.
13. Interpret the approval decision (approved, declined, or expired).
14. If approved, re-read source rows, prepare a review release record, and release declined or expired claims.
15. Confirm the review release status.
16. Re-read the reviewed menu and publication from OrbitPage.
17. Read the pending claim from the registry and check the exact reviewed state for consistency.
18. Apply the reviewed native menu updates to OrbitPage with manual revision control and optional publishing.
19. Read the saved menu and resulting publication to verify the exact saved result.
20. Update the registry with the verified ownership snapshot.
21. Output the verified result status.
## Setup
1. Import the workflow JSON into n8n.
2. Configure Google Sheets credentials with access to the source spreadsheet shared with the service account.
3. Configure OrbitPage API credentials with appropriate permissions.
4. Configure SMTP credentials for sending approval emails.
5. In the `Configuration` node, set `MODE` to `SAMPLE`, `PREVIEW`, or `EMAIL_APPROVAL`; set `SPREADSHEET_ID` to your Google Sheets ID; set `SHEET_NAME` to the sheet containing items (default `Items`); set `SYNC_KEY` to a unique lowercase identifier; set `SECTION_NAME` to the OrbitPage menu section name; set `EXPECTED_CURRENCY` to the three-letter currency code (default `EUR`); set `REGISTRY_TABLE_NAME` to the Data Tables table name (default `OrbitPage Sheets Sync`); set `FROM_EMAIL` and `APPROVAL_EMAIL` for SMTP; set `ALLOW_DELETIONS` and `PUBLISH_AFTER_APPROVAL` flags; set `APPROVAL_TIMEOUT_HOURS` for email approval wait time.
6. Ensure the OrbitPage native menu is enabled and configured with less than 30 sections and less than 250 items.
7. Test the workflow manually before enabling triggers.
## Requirements
- n8n version 2.x or higher.
- Data Tables node installed and accessible.
- OrbitPage community node version 0.3.2 or higher.
- Configured Google Sheets service account with access to the source spreadsheet.
- Configured SMTP credentials for sending approval emails.
- OrbitPage workspace with a published native menu section.
- Source Google Sheet with columns: id, approved, action, name, description, price, available, position.
- Maximum 250 source/menu items and 30 sections.
## Customization
- Change `MODE` to control workflow behavior: `SAMPLE` for test data, `PREVIEW` for dry run, `EMAIL_APPROVAL` for email-based approval.
- Adjust `SYNC_KEY` and `SECTION_NAME` to match the target OrbitPage menu section.
- Modify `EXPECTED_CURRENCY` to match your menu currency.
- Enable `ALLOW_DELETIONS` to permit item deletions via approved rows.
- Enable `PUBLISH_AFTER_APPROVAL` to publish changes automatically after approval.
- Customize email sender and recipient addresses for approval notifications.
- Adjust `APPROVAL_TIMEOUT_HOURS` to set the email approval response window.
- Extend or modify the Google Sheets range or columns as needed, respecting the 250 item limit.
- Adapt the workflow nodes or code for additional validation or integration as required.

## Additional Details

This workflow synchronizes a single OrbitPage native menu section with data from a Google Sheet, preserving all other page content and menu sections. It supports modes for sample testing, preview without writes, and email-based approval workflows with configurable timeouts. Deletion actions require explicit approval and configuration. The workflow enforces limits on the number of menu items and sections and requires a compatible OrbitPage plan and properly configured credentials. For implementation help or customization, contact info@paoloronco.it or visit https://paoloronco.it.

Full technical documentation: https://app.notion.com/p/Sync-Google-Sheets-Menus-and-Price-Lists-to-OrbitPage-409f0ba27c3281adaf97c84b96825cf3
